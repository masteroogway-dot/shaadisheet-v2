import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: { "HTTP-Referer": "https://shaadisheet-v2.vercel.app", "X-Title": "ShaadiSheet AI" },
});

// ─── Helpers ──────────────────────────────────────────────────────
function formatINR(n: number) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + " L";
  if (n >= 1000) return (n / 1000).toFixed(1) + " K";
  return n.toString();
}

function toNumber(val: any, fallback = 0): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace(/[^\d.]/g, ""));
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function toString(val: any, fallback = ""): string {
  if (val === null || val === undefined) return fallback;
  return String(val).trim();
}

function buildWeddingContext(summary: any): string {
  const weddingDate = summary.weddingDate
    ? new Date(summary.weddingDate).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })
    : "Not set";
  const daysUntil = summary.weddingDate
    ? Math.ceil((new Date(summary.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return `WEDDING DATA:
- Name: ${summary.name || "Not set"}
- Date: ${weddingDate}${daysUntil !== null ? ` (${daysUntil} days away)` : ""}
- City: ${summary.weddingCity || "Not set"}
- Religion: ${summary.religion || "Not set"}
- Budget: ₹${formatINR(summary.budget)}
- Budget Allocated: ₹${formatINR(summary.budgetAllocated)}
- Budget Spent: ₹${formatINR(summary.budgetSpent)}
- Budget Remaining: ₹${formatINR(summary.budgetRemaining)}
- Guests: ${summary.guestCount} total (RSVP Yes: ${summary.rsvpYes}, Pending: ${summary.rsvpPending}, Declined: ${summary.rsvpDeclined})
- Vendors: ${summary.vendorCount} total (Booked: ${summary.vendorsBooked})
- Tasks: ${summary.taskCount} total (Done: ${summary.tasksDone}, Remaining: ${summary.taskCount - summary.tasksDone})
- Room Allocations: ${summary.roomCount}
- Events: ${(summary.events || []).map((e: any) => e.name).join(", ") || "None configured"}`;
}

// ─── Tool definitions ─────────────────────────────────────────────

const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "allocate_rooms",
      description: "Create room allocations and assign guests to rooms.",
      parameters: {
        type: "object",
        properties: {
          count: { type: "number", description: "Number of rooms to allocate." },
          hotel: { type: "string", description: "Hotel name" },
          roomType: { type: "string", enum: ["Standard", "Deluxe", "Suite", "Premium"], description: "Room type" },
          checkIn: { type: "string", description: "Check-in date in YYYY-MM-DD format" },
          checkOut: { type: "string", description: "Check-out date in YYYY-MM-DD format" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_guests",
      description: "Create multiple guest records at once.",
      parameters: {
        type: "object",
        properties: {
          guests: {
            type: "array",
            items: {
              type: "object",
              properties: {
                guestName: { type: "string", description: "Full name of the guest" },
                side: { type: "string", enum: ["Bride", "Groom"], description: "Bride or Groom side" },
                relation: { type: "string", description: "Relation like Father, Mother, Friend" },
                dietary: { type: "string", enum: ["Veg", "Non-Veg", "Jain", "Vegan"], description: "Dietary preference" },
                rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"], description: "RSVP status" },
                phone: { type: "string", description: "Phone number" },
              },
              required: ["guestName", "side"],
            },
            description: "Array of guest objects to create",
          },
        },
        required: ["guests"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_guests",
      description: "Update existing guests in bulk based on filters.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              side: { type: "string", enum: ["Bride", "Groom"] },
              name_contains: { type: "string" },
              rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"] },
              dietary: { type: "string", enum: ["Veg", "Non-Veg", "Jain", "Vegan"] },
            },
          },
          updates: {
            type: "object",
            properties: {
              rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"] },
              dietary: { type: "string", enum: ["Veg", "Non-Veg", "Jain", "Vegan"] },
              side: { type: "string", enum: ["Bride", "Groom"] },
            },
          },
        },
        required: ["updates"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_vendor",
      description: "Create a new vendor entry.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Vendor name" },
          category: { type: "string", description: "Category like Catering, Photography, Decoration" },
          contact: { type: "string", description: "Contact phone number" },
          quote: { type: "number", description: "Quoted price in INR" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["name", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_budget_item",
      description: "Create a new budget item.",
      parameters: {
        type: "object",
        properties: {
          item: { type: "string", description: "Item name" },
          category: { type: "string", description: "Category like Venue, Catering, Decoration" },
          estimated: { type: "number", description: "Estimated cost in INR" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["item", "category", "estimated"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task or to-do item.",
      parameters: {
        type: "object",
        properties: {
          task: { type: "string", description: "Task description" },
          category: { type: "string", description: "Category" },
          deadline: { type: "string", description: "Deadline in YYYY-MM-DD format" },
          priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"] },
        },
        required: ["task"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_guests",
      description: "Delete guests based on filters.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              side: { type: "string", enum: ["Bride", "Groom"] },
              name_contains: { type: "string" },
              rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"] },
            },
          },
        },
        required: ["filter"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_rooms",
      description: "Delete room allocations.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              hotel: { type: "string" },
              status: { type: "string", enum: ["Reserved", "Checked In", "Checked Out", "Cancelled", "No Show"] },
              guestName_contains: { type: "string" },
            },
          },
        },
        required: ["filter"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_vendors",
      description: "Delete vendors based on filters.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              category: { type: "string" },
              name_contains: { type: "string" },
              contract: { type: "string", enum: ["Pending", "Signed", "Completed"] },
            },
          },
        },
        required: ["filter"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_budget_items",
      description: "Delete budget items based on filters.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              category: { type: "string" },
              item_contains: { type: "string" },
            },
          },
        },
        required: ["filter"],
      },
    },
  },
];

