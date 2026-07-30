"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import CountUp from "@/components/animations/CountUp";
import { updateWedding } from "@/lib/actions";
import { formatCurrency, formatCurrencyAbbrev, getCurrencySymbol, getBudgetRange } from "@/lib/format";
import InviteModal from "@/components/InviteModal";
import WeddingWebsiteModal from "@/components/WeddingWebsiteModal";
import WeddingQuestionnaire from "@/components/WeddingQuestionnaire";
import ToastContainer, { Toast } from "@/components/Toast";
import CurrencyInput from "@/components/CurrencyInput";

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function OverviewView({ wedding, onUpdate, userRole = "owner", onToast }: { wedding: any; onUpdate?: () => void; userRole?: string; onToast?: (msg: string, type?: "success" | "error") => void }) {
  const { data: session } = useSession();
  const [editBudget, setEditBudget] = useState("");
  const [editGuests, setEditGuests] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);
  const [editingGuests, setEditingGuests] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [websiteOpen, setWebsiteOpen] = useState(false);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>(wedding.collaborators || []);
  const [editingCollab, setEditingCollab] = useState<string | null>(null);
  const [collabRole, setCollabRole] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  let toastId = 0;
  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const canEditBudget = userRole === "owner" || userRole === "co-owner";
  const canManageCollabs = userRole === "owner" || userRole === "co-owner";

  const BUDGET_MIN = 100000;
  const BUDGET_MAX = 100000000;
  const GUEST_MIN = 50;
  const GUEST_MAX = 5000;

  const handleSaveBudget = async () => {
    const val = parseInt(editBudget) || 0;
    if (val < BUDGET_MIN || val > BUDGET_MAX) {
      addToast(`Budget must be between ${getCurrencySymbol(wedding.currency)}10 Lakh and ${getCurrencySymbol(wedding.currency)}10 Crore`, "error");
      return;
    }
    setSaving(true);
    try {
      await updateWedding({ weddingId: wedding.id, budget: val });
      setEditingBudget(false);
      addToast("Budget updated successfully", "success");
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      addToast("Failed to update budget", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGuests = async () => {
    const val = parseInt(editGuests) || 0;
    if (val < GUEST_MIN || val > GUEST_MAX) {
      addToast(`Guest count must be between ${GUEST_MIN.toLocaleString("en-IN")} and ${GUEST_MAX.toLocaleString("en-IN")}`, "error");
      return;
    }
    setSaving(true);
    try {
      await updateWedding({ weddingId: wedding.id, guestCount: val });
      setEditingGuests(false);
      addToast("Guest count updated successfully", "success");
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      addToast("Failed to update guest count", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDate = async () => {
    if (!editDate) {
      addToast("Please select a date", "error");
      return;
    }
    setSaving(true);
    try {
      await updateWedding({ weddingId: wedding.id, weddingDate: new Date(editDate) });
      setEditingDate(false);
      addToast("Wedding date updated successfully", "success");
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      addToast("Failed to update wedding date", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeCollabRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/collaborators/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        onToast?.(data.error || "Failed to update role", "error");
        return;
      }
      setCollaborators((prev) => prev.map((c) => c.user.id === userId ? { ...c, role: newRole } : c));
      setEditingCollab(null);
      onToast?.("Role updated", "success");
    } catch {}
  };

  const handleRemoveCollab = async (userId: string) => {
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/collaborators/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        onToast?.(data.error || "Failed to remove collaborator", "error");
        return;
      }
      setCollaborators((prev) => prev.filter((c) => c.user.id !== userId));
      onToast?.("Collaborator removed", "success");
    } catch {}
  };

  const totalBudget = wedding.budget || 0;
  const totalSpent = wedding.budgetItems?.reduce((s: number, i: any) => s + (i.paid || 0), 0) || 0;
  const totalGuests = wedding.guests?.length || 0;
  const rsvpYes = wedding.guests?.filter((g: any) => g.rsvp === "Yes").length || 0;
  const vendorsBooked = wedding.vendors?.filter((v: any) => v.contract === "Signed").length || 0;
  const totalVendors = wedding.vendors?.length || 0;
  const tasksDone = wedding.tasks?.filter((t: any) => t.done).length || 0;
  const totalTasks = wedding.tasks?.length || 0;
  const totalRooms = wedding.roomAllocations?.length || 0;
  const roomsOccupied = wedding.roomAllocations?.filter((r: any) => r.status === "Checked In").length || 0;
  const needsRoom = wedding.guests?.filter((g: any) => g.accommodation === "Room Needed").length || 0;
  const floating = wedding.guests?.filter((g: any) => g.accommodation === "Local / Floating").length || 0;
  const totalGifts = wedding.gifts?.length || 0;
  const totalGiftAmount = wedding.gifts?.reduce((s: number, g: any) => s + (g.amount || 0), 0) || 0;
  const pendingThankYous = wedding.gifts?.filter((g: any) => g.thankYou === "Pending").length || 0;

  const countdown = wedding.weddingDate
    ? Math.ceil((new Date(wedding.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dbEvents = wedding.events || [];
  const upcomingEvents = dbEvents
    .filter((e: any) => {
      if (!e.date) return false;
      const d = new Date(e.date + "T00:00:00");
      return d >= today;
    })
    .sort((a: any, b: any) => {
      if (a.date === b.date) return a.startTime.localeCompare(b.startTime);
      return a.date.localeCompare(b.date);
    })
    .slice(0, 5);

  const hasData = totalBudget > 0 || totalGuests > 0 || totalVendors > 0 || totalTasks > 0 || totalRooms > 0;

  // Calculate overall progress
  const progressItems = [
    { done: wedding.weddingDate ? 1 : 0, total: 1 },
    { done: totalBudget > 0 ? 1 : 0, total: 1 },
    { done: Math.min(totalGuests, 50), total: 50 },
    { done: vendorsBooked, total: Math.max(totalVendors, 1) },
    { done: tasksDone, total: Math.max(totalTasks, 1) },
  ];
  const progressPct = Math.round(
    progressItems.reduce((s, p) => s + (p.done / p.total) * 100, 0) / progressItems.length
  );

  const dynamicTips = [];
  if (!wedding.weddingDate) {
    dynamicTips.push({ icon: "fa-calendar-check", color: "#D1FAE5", text: "Set your wedding date to unlock countdown and reminders." });
  }
  if (totalBudget > 0 && totalSpent === 0) {
    dynamicTips.push({ icon: "fa-lightbulb", color: "#FEF3C7", text: "Review your budget allocations to ensure nothing is missed." });
  }
  if (totalGuests > 0 && rsvpYes === 0) {
    dynamicTips.push({ icon: "fa-envelope", color: "#DBEAFE", text: "Start collecting RSVPs from your guest list." });
  }
  if (totalVendors > 0 && vendorsBooked < totalVendors) {
    dynamicTips.push({ icon: "fa-handshake", color: "#FDE68A", text: `${totalVendors - vendorsBooked} vendor${totalVendors - vendorsBooked > 1 ? "s" : ""} pending contract signing.` });
  }
  if (totalTasks > 0 && tasksDone < totalTasks) {
    dynamicTips.push({ icon: "fa-list-check", color: "#E9D5FF", text: `${totalTasks - tasksDone} task${totalTasks - tasksDone > 1 ? "s" : ""} remaining - stay on track!` });
  }
  if (totalRooms > 0 && roomsOccupied === 0) {
    dynamicTips.push({ icon: "fa-bed", color: "#FEE2E2", text: "No guests have checked in yet. Update room statuses as the day approaches." });
  }
  if (dynamicTips.length === 0) {
    dynamicTips.push({ icon: "fa-check-circle", color: "#D1FAE5", text: "Everything looks great! Your wedding is well organized." });
  }

  // ── Phase Tracker ──
  const PHASES = [
    { name: "Dream Phase", emoji: "\u{1F48C}", description: "Set your vision, budget, and guest count", threshold: 365 },
    { name: "Booking Phase", emoji: "\u{1F4E6}", description: "Lock in your key vendors", threshold: 270 },
    { name: "Detail Phase", emoji: "\u{1F380}", description: "Finalize outfits, invites, and menus", threshold: 180 },
    { name: "Coordination Phase", emoji: "\u{1F4CB}", description: "Seating, rooms, and timeline", threshold: 90 },
    { name: "Final Countdown", emoji: "\u{23F0}", description: "Confirm everything and delegate", threshold: 30 },
    { name: "Wedding Week", emoji: "\u{1F492}", description: "Execute, enjoy, and celebrate!", threshold: 0 },
  ];
  let currentPhase = PHASES[0];
  if (countdown !== null) {
    for (const phase of PHASES) {
      if (countdown <= phase.threshold) currentPhase = phase;
    }
  }
  const phaseIndex = PHASES.indexOf(currentPhase);
  const phaseProgress = Math.round(((phaseIndex + 1) / PHASES.length) * 100);

  // ── Smart Recommendations (Next 3 Steps) ──
  type Rec = { id: string; icon: string; text: string; urgency: "critical" | "high" | "medium"; color: string; score: number };
  const recommendations: Rec[] = [];
  const overdueTasksList = wedding.tasks?.filter((t: any) => !t.done && t.dueDate && new Date(t.dueDate) < today) || [];
  for (const t of overdueTasksList.slice(0, 2)) {
    recommendations.push({ id: `to-${t.id}`, icon: "fa-exclamation-circle", text: `"${t.text}" is overdue`, urgency: "critical", color: "text-red-600 bg-red-50 border-red-200", score: 10 });
  }
  const unsignedVendors = wedding.vendors?.filter((v: any) => v.contract === "Pending") || [];
  for (const v of unsignedVendors.slice(0, 2)) {
    const daysToVendorDeadline = v.deadline ? Math.ceil((new Date(v.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isOverdue = daysToVendorDeadline !== null && daysToVendorDeadline < 0;
    const isUrgent = daysToVendorDeadline !== null && daysToVendorDeadline <= 30;
    recommendations.push({
      id: `v-${v.id}`,
      icon: "fa-store",
      text: isOverdue ? `${v.category || "Vendor"} contract overdue` : isUrgent ? `Book ${v.category || "Vendor"} \u2014 ${daysToVendorDeadline} days left` : `${v.category || "Vendor"} needs contract`,
      urgency: isOverdue ? "critical" : isUrgent ? "high" : "medium",
      color: isOverdue ? "text-red-600 bg-red-50 border-red-200" : isUrgent ? "text-orange-600 bg-orange-50 border-orange-200" : "text-amber-600 bg-amber-50 border-amber-200",
      score: isOverdue ? 9 : isUrgent ? 7 : 4,
    });
  }
  if (countdown !== null && countdown <= 60) {
    const pendingRsvps = wedding.guests?.filter((g: any) => g.rsvp === "Pending").length || 0;
    if (pendingRsvps > 0) {
      recommendations.push({ id: "rsvp", icon: "fa-envelope", text: `${pendingRsvps} guest${pendingRsvps > 1 ? "s" : ""} haven\u2019t responded`, urgency: "high", color: "text-blue-600 bg-blue-50 border-blue-200", score: 8 });
    }
  }
  const overdueCount = overdueTasksList.length;
  if (overdueCount === 0 && unsignedVendors.length === 0 && recommendations.length === 0) {
    recommendations.push({ id: "all-good", icon: "fa-check-circle", text: "Everything looks on track! Keep it up.", urgency: "medium", color: "text-green bg-green/10 border-green/20", score: 0 });
  }
  recommendations.sort((a, b) => b.score - a.score);
  const topRecs = recommendations.slice(0, 3);

  // ── This Month's Focus ──
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  const tasksThisMonth = (wedding.tasks || []).filter((t: any) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const overdueMonth = tasksThisMonth.filter((t: any) => !t.done && new Date(t.dueDate) < today);
  const upcomingMonth = tasksThisMonth.filter((t: any) => !t.done && new Date(t.dueDate) >= today);

  // ── Wedding Week at a Glance ──
  const weddingWeekEvents = (wedding.events || [])
    .filter((e: any) => {
      if (!e.date || !wedding.weddingDate) return false;
      const eventDate = new Date(e.date + "T00:00:00");
      const diff = Math.abs(Math.ceil((eventDate.getTime() - new Date(wedding.weddingDate).getTime()) / (1000 * 60 * 60 * 24)));
      return diff <= 3;
    })
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div data-tutorial="overview">
      <div className="bg-gradient-to-br from-[#722F37] to-[#5C2530] rounded-2xl p-5 sm:p-6 md:p-8 mb-8 md:mb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back, {session?.user?.name?.split(" ")[0] || "there"}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Wedding Dashboard</h2>
            <p className="text-white/50 text-sm mt-1">
              {countdown !== null ? (countdown > 0 ? `${countdown} days until your wedding` : countdown === 0 ? "Your wedding day!" : `${Math.abs(countdown)} days since your wedding`) : "Set your wedding date to see countdown"}
            </p>
          </div>
          {hasData && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setQuestionnaireOpen(true)}
                data-tutorial="website"
                className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer shrink-0 min-h-[44px]"
              >
                <i className="fas fa-globe text-white/70" />
                <span className="hidden sm:inline">Website</span>
              </button>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 shrink-0">
                <div className="text-2xl">{currentPhase.emoji}</div>
                <div>
                  <p className="text-xs text-white/50 font-medium">Current Phase</p>
                  <p className="text-sm font-bold text-white">{currentPhase.name}</p>
                  <p className="text-[0.65rem] text-white/40">{currentPhase.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stat Cards */}
        {!hasData ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-rocket text-maroon text-xl" />
            </div>
            <h3 className="font-bold text-lg mb-2">Welcome to ShaadiSheet!</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Your wedding dashboard is ready. Start by adding budget items, vendors, or guests from the sidebar.</p>
            <div className="flex gap-3 justify-center">
              <span className="px-4 py-2 bg-maroon/5 rounded-lg text-sm text-maroon font-medium">Budget {'\u2192'}</span>
              <span className="px-4 py-2 bg-maroon/5 rounded-lg text-sm text-maroon font-medium">Vendors {'\u2192'}</span>
              <span className="px-4 py-2 bg-maroon/5 rounded-lg text-sm text-maroon font-medium">Guests {'\u2192'}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[
                { label: "Total Budget", numVal: totalBudget, prefix: totalBudget > 0 ? getCurrencySymbol(wedding.currency) : "", suffix: "", formatFn: totalBudget > 0 ? (v: number) => formatCurrencyAbbrev(v, wedding.currency) : undefined, sub: totalSpent > 0 ? `${getCurrencySymbol(wedding.currency)}${formatCurrency(totalSpent, wedding.currency)} spent (${Math.round(totalSpent / totalBudget * 100)}%)` : "No spending yet", icon: "fa-rupee-sign", gradient: "from-maroon to-maroon-light" },
                { label: "Guests", numVal: totalGuests, prefix: "", suffix: "", formatFn: undefined, sub: rsvpYes > 0 ? `${rsvpYes} RSVP'd (${Math.round(rsvpYes / totalGuests * 100)}%)` : floating > 0 ? `${floating} local/floating` : "No RSVPs yet", icon: "fa-users", gradient: "from-green to-green/80" },
                { label: "Vendors", numVal: vendorsBooked, prefix: "", suffix: totalVendors > 0 ? ` / ${totalVendors}` : "", formatFn: undefined, sub: totalVendors > 0 ? `${totalVendors - vendorsBooked} remaining` : "No vendors added", icon: "fa-store", gradient: "from-blue to-blue/80" },
                { label: "Tasks", numVal: tasksDone, prefix: "", suffix: totalTasks > 0 ? ` / ${totalTasks}` : "", formatFn: undefined, sub: totalTasks > 0 ? `${totalTasks - tasksDone} remaining` : "No tasks yet", icon: "fa-tasks", gradient: "from-orange-600 to-red-700" },
                { label: "Rooms", numVal: totalRooms, prefix: "", suffix: "", formatFn: undefined, sub: roomsOccupied > 0 ? `${roomsOccupied} checked in` : needsRoom > 0 ? `${needsRoom} guests need rooms` : totalRooms > 0 ? "None checked in" : "No rooms allocated", icon: "fa-bed", gradient: "from-purple-600 to-purple-800" },
                { label: "Gifts", numVal: totalGiftAmount, prefix: totalGiftAmount > 0 ? getCurrencySymbol(wedding.currency) : "", suffix: "", formatFn: totalGiftAmount > 0 ? (v: number) => formatCurrencyAbbrev(v, wedding.currency) : undefined, sub: totalGifts > 0 ? `${totalGifts} gifts${pendingThankYous > 0 ? ` \u2022 ${pendingThankYous} pending thank-yous` : ""}` : "No gifts tracked", icon: "fa-gift", gradient: "from-pink-500 to-rose-600" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-all duration-300 hover:border-gray-300 group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    <i className={`fas ${s.icon} text-lg`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[0.7rem] text-gray-400 font-semibold uppercase tracking-wider">{s.label}</span>
                    <div className="text-2xl font-extrabold text-gray-900 mt-0.5">
                      {s.numVal === 0 && s.label !== "Total Budget" ? "\u2014" : (
                        <CountUp target={s.numVal} prefix={s.prefix} suffix={s.suffix} formatValue={s.formatFn} duration={1.5} />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 block mt-1 leading-relaxed">{s.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Phase Progress Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-8 md:mb-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm">
                  {currentPhase.emoji} {currentPhase.name}
                </h3>
                <span className="text-xs text-gray-500">{phaseProgress}% complete</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-maroon to-gold rounded-full transition-all duration-1000" style={{ width: `${phaseProgress}%` }} />
              </div>
              <div className="flex justify-between">
                {PHASES.map((phase, i) => (
                  <div key={i} className="flex flex-col items-center" style={{ flex: 1 }}>
                    <div className={`w-3 h-3 rounded-full mb-1 ${i <= phaseIndex ? "bg-maroon" : "bg-gray-300"} ${i === phaseIndex ? "ring-2 ring-maroon/30" : ""}`} />
                    <span className={`text-[0.6rem] text-center leading-tight hidden md:block ${i <= phaseIndex ? "text-maroon font-semibold" : "text-gray-400"}`}>
                      {phase.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          {/* Wedding Settings */}            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-8 md:mb-10">
              <h3 className="font-bold text-gray-900 mb-4">
                <i className="fas fa-cog text-gray-400 mr-2" />
                Wedding Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Budget */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Total Budget</p>
                  {editingBudget ? (
                    <>
                      <CurrencyInput
                        value={parseInt(editBudget) || 0}
                        onChange={(val) => setEditBudget(String(val))}
                        placeholder={String(wedding.budget || "")}
                        currency={wedding.currency}
                      />
                      <p className="text-[0.65rem] text-gray-400 mt-1">Min: {formatCurrency(getBudgetRange(wedding.currency).min, wedding.currency)}, Max: {formatCurrency(getBudgetRange(wedding.currency).max, wedding.currency)}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={handleSaveBudget} disabled={saving} className="px-3 py-1.5 bg-maroon text-white text-xs font-semibold rounded-lg hover:bg-maroon-dark disabled:opacity-50 cursor-pointer">
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => setEditingBudget(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-extrabold text-gray-900 truncate">
                        {totalBudget > 0 ? formatCurrency(totalBudget, wedding.currency) : "Not set"}
                      </p>
                      {canEditBudget && (
                        <button onClick={() => { setEditBudget(String(wedding.budget || "")); setEditingBudget(true); }} className="px-2.5 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 cursor-pointer shrink-0">
                          <i className="fas fa-pen" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Guest Count */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Expected Guests</p>
                  {editingGuests ? (
                    <>
                      <input
                        type="number"
                        value={editGuests}
                        onChange={(e) => setEditGuests(e.target.value)}
                        placeholder={String(wedding.guestCount || "")}
                        className="w-full px-3 py-1.5 border-2 border-gray-200 focus:border-maroon rounded-lg text-sm font-bold focus:outline-none transition-colors"
                        min={GUEST_MIN}
                        max={GUEST_MAX}
                      />
                      <p className="text-[0.65rem] text-gray-400 mt-1">Min: 50, Max: 5,000</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={handleSaveGuests} disabled={saving} className="px-3 py-1.5 bg-maroon text-white text-xs font-semibold rounded-lg hover:bg-maroon-dark disabled:opacity-50 cursor-pointer">
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => setEditingGuests(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-extrabold text-gray-900 truncate">
                        {(wedding.guestCount || 0) > 0 ? (wedding.guestCount || 0).toLocaleString("en-IN") : "Not set"}
                      </p>
                      {canEditBudget && (
                        <button onClick={() => { setEditGuests(String(wedding.guestCount || "")); setEditingGuests(true); }} className="px-2.5 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 cursor-pointer shrink-0">
                          <i className="fas fa-pen" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Wedding Date */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Wedding Date</p>
                  {editingDate ? (
                    <>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-1.5 border-2 border-gray-200 focus:border-maroon rounded-lg text-sm font-bold focus:outline-none transition-colors"
                      />
                      <div className="flex gap-2 mt-3">
                        <button onClick={handleSaveDate} disabled={saving} className="px-3 py-1.5 bg-maroon text-white text-xs font-semibold rounded-lg hover:bg-maroon-dark disabled:opacity-50 cursor-pointer">
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => setEditingDate(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-extrabold text-gray-900 truncate">
                        {wedding.weddingDate
                          ? new Date(wedding.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "Not set"}
                      </p>
                      {canEditBudget && (
                        <button onClick={() => { setEditDate(wedding.weddingDate ? new Date(wedding.weddingDate).toISOString().split("T")[0] : ""); setEditingDate(true); }} className="px-2.5 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 cursor-pointer shrink-0">
                          <i className="fas fa-pen" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          {/* Collaborators Section */}
          {canManageCollabs && (            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-8 md:mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
                  <h3 className="font-bold text-gray-900">
                    <i className="fas fa-users text-gray-400 mr-2" />
                    Collaborators
                  </h3>
                  <button onClick={() => setInviteOpen(true)}
                    className="px-3 py-2 bg-maroon text-white text-xs font-semibold rounded-lg hover:bg-maroon-dark cursor-pointer shrink-0">
                    <i className="fas fa-plus mr-1" /> Invite
                  </button>
                </div>
                {collaborators.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No collaborators yet. Invite someone to help plan!</p>
                ) : (
                  <div className="space-y-2">
                    {collaborators.map((c: any) => (
                      <div key={c.user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-3 sm:gap-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-maroon/10 flex items-center justify-center text-maroon font-bold text-sm shrink-0">
                            {c.user.name?.[0] || c.user.email?.[0] || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{c.user.name || c.user.email}</p>
                            <p className="text-xs text-gray-400 truncate">{c.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          {editingCollab === c.user.id ? (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1">
                                {[
                                  { value: "viewer", label: "Viewer", desc: "Can view all data but cannot edit", icon: "fa-eye" },
                                  { value: "editor", label: "Editor", desc: "Can edit guests, vendors, budget, and tasks", icon: "fa-pen" },
                                  { value: "co-owner", label: "Co-Owner", desc: "Full access including managing collaborators", icon: "fa-crown" },
                                ].map((r) => (
                                  <button
                                    key={r.value}
                                    onClick={() => setCollabRole(r.value)}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left cursor-pointer transition-all ${
                                      collabRole === r.value
                                        ? "bg-maroon text-white shadow-sm"
                                        : "bg-white border border-gray-200 text-gray-700 hover:border-maroon/40 hover:bg-maroon/5"
                                    }`}
                                  >
                                    <i className={`fas ${r.icon} text-[0.65rem] ${collabRole === r.value ? "text-white/80" : "text-gray-400"} w-3 text-center`} />
                                    <div className="min-w-0">
                                      <div className={`text-xs font-semibold ${collabRole === r.value ? "text-white" : ""}`}>{r.label}</div>
                                      <div className={`text-[0.6rem] leading-tight ${collabRole === r.value ? "text-white/70" : "text-gray-400"}`}>{r.desc}</div>
                                    </div>
                                    {collabRole === r.value && <i className="fas fa-check text-[0.6rem] text-white/80 ml-auto shrink-0" />}
                                  </button>
                                ))}
                              </div>
                              <div className="flex flex-col gap-1 ml-1">
                                <button onClick={() => handleChangeCollabRole(c.user.id, collabRole)}
                                  className="px-3 py-2 bg-maroon text-white text-xs rounded-lg cursor-pointer font-semibold hover:bg-maroon-dark">Save</button>
                                <button onClick={() => { setEditingCollab(null); setCollabRole(c.role); }}
                                  className="px-3 py-2 bg-gray-100 text-gray-500 text-xs rounded-lg cursor-pointer hover:bg-gray-200">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="text-xs px-2 py-1 bg-maroon/10 text-maroon rounded-full font-semibold">{c.role}</span>
                              <button onClick={() => { setEditingCollab(c.user.id); setCollabRole(c.role); }}
                                className="text-xs text-gray-400 hover:text-maroon cursor-pointer px-2 py-2">
                                <i className="fas fa-pen" />
                              </button>
                              <button onClick={() => handleRemoveCollab(c.user.id)}
                                className="text-xs text-gray-400 hover:text-red-500 cursor-pointer px-2 py-2">
                                <i className="fas fa-times" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>          )}

          <InviteModal weddingId={wedding.id} weddingName={wedding.name || "My Wedding"} open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <WeddingWebsiteModal
        open={websiteOpen}
        onClose={() => setWebsiteOpen(false)}
        weddingId={wedding.id}
        weddingName={wedding.name || "My Wedding"}
        websiteData={{
          websiteSlug: wedding.websiteSlug,
          websitePhoto: wedding.websitePhoto,
          websiteTagline: wedding.websiteTagline,
          name: wedding.name,
          weddingDate: wedding.weddingDate,
          weddingCity: wedding.weddingCity,
        }}
        onUpdate={onUpdate}
      />

      <WeddingQuestionnaire
        open={questionnaireOpen}
        onClose={() => setQuestionnaireOpen(false)}
        wedding={wedding}
        websiteData={{
          websiteSlug: wedding.websiteSlug,
          config: wedding.websiteConfig ? JSON.parse(wedding.websiteConfig) : {},
          name: wedding.name,
          weddingDate: wedding.weddingDate,
          weddingCity: wedding.weddingCity,
        }}
        onUpdate={onUpdate}
      />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 md:mb-10">              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-0">
                  <h3 className="font-bold">Upcoming Events</h3>
                </div>
                <div className="p-6">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-gray-400 text-center py-5">No upcoming events</p>
                  ) : upcomingEvents.map((event: any) => {
                    const d = new Date(event.date + "T00:00:00");
                    const day = d.getDate();
                    const month = d.toLocaleString("en-US", { month: "short" });
                    const isWedding = event.name?.includes("Wedding") || event.name?.includes("Nikah") || event.name?.includes("Anand Karaj");
                    const daysUntil = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={event.id} className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
                        <div className={`w-[52px] h-[52px] rounded-lg flex flex-col items-center justify-center shrink-0 ${isWedding ? "bg-gradient-to-br from-maroon to-maroon-light text-white" : "bg-gray-100"}`}>
                          <span className="text-lg font-extrabold leading-none">{day}</span>
                          <span className="text-[0.7rem] uppercase font-semibold opacity-80">{month}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <strong className="text-sm">{event.name}</strong>
                          <span className="block text-xs text-gray-500">
                            {event.location || wedding.weddingCity || "Venue TBD"} {'\u2022'} {formatTime(event.startTime)}
                          </span>
                        </div>
                        <span className={`status-badge text-xs shrink-0 ${daysUntil <= 7 ? "planning" : "pending"}`}>
                          {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : daysUntil <= 7 ? "This Week" : "Upcoming"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 pt-5 pb-0">
                  <h3 className="font-bold">Your Next 3 Steps</h3>
                </div>
                <div className="p-6">
                  {topRecs.map((rec) => (
                    <div key={rec.id} className={`flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${rec.color}`}>
                        <i className={`fas ${rec.icon} text-sm`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{rec.text}</p>
                      </div>
                      {rec.urgency === "critical" && (
                        <span className="text-[0.65rem] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">Urgent</span>
                      )}
                      {rec.urgency === "high" && (
                        <span className="text-[0.65rem] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shrink-0">Soon</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>          </div>

          {/* This Month's Focus */}
          {tasksThisMonth.length > 0 && (              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                <div className="flex items-center justify-between px-6 pt-5 pb-0">
                  <h3 className="font-bold">
                    <i className="fas fa-calendar-day text-gray-400 mr-2" />
                    This Month
                  </h3>
                  <span className="text-xs text-gray-500">{tasksThisMonth.length} task{tasksThisMonth.length !== 1 ? "s" : ""} due</span>
                </div>
                <div className="p-6">
                  {overdueMonth.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">{overdueMonth.length} Overdue</p>
                      {overdueMonth.slice(0, 3).map((t: any) => (
                        <div key={t.id} className="flex items-center gap-3 py-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <span className="text-sm truncate">{t.text}</span>
                          <span className="text-xs text-red-500 shrink-0">Overdue</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    {upcomingMonth.length > 0 && <p className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-wide">{upcomingMonth.length} Upcoming</p>}
                    {upcomingMonth.slice(0, 4).map((t: any) => {
                      const d = new Date(t.dueDate);
                      const daysLeft = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={t.id} className="flex items-center gap-3 py-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${daysLeft <= 3 ? "bg-orange-500" : "bg-green"}`} />
                          <span className="text-sm truncate">{t.text}</span>
                          <span className="text-xs text-gray-400 shrink-0">{daysLeft}d</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>          )}

          {/* Wedding Week at a Glance */}
          {weddingWeekEvents.length > 0 && (              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 pt-5 pb-0">
                  <h3 className="font-bold">
                    <i className="fas fa-rings-wedding text-gray-400 mr-2" />
                    Wedding Week
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {weddingWeekEvents.map((event: any) => {
                      const d = new Date(event.date + "T00:00:00");
                      const day = d.getDate();
                      const month = d.toLocaleString("en-US", { month: "short" });
                      const weekday = d.toLocaleString("en-US", { weekday: "short" });
                      const isWedding = event.name?.includes("Wedding") || event.name?.includes("Nikah") || event.name?.includes("Anand Karaj");
                      const daysUntil = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={event.id} className={`flex items-center gap-4 p-3 rounded-lg ${isWedding ? "bg-maroon/5 border border-maroon/10" : "bg-gray-50"}`}>
                          <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 ${isWedding ? "bg-gradient-to-br from-maroon to-maroon-light text-white" : "bg-white"}`}>
                            <span className="text-[0.6rem] font-semibold uppercase opacity-70">{weekday}</span>
                            <span className="text-lg font-extrabold leading-none">{day}</span>
                            <span className="text-[0.6rem] font-semibold uppercase opacity-70">{month}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <strong className="text-sm">{event.name}</strong>
                            <span className="block text-xs text-gray-500">
                              {event.startTime ? formatTime(event.startTime) : "Time TBD"} {'\u2022'} {event.location || "Venue TBD"}
                            </span>
                          </div>
                          <span className={`status-badge text-xs shrink-0 ${daysUntil <= 1 ? "planning" : daysUntil <= 3 ? "pending" : ""}`}>
                            {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>          )}

          {wedding.budgetItems && wedding.budgetItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="flex items-center justify-between px-6 pt-5 pb-0">
                <h3 className="font-bold">Budget Overview</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(() => {
                    const categoryMap = new Map<string, number>();
                    for (const item of wedding.budgetItems) {
                      const cat = item.category || "Uncategorized";
                      categoryMap.set(cat, (categoryMap.get(cat) || 0) + (item.paid || 0));
                    }
                    const categoryBudgetMap = new Map<string, number>();
                    for (const item of wedding.budgetItems) {
                      const cat = item.category || "Uncategorized";
                      categoryBudgetMap.set(cat, (categoryBudgetMap.get(cat) || 0) + (item.estimated || 0));
                    }
                    const colors = [
                      "from-maroon to-maroon-light",
                      "from-gold to-gold-dark",
                      "from-green to-green/80",
                      "from-blue to-blue/80",
                      "from-purple-600 to-purple-800",
                      "from-orange-600 to-red-700",
                    ];
                    return Array.from(categoryMap.entries()).map(([cat, spent], i) => {
                      const budget = categoryBudgetMap.get(cat) || 0;
                      const pct = budget > 0 ? Math.min(Math.round(spent / budget * 100), 100) : 0;
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1.5 gap-2">
                            <span className="font-medium truncate min-w-0">{cat}</span>
                            <span className="text-gray-500 whitespace-nowrap shrink-0">{formatCurrency(spent, wedding.currency)} / {formatCurrency(budget, wedding.currency)}</span>
                          </div>
                          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
