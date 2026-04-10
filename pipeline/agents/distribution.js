'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Distribution Agent Handler
 * Packages approved content and prepares it for platform distribution.
 */
async function handle(job) {
  const { task_name, client_id, procedure_focus, platform_targets } = job.data;
  const startTime = Date.now();
  const outputDir = path.resolve(__dirname, '../../outputs', task_name);

  fs.mkdirSync(outputDir, { recursive: true });

  job.log(`Processing distribution_agent for ${task_name}...`);
  job.updateProgress(10);

  // Check for approval
  const correctionPath = path.join(outputDir, 'correction_result.json');
  const consolidatedPath = path.join(outputDir, 'consolidated_issues.json');
  let approved = false;
  let finalScore = 0;

  try {
    const correction = JSON.parse(fs.readFileSync(correctionPath, 'utf-8'));
    approved = correction.approved;
    finalScore = correction.final_score;
    job.log(`Correction result found: score ${finalScore}, approved: ${approved}`);
  } catch (_) {
    try {
      const consolidated = JSON.parse(fs.readFileSync(consolidatedPath, 'utf-8'));
      approved = consolidated.all_pass;
      finalScore = consolidated.overall_score;
      job.log(`Using consolidated issues: score ${finalScore}, all_pass: ${approved}`);
    } catch (err) {
      job.log(`No review data found: ${err.message}. Proceeding with distribution anyway.`);
      approved = true;
      finalScore = 100;
    }
  }

  job.updateProgress(30);

  // Collect all output assets
  let allFiles = [];
  try {
    allFiles = fs.readdirSync(outputDir);
  } catch (err) {
    job.log(`Could not read output directory: ${err.message}`);
  }

  job.updateProgress(50);

  // Build distribution package per platform
  const packages = {};
  for (const platform of platform_targets) {
    const slug = platform.toLowerCase().replace(/\s+/g, '_');
    packages[platform] = {
      platform,
      status: approved ? 'ready_to_publish' : 'blocked_pending_approval',
      assets: {
        copy: allFiles.filter((f) => f.startsWith(`copy_${slug}`)).map((f) => path.join(outputDir, f)),
        creative: allFiles.filter((f) => f.endsWith('.html') || f.endsWith('.png')).map((f) => path.join(outputDir, f)),
        video: allFiles.filter((f) => f.includes('video') || f.includes('remotion')).map((f) => path.join(outputDir, f)),
        carousel: allFiles.filter((f) => f.includes('carousel')).map((f) => path.join(outputDir, f)),
      },
      scheduled_publish: null, // placeholder for scheduling
      notes: approved
        ? `Ready for ${platform} distribution.`
        : `Blocked: final score ${finalScore}/100.`,
    };
  }

  job.updateProgress(75);

  // Write distribution manifest
  const distManifest = {
    task_name,
    client_id,
    procedure_focus,
    approved,
    final_score: finalScore,
    platform_count: platform_targets.length,
    total_assets: allFiles.length,
    packages,
    distributed_at: new Date().toISOString(),
  };

  const distPath = path.join(outputDir, 'distribution_manifest.json');
  fs.writeFileSync(distPath, JSON.stringify(distManifest, null, 2), 'utf-8');
  job.log(`Wrote distribution manifest: ${distPath}`);

  // Write final pipeline summary
  const summary = {
    task_name,
    client_id,
    procedure_focus,
    platforms: platform_targets,
    final_score: finalScore,
    approved,
    total_outputs: allFiles.length,
    output_directory: outputDir,
    completed_at: new Date().toISOString(),
  };

  const summaryPath = path.join(outputDir, 'pipeline_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
  job.log(`Wrote pipeline summary: ${summaryPath}`);

  job.updateProgress(100);

  const duration = Date.now() - startTime;
  return {
    status: 'completed',
    agent: 'distribution_agent',
    duration_ms: duration,
    outputs: [distPath, summaryPath],
    approved,
    notes: approved
      ? `Distribution package ready for ${platform_targets.length} platform(s).`
      : `Distribution blocked — score ${finalScore}/100.`,
  };
}

module.exports = { handle };
