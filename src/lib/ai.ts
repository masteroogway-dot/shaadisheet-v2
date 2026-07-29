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
      name: "create_gifts",
      description: "Create gift records. Use when user mentions receiving shagun, gift, cash from someone.",
      parameters: {
        type: "object",
        properties: {
          gifts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                fromName: { type: "string", description: "Name of person/family who gave the gift" },
                fromSide: { type: "string", enum: ["Paternal", "Maternal", "Groom", "Friends", "Colleagues", "Both"], description: "Which side of the family" },
                amount: { type: "number", description: "Amount in INR (for cash gifts)" },
                giftType: { type: "string", enum: ["Cash", "Gold", "Gift", "Other"], description: "Type of gift" },
                thankYou: { type: "string", enum: ["Sent", "Pending"], description: "Thank you status" },
              },
              required: ["fromName"],
            },
            description: "Array of gift objects to create",
          },
        },
        required: ["gifts"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_gifts",
      description: "Update gifts by filter. Use for marking thank-yous sent, updating amounts.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              fromName: { type: "string", description: "Gift giver name to match" },
              fromSide: { type: "string", enum: ["Paternal", "Maternal", "Groom", "Friends", "Colleagues", "Both"], description: "Filter by side" },
              thankYou: { type: "string", enum: ["Sent", "Pending"], description: "Filter by thank you status" },
              giftType: { type: "string", enum: ["Cash", "Gold", "Gift", "Other"], description: "Filter by gift type" },
            },
          },
          updates: {
            type: "object",
            properties: {
              thankYou: { type: "string", enum: ["Sent", "Pending"], description: "Update thank you status" },
              received: { type: "string", enum: ["Yes", "Pending"], description: "Update received status" },
              amount: { type: "number", description: "Update amount in INR" },
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
      name: "delete_gifts",
      description: "Delete gifts by filter.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              fromName: { type: "string", description: "Gift giver name to match" },
              fromSide: { type: "string", enum: ["Paternal", "Maternal", "Groom", "Friends", "Colleagues", "Both"], description: "Filter by side" },
              thankYou: { type: "string", enum: ["Sent", "Pending"], description: "Filter by thank you status" },
            },
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_outfits",
      description: "Create outfit records. Use when user mentions outfit, dress, lehenga, sherwani, gown, saree, jewelry pairing.",
      parameters: {
        type: "object",
        properties: {
          outfits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event: { type: "string", description: "Event name like Sangeet, Wedding, Reception, Mehendi" },
                person: { type: "string", enum: ["Bride", "Groom", "Bride's Mother", "Groom's Mother", "Bride's Father", "Groom's Father", "Bridesmaid", "Groomsman", "Other"], description: "Who will wear this outfit" },
                description: { type: "string", description: "Outfit description like 'Red lehenga with gold embroidery'" },
                designer: { type: "string", description: "Designer or boutique name" },
                cost: { type: "number", description: "Cost in INR" },
                status: { type: "string", enum: ["Shopping", "Tailored", "Ready"], description: "Current status" },
                jewelryPairing: { type: "string", description: "Which jewelry to pair with this outfit" },
              },
              required: ["event", "person"],
            },
            description: "Array of outfit objects to create",
          },
        },
        required: ["outfits"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_outfits",
      description: "Update outfits by filter. Use for marking outfit ready, updating cost.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              event: { type: "string", description: "Filter by event name" },
              person: { type: "string", description: "Filter by person" },
              status: { type: "string", enum: ["Shopping", "Tailored", "Ready"], description: "Filter by status" },
            },
          },
          updates: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["Shopping", "Tailored", "Ready"], description: "Update status" },
              cost: { type: "number", description: "Update cost in INR" },
              designer: { type: "string", description: "Update designer" },
              jewelryPairing: { type: "string", description: "Update jewelry pairing" },
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
      name: "delete_outfits",
      description: "Delete outfits by filter.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              event: { type: "string", description: "Filter by event name" },
              person: { type: "string", description: "Filter by person" },
              status: { type: "string", enum: ["Shopping", "Tailored", "Ready"], description: "Filter by status" },
            },
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_invites",
      description: "Create invitation records. Use when user mentions invite, invitation card, save-the-date, printed, dispatched.",
      parameters: {
        type: "object",
        properties: {
          invites: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["Save-the-Date", "Main Invite", "Digital Invite", "Follow-up", "Wedding Website", "WhatsApp"], description: "Type of invitation" },
                description: { type: "string", description: "Description like 'Gold foil printed card'" },
                designer: { type: "string", description: "Designer name" },
                printer: { type: "string", description: "Printer name" },
                quantity: { type: "number", description: "Number of cards" },
                cost: { type: "number", description: "Total cost in INR" },
                sentDate: { type: "string", description: "Date when sent (YYYY-MM-DD)" },
                rsvpDeadline: { type: "string", description: "RSVP deadline date" },
                status: { type: "string", enum: ["Planning", "Designed", "Printed", "Dispatched", "Delivered"], description: "Current status" },
              },
              required: ["type"],
            },
            description: "Array of invite objects to create",
          },
        },
        required: ["invites"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_invites",
      description: "Update invitations by filter. Use for marking as sent, dispatched.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["Save-the-Date", "Main Invite", "Digital Invite", "Follow-up", "Wedding Website", "WhatsApp"], description: "Filter by invite type" },
              status: { type: "string", enum: ["Planning", "Designed", "Printed", "Dispatched", "Delivered"], description: "Filter by status" },
            },
          },
          updates: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["Planning", "Designed", "Printed", "Dispatched", "Delivered"], description: "Update status" },
              sentDate: { type: "string", description: "Update sent date" },
              quantity: { type: "number", description: "Update quantity" },
              cost: { type: "number", description: "Update cost in INR" },
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
      name: "delete_invites",
      description: "Delete invitations by filter.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["Save-the-Date", "Main Invite", "Digital Invite", "Follow-up", "Wedding Website", "WhatsApp"], description: "Filter by invite type" },
              status: { type: "string", enum: ["Planning", "Designed", "Printed", "Dispatched", "Delivered"], description: "Filter by status" },
            },
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_checklist_items",
      description: "Create checklist items. Use when user mentions adding items to emergency kit, priest requirements, or vidaai essentials.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string", enum: ["Emergency Kit", "Priest Requirements", "Vidaai Essentials"], description: "Which checklist" },
                text: { type: "string", description: "Item text" },
              },
              required: ["category", "text"],
            },
            description: "Array of checklist items to create",
          },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_checklist_items",
      description: "Update checklist items by filter. Use for marking items done/undone.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              category: { type: "string", enum: ["Emergency Kit", "Priest Requirements", "Vidaai Essentials"], description: "Filter by category" },
              done: { type: "boolean", description: "Filter by done status" },
            },
          },
          updates: {
            type: "object",
            properties: {
              done: { type: "boolean", description: "Mark as done or undone" },
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
      name: "delete_checklist_items",
      description: "Delete checklist items by filter.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              category: { type: "string", enum: ["Emergency Kit", "Priest Requirements", "Vidaai Essentials"], description: "Filter by category" },
              done: { type: "boolean", description: "Filter by done status" },
            },
          },
        },
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
  // ── Events ──
  {
    type: "function",
    function: {
      name: "create_events",
      description: "Create wedding events/ceremonies (e.g. Mehendi, Sangeet, Haldi, Wedding, Reception).",
      parameters: {
        type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Event name like Mehendi, Sangeet, Haldi" },
                date: { type: "string", description: "Date in YYYY-MM-DD format" },
                startTime: { type: "string", description: "Start time like 10:00" },
                duration: { type: "number", description: "Duration in minutes" },
                location: { type: "string", description: "Venue or location" },
                description: { type: "string", description: "Event description" },
                isRitual: { type: "boolean", description: "Whether this is a religious ritual" },
              },
              required: ["name"],
            },
            description: "Array of events to create",
          },
        },
        required: ["events"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_events",
      description: "Update wedding events by name filter.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              name_contains: { type: "string", description: "Event name to match" },
            },
          },
          updates: {
            type: "object",
            properties: {
              date: { type: "string" },
              startTime: { type: "string" },
              duration: { type: "number" },
              location: { type: "string" },
              description: { type: "string" },
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
      name: "delete_events",
      description: "Delete wedding events by name filter.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              name_contains: { type: "string" },
            },
          },
        },
        required: ["filter"],
      },
    },
  },
  // ── Seating ──
  {
    type: "function",
    function: {
      name: "create_seating_tables",
      description: "Create seating tables with capacity and guest assignments.",
      parameters: {
        type: "object",
        properties: {
          tables: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Table name like Table 1, Family Table" },
                capacity: { type: "number", description: "Number of seats (default 8)" },
                guests: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of guest names to seat at this table",
                },
              },
              required: ["name"],
            },
            description: "Array of tables to create",
          },
        },
        required: ["tables"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_seating",
      description: "Update seating tables by name.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              name_contains: { type: "string" },
            },
          },
          updates: {
            type: "object",
            properties: {
              capacity: { type: "number" },
              guests: {
                type: "array",
                items: { type: "string" },
                description: "New guest list (replaces existing)",
              },
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
      name: "delete_seating",
      description: "Delete seating tables by name.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              name_contains: { type: "string" },
            },
          },
        },
        required: ["filter"],
      },
    },
  },
  // ── Timeline ──
  {
    type: "function",
    function: {
      name: "create_timeline_items",
      description: "Create timeline items for the wedding day schedule.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Timeline item title" },
                startTime: { type: "string", description: "Start time like 09:00" },
                duration: { type: "number", description: "Duration in minutes" },
                description: { type: "string", description: "What happens during this slot" },
                isHighlight: { type: "boolean", description: "Whether this is a highlight/key moment" },
              },
              required: ["title"],
            },
            description: "Array of timeline items",
          },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_timeline",
      description: "Update timeline items by title.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              title_contains: { type: "string" },
            },
          },
          updates: {
            type: "object",
            properties: {
              startTime: { type: "string" },
              duration: { type: "number" },
              description: { type: "string" },
              isHighlight: { type: "boolean" },
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
      name: "delete_timeline",
      description: "Delete timeline items by title.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              title_contains: { type: "string" },
            },
          },
        },
        required: ["filter"],
      },
    },
  },
  // ── Hashtags ──
  {
    type: "function",
    function: {
      name: "create_hashtags",
      description: "Create custom hashtags for the couple. Use when user wants specific hashtags.",
      parameters: {
        type: "object",
        properties: {
          hashtags: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string", description: "Hashtag text with # (e.g. #MadhurWedsAnanya)" },
                style: { type: "string", enum: ["Romantic", "Funny", "Pun", "Traditional", "Modern"], description: "Hashtag style" },
                language: { type: "string", enum: ["English", "Hindi", "Bilingual"], description: "Language" },
              },
              required: ["text"],
            },
            description: "Array of hashtags to create",
          },
        },
        required: ["hashtags"],
      },
    },
  },
  // ── Tasks (update/delete) ──
  {
    type: "function",
    function: {
      name: "update_tasks",
      description: "Update tasks by filter. Use for marking done, changing priority.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              text_contains: { type: "string", description: "Task text to match" },
              done: { type: "boolean" },
              category: { type: "string" },
              priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"] },
            },
          },
          updates: {
            type: "object",
            properties: {
              done: { type: "boolean" },
              priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"] },
              category: { type: "string" },
              dueDate: { type: "string", description: "Due date in YYYY-MM-DD format" },
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
      name: "delete_tasks",
      description: "Delete tasks by filter.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              text_contains: { type: "string" },
              done: { type: "boolean" },
              category: { type: "string" },
            },
          },
        },
        required: ["filter"],
      },
    },
  },
  // ── Budget (update) ──
  {
    type: "function",
    function: {
      name: "update_budget_items",
      description: "Update budget items by filter. Use for updating actual cost, paid amount, status.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              item_contains: { type: "string" },
              category: { type: "string" },
            },
          },
          updates: {
            type: "object",
            properties: {
              actual: { type: "number", description: "Actual cost in INR" },
              paid: { type: "number", description: "Amount paid in INR" },
              status: { type: "string", enum: ["Pending", "Booked", "Paid"] },
              notes: { type: "string" },
            },
          },
        },
        required: ["updates"],
      },
    },
  },
  // ── Vendors (update) ──
  {
    type: "function",
    function: {
      name: "update_vendors",
      description: "Update vendors by filter. Use for updating quote, contract status, notes.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            properties: {
              name_contains: { type: "string" },
              category: { type: "string" },
              contract: { type: "string", enum: ["Pending", "Signed", "Completed"] },
            },
          },
          updates: {
            type: "object",
            properties: {
              quote: { type: "number", description: "Quoted price in INR" },
              paid: { type: "number", description: "Amount paid in INR" },
              contract: { type: "string", enum: ["Pending", "Signed", "Completed"] },
              rating: { type: "string" },
              notes: { type: "string" },
              deadline: { type: "string" },
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
    case "delete_events":
    case "delete_seating":
    case "delete_timeline":
    case "delete_tasks":
      return { filter: args.filter || {} };
    case "search_vendors":
      return { query: toString(args.query) };
    case "create_events":
      return {
        events: (args.events || []).map((e: any) => ({
          name: toString(e.name),
          date: toString(e.date),
          startTime: toString(e.startTime, "10:00"),
          duration: toNumber(e.duration, 60),
          location: toString(e.location),
          description: toString(e.description),
          isRitual: !!e.isRitual,
        })),
      };
    case "update_events":
      return { filter: args.filter || {}, updates: args.updates };
    case "create_seating_tables":
      return {
        tables: (args.tables || []).map((t: any) => ({
          name: toString(t.name),
          capacity: toNumber(t.capacity, 8),
          guests: t.guests || [],
        })),
      };
    case "update_seating":
      return { filter: args.filter || {}, updates: args.updates };
    case "create_timeline_items":
      return {
        items: (args.items || []).map((i: any) => ({
          title: toString(i.title),
          startTime: toString(i.startTime, "09:00"),
          duration: toNumber(i.duration, 30),
          description: toString(i.description),
          isHighlight: !!i.isHighlight,
        })),
      };
    case "update_timeline":
      return { filter: args.filter || {}, updates: args.updates };
    case "create_hashtags":
      return {
        hashtags: (args.hashtags || []).map((h: any) => ({
          text: toString(h.text),
          style: toString(h.style, "Romantic"),
          language: toString(h.language, "English"),
        })),
      };
    case "update_tasks":
      return { filter: args.filter || {}, updates: args.updates };
    case "update_budget_items":
      return { filter: args.filter || {}, updates: args.updates };
    case "update_vendors":
      return { filter: args.filter || {}, updates: args.updates };
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
    case "create_gifts": {
      const data = a.gifts.map((g: any) => ({
        weddingId, fromName: g.fromName, fromSide: g.fromSide || "Both",
        amount: g.amount || 0, giftType: g.giftType || "Cash",
        received: "Yes", thankYou: g.thankYou || "Pending",
      }));
      await prisma.gift.createMany({ data });
      return `Created ${a.gifts.length} gift(s): ${a.gifts.map((g: any) => `${g.fromName}${g.amount ? ` - ₹${formatINR(g.amount)}` : ""}`).join(", ")}.`;
    }
    case "update_gifts": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.fromName) where.fromName = { contains: filter.fromName, mode: "insensitive" };
      if (filter.fromSide) where.fromSide = filter.fromSide;
      if (filter.thankYou) where.thankYou = filter.thankYou;
      if (filter.giftType) where.giftType = filter.giftType;
      const result = await prisma.gift.updateMany({ where, data: updates });
      return `Updated ${result.count} gift(s).`;
    }
    case "delete_gifts": {
      const { filter = {} } = a;
      const where: any = { weddingId };
      if (filter.fromName) where.fromName = { contains: filter.fromName, mode: "insensitive" };
      if (filter.fromSide) where.fromSide = filter.fromSide;
      if (filter.thankYou) where.thankYou = filter.thankYou;
      const result = await prisma.gift.deleteMany({ where });
      return `Deleted ${result.count} gift(s).`;
    }
    case "create_outfits": {
      const items = a.outfits || [];
      const maxOrder = await prisma.outfit.aggregate({ where: { weddingId }, _max: { order: true } });
      let order = (maxOrder._max.order ?? -1) + 1;
      for (const item of items) {
        await prisma.outfit.create({
          data: {
            weddingId,
            order: order++,
            event: item.event || "",
            person: item.person || "Bride",
            description: item.description || "",
            designer: item.designer || "",
            cost: typeof item.cost === "number" ? item.cost : 0,
            status: item.status || "Shopping",
            jewelryPairing: item.jewelryPairing || "",
          },
        });
      }
      return `Created ${items.length} outfit(s).`;
    }
    case "update_outfits": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.event) where.event = { contains: filter.event, mode: "insensitive" };
      if (filter.person) where.person = { contains: filter.person, mode: "insensitive" };
      if (filter.status) where.status = filter.status;
      const result = await prisma.outfit.updateMany({ where, data: updates });
      return `Updated ${result.count} outfit(s).`;
    }
    case "delete_outfits": {
      const { filter = {} } = a;
      const where: any = { weddingId };
      if (filter.event) where.event = { contains: filter.event, mode: "insensitive" };
      if (filter.person) where.person = { contains: filter.person, mode: "insensitive" };
      if (filter.status) where.status = filter.status;
      const result = await prisma.outfit.deleteMany({ where });
      return `Deleted ${result.count} outfit(s).`;
    }
    case "create_invites": {
      const items = a.invites || [];
      const maxOrder = await prisma.inviteDetail.aggregate({ where: { weddingId }, _max: { order: true } });
      let order = (maxOrder._max.order ?? -1) + 1;
      for (const item of items) {
        await prisma.inviteDetail.create({
          data: {
            weddingId,
            order: order++,
            type: item.type || "Main Invite",
            description: item.description || "",
            designer: item.designer || "",
            printer: item.printer || "",
            quantity: typeof item.quantity === "number" ? item.quantity : 0,
            cost: typeof item.cost === "number" ? item.cost : 0,
            sentDate: item.sentDate || "",
            rsvpDeadline: item.rsvpDeadline || "",
            status: item.status || "Planning",
          },
        });
      }
      return `Created ${items.length} invitation(s).`;
    }
    case "update_invites": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.type) where.type = filter.type;
      if (filter.status) where.status = filter.status;
      const result = await prisma.inviteDetail.updateMany({ where, data: updates });
      return `Updated ${result.count} invitation(s).`;
    }
    case "delete_invites": {
      const { filter = {} } = a;
      const where: any = { weddingId };
      if (filter.type) where.type = filter.type;
      if (filter.status) where.status = filter.status;
      const result = await prisma.inviteDetail.deleteMany({ where });
      return `Deleted ${result.count} invitation(s).`;
    }
    case "create_checklist_items": {
      const items = a.items || [];
      const maxOrder = await prisma.checklistItem.aggregate({ where: { weddingId }, _max: { order: true } });
      let order = (maxOrder._max.order ?? -1) + 1;
      for (const item of items) {
        await prisma.checklistItem.create({
          data: {
            weddingId,
            order: order++,
            category: item.category || "Emergency Kit",
            text: item.text || "",
            done: false,
          },
        });
      }
      return `Created ${items.length} checklist item(s).`;
    }
    case "update_checklist_items": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.category) where.category = filter.category;
      if (filter.done !== undefined) where.done = filter.done;
      const result = await prisma.checklistItem.updateMany({ where, data: updates });
      return `Updated ${result.count} checklist item(s).`;
    }
    case "delete_checklist_items": {
      const { filter = {} } = a;
      const where: any = { weddingId };
      if (filter.category) where.category = filter.category;
      if (filter.done !== undefined) where.done = filter.done;
      const result = await prisma.checklistItem.deleteMany({ where });
      return `Deleted ${result.count} checklist item(s).`;
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
    case "create_events": {
      const items = a.events || [];
      const maxOrder = await prisma.weddingEvent.aggregate({ where: { weddingId }, _max: { order: true } });
      let order = (maxOrder._max.order ?? -1) + 1;
      for (const item of items) {
        await prisma.weddingEvent.create({
          data: {
            weddingId, order: order++,
            name: item.name, date: item.date, startTime: item.startTime,
            duration: item.duration, location: item.location,
            description: item.description, isRitual: item.isRitual,
          },
        });
      }
      return `Created ${items.length} event(s): ${items.map((i: any) => i.name).join(", ")}.`;
    }
    case "update_events": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.name_contains) where.name = { contains: filter.name_contains, mode: "insensitive" };
      const result = await prisma.weddingEvent.updateMany({ where, data: updates });
      return `Updated ${result.count} event(s).`;
    }
    case "delete_events": {
      const { filter = {} } = a;
      const where: any = { weddingId };
      if (filter.name_contains) where.name = { contains: filter.name_contains, mode: "insensitive" };
      const result = await prisma.weddingEvent.deleteMany({ where });
      return `Deleted ${result.count} event(s).`;
    }
    case "create_seating_tables": {
      const items = a.tables || [];
      const maxOrder = await prisma.seatingTable.aggregate({ where: { weddingId }, _max: { order: true } });
      let order = (maxOrder._max.order ?? -1) + 1;
      for (const item of items) {
        await prisma.seatingTable.create({
          data: {
            weddingId, order: order++,
            name: item.name, capacity: item.capacity,
            guests: JSON.stringify(item.guests || []),
          },
        });
      }
      return `Created ${items.length} table(s): ${items.map((i: any) => i.name).join(", ")}.`;
    }
    case "update_seating": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.name_contains) where.name = { contains: filter.name_contains, mode: "insensitive" };
      const data: any = {};
      if (updates.capacity !== undefined) data.capacity = updates.capacity;
      if (updates.guests) data.guests = JSON.stringify(updates.guests);
      const result = await prisma.seatingTable.updateMany({ where, data });
      return `Updated ${result.count} table(s).`;
    }
    case "delete_seating": {
      const { filter = {} } = a;
      const where: any = { weddingId };
      if (filter.name_contains) where.name = { contains: filter.name_contains, mode: "insensitive" };
      const result = await prisma.seatingTable.deleteMany({ where });
      return `Deleted ${result.count} table(s).`;
    }
    case "create_timeline_items": {
      const items = a.items || [];
      const maxOrder = await prisma.weddingTimelineItem.aggregate({ where: { weddingId }, _max: { order: true } });
      let order = (maxOrder._max.order ?? -1) + 1;
      for (const item of items) {
        await prisma.weddingTimelineItem.create({
          data: {
            weddingId, order: order++,
            title: item.title, startTime: item.startTime,
            duration: item.duration, description: item.description,
            isHighlight: item.isHighlight,
          },
        });
      }
      return `Created ${items.length} timeline item(s): ${items.map((i: any) => i.title).join(", ")}.`;
    }
    case "update_timeline": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.title_contains) where.title = { contains: filter.title_contains, mode: "insensitive" };
      const result = await prisma.weddingTimelineItem.updateMany({ where, data: updates });
      return `Updated ${result.count} timeline item(s).`;
    }
    case "delete_timeline": {
      const { filter = {} } = a;
      const where: any = { weddingId };
      if (filter.title_contains) where.title = { contains: filter.title_contains, mode: "insensitive" };
      const result = await prisma.weddingTimelineItem.deleteMany({ where });
      return `Deleted ${result.count} timeline item(s).`;
    }
    case "create_hashtags": {
      const items = a.hashtags || [];
      const maxOrder = await prisma.hashtag.aggregate({ where: { weddingId }, _max: { order: true } });
      let order = (maxOrder._max.order ?? -1) + 1;
      for (const item of items) {
        await prisma.hashtag.create({
          data: {
            weddingId, order: order++,
            text: item.text.startsWith("#") ? item.text : `#${item.text}`,
            style: item.style, language: item.language,
          },
        });
      }
      return `Created ${items.length} hashtag(s): ${items.map((i: any) => i.text).join(", ")}.`;
    }
    case "update_tasks": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.text_contains) where.text = { contains: filter.text_contains, mode: "insensitive" };
      if (filter.done !== undefined) where.done = filter.done;
      if (filter.category) where.category = filter.category;
      if (filter.priority) where.priority = filter.priority;
      const result = await prisma.task.updateMany({ where, data: updates });
      return `Updated ${result.count} task(s).`;
    }
    case "delete_tasks": {
      const { filter = {} } = a;
      const where: any = { weddingId };
      if (filter.text_contains) where.text = { contains: filter.text_contains, mode: "insensitive" };
      if (filter.done !== undefined) where.done = filter.done;
      if (filter.category) where.category = filter.category;
      const result = await prisma.task.deleteMany({ where });
      return `Deleted ${result.count} task(s).`;
    }
    case "update_budget_items": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.item_contains) where.item = { contains: filter.item_contains, mode: "insensitive" };
      if (filter.category) where.category = { contains: filter.category, mode: "insensitive" };
      const result = await prisma.budgetItem.updateMany({ where, data: updates });
      return `Updated ${result.count} budget item(s).`;
    }
    case "update_vendors": {
      const { filter = {}, updates } = a;
      const where: any = { weddingId };
      if (filter.name_contains) where.name = { contains: filter.name_contains, mode: "insensitive" };
      if (filter.category) where.category = { contains: filter.category, mode: "insensitive" };
      if (filter.contract) where.contract = filter.contract;
      const result = await prisma.vendor.updateMany({ where, data: updates });
      return `Updated ${result.count} vendor(s).`;
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
  return `You are ShaadiSheet AI — an elite South Asian wedding planning assistant with deep expertise across all countries, religions, and regions.

${weddingCtx}

## RESPONSE STYLE
- Be direct. No filler, no greetings, no emojis.
- Be specific. Give exact amounts (in local currency), dates, names.
- Use tables for data, bold for key info.
- Max 100 words for advice, 150 for analysis.
- Match the user's language (Hindi-English mix is fine).

## YOUR CAPABILITIES
You have direct database access via tools:
- CREATE guests, vendors, budget items, tasks, room allocations, events, seating tables, timeline items, hashtags
- UPDATE RSVP, dietary, vendor contracts, task status, room status, events, seating, timeline, budget items, vendors
- DELETE guests, vendors, budget items, rooms, tasks, events, seating, timeline by any filter
- SEARCH real vendors in any city via Google Places

## TOOL USAGE RULES
- Use tools IMMEDIATELY when user asks to create/update/delete
- name_contains: Full or partial name (e.g. "Sameer Jain")
- NEVER combine name_contains and dietary in same filter
- "Jain" in a person's name is part of their NAME, not dietary
- Guest accommodation: "Room Needed" = outstation guest needing hotel, "Local / Floating" = local guest not needing room
- Gift Tracker: Use create_gifts when user says "X gave PKR/BDT/LKR/NPR/MVR/AFN Y" or "received from X". Default side based on context
- Outfit Planner: Use create_outfits when user mentions outfit, dress, lehenga, sherwani, gown, saree. Map person from context. Ask which event if not specified.
- Invitations: Use create_invites when user mentions invite, card, save-the-date. Default type to "Main Invite". Ask quantity if not provided.
- Cultural Checklists: Use create_checklist_items for emergency kit, priest requirements, nikah prep, gurdwara requirements, poruwa prep, etc. Ask which category if not specified.
- Events: Use create_events for Mehendi, Sangeet, Haldi, Nikah, Anand Karaj, Poruwa, Walima, etc. Include date, time, location if provided.
- Seating: Use create_seating_tables for table assignments. Include capacity and guest names.
- Timeline: Use create_timeline_items for day-of schedule. Include start times and durations.
- Hashtags: Use create_hashtags when user wants specific custom hashtags.
- Tasks: Use update_tasks to mark done, change priority. Use delete_tasks to remove completed tasks.
- Budget: Use update_budget_items to record actual costs, payments, and status.
- Vendors: Use update_vendors to update quotes, contract status, ratings, deadlines.
- After tool runs, confirm in one sentence, then ask if they need anything else

## WEDDING EXPERTISE — ALL SOUTH ASIAN TRADITIONS

### Countries & Currencies:
| Country | Currency | Typical Budget Range |
|---------|----------|---------------------|
| India | INR (₹) | ₹5L – ₹5 Crore |
| Pakistan | PKR (₨) | ₨15L – ₨5 Crore |
| Bangladesh | BDT (৳) | ৳3L – ৳20L |
| Sri Lanka | LKR (Rs) | $3K – $80K |
| Nepal | NPR (₨) | $5K – $40K |
| Maldives | MVR (Rf) | $3K – $400K |
| Afghanistan | AFN (؋) | ؋3L – ؋50L |

### Rituals by Country & Religion:

**India — Hindu (North Indian):**
Roka → Engagement → Mehendi → Sangeet → Haldi → Wedding (Baraat, Jaimala, Kanyadaan, Mangal Pheras, Sindoor, Vidaai) → Reception

**India — Hindu (South Indian):**
Nischayam → Mehendi → Wedding (Kanyadaanam, Thali/Taali tying, Saptapadi) → Reception

**India — Muslim:**
Mangni → Mehendi → Nikah (Ijab-e-Qubool, Mahr, Aarsi Mushaf) → Walima

**India — Sikh:**
Kurmai → Mehendi → Sangeet → Jaggo → Anand Karaj (4 Laavan) → Langar → Reception

**India — Jain:**
Vagdana → Engagement → Mehendi → Sangeet → Wedding (Mada Mandap, Mangal Pheras, Granthi Bandhan) → Reception
*Strictly vegetarian — NO root vegetables (onion, garlic, potato, carrot)*

**India — Christian:**
Engagement → Roce → Church Wedding (Vows, Rings, Minnukettu for Kerala) → Reception

**Pakistan — Sunni Muslim:**
Dholki → Mayun → Mehndi → Baraat (Joota Chupai, Doodh Pilai) → Nikah → Walima

**Bangladesh — Bengali Muslim:**
Gaye Holud → Mehendi → Nikah → Walima → Bou Bhat

**Bangladesh — Bengali Hindu:**
Gaye Holud → Dodhi Mangal → Shubho Drishti → Wedding (Mangal Pheras, Sindoor Daan) → Bou Bhat

**Sri Lanka — Sinhalese Buddhist:**
Poruwa Ceremony → Kiribath → Reception

**Sri Lanka — Tamil Hindu:**
Kanyadaanam → Thaali Ceremony (3 knots) → Agni Pradakshina → Saptapadi → Reception

**Nepal — Hindu:**
Tika-Tala → Mehendi → Janti → Wedding (Swayamvar, Sindoor, Fire Ceremony) → Mukh Herne → Reception

**Nepal — Newari:**
Ihi (Bel marriage) → Supari → Swayamvar → Sindoor → Departure (Palanquin) → Reception

**Maldives — Muslim:**
Henna Night → Nikah → Boduberu (drumming/dance) → Valimah

**Afghanistan — Pashtun Muslim:**
Khwara → Shirni Khori → Henna Night → Nikah → Walima (with Attan dance)

### Budget Allocation (varies by tradition):
| Category | % of Total |
|----------|-----------|
| Venue & Catering | 35-50% |
| Photography | 8-12% |
| Bridal Outfit & Jewellery | 10-15% |
| Decor & Flowers | 8-12% |
| Makeup & Mehendi | 3-5% |
| Music & Entertainment | 5-8% |
| Invitations | 2-3% |
| Transport | 2-3% |
| Misc & Buffer | 10-15% |

### Dress Codes by Tradition:
| Tradition | Bride | Groom |
|-----------|-------|-------|
| Hindu North Indian | Red lehenga with zardozi | Sherwani + turban |
| Hindu South Indian | Kanjeevaram silk saree | Dhoti + kurta |
| Muslim Indian | Sharara/gharara in red/gold | Sherwani + karakuli |
| Sikh | Red lehenga + chooda + kaleere | Sherwani + turban + kirpan |
| Jain | Red/gold lehenga | Sherwani + turban |
| Christian Indian | White gown (Goan) / Kasavu saree (Kerala) | Suit/tuxedo |
| Pakistani | Deep red lehenga (8+ kg) | Sherwani + sehra |
| Bengali Muslim | Red Benarasi silk saree | Sherwani/Panjabi |
| Sinhalese Buddhist | Kandyan white/gold saree | Kandyan Nilame outfit |
| Tamil Hindu | Kanchipuram gold silk saree | Veshti + silk shirt |
| Nepali Hindu | Red sari/lehenga | Daura Suruwal + topor |
| Maldivian | Dhirhamathi/Libaas | White shirt + mundu |
| Afghan Pashtun | Green dress (Nikah), white (reception) | Suit or Perahan Tunban |

### Food Defaults by Tradition:
| Tradition | Type | Key Dishes |
|-----------|------|------------|
| Hindu North | Mixed | Butter chicken, biryani, naan, gulab jamun |
| Hindu South | Vegetarian | Sadya on banana leaf, sambar, rasam, payasam |
| Muslim | Non-veg (halal) | Biryani, kebabs, nihari, sheer khurma |
| Sikh | Mixed (langar is veg) | Butter chicken, dal makhani, langar |
| Jain | Strict veg (no root veg) | Farsan, dhokla, no onion/garlic |
| Christian | Varies | Pork sorpotel, appam-stew, sadya |
| Pakistani | Non-veg (halal) | Biryani, nihari, haleem, seekh kebabs |
| Bengali | Fish-centric | Fish curry, hilsa, rasgulla, sandesh |
| Sri Lankan | Rice-based | Kiribath, kavum, rice and curry |
| Nepali | Rice+lentil | Dal bhat, sel roti, momos |
| Maldivian | Seafood (halal) | Fish curry, garudhiya, grilled seafood |
| Afghan | Rice+meat | Kabuli pulao, mantu, kebabs |

### Cultural Sensitivity:
- Jain weddings: No root vegetables, no alcohol, no leather/silk in decor
- Sikh Gurdwara: No alcohol, heads must be covered, langar is strictly vegetarian
- Muslim weddings: No pork, no alcohol (halal only), separate seating sometimes
- Maldives: All food must be halal, modest attire required
- Afghan: Mahr (bride price) is documented, Attan is traditional circular dance
- Bengali: Fish is central to cuisine, Gaye Holud uses turmeric theme
- Nepali: Dubo Ko Mala (Bermuda grass garlands) symbolizes never-wilting marriage
- Sri Lankan: Poruwa ceremony on decorated wooden platform, Nekath astrological timing
- Pakistani: Joota Chupai (sisters hide groom's shoes), Doodh Pilai (milk for money)

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
const DESTRUCTIVE_TOOLS = new Set(["delete_guests", "delete_vendors", "delete_budget_items", "delete_rooms", "delete_gifts"]);

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
