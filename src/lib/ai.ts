import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.BLUESMINDS_API_KEY || "",
  baseURL: "https://api.bluesminds.com/v1",
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
      description: "Delete guests based on filters. Use name_contains to match partial or full guest names (e.g. 'Sameer Jain' matches the guest named Sameer Jain). NEVER combine name_contains with dietary — they are separate operations.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              side: { type: "string", enum: ["Bride", "Groom"], description: "Filter by bride or groom side" },
              name_contains: { type: "string", description: "Full or partial guest name to match, e.g. 'Sameer Jain'" },
              rsvp: { type: "string", enum: ["Pending", "Yes", "No", "Declined"], description: "Filter by RSVP status" },
              dietary: { type: "string", enum: ["Veg", "Non-Veg", "Jain", "Vegan"], description: "Filter by dietary preference. Only use when user explicitly mentions dietary (e.g. 'delete veg guests'). NEVER use when user gives a person's name." },
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
      description: "Delete vendors based on filters. Use name_contains to match vendor names.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              category: { type: "string", description: "Filter by vendor category" },
              name_contains: { type: "string", description: "Full or partial vendor name to match" },
              contract: { type: "string", enum: ["Pending", "Signed", "Completed"], description: "Filter by contract status" },
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
      description: "Delete budget items based on filters. Use item_contains to match item names.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              category: { type: "string", description: "Filter by budget category" },
              item_contains: { type: "string", description: "Full or partial item name to match" },
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
      description: "Search for real wedding vendors in a city using Google Places. Use this when users ask about vendors, photographers, caterers, decorators, etc. in a specific city.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query like 'wedding photographers in Nashik' or 'caterers in Mumbai'" },
        },
        required: ["query"],
      },
    },
  },
];

