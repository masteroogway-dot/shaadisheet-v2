"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DemoTab = "overview" | "budget" | "vendors" | "guests" | "events" | "tasks" | "hashtags" | "sangeet" | "colors";

type SidebarItem = { id: string; icon: string; label: string };

const SIDEBAR_SECTIONS: { title: string; icon: string; items: SidebarItem[] }[] = [
  {
    title: "Planning",
    icon: "fa-clipboard-list",
    items: [
      { id: "overview" as DemoTab, icon: "fa-home", label: "Overview" },
      { id: "budget" as DemoTab, icon: "fa-coins", label: "Budget" },
      { id: "vendors" as DemoTab, icon: "fa-store", label: "Vendors" },
      { id: "guests" as DemoTab, icon: "fa-users", label: "Guests" },
      { id: "events" as DemoTab, icon: "fa-calendar-alt", label: "Events" },
      { id: "tasks" as DemoTab, icon: "fa-tasks", label: "Tasks" },
    ],
  },
  {
    title: "Logistics",
    icon: "fa-hotel",
    items: [
      { id: "seating", icon: "fa-th-large", label: "Seating" },
      { id: "rooms", icon: "fa-bed", label: "Rooms" },
      { id: "timeline", icon: "fa-clock", label: "Timeline" },
      { id: "gifts", icon: "fa-gift", label: "Gift Tracker" },
      { id: "outfits", icon: "fa-shirt", label: "Outfit Planner" },
      { id: "colors" as DemoTab, icon: "fa-palette", label: "Color Coordinator" },
      { id: "invites", icon: "fa-envelope-open-text", label: "Invites" },
    ],
  },
  {
    title: "Checklists",
    icon: "fa-clipboard-check",
    items: [
      { id: "emergency", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "priest", icon: "fa-om", label: "Priest Requirements" },
      { id: "vidaai", icon: "fa-heart-crack", label: "Vidaai Essentials" },
    ],
  },
  {
    title: "Fun",
    icon: "fa-wand-magic-sparkles",
    items: [
      { id: "hashtags" as DemoTab, icon: "fa-hashtag", label: "Hashtag Generator" },
      { id: "sangeet" as DemoTab, icon: "fa-music", label: "Sangeet Planner" },
    ],
  },
];

const EVENTS = [
  { name: "Mehendi Night", date: "Dec 18, 2026", time: "6:00 PM", venue: "Garden Lawn", status: "Confirmed" },
  { name: "Haldi Ceremony", date: "Dec 19, 2026", time: "10:00 AM", venue: "Home Terrace", status: "Confirmed" },
  { name: "Wedding Ceremony", date: "Dec 20, 2026", time: "7:00 PM", venue: "Grand Palace Banquet", status: "Confirmed" },
  { name: "Reception", date: "Dec 21, 2026", time: "8:00 PM", venue: "Grand Palace Banquet", status: "Confirmed" },
];

const GUESTS = [
  { name: "Priya Sharma", side: "Bride", rsvp: "Yes", dietary: "Vegetarian", table: 1 },
  { name: "Rahul Verma", side: "Groom", rsvp: "Yes", dietary: "Non-Veg", table: 2 },
  { name: "Anita Devi", side: "Bride", rsvp: "Pending", dietary: "Vegan", table: "—" },
  { name: "Vikram Singh", side: "Groom", rsvp: "Yes", dietary: "Non-Veg", table: 3 },
  { name: "Meera Joshi", side: "Bride", rsvp: "No", dietary: "Vegetarian", table: "—" },
  { name: "Amit Patel", side: "Groom", rsvp: "Yes", dietary: "Jain", table: 4 },
  { name: "Neha Gupta", side: "Bride", rsvp: "Yes", dietary: "Vegetarian", table: 1 },
  { name: "Sanjay Kumar", side: "Groom", rsvp: "Pending", dietary: "Non-Veg", table: "—" },
];

