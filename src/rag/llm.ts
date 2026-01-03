export async function embed(text: string): Promise<number[]> {
  // Stub simples: NÃO é embedding real. Só pra fluxo funcionar sem API.
  // Trocaremos por OpenAI (text-embedding-3-small)
  const arr = Array.from(text.slice(0, 256)).map((c) => c.charCodeAt(0) / 255);
  while (arr.length < 256) arr.push(0);
  return arr;
}

export async function generateAnswer(question: string, context: string) {
  // Stub: responde "resumindo" o contexto
  if (!context.trim())
    return "Não encontrei contexto suficiente para responder com segurança";
  return `Com base no contexto: ${context.slice(0, 400)}...`;
}