// ─── Pre-execution parameter validation ────────────────────────────

function validateAndCoerceArgs(name: string, args: any): any {
  switch (name) {
    case "allocate_rooms":
      return {
        ...args,
        count: args.count ? toNumber(args.count) : undefined,
        hotel: toString(args.hotel),
        roomType: toString(args.roomType, "Standard"),
        checkIn: toString(args.checkIn),
        checkOut: toString(args.checkOut),
      };
    case "create_guests":
      return {
        guests: (args.guests || []).map((g: any) => ({
          guestName: toString(g.guestName),
          side: toString(g.side, "Bride"),
          relation: toString(g.relation),
          dietary: toString(g.dietary, "Veg"),
          rsvp: toString(g.rsvp, "Pending"),
          phone: toString(g.phone),
        })),
      };
    case "update_guests":
      return { filter: args.filter || {}, updates: args.updates };
    case "create_vendor":
      return {
        name: toString(args.name),
        category: toString(args.category),
        contact: toString(args.contact),
        quote: toNumber(args.quote),
        notes: toString(args.notes),
      };
    case "create_budget_item":
      return {
        item: toString(args.item),
        category: toString(args.category),
        estimated: toNumber(args.estimated),
        notes: toString(args.notes),
      };
    case "create_task":
      return {
        task: toString(args.task),
        category: toString(args.category),
        deadline: toString(args.deadline),
        priority: toString(args.priority, "Medium"),
      };
    case "delete_guests":
    case "delete_vendors":
    case "delete_budget_items":
    case "delete_rooms":
      return { filter: args.filter || {} };
    default:
      return args;
  }
}

// ─── Tool execution ────────────────────────────────────────────────

