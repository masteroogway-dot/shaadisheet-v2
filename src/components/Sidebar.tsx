"use client";

import Link from "next/link";

const NAV_ITEMS = [
  { id: "overview", icon: "fa-home", label: "Overview" },
  { id: "budget", icon: "fa-rupee-sign", label: "Budget" },
  { id: "vendors", icon: "fa-store", label: "Vendors" },
  { id: "guests", icon: "fa-users", label: "Guests" },
  { id: "events", icon: "fa-calendar-alt", label: "Events" },
  { id: "tasks", icon: "fa-tasks", label: "Tasks" },
  { id: "seating", icon: "fa-th-large", label: "Seating" },
  { id: "rooms", icon: "fa-bed", label: "Room Allocation" },
  { id: "timeline", icon: "fa-clock", label: "Day Timeline" },
];

interface Props {
  activeView: string;
  onViewChange: (view: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ activeView, onViewChange, mobileOpen, onMobileClose }: Props) {
  const handleNav = (id: string) => {
    onViewChange(id);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[260px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto z-50
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:w-[240px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-3 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <i className="fas fa-arrow-left w-5 text-center" />
            <span>My Weddings</span>
          </Link>
        </div>
        <nav className="flex-1 p-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] rounded-lg text-[0.9rem] font-medium transition-all mb-0.5 cursor-pointer ${
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
      </aside>
    </>
  );
}
