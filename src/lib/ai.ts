import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

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

// ─── Provider configuration ───────────────────────────────────────

interface ProviderConfig {
  name: string;
  apiKey: string;
  baseURL: string;
  model: string;
  priority: number;
  maxTokens: number;
  supportsTools: boolean;
}

function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  // Priority 1: Google Gemini keys (stacked, 1500 RPD each, Claude-level)
  const geminiKeys = (process.env.GOOGLE_GEMINI_API_KEY || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  for (let i = 0; i < geminiKeys.length; i++) {
    providers.push({
      name: `gemini-${i + 1}`,
      apiKey: geminiKeys[i],
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: "gemini-2.0-flash",
      priority: i + 1,
      maxTokens: 8192,
      supportsTools: true,
    });
  }

  // Priority: Mistral (free, 1B tok/month, Claude-level)
  if (process.env.MISTRAL_API_KEY) {
    providers.push({
      name: "mistral",
      apiKey: process.env.MISTRAL_API_KEY,
      baseURL: "https://api.mistral.ai/v1",
      model: "mistral-medium-latest",
      priority: geminiKeys.length + 1,
      maxTokens: 32768,
      supportsTools: true,
    });
  }

  // Priority: BluesMinds (last resort fallback)
  if (process.env.BLUESMINDS_API_KEY) {
    providers.push({
      name: "bluesminds",
      apiKey: process.env.BLUESMINDS_API_KEY,
      baseURL: "https://api.bluesminds.com/v1",
      model: "meta/llama-3.1-70b-instruct",
      priority: geminiKeys.length + 2,
      maxTokens: 4096,
      supportsTools: true,
    });
  }

  return providers.sort((a, b) => a.priority - b.priority);
}

// ─── Wedding context builder ──────────────────────────────────────

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
                name: { type: "string", description: "Full name of the guest" },
                side: { type: "string", enum: ["Bride", "Groom"], description: "Bride or Groom side" },
                relation: { type: "string", description: "Relation like Father, Mother, Friend" },
                dietary: { type: "string", enum: ["Veg", "Non-Veg", "Jain", "Vegan"], description: "Dietary preference" },
                rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"], description: "RSVP status" },
                accommodation: { type: "string", enum: ["Room Needed", "Local / Floating"], description: "Whether guest needs hotel room or is local" },
              },
              required: ["name", "side"],
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
      description: "Update existing guests in bulk based on filters. Use name_contains to match guest names.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              side: { type: "string", enum: ["Bride", "Groom"], description: "Filter by bride or groom side" },
              name_contains: { type: "string", description: "Full or partial guest name to match" },
              rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"], description: "Filter by RSVP status" },
              dietary: { type: "string", enum: ["Veg", "Non-Veg", "Jain", "Vegan"], description: "Filter by dietary preference" },
              accommodation: { type: "string", enum: ["Room Needed", "Local / Floating"], description: "Filter by accommodation type" },
            },
          },
          updates: {
            type: "object",
            properties: {
              rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"], description: "New RSVP status" },
              dietary: { type: "string", enum: ["Veg", "Non-Veg", "Jain", "Vegan"], description: "New dietary preference" },
              side: { type: "string", enum: ["Bride", "Groom"], description: "New side" },
              accommodation: { type: "string", enum: ["Room Needed", "Local / Floating"], description: "New accommodation status" },
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
          priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"], description: "Priority level" },
        },
        required: ["task"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_guests",
      description: "Delete guests based on filters. Use name_contains to match partial or full guest names.",
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
  {
    type: "function",
    function: {
      name: "search_vendors",
      description: "Search for real wedding vendors in a city using Google Places.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query like 'wedding photographers in Nashik'" },
        },
        required: ["query"],
      },
    },
  },
];

// ─── Google Places search ─────────────────────────────────────────

