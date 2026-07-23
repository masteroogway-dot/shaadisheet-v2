export function shouldUseAI(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Simple CRUD commands - use fast parser (ALWAYS, regardless of length)
  const simplePatterns = [
    /^(mark|set|change|update|make|turn|switch|assign)\s+/,
    /^(delete|remove|clear|drop)\s+/,
    /^(add|create|new)\s+/,
    /^(how many|what's|what is|show|list|count)\s+/,
    /^(yes|no|all yes|cancel|confirm|y|n)$/i,
  ];
  if (simplePatterns.some((p) => p.test(q))) return false;

  // Complex queries - use AI
  const complexPatterns = [
    /summar/i,
    /suggest/i,
    /recommend/i,
    /advice/i,
    /should i/i,
    /what.*miss/i,
    /what.*missing/i,
    /what.*next/i,
    /priorit/i,
    /analyze/i,
    /compare/i,
    /plan(?!ning)/i,
    /how.*improve/i,
    /how.*optimize/i,
    /what.*think/i,
    /tell me about/i,
    /explain/i,
    /why/i,
    /help me/i,
    /what.*status/i,
    /overview/i,
    /progress/i,
    /cultural/i,
    /ritual/i,
    /tradition/i,
    /ceremony/i,
    /find.*vendor/i,
    /food.*vendor/i,
    /vendor.*recommend/i,
  ];
  if (complexPatterns.some((p) => p.test(q))) return true;

  // Default to parser
  return false;
}
