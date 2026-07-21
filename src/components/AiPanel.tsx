"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  addAiMessage,
  getAiMessages,
  previewBulkAction,
  executeBulkUpdate,
  getWeddingSummary,
  storeInteraction,
  correctInteraction,
  learnCommand,
  getLearnedPatterns,
} from "@/lib/actions";
import { shouldUseAI } from "@/lib/ai-helpers";

function formatINR(n: number) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + " L";
  if (n >= 1000) return (n / 1000).toFixed(1) + " K";
  return n.toString();
}

type PendingAction = {
  type: string;
  filter: any;
  updates: any;
  description: string;
  preview: { count: number; sample: any[] };
};

type LearnedPattern = {
  id: string;
  pattern: string | null;
  intent: string | null;
  targetType: string | null;
  content: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  wedding: any;
  weddingId: string;
  onUpdate: () => void;
}

export default function AiPanel({ open, onClose, wedding, weddingId, onUpdate }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string; action?: PendingAction; id?: string; learned?: boolean }>>([]);
  const [loaded, setLoaded] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [learnedPatterns, setLearnedPatterns] = useState<LearnedPattern[]>([]);
  const [learningMode, setLearningMode] = useState(false);
  const [learningPattern, setLearningPattern] = useState("");
  const [learningIntent, setLearningIntent] = useState("update");
  const [learningTarget, setLearningTarget] = useState("guests");
  const [learningResponse, setLearningResponse] = useState("");
  const [correctingId, setCorrectingId] = useState<number | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && !loaded) {
      Promise.all([
        getAiMessages(weddingId),
        getLearnedPatterns(weddingId),
      ]).then(([dbMessages, patterns]) => {
        if (dbMessages && dbMessages.length > 0) {
          setMessages([
            { role: "bot", content: getWelcomeMessage() },
            ...dbMessages.map((m: any) => ({ role: m.role === "learned" ? "bot" : m.role, content: m.content, id: m.id })),
          ]);
        }
        setLearnedPatterns(patterns || []);
        setLoaded(true);
      }).catch(() => setLoaded(true));
    }
  }, [open, loaded, weddingId]);

  const getWelcomeMessage = () => {
    const learnedCount = learnedPatterns.length;
    const base = `Hi! I'm your ShaadiSheet AI assistant, powered by **Gemini** for smart queries.\n\n**Quick Actions (instant):**\n- "Mark all Sharma guests as RSVP Yes"\n- "Set all Bride side guests dietary to Veg"\n- "Delete all guests with Declined RSVP"\n\n**Smart Queries (AI-powered):**\n- "Summarize my wedding planning status"\n- "What should I prioritize next?"\n- "Analyze my budget and suggest savings"\n- "Which guests haven't RSVP'd yet?"\n- "Tell me about Mehndi ceremony traditions"`;
    if (learnedCount > 0) {
      return base + `\n\n**Learned:** ${learnedCount} custom command${learnedCount > 1 ? "s" : ""} from past interactions.`;
    }
    return base + `\n\nJust type what you need in plain English!`;
  };

  const checkLearnedPatterns = (q: string): { response: string; action?: PendingAction; learned?: boolean } | null => {
    for (const lp of learnedPatterns) {
      if (!lp.pattern) continue;
      try {
        const regex = new RegExp(lp.pattern, "i");
        if (regex.test(q)) {
          return { response: lp.content, learned: true };
        }
      } catch {
        // invalid regex, skip
      }
    }
    return null;
  };

  const parseCommand = useCallback(async (userMsg: string): Promise<{ response: string; action?: PendingAction; learned?: boolean }> => {
    const q = userMsg.toLowerCase().trim();

    // ── Check learned patterns first ──
    const learnedMatch = checkLearnedPatterns(q);
    if (learnedMatch) return learnedMatch;

    const summary = await getWeddingSummary(weddingId);

    const isUpdateCmd = q.includes("mark") || q.includes("set") || q.includes("change") || q.includes("update") || q.includes("move") || q.includes("make") || q.includes("turn") || q.includes("switch") || q.includes("assign") || q.includes("apply");
    const isDeleteCmd = q.includes("delete") || q.includes("remove") || q.includes("clear");
    const isQueryCmd = q.includes("how many") || q.includes("what's") || q.includes("what is") || q.includes("show") || q.includes("list") || q.includes("count") || q.includes("give me");
    const isAddCmd = q.includes("add") || q.includes("create") || q.includes("new");
    const isBulkCmd = q.includes("all ") || q.includes("every") || q.includes("all the") || q.includes("entire") || /\d+/.test(q);

    if (isDeleteCmd) return parseDeleteCommand(q, summary);
    if (isUpdateCmd) return parseUpdateCommand(q, summary);
    if (isAddCmd) return parseAddCommand(q, summary);

    if (/^(yes|all\s*yes|mark\s*all|set\s*all|do\s*it|confirm|y)$/i.test(q) || (q.includes("them") && q.includes("yes"))) {
      return parseUpdateCommand("set all guests rsvp to yes", summary);
    }
    if (/^(no|cancel|n)$/i.test(q)) return { response: "Action cancelled." };

    if (isQueryCmd || isBulkCmd) return parseQueryCommand(q, summary);

    if (q.includes("help") || q.includes("what can you do")) return { response: getWelcomeMessage() };

    if (q.includes("budget") || q.includes("spend") || q.includes("cost") || q.includes("money")) {
      return { response: `**Budget Summary:**\n- Total: ${formatINR(summary.budget)}\n- Allocated: ${formatINR(summary.budgetAllocated)}\n- Spent: ${formatINR(summary.budgetSpent)}\n- Remaining: ${formatINR(summary.budgetRemaining)}` };
    }
    if (q.includes("guest") || q.includes("rsvp") || q.includes("invite")) {
      return { response: `**Guest Summary:**\n- Total: ${summary.guestCount}\n- RSVP Yes: ${summary.rsvpYes}\n- Pending: ${summary.rsvpPending}\n- Declined: ${summary.rsvpDeclined}` };
    }
    if (q.includes("vendor")) {
      return { response: `**Vendor Summary:**\n- Total: ${summary.vendorCount}\n- Booked: ${summary.vendorsBooked}\n- Remaining: ${summary.vendorCount - summary.vendorsBooked}` };
    }
    if (q.includes("task")) {
      return { response: `**Task Summary:**\n- Total: ${summary.taskCount}\n- Done: ${summary.tasksDone}\n- Remaining: ${summary.taskCount - summary.tasksDone}` };
    }
    if (q.includes("room")) {
      return { response: `**Room Summary:**\n- Total: ${summary.roomCount}` };
    }

    if (q.includes("yes") || q.includes("no") || q.includes("veg") || q.includes("non-veg")) {
      return parseUpdateCommand(`set all guests ${q.includes("yes") ? "rsvp to yes" : q.includes("veg") ? "dietary to veg" : "rsvp to " + q}`, summary);
    }

    return { response: `I can help with your wedding! Try:\n\n- "Mark all Sharma guests as RSVP Yes"\n- "Set dietary to Veg for all Bride side"\n- "Delete all Declined guests"\n- "How many vendors are booked?"\n- "What's my budget remaining?"\n\nOr click **Learn** to teach me a new command!` };
  }, [weddingId, learnedPatterns]);

  const parseDeleteCommand = (q: string, summary: any): { response: string; action?: PendingAction } => {
    let type = "";
    let filter: any = {};
    let targetLabel = "";

    if (q.includes("guest")) { type = "delete_guests"; targetLabel = "guests"; }
    else if (q.includes("vendor")) { type = "delete_vendors"; targetLabel = "vendors"; }
    else if (q.includes("budget") || q.includes("item")) { type = "delete_budget"; targetLabel = "budget items"; }
    else if (q.includes("room")) { type = "delete_rooms"; targetLabel = "room allocations"; }
    else return { response: "What would you like to delete? You can say:\n- \"Delete all Declined guests\"\n- \"Delete all Pending vendors\"\n- \"Delete all budget items in Venue category\"" };

    if (q.includes("declined") || q.includes("reject")) {
      filter.rsvp = targetLabel === "guests" ? "Declined" : undefined;
      filter.status = targetLabel !== "guests" ? "Cancelled" : undefined;
    } else if (q.includes("pending")) {
      filter.rsvp = targetLabel === "guests" ? "Pending" : undefined;
      filter.contract = targetLabel === "vendors" ? "Pending" : undefined;
      filter.status = targetLabel === "rooms" ? "Reserved" : undefined;
    } else if (q.includes("signed") || q.includes("booked")) {
      filter.contract = "Signed";
    }

    if (q.includes("bride")) filter.side = "Bride";
    if (q.includes("groom")) filter.side = "Groom";

    const familyMatch = q.match(/(?:family|family of|from|named?|surname)\s+(\w+)/i);
    if (familyMatch) filter.name_contains = familyMatch[1];
    const sharmaMatch = q.match(/sharma|patel|gupta|singh|kumar|verma|jain| agarwal|mittal|reddy|nair|pillai|desai|rao/i);
    if (sharmaMatch && !filter.name_contains) filter.name_contains = sharmaMatch[0];

    if (q.includes("veg") && !q.includes("non")) filter.dietary = "Veg";
    if (q.includes("non-veg") || q.includes("nonveg")) filter.dietary = "Non-Veg";
    if (q.includes("vegan")) filter.dietary = "Vegan";
    if (q.includes("jain")) filter.dietary = "Jain";

    // Clean undefined values
    filter = Object.fromEntries(Object.entries(filter).filter(([_, v]) => v !== undefined));

    const filterDesc = describeFilter(filter, targetLabel);

    return {
      response: `I'll delete ${targetLabel}${filterDesc}. Please confirm below.`,
      action: { type, filter, updates: {}, description: `Delete ${targetLabel}${filterDesc}`, preview: { count: 0, sample: [] } },
    };
  };

  const parseUpdateCommand = (q: string, summary: any): { response: string; action?: PendingAction } => {
    let type = "";
    let filter: any = {};
    let updates: any = {};
    let targetLabel = "";

    if (q.includes("guest")) { type = "guests"; targetLabel = "guests"; }
    else if (q.includes("vendor")) { type = "vendors"; targetLabel = "vendors"; }
    else if (q.includes("budget") || q.includes("item")) { type = "budget"; targetLabel = "budget items"; }
    else if (q.includes("room")) { type = "rooms"; targetLabel = "rooms"; }
    else if (q.includes("task")) { type = "tasks"; targetLabel = "tasks"; }
    else {
      if (q.includes("rsvp") || q.includes("dietary") || q.includes("side") || q.includes("yes") || q.includes("veg")) {
        type = "guests"; targetLabel = "guests";
      } else if (q.includes("contract") || q.includes("rating")) {
        type = "vendors"; targetLabel = "vendors";
      } else if (q.includes("status") && q.includes("room")) {
        type = "rooms"; targetLabel = "rooms";
      } else {
        return { response: "What would you like to update? Specify the target:\n- \"Mark all Sharma **guests** as RSVP Yes\"\n- \"Set **vendor** contract to Signed\"\n- \"Update **room** status to Checked In\"" };
      }
    }

    if (q.includes("bride")) filter.side = "Bride";
    if (q.includes("groom")) filter.side = "Groom";

    const familyMatch = q.match(/(?:family|family of|from|named?|surname)\s+(\w+)/i);
    if (familyMatch) filter.name_contains = familyMatch[1];
    const sharmaMatch = q.match(/sharma|patel|gupta|singh|kumar|verma|jain| agarwal|mittal|reddy|nair|pillai|desai|rao/i);
    if (sharmaMatch && !filter.name_contains) filter.name_contains = sharmaMatch[0];

    if (q.includes("veg") && !q.includes("non")) filter.dietary = "Veg";
    if (q.includes("non-veg") || q.includes("nonveg")) filter.dietary = "Non-Veg";
    if (q.includes("jain")) filter.dietary = "Jain";

    if (q.includes("pending")) {
      if (targetLabel === "guests") filter.rsvp = "Pending";
      else if (targetLabel === "vendors") filter.contract = "Pending";
      else if (targetLabel === "rooms") filter.status = "Reserved";
    }
    if (q.includes("confirmed") || q.includes("confirm")) {
      if (targetLabel === "guests") filter.rsvp = "Yes";
    }
    if (q.includes("declined")) filter.rsvp = "Declined";

    const catMatch = q.match(/(?:in|category)\s+(\w[\w\s&]*?)(?:\s+to|\s+as|\s*$)/i);
    if (catMatch) filter.category = catMatch[1].trim();

    // Parse updates
    if (q.includes("rsvp") && (q.includes("yes") || q.includes("confirm"))) updates.rsvp = "Yes";
    else if (q.includes("rsvp") && q.includes("pending")) updates.rsvp = "Pending";
    else if (q.includes("rsvp") && q.includes("decline")) updates.rsvp = "Declined";
    else if (!q.includes("rsvp") && !q.includes("dietary") && !q.includes("side") && !q.includes("contract") && !q.includes("status")) {
      if (q.includes("yes") || q.includes("confirm") || q.includes("accept")) {
        if (targetLabel === "guests") updates.rsvp = "Yes";
        else if (targetLabel === "vendors") updates.contract = "Signed";
        else updates.status = "Reserved";
      } else if (q.includes("no") || q.includes("decline") || q.includes("reject")) {
        if (targetLabel === "guests") updates.rsvp = "Declined";
        else if (targetLabel === "vendors") updates.contract = "Pending";
        else updates.status = "Cancelled";
      } else if (q.includes("pending")) {
        if (targetLabel === "guests") updates.rsvp = "Pending";
        else if (targetLabel === "vendors") updates.contract = "Pending";
        else updates.status = "Reserved";
      }
    } else {
      if (q.includes("yes") || q.includes("confirm")) updates.rsvp = "Yes";
      else if (q.includes("pending")) updates.rsvp = "Pending";
      else if (q.includes("decline") || q.includes("declined")) updates.rsvp = "Declined";
    }

    if (q.includes("dietary") || q.includes("food")) {
      if (q.includes("non-veg") || q.includes("nonveg")) updates.dietary = "Non-Veg";
      else if (q.includes("vegan")) updates.dietary = "Vegan";
      else if (q.includes("jain")) updates.dietary = "Jain";
      else if (q.includes("veg")) updates.dietary = "Veg";
    }

    if (q.includes("side")) {
      if (q.includes("bride")) updates.side = "Bride";
      else if (q.includes("groom")) updates.side = "Groom";
    }

    if (q.includes("contract")) {
      if (q.includes("signed") || q.includes("book")) updates.contract = "Signed";
      else if (q.includes("pending")) updates.contract = "Pending";
      else if (q.includes("complete")) updates.contract = "Completed";
    }

    if (q.includes("status")) {
      if (q.includes("checked in")) updates.status = "Checked In";
      else if (q.includes("checked out")) updates.status = "Checked Out";
      else if (q.includes("reserved")) updates.status = "Reserved";
      else if (q.includes("cancelled")) updates.status = "Cancelled";
    }

    if (type === "tasks" && (q.includes("done") || q.includes("complete") || q.includes("mark"))) {
      if (q.includes("undo") || q.includes("uncomplete")) updates.done = false;
      else updates.done = true;
      if (q.includes("all")) filter.done = false;
    }

    if (Object.keys(updates).length === 0) {
      return { response: `What should I change? For example:\n- "Set RSVP to Yes for all Sharma guests"\n- "Change dietary to Veg for Bride side"\n- "Set vendor contract to Signed"\n- "Mark all tasks as done"` };
    }

    // Clean undefined values
    filter = Object.fromEntries(Object.entries(filter).filter(([_, v]) => v !== undefined));

    const filterDesc = describeFilter(filter, targetLabel);
    const updateDesc = describeUpdates(updates);

    return {
      response: `I'll ${updateDesc} for ${targetLabel}${filterDesc}. Please confirm below.`,
      action: { type, filter, updates, description: `${updateDesc} for ${targetLabel}${filterDesc}`, preview: { count: 0, sample: [] } },
    };
  };

  const parseQueryCommand = (q: string, summary: any): { response: string } => {
    if (q.includes("budget") || q.includes("spend")) {
      return { response: `**Budget Summary:**\n- Total: ${formatINR(summary.budget)}\n- Allocated: ${formatINR(summary.budgetAllocated)}\n- Spent: ${formatINR(summary.budgetSpent)}\n- Remaining: ${formatINR(summary.budgetRemaining)}` };
    }
    if (q.includes("guest")) {
      return { response: `**Guest Summary:**\n- Total: ${summary.guestCount}\n- RSVP Yes: ${summary.rsvpYes}\n- Pending: ${summary.rsvpPending}\n- Declined: ${summary.rsvpDeclined}` };
    }
    if (q.includes("vendor")) {
      return { response: `**Vendor Summary:**\n- Total: ${summary.vendorCount}\n- Booked: ${summary.vendorsBooked}\n- Remaining: ${summary.vendorCount - summary.vendorsBooked}` };
    }
    if (q.includes("task")) {
      return { response: `**Task Summary:**\n- Total: ${summary.taskCount}\n- Done: ${summary.tasksDone}\n- Remaining: ${summary.taskCount - summary.tasksDone}` };
    }
    if (q.includes("room")) {
      return { response: `**Room Summary:**\n- Total: ${summary.roomCount}` };
    }
    return { response: `**Wedding Overview:**\n- Date: ${summary.weddingDate ? new Date(summary.weddingDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}\n- City: ${summary.weddingCity || "TBD"}\n- Budget: ${formatINR(summary.budget)}\n- Guests: ${summary.guestCount}\n- Vendors: ${summary.vendorCount}` };
  };

  const parseAddCommand = (q: string, summary: any): { response: string } => {
    if (q.includes("guest")) {
      const countMatch = q.match(/(\d+)/);
      const count = countMatch ? parseInt(countMatch[1]) : 1;
      return { response: `I can add ${count} guest(s). Use the **Guests** section and click **Add Guest** or **Add Multiple Rows** to add ${count} rows at once.` };
    }
    if (q.includes("vendor")) return { response: `Use the **Vendors** section and click **Add Vendor** to add a new vendor entry.` };
    if (q.includes("budget") || q.includes("item")) {
      const countMatch = q.match(/(\d+)/);
      const count = countMatch ? parseInt(countMatch[1]) : 1;
      return { response: `Use the **Budget** section and click **Add Item** or **Add More Items** to add ${count} budget entries.` };
    }
    if (q.includes("table")) return { response: `Use the **Seating** section and click **Add Table** to create a new seating table.` };
    if (q.includes("room")) return { response: `Use the **Room Allocation** section and click **Add Room** to add a new room allocation.` };
    return { response: `What would you like to add? I can help with:\n- Guests\n- Vendors\n- Budget items\n- Seating tables\n- Room allocations` };
  };

  const describeFilter = (filter: any, target: string): string => {
    const parts: string[] = [];
    if (filter.side) parts.push(`${filter.side}'s side`);
    if (filter.relation) parts.push(`${filter.relation} family`);
    if (filter.name_contains) parts.push(`named "${filter.name_contains}"`);
    if (filter.rsvp) parts.push(`with RSVP "${filter.rsvp}"`);
    if (filter.dietary) parts.push(`dietary "${filter.dietary}"`);
    if (filter.contract) parts.push(`contract "${filter.contract}"`);
    if (filter.status) parts.push(`status "${filter.status}"`);
    if (filter.category) parts.push(`in "${filter.category}" category`);
    if (filter.hotel) parts.push(`at "${filter.hotel}"`);
    if (filter.roomType) parts.push(`type "${filter.roomType}"`);
    if (parts.length === 0) return "";
    return ` where ${parts.join(", ")}`;
  };

  const describeUpdates = (updates: any): string => {
    const parts: string[] = [];
    if (updates.rsvp) parts.push(`RSVP to "${updates.rsvp}"`);
    if (updates.dietary) parts.push(`dietary to "${updates.dietary}"`);
    if (updates.side) parts.push(`side to "${updates.side}"`);
    if (updates.contract) parts.push(`contract to "${updates.contract}"`);
    if (updates.status) parts.push(`status to "${updates.status}"`);
    if (updates.done !== undefined) parts.push(`mark as ${updates.done ? "done" : "undone"}`);
    return "set " + parts.join(", ");
  };

  const getSmartSuggestions = (action: PendingAction): string[] => {
    const suggestions: string[] = [];
    if (action.type === "guests" && action.updates.rsvp === "Yes") {
      suggestions.push("Assign these guests to seating tables");
      suggestions.push("Set dietary preferences for confirmed guests");
    }
    if (action.type === "guests" && action.updates.rsvp === "Declined") {
      suggestions.push("Remove declined guests from seating");
    }
    if (action.type === "vendors" && action.updates.contract === "Signed") {
      suggestions.push("Set vendor payment status");
    }
    if (action.type === "budget") {
      suggestions.push("Check budget remaining");
    }
    if (suggestions.length === 0) {
      suggestions.push("What's my current summary?");
    }
    return suggestions.slice(0, 3);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setExecuting(true);
    try {
      const result = await executeBulkUpdate(weddingId, pendingAction.type, pendingAction.filter, pendingAction.updates);
      const targetDesc = pendingAction.description.split(" for ")[1] || pendingAction.description;
      const confirmMsg = `Done! Updated **${result.updated}** ${targetDesc}.`;
      setMessages((prev) => [...prev, { role: "bot", content: confirmMsg }]);

      // Store successful interaction
      const lastUserMsg = messages.filter((m) => m.role === "user").pop();
      if (lastUserMsg) {
        await storeInteraction(weddingId, "user", lastUserMsg.content, "update", pendingAction.type, true);
        await storeInteraction(weddingId, "bot", confirmMsg, "update", pendingAction.type, true);
      }

      // Smart suggestions
      const suggestions = getSmartSuggestions(pendingAction);
      if (suggestions.length > 0) {
        const sugMsg = `**Follow-up suggestions:**\n${suggestions.map((s) => `- ${s}`).join("\n")}`;
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "bot", content: sugMsg }]);
        }, 500);
      }

      setPendingAction(null);
      onUpdate();
    } catch (e) {
      const errMsg = `Failed to execute: ${(e as Error).message}`;
      setMessages((prev) => [...prev, { role: "bot", content: errMsg }]);
    } finally {
      setExecuting(false);
    }
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    setMessages((prev) => [...prev, { role: "bot", content: "Action cancelled." }]);
  };

  const handleCorrect = async (msgIndex: number) => {
    if (!correctionText.trim()) return;
    const msg = messages[msgIndex];
    if (msg.id) {
      await correctInteraction(msg.id, correctionText);
    }
    setMessages((prev) => [
      ...prev.slice(0, msgIndex + 1),
      { role: "bot", content: `Got it! I'll remember that. Updated: "${correctionText}"` },
    ]);
    setCorrectingId(null);
    setCorrectionText("");
  };

  const handleLearn = async () => {
    if (!learningPattern.trim() || !learningResponse.trim()) return;
    try {
      // Test the regex
      new RegExp(learningPattern, "i");
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "Invalid pattern. Use valid regex like `^show all veg guests$`" }]);
      return;
    }

    const result = await learnCommand(weddingId, learningPattern, learningIntent, learningTarget, learningResponse);
    if (result) {
      setLearnedPatterns((prev) => [...prev, result as LearnedPattern]);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: `Learned! I'll now respond to pattern \`${learningPattern}\` with: "${learningResponse}"`, learned: true },
      ]);
    }
    setLearningMode(false);
    setLearningPattern("");
    setLearningResponse("");
  };

  const send = async () => {
    if (!input.trim() || executing) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      await addAiMessage(weddingId, "user", userMsg);

      // Check if should use Gemini for complex queries
      if (shouldUseAI(userMsg)) {
        setMessages((prev) => [...prev, { role: "bot", content: "Thinking..." }]);

        try {
          const conversationHistory = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
          const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weddingId, question: userMsg, conversationHistory }),
          });
          const data = await res.json();
          if (!res.ok || data.error) {
            // Gemini failed — fall back to rule-based parser
            const fallback = await parseCommand(userMsg);
            setMessages((prev) => {
              const without = prev.slice(0, -1);
              return [...without, { role: "bot", content: fallback.response, action: fallback.action }];
            });
            await addAiMessage(weddingId, "bot", fallback.response);
            return;
          }
          const response = data.response || "No response from Gemini.";

          // Remove "Thinking..." and add real response
          setMessages((prev) => {
            const without = prev.slice(0, -1);
            return [...without, { role: "bot", content: response }];
          });

        await addAiMessage(weddingId, "bot", response);
        await storeInteraction(weddingId, "user", userMsg, "query", undefined, true);
        onUpdate();
        return;
        } catch (geminiErr) {
          // Gemini failed — fall back to rule-based parser
          const fallback = await parseCommand(userMsg);
          setMessages((prev) => {
            const without = prev.slice(0, -1);
            return [...without, { role: "bot", content: fallback.response, action: fallback.action }];
          });
          await addAiMessage(weddingId, "bot", fallback.response);
          return;
        }
      }

      // Rule-based parser for simple commands
      const { response, action, learned } = await parseCommand(userMsg);

      if (action) {
        const preview = await previewBulkAction(weddingId, action.type, action.filter);
        action.preview = preview;
        setPendingAction(action);
        setMessages((prev) => [...prev, { role: "bot", content: response, action, learned }]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", content: response, learned }]);
      }

      await addAiMessage(weddingId, "bot", response);
      await storeInteraction(weddingId, "user", userMsg, action ? "update" : "query", action?.type || undefined, undefined);
      onUpdate();
    } catch (e) {
      const errMsg = `Sorry, I couldn't process that. ${(e as Error).message}`;
      setMessages((prev) => [...prev, { role: "bot", content: errMsg }]);
    }
  };

  return (
    <div className={`fixed top-[60px] right-0 w-[420px] h-[calc(100vh-60px)] bg-white border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.1)] flex flex-col z-[90] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-br from-maroon to-maroon-light text-white shrink-0">
        <div className="flex items-center gap-2.5 font-bold">
          <i className="fas fa-wand-magic-sparkles" /> ShaadiSheet AI
          {learnedPatterns.length > 0 && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{learnedPatterns.length} learned</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLearningMode(!learningMode)}
            className="text-[11px] bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Teach AI a new command"
          >
            <i className="fas fa-graduation-cap mr-1" /> Learn
          </button>
          <button onClick={onClose} className="text-white/80 hover:text-white cursor-pointer"><i className="fas fa-times text-lg" /></button>
        </div>
      </div>

      {learningMode && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gold/10 to-gold/5 space-y-3 shrink-0">
          <div className="text-xs font-bold text-gold flex items-center gap-1.5">
            <i className="fas fa-graduation-cap" /> Teach AI a New Command
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={learningIntent}
                onChange={(e) => setLearningIntent(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
              >
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="query">Query</option>
                <option value="add">Add</option>
              </select>
              <select
                value={learningTarget}
                onChange={(e) => setLearningTarget(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
              >
                <option value="guests">Guests</option>
                <option value="vendors">Vendors</option>
                <option value="budget">Budget</option>
                <option value="rooms">Rooms</option>
                <option value="tasks">Tasks</option>
              </select>
            </div>
            <input
              value={learningPattern}
              onChange={(e) => setLearningPattern(e.target.value)}
              placeholder="Pattern (regex): ^show all veg guests$"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            />
            <textarea
              value={learningResponse}
              onChange={(e) => setLearningResponse(e.target.value)}
              placeholder="Response: Here are all your vegetarian guests..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleLearn}
                disabled={!learningPattern.trim() || !learningResponse.trim()}
                className="flex-1 px-3 py-1.5 bg-gradient-to-br from-gold to-gold-light text-white text-xs font-semibold rounded-lg hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <i className="fas fa-check mr-1" /> Save
              </button>
              <button
                onClick={() => setLearningMode(false)}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${msg.role === "bot" ? "bg-gradient-to-br from-maroon to-gold text-white" : "bg-gray-200 text-gray-700"}`}>
              {msg.role === "bot" ? <i className="fas fa-wand-magic-sparkles" /> : (wedding.name?.charAt(0) || "U")}
            </div>
            <div className="flex flex-col gap-1">
              <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-line ${msg.role === "bot" ? "bg-gray-100 rounded-tl-sm" : "bg-gradient-to-br from-maroon to-maroon-light text-white rounded-tr-sm"}`}>
                {msg.learned && <span className="inline-block bg-gold/20 text-gold text-[10px] px-1.5 py-0.5 rounded-full mr-1.5 font-bold">Learned</span>}
                {msg.content}
              </div>
              {msg.role === "bot" && i > 0 && !msg.action && correctingId !== i && (
                <button
                  onClick={() => { setCorrectingId(i); setCorrectionText(""); }}
                  className="text-[10px] text-gray-400 hover:text-maroon transition-colors self-start cursor-pointer"
                >
                  <i className="fas fa-pen mr-0.5" /> Correct this
                </button>
              )}
              {correctingId === i && (
                <div className="flex gap-1.5 items-center">
                  <input
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCorrect(i)}
                    placeholder="What should it say instead?"
                    className="flex-1 px-2.5 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-maroon"
                    autoFocus
                  />
                  <button onClick={() => handleCorrect(i)} className="text-xs text-maroon font-bold hover:text-maroon-light cursor-pointer">
                    <i className="fas fa-check" />
                  </button>
                  <button onClick={() => setCorrectingId(null)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
                    <i className="fas fa-times" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {pendingAction && (
          <div className="bg-white border-2 border-maroon/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-maroon">
              <i className="fas fa-exclamation-triangle" /> Confirm Bulk Action
            </div>

            <p className="text-sm text-gray-600">{pendingAction.description}</p>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {pendingAction.preview.count} items will be affected
              </div>
              {pendingAction.preview.count === 0 ? (
                <p className="text-xs text-gray-400">No matching items found.</p>
              ) : (
                <div className="space-y-1">
                  {pendingAction.preview.sample.slice(0, 5).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <i className="fas fa-circle text-[0.3rem] text-gray-400" />
                      <span className="font-medium">{item.name || item.guestName || item.item || item.category}</span>
                      {item.rsvp && <span className="text-gray-400">({item.rsvp})</span>}
                      {item.side && <span className="text-gray-400">({item.side})</span>}
                      {item.contract && <span className="text-gray-400">({item.contract})</span>}
                      {item.status && <span className="text-gray-400">({item.status})</span>}
                    </div>
                  ))}
                  {pendingAction.preview.count > 5 && (
                    <p className="text-xs text-gray-400">...and {pendingAction.preview.count - 5} more</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmAction}
                disabled={executing || pendingAction.preview.count === 0}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-maroon to-maroon-light text-white text-sm font-semibold rounded-lg hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {executing ? <><i className="fas fa-spinner fa-spin mr-1.5" /> Executing...</> : <><i className="fas fa-check mr-1.5" /> Confirm</>}
              </button>
              <button
                onClick={handleCancelAction}
                disabled={executing}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      <div className="p-4 border-t border-gray-200 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a command..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors"
          />
          <button onClick={send} className="w-11 h-11 rounded-lg bg-gradient-to-br from-maroon to-maroon-light text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
            <i className="fas fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  );
}
