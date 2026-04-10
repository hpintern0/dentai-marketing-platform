'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Carousel Agent Handler
 * Generates multi-slide carousel content for social media platforms.
 */
async function handle(job) {
  const { task_name, client_id, procedure_focus, platform_targets } = job.data;
  const startTime = Date.now();
  const outputDir = path.resolve(__dirname, '../../outputs', task_name);

  fs.mkdirSync(outputDir, { recursive: true });

  job.log(`Processing carousel_agent for ${task_name}...`);
  job.updateProgress(10);

  // Read research data if available
  const researchPath = path.join(outputDir, 'research_results.json');
  let research = null;
  try {
    research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
    job.log('Loaded research_results.json for carousel content.');
  } catch (err) {
    job.log(`No research results found: ${err.message}. Using defaults.`);
  }

  job.updateProgress(30);

  // Generate carousel slides
  const slides = [
    {
      slide: 1,
      type: 'cover',
      headline: `Everything You Need to Know About ${procedure_focus}`,
      subtext: 'Swipe to learn more',
      background: '#1a1a2e',
      accent: '#0abde3',
    },
    {
      slide: 2,
      type: 'benefit',
      headline: 'Why Choose This Procedure?',
      body: `${procedure_focus} offers life-changing results with modern techniques that minimize discomfort and recovery time.`,
      icon: 'sparkles',
    },
    {
      slide: 3,
      type: 'process',
      headline: 'What to Expect',
      body: 'Step 1: Consultation — Step 2: Custom Treatment Plan — Step 3: Procedure Day — Step 4: Your New Smile',
      icon: 'clipboard-check',
    },
    {
      slide: 4,
      type: 'social-proof',
      headline: 'Trusted by Thousands',
      body: '98% patient satisfaction. See what our patients are saying about their experience.',
      icon: 'star',
    },
    {
      slide: 5,
      type: 'cta',
      headline: 'Ready to Get Started?',
      body: 'Book your free consultation today and take the first step toward your dream smile.',
      cta: 'Book Now — Link in Bio',
      icon: 'calendar',
    },
  ];

  const carouselPayload = {
    task_name,
    client_id,
    procedure_focus,
    slide_count: slides.length,
    dimensions: { width: 1080, height: 1080 },
    slides,
    generated_at: new Date().toISOString(),
  };

  const carouselPath = path.join(outputDir, 'carousel.json');
  fs.writeFileSync(carouselPath, JSON.stringify(carouselPayload, null, 2), 'utf-8');
  job.log(`Wrote carousel definition: ${carouselPath}`);

  job.updateProgress(70);

  // Generate individual slide HTML stubs
  const slideFiles = [];
  for (const slide of slides) {
    const fileName = `carousel_slide_${slide.slide}.html`;
    const filePath = path.join(outputDir, fileName);
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  body { width: 1080px; height: 1080px; margin: 0; font-family: Inter, sans-serif; background: #1a1a2e; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px; }
  h1 { font-size: 48px; margin-bottom: 24px; color: #0abde3; }
  p { font-size: 28px; line-height: 1.5; }
</style></head><body>
  <h1>${slide.headline}</h1>
  <p>${slide.body || slide.subtext || ''}</p>
</body></html>`;
    fs.writeFileSync(filePath, html, 'utf-8');
    slideFiles.push(filePath);
  }
  job.log(`Wrote ${slideFiles.length} slide HTML files.`);

  job.updateProgress(100);

  const duration = Date.now() - startTime;
  return {
    status: 'completed',
    agent: 'carousel_agent',
    duration_ms: duration,
    outputs: [carouselPath, ...slideFiles],
    notes: `Generated ${slides.length}-slide carousel.`,
  };
}

module.exports = { handle };
