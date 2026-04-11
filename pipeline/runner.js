/**
 * In-process pipeline runner — no Redis/BullMQ needed.
 * Runs agents sequentially in the same Node.js process.
 * For production scale, swap this with the BullMQ worker.
 */

const fs = require('fs');
const path = require('path');
const handlers = require('./agents/index');

const AGENT_SEQUENCE = [
  'dental_research_agent',
  'dental_intelligence_agent',
  'copywriter_agent',
  'ad_creative_designer',
  'carousel_agent',
  'video_ad_specialist',
  'review_orchestrator',
  'distribution_agent',
];

async function runPipeline(payload) {
  const { task_name, client_id, procedure_focus } = payload;
  const outputDir = path.resolve(__dirname, `../outputs/${task_name}`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create Supabase client for loading client data
  let supabase = null;
  if (client_id && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }

  // Load client profile from Supabase
  let clientProfile = null;
  if (supabase) {
    try {
      const { data } = await supabase.from('clients').select('*').eq('id', client_id).single();
      if (data) {
        clientProfile = data;
        console.log(`[Pipeline] Client loaded: ${data.name}`);
      }
    } catch (err) {
      console.warn(`[Pipeline] Could not load client: ${err.message}`);
    }
  }

  // Inject client data into payload so all agents can use it
  if (clientProfile) {
    payload.client_name = clientProfile.name;
    payload.client_cro = clientProfile.cro_number;
    payload.client_specialty = clientProfile.specialty;
    payload.client_instagram = clientProfile.instagram_handle;
    payload.client_city = `${clientProfile.city}, ${clientProfile.state}`;
    payload.client_tone = clientProfile.tone;
    payload.client_ctas = clientProfile.default_ctas || [];
    payload.client_colors = clientProfile.color_palette || {};
  }

  // Load client media assets
  let clientAssets = [];
  if (supabase) {
    try {
      const { data: assets } = await supabase
        .from('media_assets')
        .select('id, asset_type, public_url, metadata')
        .eq('client_id', client_id)
        .order('created_at', { ascending: false });
      clientAssets = assets || [];
      console.log(`[Pipeline] Loaded ${clientAssets.length} media assets for client`);
    } catch (err) {
      console.warn('[Pipeline] Could not load media assets:', err.message);
    }
  }

  // Inject into payload
  payload.client_assets = clientAssets.map(a => ({
    type: a.asset_type,
    url: a.public_url,
    metadata: a.metadata,
  }));

  const results = [];
  const startTime = Date.now();

  console.log(`\n[Pipeline] Starting pipeline for: ${task_name}`);
  console.log(`[Pipeline] Client: ${payload.client_name || 'unknown'}`);
  console.log(`[Pipeline] Procedure: ${procedure_focus}`);
  console.log(`[Pipeline] Output: ${outputDir}\n`);

  // Determine which agents to skip
  const skipAgents = [];
  if (payload.skip_research) skipAgents.push('dental_research_agent', 'dental_intelligence_agent');
  if (payload.skip_image) skipAgents.push('ad_creative_designer');
  if (payload.skip_carousel) skipAgents.push('carousel_agent');
  if (payload.skip_video) skipAgents.push('video_ad_specialist');

  for (const agentName of AGENT_SEQUENCE) {
    if (skipAgents.includes(agentName)) {
      console.log(`[Pipeline] Skipping: ${agentName}`);
      results.push({ agent: agentName, status: 'skipped', duration_ms: 0 });

      // Emit event if available
      if (global.emitPipelineEvent) {
        global.emitPipelineEvent(payload.campaign_id, {
          agent_name: agentName,
          status: 'skipped',
          progress: 0,
        });
      }
      continue;
    }

    const handler = handlers[agentName];
    if (!handler) {
      console.warn(`[Pipeline] No handler for: ${agentName}`);
      results.push({ agent: agentName, status: 'skipped', notes: 'No handler' });
      continue;
    }

    const agentStart = Date.now();
    console.log(`[Pipeline] Running: ${agentName}...`);

    // Emit running event
    if (global.emitPipelineEvent) {
      global.emitPipelineEvent(payload.campaign_id, {
        agent_name: agentName,
        status: 'running',
        progress: 0,
      });
    }

    try {
      // Create a mock job object similar to BullMQ
      const job = { data: payload, name: agentName };
      const result = await handler(job);
      const duration = Date.now() - agentStart;

      console.log(`[Pipeline] ${agentName} complete (${duration}ms)`);
      results.push({ agent: agentName, status: 'complete', duration_ms: duration, result });

      // Emit complete event
      if (global.emitPipelineEvent) {
        global.emitPipelineEvent(payload.campaign_id, {
          agent_name: agentName,
          status: 'complete',
          duration_ms: duration,
          progress: 100,
        });
      }
    } catch (err) {
      const duration = Date.now() - agentStart;
      console.error(`[Pipeline] ${agentName} failed (${duration}ms):`, err.message);
      results.push({ agent: agentName, status: 'failed', duration_ms: duration, error: err.message });

      // Emit failed event
      if (global.emitPipelineEvent) {
        global.emitPipelineEvent(payload.campaign_id, {
          agent_name: agentName,
          status: 'failed',
          duration_ms: duration,
          notes: err.message,
        });
      }

      // Continue to next agent — don't break the pipeline
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log(`\n[Pipeline] Complete! Total: ${totalDuration}ms`);
  console.log(`[Pipeline] Results: ${results.filter(r => r.status === 'complete').length} complete, ${results.filter(r => r.status === 'failed').length} failed, ${results.filter(r => r.status === 'skipped').length} skipped`);

  // Save pipeline summary
  fs.writeFileSync(
    path.join(outputDir, 'pipeline_summary.json'),
    JSON.stringify({ payload, results, total_duration_ms: totalDuration, completed_at: new Date().toISOString() }, null, 2)
  );

  // Save outputs to Supabase (campaign_pieces + storage)
  if (payload.campaign_id && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      await saveOutputsToSupabase(payload, outputDir);
    } catch (err) {
      console.error('[Pipeline] Failed to save outputs to Supabase:', err.message);
    }
  }

  return { results, total_duration_ms: totalDuration };
}

async function saveOutputsToSupabase(payload, outputDir) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const campaignId = payload.campaign_id;
  const clientId = payload.client_id;
  const pieces = [];

  // Upload carousel slides
  const carouselDir = path.join(outputDir, 'carousel');
  if (fs.existsSync(carouselDir)) {
    const slides = fs.readdirSync(carouselDir).filter(f => f.endsWith('.png')).sort();
    for (let i = 0; i < slides.length; i++) {
      const filePath = path.join(carouselDir, slides[i]);
      const storagePath = `${clientId}/${campaignId}/carousel/${slides[i]}`;

      const fileBuffer = fs.readFileSync(filePath);
      await supabase.storage.from('dental-campaigns').upload(storagePath, fileBuffer, {
        contentType: 'image/png', upsert: true,
      });

      const { data: urlData } = supabase.storage.from('dental-campaigns').getPublicUrl(storagePath);

      pieces.push({
        campaign_id: campaignId,
        piece_type: 'carousel_slide',
        piece_index: i + 1,
        content: { title: `Slide ${i + 1}` },
        media_url: urlData.publicUrl,
        approval_status: 'pending',
      });
      console.log(`[Pipeline] Uploaded slide: ${slides[i]}`);
    }

    // If no PNG slides but structure exists, save structure as pieces
    const structurePath = path.join(carouselDir, 'carousel_structure.json');
    if (pieces.filter(p => p.piece_type === 'carousel_slide').length === 0 && fs.existsSync(structurePath)) {
      const structure = JSON.parse(fs.readFileSync(structurePath, 'utf-8'));
      const slides = structure.slides || [];
      for (let i = 0; i < slides.length; i++) {
        pieces.push({
          campaign_id: campaignId,
          piece_type: 'carousel_slide',
          piece_index: i + 1,
          content: slides[i],
          approval_status: 'pending',
        });
      }
      console.log(`[Pipeline] Saved ${slides.length} carousel slides (structure, no PNG)`);
    }
  }

  // Upload ad creatives
  const adsDir = path.join(outputDir, 'ads');
  if (fs.existsSync(adsDir)) {
    const ads = fs.readdirSync(adsDir).filter(f => f.endsWith('.png'));
    for (const ad of ads) {
      const filePath = path.join(adsDir, ad);
      const storagePath = `${clientId}/${campaignId}/ads/${ad}`;

      const fileBuffer = fs.readFileSync(filePath);
      await supabase.storage.from('dental-campaigns').upload(storagePath, fileBuffer, {
        contentType: 'image/png', upsert: true,
      });

      const { data: urlData } = supabase.storage.from('dental-campaigns').getPublicUrl(storagePath);

      pieces.push({
        campaign_id: campaignId,
        piece_type: 'instagram_ad',
        piece_index: 0,
        content: { title: ad.replace('.png', '') },
        media_url: urlData.publicUrl,
        approval_status: 'pending',
      });
      console.log(`[Pipeline] Uploaded ad: ${ad}`);
    }

    // If no ad PNGs but layout exists, save layout as piece
    const layoutPath = path.join(adsDir, 'layout.json');
    if (pieces.filter(p => p.piece_type === 'instagram_ad').length === 0 && fs.existsSync(layoutPath)) {
      const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));
      pieces.push({
        campaign_id: campaignId,
        piece_type: 'instagram_ad',
        piece_index: 0,
        content: layout,
        approval_status: 'pending',
      });
      console.log(`[Pipeline] Saved ad layout (no PNG)`);
    }
  }

  // Upload videos
  const videoDir = path.join(outputDir, 'video');
  if (fs.existsSync(videoDir)) {
    const videos = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4') || f.endsWith('.webm'));
    for (const vid of videos) {
      const filePath = path.join(videoDir, vid);
      const storagePath = `${clientId}/${campaignId}/video/${vid}`;
      const contentType = vid.endsWith('.mp4') ? 'video/mp4' : 'video/webm';

      const fileBuffer = fs.readFileSync(filePath);
      await supabase.storage.from('dental-campaigns').upload(storagePath, fileBuffer, {
        contentType, upsert: true,
      });

      const { data: urlData } = supabase.storage.from('dental-campaigns').getPublicUrl(storagePath);

      pieces.push({
        campaign_id: campaignId,
        piece_type: 'video',
        piece_index: 0,
        content: { title: vid.replace(/\.(mp4|webm)$/, ''), type: contentType },
        media_url: urlData.publicUrl,
        approval_status: 'pending',
      });
      console.log(`[Pipeline] Uploaded video: ${vid}`);
    }

    // If no video files but concept exists, save concept as piece
    const conceptPath = path.join(videoDir, 'video_concept.json');
    if (pieces.filter(p => p.piece_type === 'video').length === 0 && fs.existsSync(conceptPath)) {
      const concept = JSON.parse(fs.readFileSync(conceptPath, 'utf-8'));
      pieces.push({
        campaign_id: campaignId,
        piece_type: 'video',
        piece_index: 0,
        content: concept,
        approval_status: 'pending',
      });
      console.log(`[Pipeline] Saved video concept (no MP4)`);
    }
  }

  // Save copy pieces
  const copyDir = path.join(outputDir, 'copy');
  if (fs.existsSync(copyDir)) {
    const copyFiles = fs.readdirSync(copyDir).filter(f => f.endsWith('.txt') || f.endsWith('.json'));
    for (const file of copyFiles) {
      const content = fs.readFileSync(path.join(copyDir, file), 'utf-8');
      const typeName = file.replace(/\.(txt|json)$/, '');
      pieces.push({
        campaign_id: campaignId,
        piece_type: typeName === 'instagram_caption' ? 'instagram_caption' : typeName,
        piece_index: 0,
        content: { text: content },
        approval_status: 'pending',
      });
      console.log(`[Pipeline] Saved copy: ${file}`);
    }
  }

  // Insert all pieces
  if (pieces.length > 0) {
    const { error } = await supabase.from('campaign_pieces').insert(pieces);
    if (error) {
      console.error('[Pipeline] Failed to insert pieces:', error.message);
    } else {
      console.log(`[Pipeline] Saved ${pieces.length} pieces to Supabase`);
    }
  }
}

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  let payload;

  if (args[0]) {
    try {
      payload = JSON.parse(args[0]);
    } catch {
      payload = JSON.parse(fs.readFileSync(args[0], 'utf-8'));
    }
  } else {
    // Demo payload
    payload = {
      task_name: 'demo_clareamento',
      client_id: '11111111-1111-1111-1111-111111111111',
      procedure_focus: 'clareamento dental',
      campaign_objective: 'captacao_pacientes',
      platform_targets: ['instagram_feed'],
      tone: 'educativo',
      skip_research: false,
      skip_image: false,
      skip_video: true,
      skip_carousel: false,
    };
  }

  runPipeline(payload)
    .then(() => process.exit(0))
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runPipeline };