async function executeTool(name: string, args: any, weddingId: string): Promise<string> {
  const a = validateAndCoerceArgs(name, args);

  switch (name) {
    case "allocate_rooms": {
      const { count, hotel = "", roomType = "Standard", checkIn = "", checkOut = "" } = a;
      const guests = await prisma.guest.findMany({ where: { weddingId }, select: { name: true } });
      const totalGuests = guests.length;
      const roomsNeeded = count || Math.ceil(totalGuests / 2);
      const rooms = [];
      let guestIdx = 0;
      for (let i = 0; i < roomsNeeded; i++) {
        const g1 = guestIdx < totalGuests ? guests[guestIdx++].name : "";
        const g2 = guestIdx < totalGuests ? guests[guestIdx++].name : "";
        rooms.push({
          weddingId, hotel: hotel || "TBD", roomNumber: `Room ${i + 1}`, roomType,
          guestName: [g1, g2].filter(Boolean).join(", "), checkIn: checkIn || "", checkOut: checkOut || "", status: "Reserved",
        });
      }
      await prisma.roomAllocation.createMany({ data: rooms });
      return `Created ${roomsNeeded} rooms at ${hotel || "TBD"} (${roomType}). Assigned ${Math.min(totalGuests, roomsNeeded * 2)} guests.`;
    }
    case "create_guests": {
      const data = a.guests.map((g: any) => ({
        weddingId, guestName: g.guestName, side: g.side, relation: g.relation,
        dietary: g.dietary, rsvp: g.rsvp, phone: g.phone,
      }));
      await prisma.guest.createMany({ data });
      return `Created ${a.guests.length} guest(s): ${a.guests.map((g: any) => g.guestName).join(", ")}.`;
    }
    case "update_guests": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.side) where.side = filter.side;
      if (filter.name_contains) where.guestName = { contains: filter.name_contains, mode: "insensitive" };
      if (filter.rsvp) where.rsvp = filter.rsvp;
      if (filter.dietary) where.dietary = filter.dietary;
      const result = await prisma.guest.updateMany({ where, data: updates });
      return `Updated ${result.count} guest(s).`;
    }
    case "create_vendor": {
      await prisma.vendor.create({
        data: { weddingId, name: a.name, category: a.category, contact: a.contact, quote: a.quote, notes: a.notes, contract: "Pending" },
      });
      return `Created vendor: ${a.name} (${a.category})${a.quote ? ` - ₹${formatINR(a.quote)}` : ""}.`;
    }
    case "create_budget_item": {
      await prisma.budgetItem.create({
        data: { weddingId, item: a.item, category: a.category, estimated: a.estimated, notes: a.notes },
      });
      return `Created budget item: ${a.item} (${a.category}) - ₹${formatINR(a.estimated)}.`;
    }
    case "create_task": {
      await prisma.task.create({
        data: { weddingId, text: a.task, period: a.category },
      });
      return `Created task: ${a.task}.`;
    }
    case "delete_guests": {
      const where: any = { weddingId };
      if (a.filter.side) where.side = a.filter.side;
      if (a.filter.name_contains) where.guestName = { contains: a.filter.name_contains, mode: "insensitive" };
      if (a.filter.rsvp) where.rsvp = a.filter.rsvp;
      const result = await prisma.guest.deleteMany({ where });
      return `Deleted ${result.count} guest(s).`;
    }
    case "delete_rooms": {
      const where: any = { weddingId };
      if (a.filter.hotel) where.hotel = { contains: a.filter.hotel, mode: "insensitive" };
      if (a.filter.status) where.status = a.filter.status;
      if (a.filter.guestName_contains) where.guestName = { contains: a.filter.guestName_contains, mode: "insensitive" };
      const result = await prisma.roomAllocation.deleteMany({ where });
      return `Deleted ${result.count} room allocation(s).`;
    }
    case "delete_vendors": {
      const where: any = { weddingId };
      if (a.filter.category) where.category = { contains: a.filter.category, mode: "insensitive" };
      if (a.filter.name_contains) where.name = { contains: a.filter.name_contains, mode: "insensitive" };
      if (a.filter.contract) where.contract = a.filter.contract;
      const result = await prisma.vendor.deleteMany({ where });
      return `Deleted ${result.count} vendor(s).`;
    }
    case "delete_budget_items": {
      const where: any = { weddingId };
      if (a.filter.category) where.category = { contains: a.filter.category, mode: "insensitive" };
      if (a.filter.item_contains) where.item = { contains: a.filter.item_contains, mode: "insensitive" };
      const result = await prisma.budgetItem.deleteMany({ where });
      return `Deleted ${result.count} budget item(s).`;
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

// ─── Main AI function ──────────────────────────────────────────────

export async function askAI(
  question: string,
  summary: any,
  conversationHistory: { role: string; content: string }[] = [],
  userId?: string
): Promise<string> {
  try {
    const weddingCtx = buildWeddingContext(summary);

    const systemPrompt = `You are ShaadiSheet AI, a wedding planning assistant. You manage the couple's database and give expert advice.

${weddingCtx}

FORMAT RULES (STRICT):
- Max 100 words for advice/knowledge responses. Be direct.
- No emojis. No "Great question!" or "Here's what I know." Just answer.
- Use tables for price comparisons. Use bullet points for lists.
- After a tool runs, just confirm in one sentence.
- Offer to take action at the end (add vendor, create budget item, set task). Don't pad with explanations.
- Never use horizontal rules (---).
- Respond in the same language the user writes in.

INDIAN WEDDING KNOWLEDGE:
- Hindu: Roka, Engagement, Mehendi, Sangeet, Haldi, Wedding (Baraat, Jaimala, Kanyadaan, Mangal Pheras, Sindoor, Vidaai), Reception
- Muslim: Mangni, Mehendi, Nikah, Walima, Ruksati
- Sikh: Kurmai, Mehendi, Sangeet, Anand Karaj (Lavaan), Langar, Reception
- Christian: Engagement, Roce, Church Wedding (Vows, Rings, Register), Reception
- Jain: Roka, Engagement, Mehendi, Sangeet, Wedding (Phere), Reception

BUDGET ALLOCATION (% of total):
- Venue & Catering: 40-50%
- Photography & Videography: 8-12%
- Bridal Outfit & Jewellery: 10-15%
- Decor & Flowers: 8-12%
- Makeup & Mehendi: 3-5%
- Music & Entertainment: 5-8%
- Invitations: 2-3%
- Transport: 2-3%
- Misc & Buffer: 10-15%

VENDOR PRICE RANGES (Indian market, 2026):
- Photography: ₹80K - ₹5L
- Videography: ₹60K - ₹4L
- Catering: ₹800 - ₹3,000/plate
- Decoration: ₹1L - ₹10L
- Makeup Artist: ₹20K - ₹2L
- Mehendi Artist: ₹10K - ₹80K
- DJ/Music: ₹30K - ₹3L
- Band/Baraat: ₹50K - ₹5L
- Venue: ₹2L - ₹25L

RULES:
- Use tools to CREATE, UPDATE, or DELETE data. Actually do it.
- When users ask to add guests/vendors/budget/tasks, use the tool immediately.
- When users ask about budget allocation, give specific ₹ amounts based on their total budget.
- When users ask about rituals, give accurate info for their religion.
- When users ask about vendors in their city, give specific guidance and typical prices.
- If ambiguous, ask for clarification.`;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    for (const m of conversationHistory.slice(-8)) {
      messages.push({ role: m.role === "bot" ? "assistant" : "user", content: m.content });
    }

    messages.push({ role: "user", content: question });

    let iterations = 0;
    while (iterations < 6) {
      iterations++;
      const completion = await openai.chat.completions.create({
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
        messages,
        tools,
        temperature: 0.3,
        max_tokens: 4096,
      });

      const choice = completion.choices[0];
      const msg = choice.message;

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return msg.content || "Done.";
      }

      messages.push({ role: "assistant", content: msg.content || "", tool_calls: msg.tool_calls });

      for (const tc of msg.tool_calls) {
        if (tc.type !== "function") continue;
        const fnName = tc.function.name;
        let fnArgs;
        try {
          fnArgs = JSON.parse(tc.function.arguments);
        } catch {
          fnArgs = {};
        }
        const result = await executeTool(fnName, fnArgs, summary.weddingId || "");
        messages.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
    }

    return "Completed all operations.";
  } catch (error: any) {
    console.error("AI error:", error?.message || error);
    if (error.message?.includes("API key")) return "AI service is temporarily unavailable. Please try again.";
    if (error.message?.includes("rate_limit")) return "Too many requests. Please wait a moment.";
    if (error.message?.includes("context_length")) return "Conversation too long. Please start a new chat.";
    return "Something went wrong. Please try again.";
  }
}
