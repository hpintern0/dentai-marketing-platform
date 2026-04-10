import IORedis from 'ioredis';

const redisUrl = process.env.UPSTASH_REDIS_URL!;

export const redis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: redisUrl.startsWith('rediss://') ? {} : undefined,
});

export const QUEUE_NAME = 'dental-content-pipeline';
