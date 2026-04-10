const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function uploadFile(bucket, storagePath, localPath, contentType) {
  const supabase = getSupabaseAdmin();
  const fileBuffer = fs.readFileSync(localPath);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return urlData.publicUrl;
}

async function uploadDirectory(bucket, baseStoragePath, localDir) {
  const results = {};
  const files = fs.readdirSync(localDir);

  for (const file of files) {
    const localPath = path.join(localDir, file);
    const stat = fs.statSync(localPath);
    if (stat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    const contentTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.mp4': 'video/mp4',
      '.json': 'application/json',
      '.html': 'text/html',
      '.css': 'text/css',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    const storagePath = `${baseStoragePath}/${file}`;

    try {
      const url = await uploadFile(bucket, storagePath, localPath, contentType);
      results[file] = url;
    } catch (err) {
      console.warn(`Failed to upload ${file}: ${err.message}`);
    }
  }

  return results;
}

module.exports = { getSupabaseAdmin, uploadFile, uploadDirectory };
