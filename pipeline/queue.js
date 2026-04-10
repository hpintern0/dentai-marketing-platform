// This module is optional — the in-process runner (pipeline/runner.js)
// doesn't need Redis. Only used if BullMQ worker mode is enabled.

let Queue, FlowProducer;
try {
  ({ Queue, FlowProducer } = require('bullmq'));
} catch (err) {
  console.warn('[queue.js] BullMQ not available — use pipeline/runner.js instead');
  Queue = null;
  FlowProducer = null;
}

function getConnection() {
  const url = process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379';
  return {
    host: new URL(url).hostname,
    port: parseInt(new URL(url).port || '6379'),
    password: new URL(url).password || undefined,
    tls: url.startsWith('rediss://') ? {} : undefined,
  };
}

const QUEUE_NAME = 'dental-content-pipeline';

let _queue = null;
function getQueue() {
  if (!Queue) {
    throw new Error('BullMQ is not available. Use pipeline/runner.js for in-process execution.');
  }
  if (!_queue) {
    _queue = new Queue(QUEUE_NAME, { connection: getConnection() });
  }
  return _queue;
}

async function enqueueJob(jobName, data, opts = {}) {
  const queue = getQueue();
  return queue.add(jobName, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    ...opts,
  });
}

async function enqueuePipeline(payload) {
  const queue = getQueue();
  // Add jobs sequentially — the worker handles dependencies via the flow
  const jobs = [];

  // Phase 1: Research (parallel)
  if (!payload.skip_research) {
    jobs.push(await queue.add('dental_research_agent', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }));
  }
  jobs.push(await queue.add('dental_intelligence_agent', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }));

  // Phase 2: Creative (after research)
  if (!payload.skip_image) {
    jobs.push(await queue.add('ad_creative_designer', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }));
  }
  if (!payload.skip_carousel) {
    jobs.push(await queue.add('carousel_agent', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }));
  }
  if (!payload.skip_video) {
    jobs.push(await queue.add('video_ad_specialist', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }));
  }
  jobs.push(await queue.add('copywriter_agent', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }));

  // Phase 3: Review
  jobs.push(await queue.add('review_orchestrator', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }));

  // Phase 4: Distribution
  jobs.push(await queue.add('distribution_agent', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }));

  return jobs;
}

module.exports = { getConnection, getQueue, enqueueJob, enqueuePipeline, QUEUE_NAME };