async function searchGooglePlaces(query: string): Promise<string> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return "Google Places API key not configured.";

  try {
    const url = `https://places.googleapis.com/v1/places:searchText`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.websiteUri,places.nationalPhoneNumber",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
    });

    if (!res.ok) return "Search failed. Please try again.";
    const data = await res.json();
    const places = data.places || [];
    if (places.length === 0) return "No vendors found for that search.";

    const rows = places.map((p: any) => {
      const name = p.displayName?.text || "Unknown";
      const addr = p.formattedAddress || "";
      const rating = p.rating ? `${p.rating}/5 (${p.userRatingCount || 0} reviews)` : "No reviews";
      const phone = p.nationalPhoneNumber || "";
      return `| ${name} | ${addr.split(",").slice(-2).join(",").trim()} | ${rating} | ${phone} |`;
    });

    return ["| Name | Area | Rating | Phone |", "|------|------|--------|-------|", ...rows].join("\n");
  } catch {
    return "Search failed. Please try again.";
  }
}

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
          name: toString(g.name || g.guestName),
          side: toString(g.side, "Bride"),
          relation: toString(g.relation),
          dietary: toString(g.dietary, "Veg"),
          rsvp: toString(g.rsvp, "Pending"),
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
    case "search_vendors":
      return { query: toString(args.query) };
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
        weddingId, name: g.name, side: g.side, relation: g.relation,
        dietary: g.dietary, rsvp: g.rsvp, accommodation: g.accommodation || "--",
      }));
      await prisma.guest.createMany({ data });
      return `Created ${a.guests.length} guest(s): ${a.guests.map((g: any) => g.name).join(", ")}.`;
    }
    case "update_guests": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.side) where.side = filter.side;
      if (filter.name_contains) where.name = { contains: filter.name_contains, mode: "insensitive" };
      if (filter.rsvp) where.rsvp = filter.rsvp;
      if (filter.dietary) where.dietary = filter.dietary;
      if (filter.accommodation) where.accommodation = filter.accommodation;
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
      if (a.filter.name_contains) where.name = { contains: a.filter.name_contains, mode: "insensitive" };
      if (a.filter.rsvp) where.rsvp = a.filter.rsvp;
      if (a.filter.dietary) where.dietary = a.filter.dietary;
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
    case "search_vendors": {
      return await searchGooglePlaces(a.query);
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

// ─── Claude-level system prompt ────────────────────────────────────

function buildSystemPrompt(weddingCtx: string): string {
  return `You are ShaadiSheet AI — an elite Indian wedding planning assistant with deep expertise across all religions and regions.

${weddingCtx}

## RESPONSE STYLE
- Be direct. No filler, no greetings, no emojis.
- Be specific. Give exact amounts (₹), dates, names.
- Use tables for data, bold for key info.
- Max 100 words for advice, 150 for analysis.
- Match the user's language (Hindi-English mix is fine).

## YOUR CAPABILITIES
You have direct database access via tools:
- CREATE guests, vendors, budget items, tasks, room allocations
- UPDATE RSVP, dietary, vendor contracts, task status, room status
- DELETE guests, vendors, budget items, rooms by any filter
- SEARCH real vendors in any city via Google Places

## TOOL USAGE RULES
- Use tools IMMEDIATELY when user asks to create/update/delete
- name_contains: Full or partial name (e.g. "Sameer Jain")
- NEVER combine name_contains and dietary in same filter
- "Jain" in a person's name is part of their NAME, not dietary
- Guest accommodation: "Room Needed" = outstation guest needing hotel, "Local / Floating" = local guest not needing room
- After tool runs, confirm in one sentence, then ask if they need anything else

## WEDDING EXPERTISE

### Rituals by Religion:
- Hindu: Roka → Engagement → Mehendi → Sangeet → Haldi → Wedding (Baraat, Jaimala, Kanyadaan, Mangal Pheras, Sindoor, Vidaai) → Reception
- Muslim: Mangni → Mehendi → Nikah (Ijab-e-Qubool, Khutba) → Walima → Ruksati
- Sikh: Kurmai → Mehendi → Sangeet → Anand Karaj (Lavaan) → Langar → Reception
- Christian: Engagement → Roce → Church Wedding (Vows, Rings) → Reception

### Budget Allocation:
| Category | % of Total |
|----------|-----------|
| Venue & Catering | 40-50% |
| Photography | 8-12% |
| Bridal Outfit & Jewellery | 10-15% |
| Decor & Flowers | 8-12% |
| Makeup & Mehendi | 3-5% |
| Music & Entertainment | 5-8% |
| Invitations | 2-3% |
| Transport | 2-3% |
| Misc & Buffer | 10-15% |

### Vendor Price Ranges (2026):
| Category | Budget | Mid-Range | Premium |
|----------|--------|-----------|---------|
| Photography | ₹80K-1.5L | ₹1.5L-3L | ₹3L-5L |
| Catering | ₹800-1200/plate | ₹1200-2000/plate | ₹2000-3000/plate |
| Decoration | ₹1L-3L | ₹3L-6L | ₹6L-10L |
| Makeup | ₹20K-50K | ₹50K-1L | ₹1L-2L |
| DJ/Music | ₹30K-80K | ₹80K-1.5L | ₹1.5L-3L |
| Venue | ₹2L-8L | ₹8L-15L | ₹15L-25L |

## IMPORTANT RULES
- Always use tools when user asks to create/update/delete data. Actually do it.
- Never make up vendor names. Use search_vendors for real results.
- When listing prices, use table format.
- If ambiguous, ask for clarification with specific options.
- Never use horizontal rules (---).
- INDIAN CURRENCY MATH: ₹30,00,000 = 30 lakh = 3,000,000 rupees. ₹30,00,000 ÷ 400 guests = ₹7,500 per plate (NOT ₹750). Always count zeros carefully. Lakh = 1,00,000 (5 zeros). Crore = 1,00,00,000 (7 zeros).`;
}

// ─── Destructive tool names ────────────────────────────────────────
const DESTRUCTIVE_TOOLS = new Set(["delete_guests", "delete_vendors", "delete_budget_items", "delete_rooms"]);

// ─── Provider caller with fallback ─────────────────────────────────

async function callProvider(
  provider: ProviderConfig,
  messages: OpenAI.ChatCompletionMessageParam[],
  weddingId: string,
): Promise<{ response: string; provider: string; pendingDelete?: { tool: string; args: any } } | null> {
  try {
    const client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseURL,
    });

    let iterations = 0;
    const msgs = [...messages];

    while (iterations < 6) {
      iterations++;
      const completion = await client.chat.completions.create({
        model: provider.model,
        messages: msgs,
        tools: provider.supportsTools ? tools : undefined,
        temperature: 0.3,
        max_tokens: provider.maxTokens,
      });

      const choice = completion.choices[0];
      const msg = choice.message;

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return { response: msg.content || "Done.", provider: provider.name };
      }

      msgs.push({ role: "assistant", content: msg.content || "", tool_calls: msg.tool_calls });

      for (const tc of msg.tool_calls) {
        if (tc.type !== "function") continue;
        const fnName = tc.function.name;
        let fnArgs;
        try { fnArgs = JSON.parse(tc.function.arguments); } catch { fnArgs = {}; }

        // Intercept destructive tools — don't execute, return pending confirmation
        if (DESTRUCTIVE_TOOLS.has(fnName)) {
          const validatedArgs = validateAndCoerceArgs(fnName, fnArgs);
          msgs.push({ role: "tool", tool_call_id: tc.id, content: `CONFIRMATION_REQUIRED: This action will permanently delete data. Describe what will be deleted and ask the user to confirm.` });
          // Store pending delete and continue the loop so AI generates a confirmation message
          const pendingDelete = { tool: fnName, args: validatedArgs };
          // Run one more iteration to get AI's confirmation message
          const finalCompletion = await client.chat.completions.create({
            model: provider.model,
            messages: msgs,
            temperature: 0.3,
            max_tokens: provider.maxTokens,
          });
          const finalMsg = finalCompletion.choices[0].message;
          return { response: finalMsg.content || "Please confirm this deletion.", provider: provider.name, pendingDelete };
        }

        let result: string;
        try {
          result = await executeTool(fnName, fnArgs, weddingId);
        } catch (toolError: any) {
          console.error(`[AI] Tool ${fnName} failed:`, toolError?.message || toolError);
          result = `Tool error: ${toolError?.message || "Unknown error"}`;
        }
        msgs.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
    }

    return { response: "Completed all operations.", provider: provider.name };
  } catch (error: any) {
    console.error(`[AI] Provider ${provider.name} failed:`, error?.message || error);
    return null;
  }
}

