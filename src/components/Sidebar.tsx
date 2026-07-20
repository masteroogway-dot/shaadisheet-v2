"use client";

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
}

export default function Sidebar({ activeView, onViewChange }: Props) {
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-maroon/5 to-gold/5 rounded-lg border border-maroon/10">
          <i className="fas fa-crown text-gold" />
          <span className="flex-1 text-sm font-semibold">Free Plan</span>
          <button className="px-3 py-1 text-xs font-bold text-white bg-maroon rounded-md hover:bg-maroon-light transition-colors cursor-pointer">Upgrade</button>
        </div>
      </div>
    </aside>
  );
}
