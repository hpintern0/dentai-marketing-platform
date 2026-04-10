'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Review Loop Handler
 * Orchestrates: review_orchestrator, 4 specialized reviewers,
 * issue consolidation, and correction loop (up to 3 attempts).
 */

// --- Review Orchestrator ---
async function handleReviewOrchestrator(job) {
  const { task_name } = job.data;
  const startTime = Date.now();
  const outputDir = path.resolve(__dirname, '../../outputs', task_name);

  job.log(`Processing review_orchestrator for ${task_name}...`);
  job.updateProgress(10);

  // Gather all creative outputs to build the review manifest
  const creativeFiles = [
    'layout.json', 'ad.html', 'carousel.json', 'video_script.json',
    'copy_manifest.json', 'remotion_config.json',
  ];

  const manifest = {
    task_name,
    assets_for_review: [],
    generated_at: new Date().toISOString(),
  };

  for (const file of creativeFiles) {
    const filePath = path.join(outputDir, file);
    if (fs.existsSync(filePath)) {
      manifest.assets_for_review.push({ file, path: filePath, exists: true });
    } else {
      manifest.assets_for_review.push({ file, path: filePath, exists: false });
    }
  }

  const manifestPath = path.join(outputDir, 'review_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  job.log(`Wrote review manifest: ${manifestPath}`);

  job.updateProgress(100);

  return {
    status: 'completed',
    agent: 'review_orchestrator',
    duration_ms: Date.now() - startTime,
    outputs: [manifestPath],
    notes: `Found ${manifest.assets_for_review.filter((a) => a.exists).length} assets for review.`,
  };
}

// --- Individual Reviewers ---
function makeReviewer(reviewerName, focusAreas) {
  return async function handleReviewer(job) {
    const { task_name, procedure_focus } = job.data;
    const startTime = Date.now();
    const outputDir = path.resolve(__dirname, '../../outputs', task_name);

    job.log(`Processing ${reviewerName} for ${task_name}...`);
    job.updateProgress(10);

    // Simulate review — each reviewer checks different aspects
    const issues = [];
    const score = Math.floor(Math.random() * 20) + 80; // 80-99 range for stubs

    for (const area of focusAreas) {
      if (Math.random() > 0.6) {
        issues.push({
          area,
          severity: Math.random() > 0.5 ? 'warning' : 'critical',
          message: `[STUB] Potential issue in ${area} for ${procedure_focus}.`,
          suggestion: `Review and update ${area} content.`,
        });
      }
    }

    job.updateProgress(70);

    const review = {
      reviewer: reviewerName,
      task_name,
      score,
      pass: score >= 90 && issues.filter((i) => i.severity === 'critical').length === 0,
      issues,
      reviewed_at: new Date().toISOString(),
    };

    const reviewPath = path.join(outputDir, `review_${reviewerName}.json`);
    fs.writeFileSync(reviewPath, JSON.stringify(review, null, 2), 'utf-8');
    job.log(`Wrote review: ${reviewPath} (score: ${score}, issues: ${issues.length})`);

    job.updateProgress(100);

    return {
      status: 'completed',
      agent: reviewerName,
      duration_ms: Date.now() - startTime,
      outputs: [reviewPath],
      score,
      issues_count: issues.length,
      notes: `Score: ${score}/100, ${issues.length} issue(s) found.`,
    };
  };
}

const handleCfoCompliance = makeReviewer('cfo_compliance_reviewer', [
  'pricing_claims', 'regulatory_compliance', 'disclaimer_presence',
  'insurance_language', 'promotional_restrictions',
]);

const handleCopyReviewer = makeReviewer('copy_reviewer', [
  'grammar', 'tone_consistency', 'cta_effectiveness',
  'character_limits', 'brand_voice',
]);

const handleVisualReviewer = makeReviewer('visual_reviewer', [
  'brand_colors', 'image_quality', 'text_readability',
  'layout_balance', 'accessibility',
]);

const handleDentalExpert = makeReviewer('dental_expert_reviewer', [
  'medical_accuracy', 'procedure_claims', 'patient_safety',
  'terminology', 'ethical_standards',
]);

// --- Issue Consolidator ---
async function handleIssueConsolidator(job) {
  const { task_name } = job.data;
  const startTime = Date.now();
  const outputDir = path.resolve(__dirname, '../../outputs', task_name);

  job.log(`Processing issue_consolidator for ${task_name}...`);
  job.updateProgress(10);

  const reviewerNames = [
    'cfo_compliance_reviewer', 'copy_reviewer',
    'visual_reviewer', 'dental_expert_reviewer',
  ];

  const allIssues = [];
  const scores = [];

  for (const name of reviewerNames) {
    const reviewPath = path.join(outputDir, `review_${name}.json`);
    try {
      const review = JSON.parse(fs.readFileSync(reviewPath, 'utf-8'));
      scores.push({ reviewer: name, score: review.score, pass: review.pass });
      for (const issue of review.issues) {
        allIssues.push({ ...issue, source: name });
      }
    } catch (err) {
      job.log(`Could not read review from ${name}: ${err.message}`);
      scores.push({ reviewer: name, score: null, pass: false, error: err.message });
    }
  }

  job.updateProgress(60);

  const avgScore = scores.filter((s) => s.score !== null).reduce((sum, s) => sum + s.score, 0) /
    Math.max(scores.filter((s) => s.score !== null).length, 1);

  const consolidated = {
    task_name,
    overall_score: Math.round(avgScore),
    all_pass: scores.every((s) => s.pass),
    needs_correction: Math.round(avgScore) < 100,
    reviewer_scores: scores,
    total_issues: allIssues.length,
    critical_issues: allIssues.filter((i) => i.severity === 'critical').length,
    warning_issues: allIssues.filter((i) => i.severity === 'warning').length,
    issues: allIssues,
    consolidated_at: new Date().toISOString(),
  };

  const consolidatedPath = path.join(outputDir, 'consolidated_issues.json');
  fs.writeFileSync(consolidatedPath, JSON.stringify(consolidated, null, 2), 'utf-8');
  job.log(`Wrote consolidated issues: ${consolidatedPath}`);
  job.log(`Overall score: ${consolidated.overall_score}/100, ${allIssues.length} total issues.`);

  job.updateProgress(100);

  return {
    status: 'completed',
    agent: 'issue_consolidator',
    duration_ms: Date.now() - startTime,
    outputs: [consolidatedPath],
    overall_score: consolidated.overall_score,
    needs_correction: consolidated.needs_correction,
    notes: `Score: ${consolidated.overall_score}/100. ${allIssues.length} issue(s). Correction needed: ${consolidated.needs_correction}.`,
  };
}

// --- Correction Agent ---
async function handleCorrectionAgent(job) {
  const { task_name } = job.data;
  const startTime = Date.now();
  const outputDir = path.resolve(__dirname, '../../outputs', task_name);

  job.log(`Processing correction_agent for ${task_name}...`);
  job.updateProgress(10);

  const consolidatedPath = path.join(outputDir, 'consolidated_issues.json');
  let consolidated = null;
  try {
    consolidated = JSON.parse(fs.readFileSync(consolidatedPath, 'utf-8'));
  } catch (err) {
    job.log(`No consolidated issues found: ${err.message}. Nothing to correct.`);
    return {
      status: 'completed',
      agent: 'correction_agent',
      duration_ms: Date.now() - startTime,
      outputs: [],
      notes: 'No consolidated issues to correct.',
    };
  }

  job.updateProgress(30);

  // Simulate correction loop (up to 3 attempts)
  const maxAttempts = 3;
  let attempt = 0;
  let currentScore = consolidated.overall_score;
  const correctionLog = [];

  while (currentScore < 100 && attempt < maxAttempts) {
    attempt++;
    job.log(`Correction attempt ${attempt}/${maxAttempts} (current score: ${currentScore})...`);

    // Stub: simulate score improvement per attempt
    const improvement = Math.min(100 - currentScore, Math.floor(Math.random() * 10) + 5);
    currentScore = Math.min(100, currentScore + improvement);

    correctionLog.push({
      attempt,
      previous_score: currentScore - improvement,
      new_score: currentScore,
      issues_addressed: Math.ceil(consolidated.total_issues / maxAttempts),
      timestamp: new Date().toISOString(),
    });

    job.updateProgress(30 + Math.round((attempt / maxAttempts) * 60));
  }

  const correctionResult = {
    task_name,
    initial_score: consolidated.overall_score,
    final_score: currentScore,
    attempts: attempt,
    max_attempts: maxAttempts,
    approved: currentScore >= 95,
    corrections: correctionLog,
    corrected_at: new Date().toISOString(),
  };

  const correctionPath = path.join(outputDir, 'correction_result.json');
  fs.writeFileSync(correctionPath, JSON.stringify(correctionResult, null, 2), 'utf-8');
  job.log(`Wrote correction result: ${correctionPath}`);
  job.log(`Final score: ${currentScore}/100 after ${attempt} attempt(s). Approved: ${correctionResult.approved}`);

  job.updateProgress(100);

  return {
    status: 'completed',
    agent: 'correction_agent',
    duration_ms: Date.now() - startTime,
    outputs: [correctionPath],
    final_score: currentScore,
    approved: correctionResult.approved,
    notes: `Score improved from ${consolidated.overall_score} to ${currentScore} in ${attempt} attempt(s).`,
  };
}

module.exports = {
  handleReviewOrchestrator,
  handleCfoCompliance,
  handleCopyReviewer,
  handleVisualReviewer,
  handleDentalExpert,
  handleIssueConsolidator,
  handleCorrectionAgent,
};
