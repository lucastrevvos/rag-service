import { chunkText } from "./chunking.js";
import { embed } from "./llm.js";
import { addEmbedding } from "./vectorStore.js";

export async function ingest(input: { docId: string; text: string }) {
  const chunks = chunkText(input.text);
  for (const chunk of chunks) {
    const v = await embed(chunk);
    addEmbedding(input.docId, chunk, v);
  }
  return { docId: input.docId, chunks: chunks.length };
}
