import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_NAME } from "./queue/bullmq.js";
import { IngestJob } from "./queue/types.js";
import { ingest } from "./rag/ingest.js";

const connection = new IORedis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

new Worker<IngestJob>(
  QUEUE_NAME,
  async (job) => {
    const { docId, text } = job.data;

    console.log(
      JSON.stringify({ event: "ingest_job_stated", jobId: job.id, docId })
    );
    const r = await ingest({ docId, text });
    console.log(
      JSON.stringify({ event: "ingest_job_done", jobId: job.id, ...r })
    );

    return r;
  },
  {
    connection,
    concurrency: 2,
  }
);

console.log(" BullMQ Worker rodando...");
