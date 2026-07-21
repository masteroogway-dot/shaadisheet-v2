import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

function formatINR(n: number) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + " L";
  if (n >= 1000) return (n / 1000).toFixed(1) + " K";
  return n.toString();
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
- Budget: ${formatINR(summary.budget)}
- Budget Allocated: ${formatINR(summary.budgetAllocated)}
- Budget Spent: ${formatINR(summary.budgetSpent)}
- Budget Remaining: ${formatINR(summary.budgetRemaining)}
- Guests: ${summary.guestCount} total (RSVP Yes: ${summary.rsvpYes}, Pending: ${summary.rsvpPending}, Declined: ${summary.rsvpDeclined})
- Vendors: ${summary.vendorCount} total (Booked: ${summary.vendorsBooked})
- Tasks: ${summary.taskCount} total (Done: ${summary.tasksDone}, Remaining: ${summary.taskCount - summary.tasksDone})
- Room Allocations: ${summary.roomCount}
- Events: ${(summary.events || []).map((e: any) => e.name).join(", ") || "None configured"}`;
}

// ─── Tool definitions for Groq function calling ──────────────────────

const tools = [
  {
    type: "function" as const,
    function: {
      name: "allocate_rooms",
      description: "Create room allocations and assign guests to rooms. Use this when the user wants to assign guests to hotel rooms. Fetches all guests from the database and assigns them 2 per room by default.",
      parameters: {
        type: "object",
        properties: {
          count: { type: "number", description: "Number of rooms to allocate. If not provided, calculates based on guest count (2 per room)." },
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
    type: "function" as const,
    function: {
      name: "create_guests",
      description: "Create multiple guest records at once. Use this when the user wants to add guests.",
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
                relation: { type: "string", description: "Relation like Father, Mother, Friend, Colleague" },
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
    type: "function" as const,
    function: {
      name: "update_guests",
      description: "Update existing guests in bulk based on filters. Use this for RSVP changes, dietary updates, side changes.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              side: { type: "string", enum: ["Bride", "Groom"], description: "Filter by side" },
              name_contains: { type: "string", description: "Filter by name containing this text" },
              rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"], description: "Filter by current RSVP" },
              dietary: { type: "string", enum: ["Veg", "Non-Veg", "Jain", "Vegan"], description: "Filter by dietary" },
            },
          },
          updates: {
            type: "object",
            properties: {
              rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"], description: "New RSVP status" },
              dietary: { type: "string", enum: ["Veg", "Non-Veg", "Jain", "Vegan"], description: "New dietary preference" },
              side: { type: "string", enum: ["Bride", "Groom"], description: "New side" },
            },
          },
        },
        required: ["updates"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_vendor",
      description: "Create a new vendor entry. Use this when the user wants to add a vendor.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Vendor name" },
          category: { type: "string", description: "Category like Catering, Photography, Decoration, Music, etc." },
          contact: { type: "string", description: "Contact phone number" },
          quote: { type: "number", description: "Quoted price in INR" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["name", "category"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_budget_item",
      description: "Create a new budget item. Use this when the user wants to add a budget entry.",
      parameters: {
        type: "object",
        properties: {
          item: { type: "string", description: "Item name" },
          category: { type: "string", description: "Category like Venue, Catering, Decoration, etc." },
          estimated: { type: "number", description: "Estimated cost in INR" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["item", "category", "estimated"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_task",
      description: "Create a new task. Use this when the user wants to add a task or to-do item.",
      parameters: {
        type: "object",
        properties: {
          task: { type: "string", description: "Task description" },
          category: { type: "string", description: "Category like Venue, Catering, Decoration, etc." },
          deadline: { type: "string", description: "Deadline date in YYYY-MM-DD format" },
          priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"], description: "Priority level" },
        },
        required: ["task"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_guests",
      description: "Delete guests based on filters. Use this when the user wants to remove guests.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              side: { type: "string", enum: ["Bride", "Groom"], description: "Filter by side" },
              name_contains: { type: "string", description: "Filter by name containing" },
              rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"], description: "Filter by RSVP" },
            },
          },
        },
        required: ["filter"],
      },
    },
  },
];

// ─── Tool execution ──────────────────────────────────────────────────

async function executeTool(name: string, args: any, weddingId: string): Promise<string> {
  switch (name) {
    case "allocate_rooms": {
      const { count, hotel = "", roomType = "Standard", checkIn = "", checkOut = "" } = args;
      // Fetch all guests for this wedding
      const guests = await prisma.guest.findMany({ where: { weddingId }, select: { name: true } });
      const totalGuests = guests.length;
      const roomsNeeded = count || Math.ceil(totalGuests / 2);

      const rooms = [];
      let guestIdx = 0;
      for (let i = 0; i < roomsNeeded; i++) {
        const guest1 = guestIdx < totalGuests ? guests[guestIdx++].name : "";
        const guest2 = guestIdx < totalGuests ? guests[guestIdx++].name : "";
        const guestNames = [guest1, guest2].filter(Boolean).join(", ");
        rooms.push({
          weddingId,
          hotel: hotel || "TBD",
          roomNumber: `Room ${i + 1}`,
          roomType,
          guestName: guestNames,
          checkIn: checkIn || "",
          checkOut: checkOut || "",
          status: "Reserved",
        });
      }
      await prisma.roomAllocation.createMany({ data: rooms });
      return `Created ${roomsNeeded} rooms at ${hotel || "TBD"} (${roomType}). Assigned ${Math.min(totalGuests, roomsNeeded * 2)} guests to rooms. Check-in: ${checkIn || "TBD"}, Check-out: ${checkOut || "TBD"}.`;
    }

    case "create_guests": {
      const { guests } = args;
      const data = guests.map((g: any) => ({
        weddingId,
        guestName: g.guestName,
        side: g.side || "Bride",
        relation: g.relation || "",
        dietary: g.dietary || "Veg",
        rsvp: g.rsvp || "Pending",
        phone: g.phone || "",
      }));
      await prisma.guest.createMany({ data });
      return `Created ${guests.length} guest(s): ${guests.map((g: any) => g.guestName).join(", ")}.`;
    }

    case "update_guests": {
      const { filter = {}, updates } = args;
      const where: any = { weddingId };
      if (filter.side) where.side = filter.side;
      if (filter.name_contains) where.guestName = { contains: filter.name_contains, mode: "insensitive" };
      if (filter.rsvp) where.rsvp = filter.rsvp;
      if (filter.dietary) where.dietary = filter.dietary;

      const result = await prisma.guest.updateMany({ where, data: updates });
      const filterDesc = Object.entries(filter).map(([k, v]) => `${k}=${v}`).join(", ") || "all";
      const updateDesc = Object.entries(updates).map(([k, v]) => `${k}=${v}`).join(", ");
      return `Updated ${result.count} guest(s) (${filterDesc}) → ${updateDesc}.`;
    }

    case "create_vendor": {
      const { name, category, contact = "", quote = 0, notes = "" } = args;
      await prisma.vendor.create({
        data: { weddingId, name, category, contact, quote, notes, contract: "Pending" },
      });
      return `Created vendor: ${name} (${category}).`;
    }

    case "create_budget_item": {
      const { item, category, estimated, notes = "" } = args;
      await prisma.budgetItem.create({
        data: { weddingId, item, category, estimated, notes },
      });
      return `Created budget item: ${item} (${category}) — ₹${formatINR(estimated)}.`;
    }

    case "create_task": {
      const { task, category = "", deadline = "", priority = "Medium" } = args;
      await prisma.task.create({
        data: { weddingId, text: task, period: category },
      });
      return `Created task: ${task}.`;
    }

    case "delete_guests": {
      const { filter } = args;
      const where: any = { weddingId };
      if (filter.side) where.side = filter.side;
      if (filter.name_contains) where.guestName = { contains: filter.name_contains, mode: "insensitive" };
      if (filter.rsvp) where.rsvp = filter.rsvp;
      const result = await prisma.guest.deleteMany({ where });
      return `Deleted ${result.count} guest(s).`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// ─── Main AI function with tool calling ──────────────────────────────

export async function askAI(
  question: string,
  summary: any,
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> {
  try {
    const weddingCtx = buildWeddingContext(summary);

    const systemPrompt = `You are ShaadiSheet AI, a specialized wedding planning assistant for Indian weddings. You have access to tools to manage the wedding database.

