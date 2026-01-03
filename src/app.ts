import express from "express";
import cors from "cors";
import { ingestQueue } from "./queue/bullmq.js";
import { ask } from "./rag/ask.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/ingest", async (req, res) => {
  try {
    const { docId, text } = req.body ?? {};
    if (!docId || typeof docId !== "string")
      return res.status(400).json({ error: "docId é obrigatorio (string)" });
    if (!text || typeof text !== "string")
      return res.status(400).json({ error: "text é obrigatorio (string)" });

    const job = await ingestQueue.add("ingest-doc", { docId, text });

    return res.status(202).json({ ok: true, jobId: job.id });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error?.message ?? "Erro desconhecido" });
  }
});

app.get("/jobs/:id", async (req, res) => {
  try {
    const job = await ingestQueue.getJob(req.params.id);

    if (!job)
      return res.status(404).json({ ok: false, error: "Job não encontrado" });

    const state = await job.getState();
    res.json({
      ok: true,
      id: job.id,
      state,
      failedReason: job.failedReason,
      returnValue: job.returnvalue,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Erro desconhecido" });
  }
});

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body ?? {};
    if (!question || typeof question !== "string")
      return res.status(400).json({ error: "question é obrigatorio (string)" });

    const result = await ask(question);
    return res.json({ ok: true, ...result });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error?.message ?? "Erro desconhecido" });
  }
});
