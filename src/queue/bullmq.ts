import { Queue } from "bullmq";
import IORedis from "ioredis";
import type { IngestJob } from "./types.js";

const connection = new IORedis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

export const QUEUE_NAME = process.env.QUEUE_NAME ?? "ingest";

export const ingestQueue = new Queue<IngestJob>(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 1000,
  },
});