// ─── Google Places search ──────────────────────────────────────────

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

    if (!res.ok) {
      const err = await res.text();
      console.error("Google Places error:", err);
      return "Search failed. Please try again.";
    }

    const data = await res.json();
    const places = data.places || [];

    if (places.length === 0) return "No vendors found for that search. Try a different query.";

    const rows = places.map((p: any) => {
      const name = p.displayName?.text || "Unknown";
      const addr = p.formattedAddress || "";
      const rating = p.rating ? `${p.rating}/5 (${p.userRatingCount || 0} reviews)` : "No reviews";
      const phone = p.nationalPhoneNumber || "";
      return `| ${name} | ${addr.split(",").slice(-2).join(",").trim()} | ${rating} | ${phone} |`;
    });

    const header = "| Name | Area | Rating | Phone |";
    const separator = "|------|------|--------|-------|";
    return [header, separator, ...rows].join("\n");
  } catch (error) {
    console.error("Google Places search error:", error);
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

// ─── Intent parser (regex fallback for free-tier models) ───────────

interface ParsedIntent {
  tool: string;
  args: any;
  description: string;
}

function parseIntent(question: string, summary: any): ParsedIntent | null {
  const q = question.toLowerCase().trim();
  const weddingId = summary?.weddingId;

  // DELETE GUESTS by name: "remove/delete Sameer Jain", "remove Sameer Jain from guests"
  const deleteGuestName = q.match(/(?:remove|delete|drop)\s+["']?([a-z][a-z\s]+?)["']?\s*(?:from\s+guests)?$/i);
  if (deleteGuestName) {
    let name = deleteGuestName[1].trim();
    // Strip entity nouns from the end
    name = name.replace(/\s+(guests?|invitees?|attendees?|people|person)$/i, '').trim();
    // Skip if it looks like a filter, not a name
    const dietaryTerms = ['veg', 'non-veg', 'non veg', 'jain', 'vegan', 'meat', 'vegetarian'];
    const rsvpTerms = ['pending', 'yes', 'no', 'declined', 'confirmed', 'attending', 'checked in', 'arrived'];
    const sideTerms = ['bride', 'groom'];
    const skipTerms = ['all', 'every', 'each', ...dietaryTerms, ...rsvpTerms, ...sideTerms];
    if (!skipTerms.includes(name) && name.length > 0) {
      return {
        tool: "delete_guests",
        args: { filter: { name_contains: name } },
        description: `Delete guest "${name}"`,
      };
    }
  }

  // DELETE GUESTS by dietary: "remove/delete all veg/jain/non-veg/vegan guests"
  const deleteGuestDietary = q.match(/(?:remove|delete|drop)\s+(?:all\s+)?(?:guests?\s+(?:who\s+)?(?:are\s+)?|with\s+)?(veg|non-veg|jain|vegan)\s*(?:dietary|guests?)?/i);
  if (deleteGuestDietary) {
    const dietary = deleteGuestDietary[1].charAt(0).toUpperCase() + deleteGuestDietary[1].slice(1).toLowerCase();
    return {
      tool: "delete_guests",
      args: { filter: { dietary } },
      description: `Delete all ${dietary} dietary guests`,
    };
  }

  // DELETE GUESTS by side: "remove/delete all bride/groom side guests"
  const deleteGuestSide = q.match(/(?:remove|delete|drop)\s+(?:all\s+)?(?:guests?\s+(?:who\s+)?(?:are\s+)?(?:on\s+)?|from\s+)?(bride|groom)\s*(?:side|guests?)?/i);
  if (deleteGuestSide) {
    const side = deleteGuestSide[1].charAt(0).toUpperCase() + deleteGuestSide[1].slice(1).toLowerCase();
    return {
      tool: "delete_guests",
      args: { filter: { side } },
      description: `Delete all ${side} side guests`,
    };
  }

  // DELETE GUESTS by RSVP: "remove/delete all pending/confirmed guests"
  const deleteGuestRsvp = q.match(/(?:remove|delete|drop)\s+(?:all\s+)?(?:guests?\s+(?:who\s+)?(?:have\s+)?|with\s+)?(pending|confirmed|attending|checked[\s-]?in|declined|cancelled|no[\s-]?show)\s*(?:rsvp|guests?)?/i);
  if (deleteGuestRsvp) {
    let rsvp = deleteGuestRsvp[1].toLowerCase();
    if (rsvp === 'confirmed' || rsvp === 'attending') rsvp = 'yes';
    if (rsvp === 'checked-in') rsvp = 'yes';
    rsvp = rsvp.charAt(0).toUpperCase() + rsvp.slice(1);
    return {
      tool: "delete_guests",
      args: { filter: { rsvp } },
      description: `Delete all ${rsvp} RSVP guests`,
    };
  }

  // UPDATE GUESTS RSVP: "mark Sameer Jain as attended/confirmed/pending"
  const updateGuestRsvp = q.match(/(?:mark|set|change|update)\s+["']?([a-z][a-z\s]+?)["']?\s+(?:as|to)\s+(attended|confirmed|pending|declined|cancelled|no[\s-]?show|yes|no)/i);
  if (updateGuestRsvp) {
    const name = updateGuestRsvp[1].trim();
    let rsvp = updateGuestRsvp[2].toLowerCase();
    if (rsvp === 'attended' || rsvp === 'confirmed') rsvp = 'yes';
    rsvp = rsvp.charAt(0).toUpperCase() + rsvp.slice(1);
    return {
      tool: "update_guests",
      args: { filter: { name_contains: name }, updates: { rsvp } },
      description: `Update "${name}" RSVP to ${rsvp}`,
    };
  }

  // DELETE VENDORS by name: "remove/delete Tenda Events vendor"
  const deleteVendorName = q.match(/(?:remove|delete|drop)\s+["']?([a-z][a-z\s]+?)["']?\s*(?:vendor|from\s+vendors)?$/i);
  if (deleteVendorName && (q.includes('vendor') || q.includes('from vendors'))) {
    const name = deleteVendorName[1].trim();
    if (!['all', 'every', 'each', 'pending', 'signed', 'completed'].includes(name)) {
      return {
        tool: "delete_vendors",
        args: { filter: { name_contains: name } },
        description: `Delete vendor "${name}"`,
      };
    }
  }

  // DELETE VENDORS by contract status: "remove all pending vendors"
  const deleteVendorContract = q.match(/(?:remove|delete|drop)\s+(?:all\s+)?(?:vendors?\s+(?:who\s+)?(?:have\s+)?|with\s+)?(pending|signed|completed)\s*(?:contract|vendors?)?/i);
  if (deleteVendorContract) {
    const contract = deleteVendorContract[1].charAt(0).toUpperCase() + deleteVendorContract[1].slice(1).toLowerCase();
    return {
      tool: "delete_vendors",
      args: { filter: { contract } },
      description: `Delete all ${contract} contract vendors`,
    };
  }

  // DELETE BUDGET ITEMS: "remove catering budget", "delete venue expenses"
  const deleteBudget = q.match(/(?:remove|delete|drop)\s+["']?([a-z][a-z\s]+?)["']?\s*(?:budget|expense|item|from\s+budget)?$/i);
  if (deleteBudget && (q.includes('budget') || q.includes('expense') || q.includes('item') || q.includes('from budget'))) {
    const item = deleteBudget[1].trim();
    if (!['all', 'every', 'each'].includes(item)) {
      return {
        tool: "delete_budget_items",
        args: { filter: { item_contains: item } },
        description: `Delete budget item "${item}"`,
      };
    }
  }

  // CREATE GUEST: "add Sameer Jain as groom side cousin veg"
  const createGuest = q.match(/(?:add|create|new)\s+["']?([a-z][a-z\s]+?)["']?\s+(?:as|on|to)\s+(bride|groom)\s*(?:side)?/i);
  if (createGuest) {
    const name = createGuest[1].trim();
    const side = createGuest[2].charAt(0).toUpperCase() + createGuest[2].slice(1).toLowerCase();
    const dietaryMatch = q.match(/(veg|non-veg|jain|vegan)/i);
    const dietary = dietaryMatch ? dietaryMatch[1].charAt(0).toUpperCase() + dietaryMatch[1].slice(1).toLowerCase() : 'Veg';
    const relationMatch = q.match(/(?:as|who(?:'s| is))\s+(?:a\s+)?(\w+)/i);
    const relation = relationMatch ? relationMatch[1] : '';
    return {
      tool: "create_guests",
      args: { guests: [{ guestName: name, side, dietary, relation, rsvp: 'Pending' }] },
      description: `Add ${name} as ${side} side guest`,
    };
  }

  // CREATE VENDOR: "add photography vendor Creative Lens contact 9876543210 quote 200000"
  const createVendor = q.match(/(?:add|create|new)\s+(?:a\s+)?(?:vendor\s+)?["']?([a-z][a-z\s]+?)["']?\s+(?:vendor|photographer|caterer|decorator)/i);
  if (createVendor) {
    const name = createVendor[1].trim();
    const categoryMatch = q.match(/(photography|catering|decoration|makeup|dj|music|band|venue|videography|mehendi)/i);
    const category = categoryMatch ? categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1).toLowerCase() : 'Other';
    const contactMatch = q.match(/(?:contact|phone|number)\s+(\d{10})/i);
    const contact = contactMatch ? contactMatch[1] : '';
    const quoteMatch = q.match(/(?:quote|price|cost|budget)\s+(?:rs\.?\s*)?(\d[\d,]*)/i);
    const quote = quoteMatch ? parseInt(quoteMatch[1].replace(/,/g, '')) : undefined;
    return {
      tool: "create_vendor",
      args: { name, category, contact: contact || undefined, quote },
      description: `Add vendor "${name}" (${category})`,
    };
  }

  // CREATE BUDGET ITEM: "add catering budget 500000"
  const createBudget = q.match(/(?:add|create|new)\s+(?:a\s+)?(?:budget\s+)?(?:item\s+)?["']?([a-z][a-z\s]+?)["']?\s+(?:budget|expense|item|cost)/i);
  if (createBudget) {
    const item = createBudget[1].trim();
    const categoryMatch = q.match(/(?:category|under|for)\s+(\w+)/i);
    const category = categoryMatch ? categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1).toLowerCase() : 'Misc';
    const amountMatch = q.match(/(?:rs\.?\s*)?(\d[\d,]*)\b/i);
    const estimated = amountMatch ? parseInt(amountMatch[1].replace(/,/g, '')) : 0;
    return {
      tool: "create_budget_item",
      args: { item, category, estimated },
      description: `Add budget item "${item}" (₹${estimated.toLocaleString('en-IN')})`,
    };
  }

  // CREATE TASK: "add task book photographer deadline 2026-09-15"
  const createTask = q.match(/(?:add|create|new)\s+(?:a\s+)?(?:task|todo|to-do)\s+["']?(.+?)["']?\s*(?:deadline|by|before)\s+(\d{4}-\d{2}-\d{2})/i);
  if (createTask) {
    return {
      tool: "create_task",
      args: { task: createTask[1].trim(), deadline: createTask[2], priority: 'Medium' },
      description: `Add task "${createTask[1].trim()}"`,
    };
  }

  return null;
}

// ─── Main AI function ──────────────────────────────────────────────

export async function askAI(
  question: string,
  summary: any,
  conversationHistory: { role: string; content: string }[] = [],
  userId?: string
): Promise<string> {
  try {
    // Try regex parser first (works perfectly, no model needed)
    const parsed = parseIntent(question, summary);
    if (parsed) {
      console.log("[AI] Regex parser matched:", parsed.tool, JSON.stringify(parsed.args));
      const result = await executeTool(parsed.tool, parsed.args, summary?.weddingId || "");
      return `${parsed.description}. ${result}`;
    }
    console.log("[AI] No regex match, falling back to LLM");

    const weddingCtx = buildWeddingContext(summary);

    const systemPrompt = `You are ShaadiSheet AI, a wedding planning assistant. You manage the couple's database and give expert advice.

${weddingCtx}

FORMAT RULES (STRICT):
- Max 80 words for advice/knowledge responses. Be extremely direct.
- No emojis. No greetings. No "Great question!" No "Here's what I know." Just the answer.
- NEVER make up vendor names, shop names, or business names. When users ask about real vendors in a city, use the search_vendors tool to find actual businesses. Only provide information from search results.
- When listing prices, use a table: | Type | Price |.
- After a tool runs, just confirm in one sentence.
- No "Action:" or "Want me to..." sections. End with one short question if needed.
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
- If ambiguous, ask for clarification.

NAME-BASED COMMANDS (critical):
- "Remove Sameer Jain" → delete_guests with filter { name_contains: "Sameer Jain" } ONLY. Do NOT add dietary.
- "Delete Neha Oswal" → delete_guests with filter { name_contains: "Neha Oswal" } ONLY. Do NOT add dietary.
- "Remove all Jain dietary guests" → delete_guests with filter { dietary: "Jain" } ONLY. Do NOT add name_contains.
- "Delete groom side" → delete_guests with filter { side: "Groom" } ONLY.
- Names with spaces (e.g. "Sameer Jain") are a SINGLE name. Do NOT split them into separate fields.
- "Jain" in a person's name is part of their NAME, NOT a dietary filter.
- If the user gives a person's name like "Sameer Jain", use ONLY name_contains. NEVER add dietary.
- If the user mentions a dietary category like "delete veg guests" or "delete Jain guests", use ONLY dietary. NEVER add name_contains.
- NEVER combine name_contains and dietary in the same filter.

EXAMPLES:
User: "Remove Sameer Jain from guests"
Tool: delete_guests({ filter: { name_contains: "Sameer Jain" } })
(WRONG: delete_guests({ filter: { name_contains: "Sameer Jain", dietary: "Jain" } }) — "Jain" is part of the name, NOT dietary!)

User: "Delete all pending vendors"
Tool: delete_vendors({ filter: { contract: "Pending" } })

User: "Remove veg dietary guests"
Tool: delete_guests({ filter: { dietary: "Veg" } })

User: "Delete Neha Oswal"
Tool: delete_guests({ filter: { name_contains: "Neha Oswal" } })

User: "Delete all Jain guests"
Tool: delete_guests({ filter: { dietary: "Jain" } })`;

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
        model: "meta/llama-3.1-70b-instruct",
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
