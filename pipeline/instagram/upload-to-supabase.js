const fs = require('fs');
const path = require('path');

async function uploadScrapedImagesToSupabase(clientId, scraperOutputDir) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[ImageUpload] Supabase not configured, skipping');
    return { uploaded: 0, skipped: 0, assets: [] };
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const dataPath = path.join(scraperOutputDir, 'instagram_data.json');
  if (!fs.existsSync(dataPath)) {
    console.log('[ImageUpload] No instagram_data.json found');
    return { uploaded: 0, skipped: 0, assets: [] };
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const posts = data.posts || [];
  const assets = [];
  let uploaded = 0;
  let skipped = 0;

  // Upload profile pic
  const profilePicPath = path.join(scraperOutputDir, 'profile_pic.jpg');
  if (fs.existsSync(profilePicPath)) {
    const result = await uploadSingleImage(supabase, clientId, profilePicPath, 'photo_dentist', { source: 'instagram_profile_pic' });
    if (result) { assets.push(result); uploaded++; } else { skipped++; }
  }

  // Upload post images
  for (const post of posts) {
    const imageFiles = (post.media_files || []).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));

    for (const imgPath of imageFiles) {
      if (!fs.existsSync(imgPath)) continue;

      // Determine asset type from caption
      const caption = (post.caption || '').toLowerCase();
      let assetType = 'other';

      if (caption.includes('antes') && (caption.includes('depois') || caption.includes('after'))) {
        assetType = 'before_after';
      } else if (caption.includes('resultado') || caption.includes('transformação') || caption.includes('transformacao')) {
        assetType = 'before_after';
      } else if (caption.includes('clínica') || caption.includes('clinica') || caption.includes('consultório') || caption.includes('consultorio') || caption.includes('equipe')) {
        assetType = 'photo_clinic';
      } else if (post.is_video || post.is_reel) {
        assetType = 'other'; // video thumbnails
      }

      const metadata = {
        source: 'instagram',
        shortcode: post.shortcode,
        original_caption: (post.caption || '').substring(0, 500),
        post_url: post.url,
        post_type: post.type,
      };

      const result = await uploadSingleImage(supabase, clientId, imgPath, assetType, metadata);
      if (result) { assets.push(result); uploaded++; } else { skipped++; }
    }
  }

  console.log(`[ImageUpload] Done: ${uploaded} uploaded, ${skipped} skipped`);
  return { uploaded, skipped, assets };
}

async function uploadSingleImage(supabase, clientId, localPath, assetType, metadata) {
  const fileName = path.basename(localPath);
  const storagePath = `${clientId}/instagram/${fileName}`;

  // Check if already exists
  const { data: existing } = await supabase
    .from('media_assets')
    .select('id')
    .eq('client_id', clientId)
    .eq('file_name', fileName)
    .limit(1);

  if (existing && existing.length > 0) {
    return null; // skip duplicate
  }

  // Upload to storage
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

  const { error: uploadError } = await supabase.storage
    .from('client-assets')
    .upload(storagePath, fileBuffer, { contentType, upsert: true });

  if (uploadError) {
    console.warn(`[ImageUpload] Upload failed for ${fileName}: ${uploadError.message}`);
    return null;
  }

  const { data: urlData } = supabase.storage.from('client-assets').getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  // Insert media_assets record
  const { data: asset, error: insertError } = await supabase
    .from('media_assets')
    .insert({
      client_id: clientId,
      asset_type: assetType,
      file_name: fileName,
      file_path: storagePath,
      public_url: publicUrl,
      mime_type: contentType,
      file_size: fileBuffer.length,
      metadata,
    })
    .select()
    .single();

  if (insertError) {
    console.warn(`[ImageUpload] Insert failed for ${fileName}: ${insertError.message}`);
    return null;
  }

  console.log(`[ImageUpload] ✓ ${fileName} → ${assetType}`);
  return asset;
}

module.exports = { uploadScrapedImagesToSupabase };
