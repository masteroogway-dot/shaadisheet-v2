import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function formatINR(n: number) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + " L";
  if (n >= 1000) return (n / 1000).toFixed(1) + " K";
  return n.toString();
}

function buildWeddingContext(summary: any, learnedPatterns: any[]): string {
  const weddingDate = summary.weddingDate
    ? new Date(summary.weddingDate).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })
    : "Not set";
  const daysUntil = summary.weddingDate
    ? Math.ceil((new Date(summary.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  let ctx = `WEDDING DATA:
- Name: ${summary.name || "Not set"}
- Date: ${weddingDate}${daysUntil !== null ? ` (${daysUntil} days away)` : ""}
- City: ${summary.weddingCity || "Not set"}
- Religion: ${summary.religion || "Not set"}
- Budget: ${formatINR(summary.budget)}
- Budget Allocated: ${formatINR(summary.budgetAllocated)}
- Budget Spent: ${formatINR(summary.budgetSpent)}
- Budget Remaining: ${formatINR(summary.budgetRemaining)}
- Guests: ${summary.guestCount} total (RSVP Yes: ${summary.rsvpYes}, Pending: ${summary.rsvpPending}, Declined: ${summary.rsvpDeclined})
- Vendors: ${summary.vendorCount} total (Booked: ${summary.vendorsBooked})
- Tasks: ${summary.taskCount} total (Done: ${summary.tasksDone}, Remaining: ${summary.taskCount - summary.tasksDone})
- Room Allocations: ${summary.roomCount}
- Events: ${(summary.events || []).map((e: any) => e.name).join(", ") || "None configured"}
- Timeline Items: ${summary.timelineCount || 0}`;

  if (learnedPatterns.length > 0) {
    ctx += `\n\nLEARNED COMMANDS (${learnedPatterns.length}):\n${learnedPatterns.map((lp: any) => `- Pattern: "${lp.pattern}" → ${lp.content}`).join("\n")}`;
  }

  return ctx;
}

export async function askGemini(
  question: string,
  summary: any,
  learnedPatterns: any[] = [],
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const weddingCtx = buildWeddingContext(summary, learnedPatterns);

    const systemPrompt = `You are ShaadiSheet AI, a specialized wedding planning assistant for Indian weddings. You help with budget tracking, guest management, vendor coordination, seating, timeline, and room allocation.

CAPABILITIES:
- Answer questions about the wedding data
- Provide wedding planning advice and suggestions
- Help prioritize tasks and identify what's missing
- Give cultural/ritual advice for Hindu, Muslim, Sikh, Christian, Jain weddings
- Analyze budgets and suggest optimizations
- Track vendor status and payments

RULES:
- Be concise and direct. No filler.
- Use ₹ for currency. Format large numbers as Cr/L/K.
- When giving advice, be specific to Indian wedding context.
- If data shows something is incomplete, proactively suggest next steps.
- Never make up data. Only use what's provided in the wedding context.
- If a question requires bulk updates (RSVP changes, deletions, etc.), tell the user to use the built-in parser commands (like "Mark all Sharma guests as RSVP Yes") since you can't modify data directly.

${weddingCtx}`;

    const history = conversationHistory.slice(-10).map((m) => ({
      role: m.role === "bot" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Hello, I'm your ShaadiSheet AI assistant. Respond with just 'ready'." }] },
        { role: "model", parts: [{ text: "ready" }] },
        ...history,
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(question);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API error:", error);
    if (error.message?.includes("API key")) {
      return "Gemini API key is invalid or expired. Using built-in parser instead.";
    }
    throw error;
  }
}

export function shouldUseGemini(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Simple CRUD commands — use fast parser
  const simplePatterns = [
    /^(mark|set|change|update|make|turn|switch|assign)\s+/,
    /^(delete|remove|clear)\s+/,
    /^(add|create|new)\s+/,
    /^(how many|what's|what is|show|list|count)\s+/,
    /^(yes|no|all yes|cancel|confirm|y|n)$/i,
  ];
  if (simplePatterns.some((p) => p.test(q))) return false;

  // Complex queries — use Gemini
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
    /plan/i,
    /how.*improve/i,
    /how.*optimize/i,
    /what.*think/i,
    /what.*think/i,
    /tell me about/i,
    /explain/i,
    /why/i,
    /help me/i,
    /what.*doing/i,
    /what.*status/i,
    /overview/i,
    /progress/i,
    /track/i,
    /what.*budget/i,
    /can you/i,
    /do you/i,
    /cultural/i,
    /ritual/i,
    /tradition/i,
    /ceremony/i,
    /schedule/i,
    /timeline/i,
    /itinerary/i,
  ];
  if (complexPatterns.some((p) => p.test(q))) return true;

  // Long queries with multiple words — likely complex
  if (q.split(/\s+/).length > 6) return true;

  // Default to parser
  return false;
}
