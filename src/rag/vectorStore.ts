type Vec = number[];
type DocChunk = { docId: string; chunk: string; embedding: Vec };

const store: DocChunk[] = [];

export function addEmbedding(docId: string, chunk: string, embedding: Vec) {
  store.push({ docId, chunk, embedding });
}

function cosine(a: Vec, b: Vec) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

export function search(queryEmbedding: Vec, topK = 5) {
  return store
    .map((x) => ({ ...x, score: cosine(queryEmbedding, x.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
