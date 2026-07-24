export function shouldUseAI(_query: string): boolean {
  // ALL queries go through the LLM — it understands natural language variations
  // The regex parser is too rigid and misses valid command phrasings
  return true;
}
