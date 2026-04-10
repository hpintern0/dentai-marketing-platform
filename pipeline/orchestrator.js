'use strict';

const { Queue, FlowProducer } = require('bullmq');
const IORedis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const QUEUE_NAME = 'dental-content-pipeline';
const REDIS_URL = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';

function createRedisConnection() {
  const conn = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    tls: REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  });
  conn.on('error', (err) => console.error('[Redis]', err.message));
  return conn;
}

// ---------------------------------------------------------------------------
// Demo payload
// ---------------------------------------------------------------------------

const DEMO_PAYLOAD = {
  task_name: `demo_invisalign_${Date.now()}`,
  client_id: 'demo-dental-clinic-001',
  procedure_focus: 'Invisalign Clear Aligners',
  platform_targets: ['Facebook', 'Instagram', 'Google Ads', 'TikTok'],
  brand_voice: 'Professional yet approachable',
  budget_tier: 'premium',
  skip_research: false,
  skip_image: false,
  skip_video: false,
  skip_carousel: false,
};

// ---------------------------------------------------------------------------
// Payload validation
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS = ['task_name', 'client_id', 'procedure_focus', 'platform_targets'];

function validatePayload(payload) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (payload[field] === undefined || payload[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  if (payload.platform_targets && !Array.isArray(payload.platform_targets)) {
    errors.push('platform_targets must be an array');
  }
  if (payload.platform_targets && Array.isArray(payload.platform_targets) && payload.platform_targets.length === 0) {
    errors.push('platform_targets must contain at least one platform');
  }
  if (errors.length > 0) {
    throw new Error(`Payload validation failed:\n  - ${errors.join('\n  - ')}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Shared job options
// ---------------------------------------------------------------------------

function jobOpts(payload) {
  return {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 86400 }, // keep 24h
    removeOnFail: { age: 604800 },    // keep 7 days
  };
}

// ---------------------------------------------------------------------------
// Build dependency graph as a BullMQ flow
// ---------------------------------------------------------------------------

function buildFlow(payload) {
  const data = { ...payload };
  const opts = jobOpts(payload);
  const skipResearch = payload.skip_research || false;
  const skipImage = payload.skip_image || false;
  const skipVideo = payload.skip_video || false;
  const skipCarousel = payload.skip_carousel || false;

  // -----------------------------------------------------------------------
  // The flow is built bottom-up (leaf children first).
  // BullMQ FlowProducer processes children before the parent.
  // So the root is distribution_agent, and everything else is nested.
  // -----------------------------------------------------------------------

  // --- Phase 1: Research (parallel, no deps) ---
  const researchJobs = [];
  if (!skipResearch) {
    researchJobs.push(
      { name: 'dental_research_agent', queueName: QUEUE_NAME, data, opts },
      { name: 'dental_intelligence_agent', queueName: QUEUE_NAME, data, opts },
    );
  }

  // --- Phase 2: Creative agents (parallel, depend on research) ---
  const creativeJobs = [];

  if (!skipImage) {
    creativeJobs.push({
      name: 'ad_creative_designer',
      queueName: QUEUE_NAME,
      data,
      opts,
      children: skipResearch ? [] : [...researchJobs],
    });
  }

  if (!skipCarousel) {
    creativeJobs.push({
      name: 'carousel_agent',
      queueName: QUEUE_NAME,
      data,
      opts,
      children: skipResearch ? [] : [...researchJobs],
    });
  }

  if (!skipVideo) {
    creativeJobs.push({
      name: 'video_ad_specialist',
      queueName: QUEUE_NAME,
      data,
      opts,
      children: skipResearch ? [] : [...researchJobs],
    });
  }

  creativeJobs.push({
    name: 'copywriter_agent',
    queueName: QUEUE_NAME,
    data,
    opts,
    children: skipResearch ? [] : [...researchJobs],
  });

  // If all creative jobs were skipped somehow, ensure at least copywriter runs
  const creativeChildren = creativeJobs.length > 0 ? creativeJobs : [{
    name: 'copywriter_agent',
    queueName: QUEUE_NAME,
    data,
    opts,
    children: skipResearch ? [] : [...researchJobs],
  }];

  // --- Phase 3: Review orchestrator (depends on all creative agents) ---
  const reviewOrchestratorJob = {
    name: 'review_orchestrator',
    queueName: QUEUE_NAME,
    data,
    opts,
    children: creativeChildren,
  };

  // --- Phase 4: Specialized reviewers (parallel, depend on review orchestrator) ---
  const reviewerJobs = [
    { name: 'cfo_compliance_reviewer', queueName: QUEUE_NAME, data, opts, children: [reviewOrchestratorJob] },
    { name: 'copy_reviewer', queueName: QUEUE_NAME, data, opts, children: [reviewOrchestratorJob] },
    { name: 'visual_reviewer', queueName: QUEUE_NAME, data, opts, children: [reviewOrchestratorJob] },
    { name: 'dental_expert_reviewer', queueName: QUEUE_NAME, data, opts, children: [reviewOrchestratorJob] },
  ];

  // --- Phase 5: Issue consolidator (depends on all reviewers) ---
  const issueConsolidatorJob = {
    name: 'issue_consolidator',
    queueName: QUEUE_NAME,
    data,
    opts,
    children: reviewerJobs,
  };

  // --- Phase 6: Correction agent (depends on consolidator, conditional) ---
  const correctionJob = {
    name: 'correction_agent',
    queueName: QUEUE_NAME,
    data,
    opts,
    children: [issueConsolidatorJob],
  };

  // --- Phase 7: Distribution (depends on correction/final approval) ---
  const distributionJob = {
    name: 'distribution_agent',
    queueName: QUEUE_NAME,
    data,
    opts,
    children: [correctionJob],
  };

  return distributionJob;
}

// ---------------------------------------------------------------------------
// Run pipeline
// ---------------------------------------------------------------------------

async function runPipeline(payload) {
  const resolvedPayload = payload || { ...DEMO_PAYLOAD };

  // Ensure unique task name
  if (!resolvedPayload.task_name || resolvedPayload.task_name === DEMO_PAYLOAD.task_name) {
    resolvedPayload.task_name = resolvedPayload.task_name || `task_${Date.now()}`;
  }

  console.log('[Orchestrator] Validating payload...');
  validatePayload(resolvedPayload);
  console.log('[Orchestrator] Payload valid.');

  console.log(`[Orchestrator] Task: ${resolvedPayload.task_name}`);
  console.log(`[Orchestrator] Client: ${resolvedPayload.client_id}`);
  console.log(`[Orchestrator] Procedure: ${resolvedPayload.procedure_focus}`);
  console.log(`[Orchestrator] Platforms: ${resolvedPayload.platform_targets.join(', ')}`);

  const skipFlags = [];
  if (resolvedPayload.skip_research) skipFlags.push('research');
  if (resolvedPayload.skip_image) skipFlags.push('image');
  if (resolvedPayload.skip_video) skipFlags.push('video');
  if (resolvedPayload.skip_carousel) skipFlags.push('carousel');
  if (skipFlags.length > 0) {
    console.log(`[Orchestrator] Skipping: ${skipFlags.join(', ')}`);
  }

  console.log('[Orchestrator] Building dependency graph...');
  const flow = buildFlow(resolvedPayload);

  console.log('[Orchestrator] Connecting to Redis...');
  const connection = createRedisConnection();

  const flowProducer = new FlowProducer({ connection });

  console.log('[Orchestrator] Enqueuing pipeline flow...');
  const tree = await flowProducer.add(flow);

  console.log(`[Orchestrator] Pipeline enqueued successfully.`);
  console.log(`[Orchestrator] Root job ID: ${tree.job.id}`);
  console.log(`[Orchestrator] Queue: ${QUEUE_NAME}`);
  console.log('[Orchestrator] Pipeline is running. Start the worker to process jobs:');
  console.log('  npm run pipeline:worker');

  // Clean up connection (FlowProducer creates its own)
  await flowProducer.close();
  await connection.quit();

  return {
    task_name: resolvedPayload.task_name,
    root_job_id: tree.job.id,
    queue: QUEUE_NAME,
    payload: resolvedPayload,
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  let payload = null;

  // Parse --payload flag
  const payloadIdx = args.indexOf('--payload');
  if (payloadIdx !== -1) {
    const payloadArg = args[payloadIdx + 1];
    if (!payloadArg) {
      console.error('[Orchestrator] --payload flag requires a JSON string or file path argument.');
      process.exit(1);
    }

    try {
      // Try parsing as JSON string first
      payload = JSON.parse(payloadArg);
    } catch (_) {
      // Try reading as file path
      try {
        const fs = require('fs');
        const content = fs.readFileSync(payloadArg, 'utf-8');
        payload = JSON.parse(content);
      } catch (err) {
        console.error(`[Orchestrator] Could not parse payload: ${err.message}`);
        process.exit(1);
      }
    }
  }

  try {
    const result = await runPipeline(payload);
    console.log('\n[Orchestrator] Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`[Orchestrator] Fatal error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

// ---------------------------------------------------------------------------
// Exports for programmatic use (from API routes, etc.)
// ---------------------------------------------------------------------------

module.exports = {
  QUEUE_NAME,
  DEMO_PAYLOAD,
  validatePayload,
  buildFlow,
  runPipeline,
  createRedisConnection,
};
