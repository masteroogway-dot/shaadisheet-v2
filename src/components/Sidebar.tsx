"use client";

import { useState } from "react";
import { resetWedding } from "@/lib/actions";

const NAV_ITEMS = [
  { id: "overview", icon: "fa-home", label: "Overview" },
  { id: "budget", icon: "fa-rupee-sign", label: "Budget" },
  { id: "vendors", icon: "fa-store", label: "Vendors" },
  { id: "guests", icon: "fa-users", label: "Guests" },
  { id: "events", icon: "fa-calendar-alt", label: "Events" },
  { id: "tasks", icon: "fa-tasks", label: "Tasks" },
  { id: "seating", icon: "fa-th-large", label: "Seating" },
  { id: "timeline", icon: "fa-clock", label: "Day Timeline" },
];

interface Props {
  activeView: string;
  onViewChange: (view: string) => void;
  onReset: () => void;
}

export default function Sidebar({ activeView, onViewChange, onReset }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    await resetWedding();
    setConfirmReset(false);
    onReset();
  };

  return (
    <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
      <nav className="flex-1 p-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[0.9rem] font-medium transition-all mb-0.5 cursor-pointer ${
              activeView === item.id
                ? "bg-gradient-to-br from-maroon to-maroon-light text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 space-y-3">
        <button
          onClick={handleReset}
          className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            confirmReset
              ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <i className={`fas ${confirmReset ? "fa-exclamation-triangle" : "fa-redo"} w-5 text-center`} />
          <span>{confirmReset ? "Click again to reset" : "Reset Wedding"}</span>
        </button>
      </div>
    </aside>
  );
}
