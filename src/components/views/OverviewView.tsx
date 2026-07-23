"use client";

import { useState, useCallback } from "react";
import CountUp from "@/components/animations/CountUp";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { updateWedding } from "@/lib/actions";
import InviteModal from "@/components/InviteModal";
import ToastContainer, { Toast } from "@/components/Toast";

function formatINR(n: number): string {
  if (n === 0) return "0";
  if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  return n.toLocaleString("en-IN");
}

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatBudgetShort(n: number): string {
  if (n === 0) return "0";
  if (n >= 10000000) return (n / 10000000).toFixed(2).replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1") + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  return n.toLocaleString("en-IN");
}

export default function OverviewView({ wedding, onUpdate, userRole = "owner", onToast }: { wedding: any; onUpdate?: () => void; userRole?: string; onToast?: (msg: string, type?: "success" | "error") => void }) {
  const [editBudget, setEditBudget] = useState("");
  const [editGuests, setEditGuests] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);
  const [editingGuests, setEditingGuests] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
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
      addToast("Budget must be between \u20B910 Lakh and \u20B910 Crore", "error");
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

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Wedding Dashboard</h2>
          <p className="text-gray-500 text-sm">
            {countdown !== null ? (countdown > 0 ? `${countdown} days until your wedding` : countdown === 0 ? "Your wedding day!" : `${Math.abs(countdown)} days since your wedding`) : "Set your wedding date to see countdown"}
          </p>
        </div>
      </div>

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
        <>
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-7">
              {[
                { label: "Total Budget", numVal: totalBudget, prefix: totalBudget > 0 ? "\u20B9" : "", suffix: "", formatFn: totalBudget > 0 ? formatBudgetShort : undefined, sub: totalSpent > 0 ? `\u20B9${formatINR(totalSpent)} spent (${Math.round(totalSpent / totalBudget * 100)}%)` : "No spending yet", icon: "fa-rupee-sign", gradient: "from-maroon to-maroon-light" },
                { label: "Guests", numVal: totalGuests, prefix: "", suffix: "", formatFn: undefined, sub: rsvpYes > 0 ? `${rsvpYes} RSVP'd (${Math.round(rsvpYes / totalGuests * 100)}%)` : "No RSVPs yet", icon: "fa-users", gradient: "from-green to-green/80" },
                { label: "Vendors", numVal: vendorsBooked, prefix: "", suffix: totalVendors > 0 ? ` / ${totalVendors}` : "", formatFn: undefined, sub: totalVendors > 0 ? `${totalVendors - vendorsBooked} remaining` : "No vendors added", icon: "fa-store", gradient: "from-blue to-blue/80" },
                { label: "Tasks", numVal: tasksDone, prefix: "", suffix: totalTasks > 0 ? ` / ${totalTasks}` : "", formatFn: undefined, sub: totalTasks > 0 ? `${totalTasks - tasksDone} remaining` : "No tasks yet", icon: "fa-tasks", gradient: "from-orange-600 to-red-700" },
                { label: "Rooms", numVal: totalRooms, prefix: "", suffix: "", formatFn: undefined, sub: roomsOccupied > 0 ? `${roomsOccupied} checked in` : totalRooms > 0 ? "None checked in" : "No rooms allocated", icon: "fa-bed", gradient: "from-purple-600 to-purple-800" },
              ].map((s, i) => (
                <div key={i} className={`bg-white rounded-xl p-4 md:p-5 border border-gray-200 flex items-center gap-3 md:gap-4 hover:shadow-md transition-shadow ${i === 4 ? "col-span-2 lg:col-span-1" : ""}`}>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shrink-0`}>
                    <i className={`fas ${s.icon}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                    <div className="text-xl font-extrabold">
                      {s.numVal === 0 && s.label !== "Total Budget" ? "\u2014" : (
                        <CountUp target={s.numVal} prefix={s.prefix} suffix={s.suffix} formatValue={s.formatFn} duration={1.5} />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 block">{s.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Wedding Settings */}
          <ScrollReveal>
            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-6 md:mb-8">
              <h3 className="font-bold text-gray-900 mb-4">
                <i className="fas fa-cog text-gray-400 mr-2" />
                Wedding Settings
                <span className="text-xs text-gray-400 font-normal ml-2">- Refresh page after saving to see updated stats</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Budget */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Total Budget</p>
                    {editingBudget ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-semibold">{"\u20B9"}</span>
                          <input
                            type="number"
                            value={editBudget}
                            onChange={(e) => setEditBudget(e.target.value)}
                            placeholder={String(wedding.budget || "")}
                            className="w-full sm:w-[200px] px-3 py-1.5 border-2 border-gray-200 focus:border-maroon rounded-lg text-sm font-bold focus:outline-none transition-colors"
                            min={BUDGET_MIN}
                            max={BUDGET_MAX}
                          />
                        </div>
                        <p className="text-[0.65rem] text-gray-400 mt-1 ml-7">Min: \u20B910 Lakh, Max: \u20B910 Crore</p>
                      </div>
                    ) : (
                      <p className="text-lg font-extrabold text-gray-900 overflow-hidden text-ellipsis">
                        {"\u20B9"}{totalBudget > 0 ? formatINR(totalBudget) : "Not set"}
                      </p>
                    )}
                  </div>
                  {editingBudget ? (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={handleSaveBudget} disabled={saving} className="px-3 py-2 bg-maroon text-white text-xs font-semibold rounded-lg hover:bg-maroon-dark disabled:opacity-50 cursor-pointer">
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditingBudget(false)} className="px-3 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    canEditBudget && (
                      <button onClick={() => { setEditBudget(String(wedding.budget || "")); setEditingBudget(true); }} className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 cursor-pointer shrink-0">
                        <i className="fas fa-pen mr-1" /> Edit
                      </button>
                    )
                  )}
                </div>

                {/* Guest Count */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Expected Guests</p>
                    {editingGuests ? (
                      <div>
                        <input
                          type="number"
                          value={editGuests}
                          onChange={(e) => setEditGuests(e.target.value)}
                          placeholder={String(wedding.guestCount || "")}
                          className="w-full sm:w-[200px] px-3 py-1.5 border-2 border-gray-200 focus:border-maroon rounded-lg text-sm font-bold focus:outline-none transition-colors"
                          min={GUEST_MIN}
                          max={GUEST_MAX}
                        />
                        <p className="text-[0.65rem] text-gray-400 mt-1">Min: 50, Max: 5,000</p>
                      </div>
                    ) : (
                      <p className="text-lg font-extrabold text-gray-900 overflow-hidden text-ellipsis">
                        {(wedding.guestCount || 0) > 0 ? (wedding.guestCount || 0).toLocaleString("en-IN") : "Not set"}
                      </p>
                    )}
                  </div>
                  {editingGuests ? (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={handleSaveGuests} disabled={saving} className="px-3 py-2 bg-maroon text-white text-xs font-semibold rounded-lg hover:bg-maroon-dark disabled:opacity-50 cursor-pointer">
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditingGuests(false)} className="px-3 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    canEditBudget && (
                      <button onClick={() => { setEditGuests(String(wedding.guestCount || "")); setEditingGuests(true); }} className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 cursor-pointer shrink-0">
                        <i className="fas fa-pen mr-1" /> Edit
                      </button>
                    )
                  )}
                </div>

                {/* Wedding Date */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Wedding Date</p>
                    {editingDate ? (
                      <div>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full sm:w-[200px] px-3 py-1.5 border-2 border-gray-200 focus:border-maroon rounded-lg text-sm font-bold focus:outline-none transition-colors"
                        />
                      </div>
                    ) : (
                      <p className="text-lg font-extrabold text-gray-900 overflow-hidden text-ellipsis">
                        {wedding.weddingDate
                          ? new Date(wedding.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "Not set"}
                      </p>
                    )}
                  </div>
                  {editingDate ? (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={handleSaveDate} disabled={saving} className="px-3 py-2 bg-maroon text-white text-xs font-semibold rounded-lg hover:bg-maroon-dark disabled:opacity-50 cursor-pointer">
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditingDate(false)} className="px-3 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    canEditBudget && (
                      <button onClick={() => { setEditDate(wedding.weddingDate ? new Date(wedding.weddingDate).toISOString().split("T")[0] : ""); setEditingDate(true); }} className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 cursor-pointer shrink-0">
                        <i className="fas fa-pen mr-1" /> Edit
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Collaborators Section */}
          {canManageCollabs && (
            <ScrollReveal>
              <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-6 md:mb-8">
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
                            <div className="flex items-center gap-1">
                              <select value={collabRole} onChange={(e) => setCollabRole(e.target.value)}
                                className="px-2 py-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-maroon">
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="co-owner">Co-Owner</option>
                              </select>
                              <button onClick={() => handleChangeCollabRole(c.user.id, collabRole)}
                                className="px-3 py-2 bg-maroon text-white text-xs rounded cursor-pointer">Save</button>
                              <button onClick={() => setEditingCollab(null)}
                                className="px-3 py-2 bg-gray-200 text-gray-600 text-xs rounded cursor-pointer">X</button>
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
              </div>
            </ScrollReveal>
          )}

          <InviteModal weddingId={wedding.id} weddingName={wedding.name || "My Wedding"} open={inviteOpen} onClose={() => setInviteOpen(false)} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ScrollReveal delay={0.1}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 pt-5 pb-0">
                  <h3 className="font-bold">Quick Tips</h3>
                </div>
                <div className="p-6">
                  {dynamicTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: tip.color }}><i className={`fas ${tip.icon} text-sm`} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{tip.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

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
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium">{cat}</span>
                            <span className="text-gray-500">{'\u20B9'}{formatINR(spent)} / {'\u20B9'}{formatINR(budget)}</span>
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
        </>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