const BUDGET_CATS = [
  { name: "Venue", allocated: 350000, spent: 320000, icon: "🏛️" },
  { name: "Catering", allocated: 250000, spent: 180000, icon: "🍽️" },
  { name: "Photography", allocated: 100000, spent: 75000, icon: "📸" },
  { name: "Decor", allocated: 80000, spent: 65000, icon: "💐" },
  { name: "Music/DJ", allocated: 50000, spent: 45000, icon: "🎵" },
  { name: "Outfits", allocated: 80000, spent: 60000, icon: "👗" },
  { name: "Makeup", allocated: 40000, spent: 35000, icon: "💄" },
  { name: "Transport", allocated: 30000, spent: 20000, icon: "🚗" },
];

const VENDORS = [
  { name: "Grand Palace Banquet", category: "Venue", status: "Confirmed", amount: "₹3,20,000" },
  { name: "Spice Garden Caterers", category: "Catering", status: "Confirmed", amount: "₹1,80,000" },
  { name: "LensMan Studios", category: "Photography", status: "Pending", amount: "₹75,000" },
  { name: "Dhoom Beats", category: "DJ", status: "Confirmed", amount: "₹45,000" },
  { name: "Royal Decor", category: "Decor", status: "Pending", amount: "₹65,000" },
];

const TASKS = [
  { task: "Book venue", done: true, due: "Mar 2026" },
  { task: "Finalize guest list", done: true, due: "Apr 2026" },
  { task: "Book photographer", done: true, due: "May 2026" },
  { task: "Send Save the Dates", done: true, due: "Jun 2026" },
  { task: "Book caterer", done: true, due: "Jul 2026" },
  { task: "Shop for outfits", done: false, due: "Aug 2026" },
  { task: "Plan mehendi night", done: false, due: "Oct 2026" },
  { task: "Finalize seating chart", done: false, due: "Nov 2026" },
  { task: "Send invitations", done: false, due: "Nov 2026" },
  { task: "Confirm all vendors", done: false, due: "Dec 2026" },
];

const HASHTAGS = [
  "#PriyaKiShaadi", "#RahulWedsPriya", "#SharmaVerma2026", "#WeddingBells",
  "#SweeterThanJalebi", "#MehendiNight", "#ShaadiKaSeason", "#DilSeShaadi",
  "#HaldiVibes", "#BaraatTime", "#PherasAndPrayers", "#VidaaiFeels",
];

const SANGEET_SONGS = [
  { title: "London Thumakda", artist: "Labh Janjua", duration: "4:35", type: "Group", performers: ["Priya", "Meera", "Neha"], confirmed: 3 },
  { title: "Nagada Sang Dhol", artist: "Shreya Ghoshal", duration: "5:02", type: "Solo", performers: ["Priya"], confirmed: 1 },
  { title: "Mere Brother Ki Dulhan", artist: "Pritam", duration: "4:28", type: "Duet", performers: ["Rahul", "Vikram"], confirmed: 2 },
  { title: "Kar Gayi Chull", artist: "Badshah", duration: "3:30", type: "Group", performers: ["Meera", "Neha", "Amit"], confirmed: 2 },
  { title: "Dil Dhadakne Do", artist: "Shankar-Ehsaan-Loy", duration: "4:50", type: "Duet", performers: ["Priya", "Rahul"], confirmed: 2 },
  { title: "Badtameez Dil", artist: "Benny Dayal", duration: "3:52", type: "Solo", performers: ["Rahul"], confirmed: 1 },
];

const COLOR_THEMES = [
  { event: "Mehendi", primary: "#228B22", secondary: "#90EE90", accent: "#FFD700", mood: "Traditional" },
  { event: "Haldi", primary: "#FFD700", secondary: "#FFA500", accent: "#FFF8DC", mood: "Vibrant" },
  { event: "Wedding", primary: "#DC143C", secondary: "#FF6347", accent: "#FFD700", mood: "Traditional" },
  { event: "Reception", primary: "#4B0082", secondary: "#9370DB", accent: "#C0C0C0", mood: "Elegant" },
];

