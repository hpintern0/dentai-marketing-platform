const fs = require('fs');
const path = require('path');

async function runDistribution(job) {
  const { task_name, client_id, platform_targets } = job.data;
  const outputDir = path.resolve(__dirname, `../../outputs/${task_name}`);

  console.log(`[Distribution] Starting distribution for: ${task_name}`);

  // Collect all media files
  const mediaFiles = [];

  // Ads
  const adsDir = path.join(outputDir, 'ads');
  if (fs.existsSync(adsDir)) {
    const adFiles = fs.readdirSync(adsDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    adFiles.forEach(f => mediaFiles.push({ type: 'ad', path: path.join(adsDir, f), filename: f }));
  }

  // Carousel slides
  const carouselDir = path.join(outputDir, 'carousel');
  if (fs.existsSync(carouselDir)) {
    const slideFiles = fs.readdirSync(carouselDir).filter(f => f.endsWith('.png'));
    slideFiles.forEach(f => mediaFiles.push({ type: 'carousel', path: path.join(carouselDir, f), filename: f }));
  }

  // Video
  const videoDir = path.join(outputDir, 'video');
  if (fs.existsSync(videoDir)) {
    const videoFiles = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4'));
    videoFiles.forEach(f => mediaFiles.push({ type: 'video', path: path.join(videoDir, f), filename: f }));
  }

  // Upload to Supabase Storage
  const mediaUrls = {};
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    for (const file of mediaFiles) {
      const storagePath = `${client_id}/${task_name}/${file.type}/${file.filename}`;
      const fileBuffer = fs.readFileSync(file.path);

      const { data, error } = await supabase.storage
        .from('dental-campaigns')
        .upload(storagePath, fileBuffer, {
          contentType: file.filename.endsWith('.mp4') ? 'video/mp4' : 'image/png',
          upsert: true,
        });

      if (error) {
        console.warn(`[Distribution] Upload failed for ${file.filename}: ${error.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('dental-campaigns')
        .getPublicUrl(storagePath);

      mediaUrls[file.filename] = urlData.publicUrl;
      console.log(`[Distribution] Uploaded: ${file.filename}`);
    }
  } catch (err) {
    console.warn(`[Distribution] Supabase upload failed: ${err.message}. Media URLs will be local paths.`);
    mediaFiles.forEach(f => { mediaUrls[f.filename] = f.path; });
  }

  // Save media URLs
  fs.writeFileSync(
    path.join(outputDir, 'media_urls.json'),
    JSON.stringify(mediaUrls, null, 2)
  );

  // Load copy files
  const copyDir = path.join(outputDir, 'copy');
  const copy = {};
  if (fs.existsSync(copyDir)) {
    for (const file of fs.readdirSync(copyDir)) {
      const content = fs.readFileSync(path.join(copyDir, file), 'utf-8');
      copy[file.replace(/\.\w+$/, '')] = content;
    }
  }

  // Load research for scheduling insights
  let scheduling = { best_days: ['terça', 'quinta'], best_times: ['12h', '19h'], engagement_patterns: 'Maior engajamento entre 19h-21h' };
  const researchPath = path.join(outputDir, 'research_results.json');
  if (fs.existsSync(researchPath)) {
    const research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
    if (research.scheduling_insights) scheduling = research.scheduling_insights;
  }

  // Generate Publish Advisory
  const taskDate = new Date().toISOString().split('T')[0];
  const publishMd = generatePublishAdvisory(task_name, taskDate, mediaUrls, copy, scheduling, platform_targets);
  fs.writeFileSync(path.join(outputDir, `Publish_${task_name}_${taskDate}.md`), publishMd);

  console.log(`[Distribution] Complete. ${Object.keys(mediaUrls).length} files uploaded.`);
  return {
    status: 'complete',
    media_count: Object.keys(mediaUrls).length,
    outputs: ['media_urls.json', `Publish_${task_name}_${taskDate}.md`],
  };
}

function generatePublishAdvisory(taskName, taskDate, mediaUrls, copy, scheduling, platforms) {
  const mediaList = Object.entries(mediaUrls)
    .map(([name, url]) => `- **${name}**: ${url}`)
    .join('\n');

  const copyList = Object.entries(copy)
    .map(([name, content]) => `### ${name}\n\`\`\`\n${content.substring(0, 500)}\n\`\`\``)
    .join('\n\n');

  return `# Publish Advisory — ${taskName}
**Data:** ${taskDate}
**Plataformas:** ${(platforms || ['instagram_feed']).join(', ')}

---

## Media Assets

${mediaList || 'Nenhum arquivo de mídia disponível.'}

---

## Copy por Plataforma

${copyList || 'Nenhuma copy disponível.'}

---

## Recomendação de Agendamento

- **Melhores dias:** ${(scheduling.best_days || []).join(', ')}
- **Melhores horários:** ${(scheduling.best_times || []).join(', ')}
- **Padrão de engajamento:** ${scheduling.engagement_patterns || 'N/A'}

### Sugestão de Publicação
| Plataforma | Data Sugerida | Horário | Status |
|---|---|---|---|
| Instagram Feed | Próxima ${scheduling.best_days?.[0] || 'terça'} | ${scheduling.best_times?.[0] || '19h'} | Aguardando aprovação |
| Instagram Stories | Mesmo dia | ${scheduling.best_times?.[1] || '12h'} | Aguardando aprovação |

---

## Instruções de Publicação

### Instagram (Automático via Graph API)
1. Confirme a aprovação de todas as peças no dashboard
2. Clique em "Publicar" — o sistema faz upload e publica via Graph API
3. Stories: publicação via Graph API com media_type=STORIES

---

*Gerado automaticamente pelo HP Odonto Marketing Platform*
`;
}

module.exports = { runDistribution };
