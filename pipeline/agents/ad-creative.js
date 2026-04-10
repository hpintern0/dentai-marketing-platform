'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Ad Creative Designer Agent Handler
 * Generates ad layout JSON and HTML template. Playwright rendering placeholder.
 */
async function handle(job) {
  const { task_name, client_id, procedure_focus, platform_targets } = job.data;
  const startTime = Date.now();
  const outputDir = path.resolve(__dirname, '../../outputs', task_name);

  fs.mkdirSync(outputDir, { recursive: true });

  job.log(`Processing ad_creative_designer for ${task_name}...`);
  job.updateProgress(10);

  // Read research brief if available
  const briefPath = path.join(outputDir, 'research_brief.md');
  let briefContent = '';
  try {
    briefContent = fs.readFileSync(briefPath, 'utf-8');
    job.log('Loaded research_brief.md for creative direction.');
  } catch (err) {
    job.log(`No research brief found: ${err.message}. Using defaults.`);
  }

  job.updateProgress(30);

  // Generate layout.json
  const layout = {
    task_name,
    client_id,
    procedure_focus,
    design: {
      width: 1080,
      height: 1080,
      background_color: '#1a1a2e',
      accent_color: '#0abde3',
      font_family: 'Inter, sans-serif',
    },
    layers: [
      { type: 'background', color: '#1a1a2e' },
      { type: 'image', placeholder: true, position: { x: 0, y: 0, w: 1080, h: 600 } },
      { type: 'text', content: `Transform Your Smile`, role: 'headline', position: { x: 60, y: 640, w: 960, h: 80 }, style: { fontSize: 48, fontWeight: 700, color: '#ffffff' } },
      { type: 'text', content: procedure_focus, role: 'subheadline', position: { x: 60, y: 740, w: 960, h: 60 }, style: { fontSize: 32, fontWeight: 400, color: '#0abde3' } },
      { type: 'text', content: 'Book Your Consultation', role: 'cta', position: { x: 60, y: 860, w: 400, h: 60 }, style: { fontSize: 24, fontWeight: 600, color: '#ffffff', background: '#0abde3', borderRadius: 12, padding: 16 } },
      { type: 'logo', placeholder: true, position: { x: 880, y: 960, w: 140, h: 60 } },
    ],
    generated_at: new Date().toISOString(),
  };

  const layoutPath = path.join(outputDir, 'layout.json');
  fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2), 'utf-8');
  job.log(`Wrote layout: ${layoutPath}`);

  job.updateProgress(60);

  // Generate ad.html
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1080">
  <title>${procedure_focus} Ad — ${client_id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1080px; font-family: Inter, sans-serif; background: #1a1a2e; color: #fff; overflow: hidden; }
    .hero { width: 100%; height: 600px; background: linear-gradient(135deg, #0abde3 0%, #1a1a2e 100%); display: flex; align-items: center; justify-content: center; }
    .hero-text { font-size: 64px; font-weight: 700; text-align: center; text-shadow: 0 2px 12px rgba(0,0,0,0.4); }
    .content { padding: 40px 60px; }
    .headline { font-size: 48px; font-weight: 700; margin-bottom: 16px; }
    .subheadline { font-size: 32px; color: #0abde3; margin-bottom: 40px; }
    .cta { display: inline-block; padding: 16px 40px; background: #0abde3; color: #fff; font-size: 24px; font-weight: 600; border-radius: 12px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="hero"><span class="hero-text">Your Best Smile Awaits</span></div>
  <div class="content">
    <div class="headline">Transform Your Smile</div>
    <div class="subheadline">${procedure_focus}</div>
    <a class="cta" href="#">Book Your Consultation</a>
  </div>
</body>
</html>`;

  const htmlPath = path.join(outputDir, 'ad.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  job.log(`Wrote ad HTML: ${htmlPath}`);

  job.updateProgress(85);

  // Playwright rendering placeholder
  job.log('Playwright screenshot rendering: [PLACEHOLDER — would capture ad.html as ad.png]');

  job.updateProgress(100);

  const duration = Date.now() - startTime;
  return {
    status: 'completed',
    agent: 'ad_creative_designer',
    duration_ms: duration,
    outputs: [layoutPath, htmlPath],
    notes: 'Layout and HTML generated. Playwright rendering is a placeholder.',
  };
}

module.exports = { handle };
