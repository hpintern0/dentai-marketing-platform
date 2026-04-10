'use strict';

const dentalResearch = require('./dental-research');
const copywriter = require('./copywriter');
const adCreative = require('./ad-creative');
const carousel = require('./carousel');
const videoAd = require('./video-ad');
const reviewLoop = require('./review-loop');
const distribution = require('./distribution');

/**
 * Agent Handler Registry
 * Maps agent/job names to their handler functions.
 * Each handler receives a BullMQ job and returns a result object.
 */
const agentHandlers = {
  // --- Research phase ---
  dental_research_agent: dentalResearch.handle,
  dental_intelligence_agent: async (job) => {
    // Intelligence agent shares the research interface but focuses on
    // competitive analysis and market positioning. Stub for now.
    const fs = require('fs');
    const path = require('path');
    const { task_name, procedure_focus } = job.data;
    const startTime = Date.now();
    const outputDir = path.resolve(__dirname, '../../outputs', task_name);

    fs.mkdirSync(outputDir, { recursive: true });
    job.log(`Processing dental_intelligence_agent for ${task_name}...`);
    job.updateProgress(20);

    const intelligence = {
      task_name,
      procedure_focus,
      market_analysis: {
        competitors: ['[STUB] Competitor A', '[STUB] Competitor B'],
        avg_price_range: '$500–$3,000',
        demand_trend: 'increasing',
        peak_search_months: ['January', 'May', 'September'],
      },
      positioning_recommendations: [
        'Emphasize technology and comfort',
        'Highlight financing options',
        'Use before/after social proof',
      ],
      generated_at: new Date().toISOString(),
    };

    const intelligencePath = path.join(outputDir, 'intelligence_report.json');
    fs.writeFileSync(intelligencePath, JSON.stringify(intelligence, null, 2), 'utf-8');
    job.log(`Wrote intelligence report: ${intelligencePath}`);
    job.updateProgress(100);

    return {
      status: 'completed',
      agent: 'dental_intelligence_agent',
      duration_ms: Date.now() - startTime,
      outputs: [intelligencePath],
      notes: 'Stub intelligence report generated.',
    };
  },

  // --- Creative phase ---
  ad_creative_designer: adCreative.handle,
  carousel_agent: carousel.handle,
  video_ad_specialist: videoAd.handle,
  copywriter_agent: copywriter.handle,

  // --- Review phase ---
  review_orchestrator: reviewLoop.handleReviewOrchestrator,
  cfo_compliance_reviewer: reviewLoop.handleCfoCompliance,
  copy_reviewer: reviewLoop.handleCopyReviewer,
  visual_reviewer: reviewLoop.handleVisualReviewer,
  dental_expert_reviewer: reviewLoop.handleDentalExpert,

  // --- Consolidation & correction ---
  issue_consolidator: reviewLoop.handleIssueConsolidator,
  correction_agent: reviewLoop.handleCorrectionAgent,

  // --- Distribution ---
  distribution_agent: distribution.handle,
};

/**
 * Get handler for a given agent name.
 * @param {string} agentName
 * @returns {Function|null}
 */
function getHandler(agentName) {
  return agentHandlers[agentName] || null;
}

/**
 * List all registered agent names.
 * @returns {string[]}
 */
function listAgents() {
  return Object.keys(agentHandlers);
}

module.exports = {
  agentHandlers,
  getHandler,
  listAgents,
};
