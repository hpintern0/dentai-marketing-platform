'use strict';

const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const handlers = require('./agents');

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
// Worker
// ---------------------------------------------------------------------------

let worker = null;

function startWorker() {
  const connection = createRedisConnection();

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const agentName = job.name;
      const handler = handlers[agentName];

      if (!handler) {
        const knownAgents = Object.keys(handlers);
        const msg = `No handler registered for agent "${agentName}". Known agents: ${knownAgents.join(', ')}`;
        console.error(`[Worker] ${msg}`);
        throw new Error(msg);
      }

      console.log(`[Worker] Starting job ${job.id} — agent: ${agentName}, task: ${job.data.task_name || 'unknown'}`);
      const startTime = Date.now();

      try {
        const result = await handler(job);
        const elapsed = Date.now() - startTime;
        console.log(`[Worker] Completed job ${job.id} — agent: ${agentName} in ${elapsed}ms`);
        return result;
      } catch (err) {
        const elapsed = Date.now() - startTime;
        console.error(`[Worker] Failed job ${job.id} — agent: ${agentName} after ${elapsed}ms: ${err.message}`);
        throw err;
      }
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
      settings: {
        backoffStrategy: (attemptsMade) => {
          // Exponential backoff: 2s, 4s, 8s
          return Math.min(Math.pow(2, attemptsMade) * 1000, 8000);
        },
      },
    },
  );

  // -------------------------------------------------------------------------
  // Event listeners — emit progress for WebSocket consumption
  // -------------------------------------------------------------------------

  worker.on('completed', (job, result) => {
    console.log(`[Worker:completed] Job ${job.id} (${job.name}) — status: ${result?.status || 'done'}`);
    // Emit event for WebSocket bridge (when integrated)
    if (process.send) {
      process.send({ event: 'job:completed', jobId: job.id, name: job.name, result });
    }
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker:failed] Job ${job?.id} (${job?.name}) — attempt ${job?.attemptsMade}/${job?.opts?.attempts || 3}: ${err.message}`);
    if (process.send) {
      process.send({ event: 'job:failed', jobId: job?.id, name: job?.name, error: err.message, attempt: job?.attemptsMade });
    }
  });

  worker.on('progress', (job, progress) => {
    console.log(`[Worker:progress] Job ${job.id} (${job.name}) — ${typeof progress === 'object' ? JSON.stringify(progress) : progress}%`);
    if (process.send) {
      process.send({ event: 'job:progress', jobId: job.id, name: job.name, progress });
    }
  });

  worker.on('error', (err) => {
    console.error('[Worker:error]', err.message);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`[Worker:stalled] Job ${jobId} has stalled.`);
  });

  console.log(`[Worker] Listening on queue "${QUEUE_NAME}" — Redis: ${REDIS_URL.replace(/\/\/.*@/, '//***@')}`);
  console.log(`[Worker] Registered agents: ${Object.keys(handlers).join(', ')}`);

  return worker;
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

async function shutdown(signal) {
  console.log(`\n[Worker] Received ${signal}. Shutting down gracefully...`);
  if (worker) {
    await worker.close();
    console.log('[Worker] Worker closed.');
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (require.main === module) {
  startWorker();
}

module.exports = { startWorker, QUEUE_NAME };