const OUTFIT_COLORS = [
  { person: "Priya", event: "Mehendi", desc: "Green Anarkali suit", colors: ["#228B22", "#FFD700"], match: 92 },
  { person: "Rahul", event: "Mehendi", desc: "Green kurta with gold", colors: ["#228B22", "#FFD700"], match: 88 },
  { person: "Priya", event: "Wedding", desc: "Red Banarasi lehenga", colors: ["#DC143C", "#FFD700"], match: 98 },
  { person: "Rahul", event: "Wedding", desc: "Red and gold sherwani", colors: ["#DC143C", "#FFD700"], match: 96 },
  { person: "Priya", event: "Reception", desc: "Purple silk saree", colors: ["#4B0082", "#C0C0C0"], match: 94 },
  { person: "Rahul", event: "Reception", desc: "Navy blue suit", colors: ["#191970", "#C0C0C0"], match: 91 },
];

function formatINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export default function InteractiveDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DemoTab>("overview");

  const totalBudget = BUDGET_CATS.reduce((a, c) => a + c.allocated, 0);
  const totalSpent = BUDGET_CATS.reduce((a, c) => a + c.spent, 0);
  const guestsConfirmed = GUESTS.filter((g) => g.rsvp === "Yes").length;
  const tasksDone = TASKS.filter((t) => t.done).length;

  const findSectionForView = (viewId: string) => {
    return SIDEBAR_SECTIONS.find((s) => s.items.some((i) => i.id === viewId));
  };
  const activeSection = findSectionForView(activeTab);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-bold border-2 border-white/30 rounded-xl text-white hover:bg-white/10 transition-all backdrop-blur-sm"
      >
        Try Interactive Demo
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-0 md:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-gray-100 rounded-none md:rounded-2xl shadow-2xl w-full max-w-6xl h-full md:h-[90vh] overflow-hidden flex flex-col"
            >
              {/* ── TOP HEADER BAR ── */}
              <div className="h-[52px] md:h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <button className="w-10 h-10 md:w-10 md:h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 lg:hidden cursor-pointer">
                    <i className="fas fa-bars text-base" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-maroon flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="font-bold text-sm text-gray-900 hidden sm:inline">ShaadiSheet</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs md:text-sm leading-tight">Priya & Rahul&apos;s Wedding</div>
                  <div className="text-[10px] md:text-xs text-gray-500 leading-tight">Dec 20, 2026 • Nashik</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-maroon transition-all cursor-pointer" title="AI Assistant">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24">
                      <path d="M12 2L9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5z" fill="currentColor" />
                      <path d="M19 15l-1.5 4-3.5-3 4-1z" fill="currentColor" opacity="0.6" />
                      <path d="M5 15l1.5 4 3.5-3-4-1z" fill="currentColor" opacity="0.6" />
                    </svg>
                  </button>
                  <div className="w-9 h-9 rounded-full bg-maroon/10 flex items-center justify-center text-maroon font-bold text-sm cursor-pointer">
                    PS
                  </div>
                </div>
              </div>

              {/* ── BODY: SIDEBAR + MAIN ── */}
              <div className="flex flex-1 overflow-hidden">
                {/* ── SIDEBAR ── */}
                <aside className="hidden lg:flex w-[240px] bg-white border-r border-gray-200 flex-col shrink-0 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all w-full cursor-pointer">
                      <i className="fas fa-arrow-left w-5 text-center" />
                      <span>My Weddings</span>
                    </button>
                  </div>
                  <nav className="flex-1 py-2">
                    {SIDEBAR_SECTIONS.map((section) => {
                      const isActive = activeSection === section;
                      return (
                        <div key={section.title} className="mb-1">
                          <div className={`w-full flex items-center gap-2 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-wider ${isActive ? "text-maroon" : "text-gray-400"}`}>
                            <i className={`fas ${section.icon} w-4 text-center text-[0.7rem]`} />
                            <span className="flex-1 text-left">{section.title}</span>
                            <i className="fas fa-chevron-down text-[0.55rem]" />
                          </div>
                          <div className="mt-0.5">
                            {section.items.map((item) => {
                              const isLocked = !["overview", "budget", "vendors", "guests", "events", "tasks", "hashtags", "sangeet", "colors"].includes(item.id);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    if (!isLocked) setActiveTab(item.id as DemoTab);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 ml-2 mr-2 min-h-[44px] rounded-lg text-[0.85rem] font-medium transition-all mb-0.5 ${
                                    isLocked
                                      ? "text-gray-400 cursor-not-allowed opacity-60"
                                      : activeTab === item.id
                                        ? "bg-gradient-to-br from-maroon to-red-800 text-white shadow-sm cursor-pointer"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                                  }`}
                                >
                                  <i className={`fas ${item.icon} w-5 text-center text-sm`} />
                                  <span className="flex-1 text-left">{item.label}</span>
                                  {isLocked && <i className="fas fa-lock text-[10px] text-gray-400" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </nav>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                  <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                      <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        {/* Welcome banner */}
                        <div className="bg-gradient-to-r from-maroon to-red-800 rounded-xl p-5 md:p-6 text-white mb-6">
                          <p className="text-xs text-white/70 mb-0.5">Welcome back, Priya</p>
                          <h2 className="text-lg md:text-xl font-bold mb-3">Priya & Rahul&apos;s Wedding</h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-[10px] text-white/60 uppercase tracking-wider">Date</p>
                              <p className="text-sm font-semibold">Dec 20, 2026</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-white/60 uppercase tracking-wider">Days Left</p>
                              <p className="text-sm font-semibold text-[#FFD54F]">142</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-white/60 uppercase tracking-wider">Guests</p>
                              <p className="text-sm font-semibold">248</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-white/60 uppercase tracking-wider">Budget</p>
                              <p className="text-sm font-semibold">{formatINR(totalBudget)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Stats cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          {[
                            { label: "Guests Confirmed", value: guestsConfirmed, total: 248, icon: "fa-users", color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Budget Used", value: `${Math.round((totalSpent / totalBudget) * 100)}%`, icon: "fa-coins", color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "Vendors Booked", value: "3/5", icon: "fa-store", color: "text-purple-600", bg: "bg-purple-50" },
                            { label: "Tasks Done", value: `${tasksDone}/${TASKS.length}`, icon: "fa-tasks", color: "text-amber-600", bg: "bg-amber-50" },
                          ].map((s, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-gray-500">{s.label}</p>
                                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                                  <i className={`fas ${s.icon} text-xs ${s.color}`} />
                                </div>
                              </div>
                              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                          <h3 className="font-bold text-gray-900 text-sm mb-4">Upcoming Events</h3>
                          <div className="space-y-3">
                            {EVENTS.map((ev, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-maroon/10 flex items-center justify-center">
                                    <i className="fas fa-calendar-alt text-maroon text-sm" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 text-sm">{ev.name}</p>
                                    <p className="text-xs text-gray-500">{ev.date} • {ev.time} • {ev.venue}</p>
                                  </div>
                                </div>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{ev.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "budget" && (
                      <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="font-bold text-gray-900 text-lg">Budget Overview</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Total: {formatINR(totalBudget)} • Spent: {formatINR(totalSpent)} • Remaining: {formatINR(totalBudget - totalSpent)}</p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-maroon rounded-lg cursor-pointer">+ Add Expense</button>
                        </div>
                        <div className="bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${(totalSpent / totalBudget) * 100}%` }} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {BUDGET_CATS.map((cat, i) => {
                            const pct = Math.round((cat.spent / cat.allocated) * 100);
                            return (
                              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{cat.icon}</span>
                                    <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                                  </div>
                                  <span className="text-xs font-bold text-gray-900">{formatINR(cat.spent)} <span className="text-gray-400 font-normal">/ {formatINR(cat.allocated)}</span></span>
                                </div>
                                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "vendors" && (
                      <motion.div key="vendors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="font-bold text-gray-900 text-lg">Vendor Directory</h2>
                            <p className="text-xs text-gray-500 mt-0.5">5 vendors • 3 confirmed • 2 pending</p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-maroon rounded-lg cursor-pointer">+ Add Vendor</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {VENDORS.map((v, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-maroon/10 flex items-center justify-center">
                                    <i className="fas fa-store text-maroon text-sm" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{v.name}</h4>
                                    <p className="text-xs text-gray-500">{v.category}</p>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.status === "Confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{v.status}</span>
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-900">{v.amount}</span>
                                <span className="text-xs text-gray-400">View Details →</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "guests" && (
                      <motion.div key="guests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="font-bold text-gray-900 text-lg">Guest List</h2>
                            <p className="text-xs text-gray-500 mt-0.5">248 total • {guestsConfirmed} confirmed • {GUESTS.filter((g) => g.rsvp === "Pending").length} pending</p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-maroon rounded-lg cursor-pointer">+ Add Guest</button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          {[
                            { label: "Confirmed", count: guestsConfirmed, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                            { label: "Pending", count: GUESTS.filter((g) => g.rsvp === "Pending").length, color: "bg-amber-50 text-amber-700 border-amber-200" },
                            { label: "Declined", count: 1, color: "bg-red-50 text-red-700 border-red-200" },
                          ].map((s, i) => (
                            <div key={i} className={`rounded-xl p-4 text-center border ${s.color}`}>
                              <p className="text-2xl font-bold">{s.count}</p>
                              <p className="text-xs font-medium">{s.label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                          <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-200">
                            <span>Name</span><span>Side</span><span>RSVP</span><span>Dietary</span><span>Table</span>
                          </div>
                          {GUESTS.map((g, i) => (
                            <div key={i} className="grid grid-cols-5 gap-2 px-4 py-3 text-sm border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <span className="font-medium text-gray-900">{g.name}</span>
                              <span className={g.side === "Bride" ? "text-pink-600" : "text-blue-600"}>{g.side}</span>
                              <span className={`font-medium ${g.rsvp === "Yes" ? "text-emerald-600" : g.rsvp === "No" ? "text-red-500" : "text-amber-600"}`}>{g.rsvp}</span>
                              <span className="text-gray-600">{g.dietary}</span>
                              <span className="text-gray-600">{g.table}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "events" && (
                      <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="font-bold text-gray-900 text-lg">Events</h2>
                            <p className="text-xs text-gray-500 mt-0.5">4 events planned</p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-maroon rounded-lg cursor-pointer">+ Add Event</button>
                        </div>
                        <div className="space-y-3">
                          {EVENTS.map((ev, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-maroon/10 flex items-center justify-center">
                                    <i className="fas fa-calendar-alt text-maroon" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-900">{ev.name}</h3>
                                    <p className="text-xs text-gray-500">{ev.date} • {ev.time}</p>
                                  </div>
                                </div>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{ev.status}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                                <span><i className="fas fa-map-marker-alt mr-1" />{ev.venue}</span>
                                <span><i className="fas fa-clock mr-1" />{ev.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "tasks" && (
                      <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="font-bold text-gray-900 text-lg">Tasks</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{tasksDone} of {TASKS.length} completed</p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-maroon rounded-lg cursor-pointer">+ Add Task</button>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-maroon to-red-600" style={{ width: `${(tasksDone / TASKS.length) * 100}%` }} />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                          {TASKS.map((t, i) => (
                            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${t.done ? "bg-maroon border-maroon" : "border-gray-300"}`}>
                                {t.done && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className={`flex-1 text-sm ${t.done ? "text-gray-400 line-through" : "text-gray-900 font-medium"}`}>{t.task}</span>
                              <span className="text-xs text-gray-400">{t.due}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "hashtags" && (
                      <motion.div key="hashtags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="mb-6">
                          <h2 className="font-bold text-gray-900 text-lg">Hashtag Generator</h2>
                          <p className="text-xs text-gray-500 mt-0.5">AI-generated for Priya & Rahul</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                          <div className="flex gap-3 mb-4">
                            <input readOnly value="Priya" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="Partner 1" />
                            <input readOnly value="Rahul" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="Partner 2" />
                          </div>
                          <button className="w-full py-2.5 bg-maroon text-white rounded-lg text-sm font-semibold cursor-pointer">Generate Hashtags</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {HASHTAGS.map((tag, i) => (
                            <div key={i} className="bg-gradient-to-br from-maroon/5 to-amber-50 border border-maroon/10 rounded-xl p-3 text-center hover:border-maroon/30 transition-colors cursor-pointer">
                              <span className="text-sm font-bold text-maroon">{tag}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "sangeet" && (
                      <motion.div key="sangeet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="font-bold text-gray-900 text-lg">Sangeet Planner</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Plan performances, track rehearsals</p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-maroon rounded-lg cursor-pointer">+ Add Song</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                          {[
                            { label: "Songs", value: SANGEET_SONGS.length, icon: "fa-music", color: "bg-purple-100 text-purple-600" },
                            { label: "Performers", value: SANGEET_SONGS.reduce((a, s) => a + s.performers.length, 0), icon: "fa-microphone", color: "bg-blue-100 text-blue-600" },
                            { label: "Confirmed", value: SANGEET_SONGS.reduce((a, s) => a + s.confirmed, 0), icon: "fa-check-circle", color: "bg-green-100 text-green-600" },
                            { label: "Duration", value: "26:37", icon: "fa-clock", color: "bg-amber-100 text-amber-600" },
                          ].map((s, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3">
                              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                                <i className={`fas ${s.icon} text-xs`} />
                              </div>
                              <div className="text-lg font-bold text-gray-900">{s.value}</div>
                              <div className="text-[0.65rem] text-gray-500">{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {SANGEET_SONGS.map((song, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="font-bold text-gray-900 text-sm">{song.title}</span>
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">{song.type}</span>
                                  <span className="text-xs text-gray-400 ml-2">{song.duration}</span>
                                </div>
                                <span className="text-xs text-gray-500">{song.artist}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {song.performers.map((p, j) => (
                                  <span key={j} className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[0.65rem] font-medium">
                                    {p} <i className="fas fa-check-circle" />
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "colors" && (
                      <motion.div key="colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="font-bold text-gray-900 text-lg">Color Coordinator</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Coordinate themes across all events</p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-maroon rounded-lg cursor-pointer">+ Add Theme</button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                          <h3 className="text-sm font-bold text-gray-900 mb-3">Color Journey</h3>
                          <div className="flex items-center gap-1 overflow-x-auto pb-2">
                            {COLOR_THEMES.map((theme, i) => (
                              <div key={i} className="flex items-center shrink-0">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex gap-0.5">
                                    <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: theme.primary }} />
                                    <div className="w-4 h-4 rounded-full border border-gray-200 mt-1" style={{ backgroundColor: theme.secondary }} />
                                  </div>
                                  <span className="text-[0.6rem] text-gray-500 font-medium">{theme.event}</span>
                                </div>
                                {i < COLOR_THEMES.length - 1 && <div className="w-6 h-0.5 bg-gray-200 mx-1" />}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                          {COLOR_THEMES.map((theme, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-gray-900 text-sm">{theme.event}</span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{theme.mood}</span>
                              </div>
                              <div className="flex gap-2 mb-2">
                                <div className="flex-1 h-10 rounded-lg border border-gray-200" style={{ backgroundColor: theme.primary }} />
                                <div className="flex-1 h-10 rounded-lg border border-gray-200" style={{ backgroundColor: theme.secondary }} />
                                <div className="flex-1 h-10 rounded-lg border border-gray-200" style={{ backgroundColor: theme.accent }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-3">Outfit Colors</h3>
                        <div className="space-y-2">
                          {OUTFIT_COLORS.map((outfit, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 text-sm">{outfit.person}</span>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{outfit.event}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${outfit.match >= 90 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{outfit.match}% match</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{outfit.desc}</p>
                              </div>
                              <div className="flex gap-1">
                                {outfit.colors.map((c, j) => (
                                  <div key={j} className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>
              </div>

              {/* ── FOOTER ── */}
              <div className="h-10 bg-white border-t border-gray-200 flex items-center justify-between px-4 shrink-0">
                <p className="text-[10px] text-gray-400">Demo — data is pre-filled for illustration</p>
                <div className="flex gap-2">
                  <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors cursor-pointer">Close</button>
                  <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 text-[11px] font-semibold text-white bg-maroon rounded-md hover:bg-maroon-dark transition-colors cursor-pointer">Start Free Trial →</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