RULES:
- Use tools to CREATE, UPDATE, or DELETE data. Don't just describe what should happen — actually do it.
- Be concise. After executing a tool, give a brief confirmation.
- Use ₹ for currency. Format large numbers as Cr/L/K.
- When users ask to add guests, vendors, budget items, or tasks — use the appropriate tool immediately.
- When users ask to update RSVP, dietary, or other fields — use update_guests.
- When users ask to allocate rooms — use allocate_rooms.
- When users ask to delete — use delete_guests.
- If a request is ambiguous, ask for clarification rather than guessing.

${weddingCtx}`;

    const messages: Array<{ role: "system" | "user" | "assistant"; content?: string; tool_calls?: any[]; tool_call_id?: string; name?: string }> = [
      { role: "system", content: systemPrompt },
    ];

    for (const m of conversationHistory.slice(-6)) {
      messages.push({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      });
    }

    messages.push({ role: "user", content: question });

    // Call Groq with tools — loop until we get a text response
    let iterations = 0;
    while (iterations < 5) {
      iterations++;
      const completion = await groq.chat.completions.create({
        messages: messages as any,
        model: "llama-3.3-70b-versatile",
        tools,
        temperature: 0.3,
        max_tokens: 1024,
      });

      const choice = completion.choices[0];
      const msg = choice.message;

      // If no tool calls, return the text response
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return msg.content || "Done.";
      }

      // Execute each tool call
      messages.push({ role: "assistant", content: msg.content || "", tool_calls: msg.tool_calls });

      for (const tc of msg.tool_calls) {
        const fnName = tc.function.name;
        const fnArgs = JSON.parse(tc.function.arguments);
        const result = await executeTool(fnName, fnArgs, summary.weddingId || "");
        messages.push({ role: "tool" as any, tool_call_id: tc.id, name: fnName, content: result });
      }
    }

    return "Completed all operations.";
  } catch (error: any) {
    console.error("AI error:", error?.message || error);
    if (error.message?.includes("API key")) return "AI API key is invalid.";
    return `AI error: ${error?.message || "Unknown error"}`;
  }
}
