"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DemoTab = "overview" | "guests" | "budget" | "vendors" | "checklist" | "hashtags";

const TABS: { id: DemoTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "guests", label: "Guests", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8m13 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { id: "budget", label: "Budget", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" },
  { id: "vendors", label: "Vendors", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { id: "checklist", label: "Checklist", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { id: "hashtags", label: "Hashtags", icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14" },
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
  { name: "Grand Palace Banquet", category: "Venue", status: "Confirmed", amount: "₹3,20,000", deadline: "Dec 15" },
  { name: "Spice Garden Caterers", category: "Catering", status: "Confirmed", amount: "₹1,80,000", deadline: "Dec 20" },
  { name: "LensMan Studios", category: "Photography", status: "Pending", amount: "₹75,000", deadline: "Dec 10" },
  { name: "Dhoom Beats", category: "DJ", status: "Confirmed", amount: "₹45,000", deadline: "Dec 18" },
  { name: "Royal Decor", category: "Decor", status: "Pending", amount: "₹65,000", deadline: "Dec 12" },
];

const CHECKLIST_ITEMS = [
  { task: "Book venue", done: true, phase: "9+ months" },
  { task: "Finalize guest list", done: true, phase: "6-9 months" },
  { task: "Send Save the Dates", done: true, phase: "6-9 months" },
  { task: "Book photographer", done: true, phase: "6-9 months" },
  { task: "Book caterer", done: true, phase: "3-6 months" },
  { task: "Shop for outfits", done: false, phase: "3-6 months" },
  { task: "Plan mehendi night", done: false, phase: "1-3 months" },
  { task: "Finalize seating chart", done: false, phase: "1-3 months" },
  { task: "Send invitations", done: false, phase: "1-3 months" },
  { task: "Confirm all vendors", done: false, phase: "Last month" },
  { task: "Final trials", done: false, phase: "Last month" },
  { task: "Pack emergency kit", done: false, phase: "Last week" },
];

const HASHTAGS = [
  "#PriyaKiShaadi", "#RahulWedsPriya", "#SharmaVerma2026", "#WeddingBells",
  "#SweeterThanJalebi", "#MehendiNight", "#ShaadiKaseason", "#DilSeShaadi",
  "#HaldiVibes", "#BaraatTime", "#PherasAndPrayers", "#VidaaiFeels",
];

export default function InteractiveDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DemoTab>("overview");
  const [hoveredGuest, setHoveredGuest] = useState<number | null>(null);

  const totalBudget = BUDGET_CATS.reduce((a, c) => a + c.allocated, 0);
  const totalSpent = BUDGET_CATS.reduce((a, c) => a + c.spent, 0);
  const guestsConfirmed = GUESTS.filter((g) => g.rsvp === "Yes").length;
  const guestsPending = GUESTS.filter((g) => g.rsvp === "Pending").length;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-bold border-2 border-white/30 rounded-xl text-white hover:bg-white/10 transition-all backdrop-blur-sm"
      >
        Try Interactive Demo
      </button>

      {/* Full-screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 md:p-6"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col"
            >
              {/* Demo Header */}
              <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 hidden md:inline">shaadisheet.com/dashboard/demo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] md:text-xs font-medium text-maroon bg-maroon/10 px-2 md:px-3 py-1 rounded-full">Demo Mode</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tab Bar */}
              <div className="flex border-b border-gray-100 bg-white px-2 md:px-4 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-maroon text-maroon"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d={tab.icon} />
                    </svg>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-3 md:p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      {/* Wedding Header */}
                      <div className="bg-gradient-to-r from-maroon to-red-800 rounded-xl p-4 md:p-6 text-white mb-4 md:mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="text-xs text-white/70 mb-1">Planning</p>
                            <h3 className="text-lg md:text-xl font-bold">Priya & Rahul&apos;s Wedding</h3>
                            <p className="text-xs text-white/80 mt-1">Dec 20, 2026 • North Indian Hindu • Nashik, India</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/70">Days Left</p>
                            <p className="text-2xl md:text-3xl font-bold text-[#FFD54F]">142</p>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                        {[
                          { label: "Guests", value: "248", sub: `${guestsConfirmed} confirmed`, color: "text-blue-600" },
                          { label: "Budget Used", value: `${Math.round((totalSpent / totalBudget) * 100)}%`, sub: `₹${(totalSpent / 100000).toFixed(1)}L of ₹${(totalBudget / 100000).toFixed(1)}L`, color: "text-emerald-600" },
                          { label: "Vendors", value: "5", sub: "3 confirmed", color: "text-purple-600" },
                          { label: "Tasks Done", value: "6/12", sub: "50% complete", color: "text-amber-600" },
                        ].map((stat, i) => (
                          <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 md:p-4">
                            <p className="text-[10px] md:text-xs text-gray-400 mb-1">{stat.label}</p>
                            <p className={`text-lg md:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 mt-1">{stat.sub}</p>
                          </div>
                        ))}
                      </div>

                      {/* Upcoming Events */}
                      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5">
                        <h4 className="font-bold text-gray-900 text-sm mb-3">Upcoming Events</h4>
                        <div className="space-y-2">
                          {[
                            { name: "Mehendi Night", date: "Dec 18, 2026", days: 2, icon: "🌿" },
                            { name: "Haldi Ceremony", date: "Dec 19, 2026", days: 3, icon: "🟡" },
                            { name: "Wedding Ceremony", date: "Dec 20, 2026", days: 4, icon: "💍" },
                            { name: "Reception", date: "Dec 21, 2026", days: 5, icon: "🎉" },
                          ].map((ev, i) => (
                            <div key={i} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{ev.icon}</span>
                                <div>
                                  <p className="font-semibold text-gray-900 text-xs md:text-sm">{ev.name}</p>
                                  <p className="text-[10px] md:text-xs text-gray-500">{ev.date}</p>
                                </div>
                              </div>
                              <span className="text-[10px] md:text-xs font-medium text-maroon bg-maroon/10 px-2 py-1 rounded-full">{ev.days} days left</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "guests" && (
                    <motion.div key="guests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">Guest List</h3>
                          <p className="text-xs text-gray-500 mt-0.5">248 total • {guestsConfirmed} confirmed • {guestsPending} pending</p>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-semibold text-white bg-maroon rounded-lg">+ Add Guest</button>
                      </div>
                      {/* RSVP Summary */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: "Confirmed", count: guestsConfirmed, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                          { label: "Pending", count: guestsPending, color: "bg-amber-50 text-amber-700 border-amber-200" },
                          { label: "Declined", count: 1, color: "bg-red-50 text-red-700 border-red-200" },
                        ].map((s, i) => (
                          <div key={i} className={`rounded-lg p-3 text-center border ${s.color}`}>
                            <p className="text-lg font-bold">{s.count}</p>
                            <p className="text-[10px] font-medium">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {/* Guest Table */}
                      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-gray-50 text-[10px] md:text-xs font-semibold text-gray-500 border-b border-gray-100">
                          <span>Name</span><span>Side</span><span>RSVP</span><span>Dietary</span><span>Table</span>
                        </div>
                        {GUESTS.map((g, i) => (
                          <div
                            key={i}
                            className={`grid grid-cols-5 gap-2 px-4 py-2.5 text-xs border-b border-gray-50 transition-colors ${hoveredGuest === i ? "bg-maroon/5" : ""}`}
                            onMouseEnter={() => setHoveredGuest(i)}
                            onMouseLeave={() => setHoveredGuest(null)}
                          >
                            <span className="font-medium text-gray-900">{g.name}</span>
                            <span className={`${g.side === "Bride" ? "text-pink-600" : "text-blue-600"}`}>{g.side}</span>
                            <span className={`font-medium ${g.rsvp === "Yes" ? "text-emerald-600" : g.rsvp === "No" ? "text-red-500" : "text-amber-600"}`}>{g.rsvp}</span>
                            <span className="text-gray-600">{g.dietary}</span>
                            <span className="text-gray-600">{g.table}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "budget" && (
                    <motion.div key="budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">Budget Overview</h3>
                          <p className="text-xs text-gray-500 mt-0.5">₹{(totalBudget / 100000).toFixed(1)}L total • ₹{(totalSpent / 100000).toFixed(1)}L spent</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                          ₹{((totalBudget - totalSpent) / 100000).toFixed(1)}L remaining
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                          style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                        />
                      </div>
                      {/* Category List */}
                      <div className="space-y-3">
                        {BUDGET_CATS.map((cat, i) => {
                          const pct = Math.round((cat.spent / cat.allocated) * 100);
                          return (
                            <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 md:p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{cat.icon}</span>
                                  <span className="font-semibold text-gray-900 text-xs md:text-sm">{cat.name}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-bold text-gray-900">₹{(cat.spent / 1000).toFixed(0)}K</span>
                                  <span className="text-[10px] text-gray-400"> / ₹{(cat.allocated / 1000).toFixed(0)}K</span>
                                </div>
                              </div>
                              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "vendors" && (
                    <motion.div key="vendors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">Vendor Directory</h3>
                          <p className="text-xs text-gray-500 mt-0.5">5 vendors tracked</p>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-semibold text-white bg-maroon rounded-lg">+ Add Vendor</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {VENDORS.map((v, i) => (
                          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">{v.name}</h4>
                                <p className="text-xs text-gray-500">{v.category}</p>
                              </div>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.status === "Confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                {v.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-900">{v.amount}</span>
                              <span className="text-[10px] text-gray-400">Due: {v.deadline}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "checklist" && (
                    <motion.div key="checklist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <div className="mb-4">
                        <h3 className="font-bold text-gray-900">Wedding Checklist</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{CHECKLIST_ITEMS.filter((c) => c.done).length} of {CHECKLIST_ITEMS.length} completed</p>
                      </div>
                      {/* Progress */}
                      <div className="bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-maroon to-red-600 transition-all"
                          style={{ width: `${(CHECKLIST_ITEMS.filter((c) => c.done).length / CHECKLIST_ITEMS.length) * 100}%` }}
                        />
                      </div>
                      {/* Group by Phase */}
                      {["9+ months", "6-9 months", "3-6 months", "1-3 months", "Last month", "Last week"].map((phase) => {
                        const items = CHECKLIST_ITEMS.filter((c) => c.phase === phase);
                        if (items.length === 0) return null;
                        return (
                          <div key={phase} className="mb-4">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{phase}</p>
                            <div className="space-y-1.5">
                              {items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-lg">
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${item.done ? "bg-maroon border-maroon" : "border-gray-300"}`}>
                                    {item.done && (
                                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className={`text-xs ${item.done ? "text-gray-400 line-through" : "text-gray-700"}`}>{item.task}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {activeTab === "hashtags" && (
                    <motion.div key="hashtags" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <div className="mb-4">
                        <h3 className="font-bold text-gray-900">Wedding Hashtags</h3>
                        <p className="text-xs text-gray-500 mt-0.5">AI-generated for Priya & Rahul</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {HASHTAGS.map((tag, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-gradient-to-br from-maroon/5 to-amber-50 border border-maroon/10 rounded-xl p-3 text-center hover:border-maroon/30 transition-colors cursor-pointer"
                          >
                            <span className="text-xs md:text-sm font-bold text-maroon">{tag}</span>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 text-center">
                          <svg className="w-4 h-4 inline-block mr-1 text-maroon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          AI generates 100+ unique hashtags based on names, events, and cultural context
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Demo Footer CTA */}
              <div className="border-t border-gray-100 bg-gray-50/80 px-4 md:px-6 py-3 flex items-center justify-between">
                <p className="text-[10px] md:text-xs text-gray-400">This is a preview — real data lives in your account</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 md:px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 md:px-4 py-2 text-xs font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-dark transition-colors"
                  >
                    Start Free Trial →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
