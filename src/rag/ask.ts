import { embed, generateAnswer } from "./llm.js";
import { search } from "./vectorStore.js";

export async function ask(question: string) {
  const q = await embed(question);
  const hits = search(q, 5);

  const context = hits
    .filter((h) => h.score > 0.05) // threshold bem baixo só pra stub
    .map((h) => `(${h.docId}) ${h.chunk}`)
    .join("\n---\n");

  const answer = await generateAnswer(question, context);

  return {
    answer,
    sources: hits.map((h) => ({ docId: h.docId, score: h.score })),
  };
}
