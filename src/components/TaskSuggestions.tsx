"use client";

import { useMemo, useState } from "react";
import { createTask } from "@/lib/actions";

const SUGGESTIONS_BY_MONTH: Record<string, { text: string; category: string; priority: string }[]> = {
  "12+": [
    { text: "Set total wedding budget", category: "Budget", priority: "High" },
    { text: "Book wedding venue", category: "Venue", priority: "High" },
    { text: "Book photographer & videographer", category: "Photography", priority: "High" },
    { text: "Start guest list draft", category: "Guests", priority: "Medium" },
    { text: "Research caterers", category: "Catering", priority: "Medium" },
  ],
  "9-12": [
    { text: "Book caterer", category: "Catering", priority: "High" },
    { text: "Book decorator", category: "Decor", priority: "High" },
    { text: "Book makeup artist", category: "Makeup", priority: "Medium" },
    { text: "Book DJ / band", category: "Entertainment", priority: "Medium" },
    { text: "Start outfit shopping (lehenga / sherwani)", category: "Outfits", priority: "Medium" },
  ],
  "6-9": [
    { text: "Book mehendi artist", category: "Mehendi", priority: "High" },
    { text: "Order wedding invitations", category: "Invites", priority: "High" },
    { text: "Book transport (baraat cars, guest pickup)", category: "Transport", priority: "Medium" },
    { text: "Finalize guest list", category: "Guests", priority: "High" },
    { text: "Book accommodation for outstation guests", category: "Accommodation", priority: "Medium" },
  ],
  "3-6": [
    { text: "Send out invitations", category: "Invites", priority: "High" },
    { text: "Finalize outfit designs", category: "Outfits", priority: "High" },
    { text: "Book priest / pandit", category: "Priest", priority: "High" },
    { text: "Plan sangeet songs & choreography", category: "Sangeet", priority: "Medium" },
    { text: "Finalize menu with caterer", category: "Catering", priority: "Medium" },
  ],
  "1-3": [
    { text: "Final dress trial", category: "Outfits", priority: "High" },
    { text: "Send reminder for RSVPs", category: "Guests", priority: "High" },
    { text: "Finalize seating arrangement", category: "Seating", priority: "High" },
    { text: "Confirm all vendor bookings", category: "Vendors", priority: "High" },
    { text: "Plan welcome kit for guests", category: "Hospitality", priority: "Medium" },
  ],
  "last": [
    { text: "Final rehearsal with priest", category: "Priest", priority: "High" },
    { text: "Confirm baraat timing & route", category: "Baraat", priority: "High" },
    { text: "Pack emergency kit (safety pins, makeup, meds)", category: "Emergency", priority: "High" },
    { text: "Final venue walkthrough", category: "Venue", priority: "High" },
    { text: "Delegate day-of tasks to family", category: "Coordination", priority: "Medium" },
  ],
};

export default function TaskSuggestions({ weddingId, wedding, onUpdate, onToast }: { weddingId: string; wedding: any; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const suggestions = useMemo(() => {
    if (!wedding.weddingDate) return [];
    const now = new Date();
    const weddingDate = new Date(wedding.weddingDate);
    const monthsLeft = Math.ceil((weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));

    let period = "12+";
    if (monthsLeft <= 1) period = "last";
    else if (monthsLeft <= 3) period = "1-3";
    else if (monthsLeft <= 6) period = "3-6";
    else if (monthsLeft <= 9) period = "6-9";
    else if (monthsLeft <= 12) period = "9-12";

    const existingTasks = new Set((wedding.tasks || []).map((t: any) => t.text?.toLowerCase()));
    const periodSuggestions = SUGGESTIONS_BY_MONTH[period] || [];
    return periodSuggestions.filter((s) => !existingTasks.has(s.text.toLowerCase()) && !dismissed.has(s.text));
  }, [wedding, dismissed]);

  const handleAddSuggestion = async (suggestion: { text: string; category: string; priority: string }) => {
    try {
      await createTask(weddingId, { period: "1-3 Months", text: suggestion.text, priority: suggestion.priority, category: suggestion.category });
      onUpdate();
      onToast(`Added: ${suggestion.text}`, "success");
    } catch {
      onToast("Failed to add task", "error");
    }
  };

  if (!suggestions.length) return null;

  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <i className="fas fa-wand-magic-sparkles text-maroon" /> Suggested Tasks
      </p>
      <div className="space-y-2">
        {suggestions.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg gap-2">
            <div className="min-w-0">
              <span className="text-sm font-medium text-purple-800 block truncate">{s.text}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">{s.category}</span>
                <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full ${s.priority === "High" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>{s.priority}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleAddSuggestion(s)} className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700">Add</button>
              <button onClick={() => setDismissed((prev) => new Set([...prev, s.text]))} className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