// ─── Main AI function ──────────────────────────────────────────────

export async function askAI(
  question: string,
  summary: any,
  conversationHistory: { role: string; content: string }[] = [],
  userId?: string,
  confirmDelete?: { tool: string; args: any },
): Promise<{ response: string; pendingDelete?: { tool: string; args: any } }> {
  // If user confirmed a delete, execute it directly
  if (confirmDelete) {
    console.log(`[AI] Executing confirmed delete: ${confirmDelete.tool}`);
    try {
      const result = await executeTool(confirmDelete.tool, confirmDelete.args, summary?.weddingId || "");
      return { response: result };
    } catch (e: any) {
      return { response: `Delete failed: ${e?.message || "Unknown error"}.` };
    }
  }

  // ALL queries go through the LLM — it understands natural language variations
  console.log("[AI] Sending to LLM:", question);

  const weddingCtx = buildWeddingContext(summary);
  const systemPrompt = buildSystemPrompt(weddingCtx);

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];

  for (const m of conversationHistory.slice(-12)) {
    messages.push({ role: m.role === "bot" ? "assistant" : "user", content: m.content });
  }

  messages.push({ role: "user", content: question });

  // Try providers in priority order with fallback
  const providers = getProviders();

  for (const provider of providers) {
    console.log(`[AI] Trying provider: ${provider.name} (${provider.model})`);
    const result = await callProvider(provider, messages, summary?.weddingId || "");
    if (result) {
      console.log(`[AI] Success with provider: ${result.provider}`);
      return { response: result.response, pendingDelete: result.pendingDelete };
    }
    console.log(`[AI] Provider ${provider.name} failed, trying next...`);
  }

  return { response: "AI service is temporarily unavailable. Please try again in a moment." };
}
