const fs = require('fs');
const path = require('path');

/**
 * Extract folder ID from various Google Drive URL formats:
 * - https://drive.google.com/drive/folders/ABC123
 * - https://drive.google.com/drive/folders/ABC123?usp=sharing
 * - https://drive.google.com/drive/u/0/folders/ABC123
 */
function extractFolderId(url) {
  const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Sync a Google Drive folder to Supabase Storage
 */
async function syncDriveFolder(driveUrl, clientId) {
  if (!driveUrl) throw new Error('No Drive URL provided');

  const folderId = extractFolderId(driveUrl);
  if (!folderId) throw new Error('Could not extract folder ID from URL');

  console.log(`[Drive] Syncing folder: ${folderId}`);

  // Use Playwright to load the folder page and get file list
  const { chromium } = eval("require")('playwright');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });

  try {
    const page = await browser.newPage();
    await page.goto(`https://drive.google.com/drive/folders/${folderId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(5000);

    // Extract file info from the page
    const files = await page.evaluate(() => {
      const items = [];
      // Google Drive renders files in divs with data-id attributes
      document.querySelectorAll('[data-id]').forEach(el => {
        const id = el.getAttribute('data-id');
        const nameEl = el.querySelector('[data-tooltip]') || el.querySelector('.KL4NAf');
        const name = nameEl ? (nameEl.getAttribute('data-tooltip') || nameEl.textContent || '').trim() : '';
        if (id && name && name.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov|svg|pdf)$/i)) {
          items.push({ id, name });
        }
      });

      // Alternative: try extracting from aria labels
      if (items.length === 0) {
        document.querySelectorAll('[data-target="doc"]').forEach(el => {
          const id = el.getAttribute('data-id');
          const name = el.getAttribute('aria-label') || '';
          if (id && name) items.push({ id, name });
        });
      }

      return items;
    });

    await page.close();

    console.log(`[Drive] Found ${files.length} files`);

    if (files.length === 0) {
      // Fallback: try the Google Drive API without key (sometimes works for public folders)
      console.log('[Drive] No files found via page scraping, trying alternative...');
    }

    // Download each file and upload to Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const results = [];
    const https = require('https');
    const http = require('http');

    for (const file of files) {
      // Only process images
      if (!file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        console.log(`[Drive] Skipping non-image: ${file.name}`);
        continue;
      }

      // Check if already synced
      const { data: existing } = await supabase
        .from('media_assets')
        .select('id')
        .eq('client_id', clientId)
        .eq('file_name', file.name)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`[Drive] Already synced: ${file.name}`);
        continue;
      }

      console.log(`[Drive] Downloading: ${file.name}`);

      // Download from Google Drive
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;

      try {
        const buffer = await downloadFromUrl(downloadUrl);

        if (!buffer || buffer.length < 1000) {
          console.log(`[Drive] File too small or failed: ${file.name}`);
          continue;
        }

        // Determine asset type from filename
        const nameLower = file.name.toLowerCase();
        let assetType = 'other';
        if (nameLower.includes('antes') || nameLower.includes('depois') || nameLower.includes('before') || nameLower.includes('after')) {
          assetType = 'before_after';
        } else if (nameLower.includes('logo')) {
          assetType = 'logo';
        } else if (nameLower.includes('dentista') || nameLower.includes('dra') || nameLower.includes('dr.') || nameLower.includes('perfil') || nameLower.includes('profile')) {
          assetType = 'photo_dentist';
        } else if (nameLower.includes('clinica') || nameLower.includes('consultorio') || nameLower.includes('fachada')) {
          assetType = 'photo_clinic';
        }

        // Upload to Supabase Storage
        const ext = path.extname(file.name).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg';
        const storagePath = `${clientId}/drive/${file.name}`;

        await supabase.storage.from('client-assets').upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

        const { data: urlData } = supabase.storage.from('client-assets').getPublicUrl(storagePath);

        // Create media_assets record
        await supabase.from('media_assets').insert({
          client_id: clientId,
          asset_type: assetType,
          file_name: file.name,
          file_path: storagePath,
          public_url: urlData.publicUrl,
          mime_type: mimeType,
          file_size: buffer.length,
          metadata: { source: 'google_drive', drive_file_id: file.id, drive_folder_id: folderId },
        });

        results.push({ name: file.name, type: assetType, url: urlData.publicUrl });
        console.log(`[Drive] Uploaded: ${file.name} -> ${assetType} (${(buffer.length/1024).toFixed(0)} KB)`);

      } catch (err) {
        console.warn(`[Drive] Failed to download ${file.name}: ${err.message}`);
      }
    }

    console.log(`[Drive] Sync complete: ${results.length} files uploaded`);
    return { files_found: files.length, uploaded: results.length, assets: results };

  } finally {
    await browser.close();
  }
}

function downloadFromUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? require('https') : require('http');
    const doRequest = (requestUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      mod.get(requestUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
          return doRequest(res.headers.location, redirects + 1);
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    };
    doRequest(url);
  });
}

module.exports = { syncDriveFolder, extractFolderId };
