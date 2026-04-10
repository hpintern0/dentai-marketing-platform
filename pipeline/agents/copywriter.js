'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Copywriter Agent Handler
 * Reads research results and generates platform-specific ad copy.
 */
async function handle(job) {
  const { task_name, client_id, procedure_focus, platform_targets } = job.data;
  const startTime = Date.now();
  const outputDir = path.resolve(__dirname, '../../outputs', task_name);

  fs.mkdirSync(outputDir, { recursive: true });

  job.log(`Processing copywriter_agent for ${task_name}...`);
  job.updateProgress(10);

  // Read research results if available
  const researchPath = path.join(outputDir, 'research_results.json');
  let research = null;
  try {
    research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
    job.log('Loaded research_results.json for copy generation.');
  } catch (err) {
    job.log(`Could not read research results: ${err.message}. Proceeding with defaults.`);
  }

  job.updateProgress(30);

  // Generate platform-specific copy
  const copyOutputs = {};
  const outputFiles = [];

  for (const platform of platform_targets) {
    const slug = platform.toLowerCase().replace(/\s+/g, '_');

    // Stub copy — placeholder for real AI generation
    const copy = {
      platform,
      procedure: procedure_focus,
      client_id,
      headline: `Transform Your Smile with ${procedure_focus}`,
      primary_text: `Discover the life-changing benefits of ${procedure_focus}. Our expert team uses the latest technology to deliver stunning results with minimal discomfort. Book your consultation today.`,
      description: `${procedure_focus} — safe, effective, and designed for your comfort.`,
      cta: 'Book Now',
      hashtags: [`#${procedure_focus.replace(/\s+/g, '')}`, '#DentalCare', '#SmileTransformation'],
      generated_at: new Date().toISOString(),
      source: research ? 'research-informed' : 'default-template',
    };

    copyOutputs[platform] = copy;

    const filePath = path.join(outputDir, `copy_${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(copy, null, 2), 'utf-8');
    outputFiles.push(filePath);
    job.log(`Wrote copy for ${platform}: ${filePath}`);
  }

  job.updateProgress(80);

  // Write combined copy manifest
  const manifestPath = path.join(outputDir, 'copy_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    task_name,
    client_id,
    procedure_focus,
    platforms: copyOutputs,
    generated_at: new Date().toISOString(),
  }, null, 2), 'utf-8');
  outputFiles.push(manifestPath);
  job.log(`Wrote copy manifest: ${manifestPath}`);

  job.updateProgress(100);

  const duration = Date.now() - startTime;
  return {
    status: 'completed',
    agent: 'copywriter_agent',
    duration_ms: duration,
    outputs: outputFiles,
    notes: `Generated copy for ${platform_targets.length} platform(s).`,
  };
}

module.exports = { handle };
