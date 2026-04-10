'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Video Ad Specialist Agent Handler
 * Generates video ad script, storyboard, and Remotion composition config.
 */
async function handle(job) {
  const { task_name, client_id, procedure_focus, platform_targets } = job.data;
  const startTime = Date.now();
  const outputDir = path.resolve(__dirname, '../../outputs', task_name);

  fs.mkdirSync(outputDir, { recursive: true });

  job.log(`Processing video_ad_specialist for ${task_name}...`);
  job.updateProgress(10);

  // Read research data if available
  const researchPath = path.join(outputDir, 'research_results.json');
  let research = null;
  try {
    research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
    job.log('Loaded research_results.json for video script.');
  } catch (err) {
    job.log(`No research results found: ${err.message}. Using defaults.`);
  }

  job.updateProgress(25);

  // Generate video script
  const script = {
    task_name,
    client_id,
    procedure_focus,
    duration_seconds: 30,
    scenes: [
      {
        scene: 1,
        duration: '0:00–0:05',
        visual: 'Slow zoom on a confident smile',
        voiceover: `What if your smile could change everything?`,
        text_overlay: procedure_focus,
        music: 'Uplifting ambient — soft intro',
      },
      {
        scene: 2,
        duration: '0:05–0:12',
        visual: 'Modern dental office, patient in chair smiling',
        voiceover: `With ${procedure_focus}, our expert team delivers stunning results using the latest technology.`,
        text_overlay: 'Expert Care. Modern Technology.',
        music: 'Build — light percussion added',
      },
      {
        scene: 3,
        duration: '0:12–0:20',
        visual: 'Before/after split screen transition',
        voiceover: 'See the transformation for yourself. Real patients, real results.',
        text_overlay: 'Real Results',
        music: 'Emotional peak',
      },
      {
        scene: 4,
        duration: '0:20–0:27',
        visual: 'Patient walking out of office, beaming',
        voiceover: 'Minimal discomfort, maximum confidence. Your new smile is waiting.',
        text_overlay: 'Minimal Downtime',
        music: 'Resolving — warm tones',
      },
      {
        scene: 5,
        duration: '0:27–0:30',
        visual: 'Logo + CTA overlay on brand gradient',
        voiceover: 'Book your free consultation today.',
        text_overlay: 'Book Now — Call or Visit Us Online',
        music: 'Gentle outro sting',
      },
    ],
    generated_at: new Date().toISOString(),
  };

  const scriptPath = path.join(outputDir, 'video_script.json');
  fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2), 'utf-8');
  job.log(`Wrote video script: ${scriptPath}`);

  job.updateProgress(50);

  // Generate Remotion composition config (placeholder)
  const remotionConfig = {
    id: `${task_name}-video-ad`,
    component: 'VideoAd',
    durationInFrames: 900,
    fps: 30,
    width: 1080,
    height: 1920,
    defaultProps: {
      procedure: procedure_focus,
      clientId: client_id,
      scenes: script.scenes.map((s) => ({
        text: s.text_overlay,
        voiceover: s.voiceover,
      })),
    },
    generated_at: new Date().toISOString(),
  };

  const remotionPath = path.join(outputDir, 'remotion_config.json');
  fs.writeFileSync(remotionPath, JSON.stringify(remotionConfig, null, 2), 'utf-8');
  job.log(`Wrote Remotion config: ${remotionPath}`);

  job.updateProgress(80);

  // Remotion rendering placeholder
  job.log('Remotion video rendering: [PLACEHOLDER — would render video_ad.mp4]');

  job.updateProgress(100);

  const duration = Date.now() - startTime;
  return {
    status: 'completed',
    agent: 'video_ad_specialist',
    duration_ms: duration,
    outputs: [scriptPath, remotionPath],
    notes: 'Video script and Remotion config generated. Rendering is a placeholder.',
  };
}

module.exports = { handle };
