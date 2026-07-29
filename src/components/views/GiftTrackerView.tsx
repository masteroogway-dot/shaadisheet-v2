"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { createGift, updateGift, deleteGift, bulkDeleteGifts, bulkUpdateGifts, batchCreateGifts, bulkAddGifts } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import { exportToCSV } from "@/lib/export";
import ImportModal from "@/components/ImportModal";
import CurrencyInput from "@/components/CurrencyInput";
import GiftAnalytics from "@/components/GiftAnalytics";

const SIDES = ["All", "Paternal", "Maternal", "Groom", "Friends", "Colleagues", "Both"];
const TYPES = ["All", "Cash", "Gold", "Gift", "Other"];
const THANK_YOU = ["All", "Sent", "Pending"];

const SIDE_COLORS: Record<string, { color: string; bg: string; bar: string }> = {
  Paternal: { color: "#8B0000", bg: "bg-maroon/10", bar: "bg-maroon" },
  Maternal: { color: "#D4AF37", bg: "bg-yellow-50", bar: "bg-yellow-500" },
  Groom: { color: "#1565C0", bg: "bg-blue-50", bar: "bg-blue-500" },
  Friends: { color: "#2E7D32", bg: "bg-green-50", bar: "bg-green" },
  Colleagues: { color: "#7C3AED", bg: "bg-purple-50", bar: "bg-purple-500" },
  Both: { color: "#6B7280", bg: "bg-gray-50", bar: "bg-gray-400" },
};

const THANK_YOU_TEMPLATES = [
  { label: "Formal", text: "Dear {name}, thank you so much for your generous gift of {amount} for our wedding. Your blessings mean the world to us. With warm regards." },
  { label: "Warm", text: "{name}, your love and generosity touched our hearts. The {amount} gift was so thoughtful. We are grateful to have you in our lives. Love always." },
  { label: "Fun", text: "Hey {name}! Still smiling about your amazing {amount} gift! You made our shaadi even more special. Let's celebrate together soon! 🎉" },
];

export default function GiftTrackerView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void; canEdit?: boolean }) {
  const gifts = wedding.gifts || [];
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterSide, setFilterSide] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterThankYou, setFilterThankYou] = useState("All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState(5);
  const [rangeInput, setRangeInput] = useState("");
  const [thankYouModal, setThankYouModal] = useState<{ name: string; amount: number; id: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [copiedTY, setCopiedTY] = useState(false);

  const filtered = gifts.filter((g: any) => {
    if (search && !g.fromName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSide !== "All" && g.fromSide !== filterSide) return false;
    if (filterType !== "All" && g.giftType !== filterType) return false;
    if (filterThankYou !== "All" && g.thankYou !== filterThankYou) return false;
    return true;
  });

  const totalReceived = gifts.reduce((s: number, g: any) => s + (g.amount || 0), 0);
  const totalCount = gifts.length;
  const pendingThankYou = gifts.filter((g: any) => g.thankYou === "Pending").length;
  const avgGift = totalCount > 0 ? Math.round(totalReceived / totalCount) : 0;

  const sideBreakdown = SIDES.slice(1).map((side) => {
    const sideGifts = gifts.filter((g: any) => g.fromSide === side);
    return { side, total: sideGifts.reduce((s: number, g: any) => s + (g.amount || 0), 0), count: sideGifts.length };
  }).filter((s) => s.count > 0);

  const maxSideTotal = useMemo(() => Math.max(...sideBreakdown.map((s) => s.total), 1), [sideBreakdown]);

  const giftRanges = useMemo(() => {
    const ranges = [
      { label: "0 - 5K", min: 0, max: 5000, count: 0, color: "from-gray-400 to-gray-500" },
      { label: "5K - 10K", min: 5000, max: 10000, count: 0, color: "from-blue-400 to-blue-500" },
      { label: "10K - 25K", min: 10000, max: 25000, count: 0, color: "from-green-400 to-green-500" },
      { label: "25K - 50K", min: 25000, max: 50000, count: 0, color: "from-yellow-400 to-yellow-500" },
      { label: "50K+", min: 50000, max: Infinity, count: 0, color: "from-maroon to-maroon-light" },
    ];
    for (const g of gifts) {
      const amt = g.amount || 0;
      for (const r of ranges) {
        if (amt >= r.min && amt < r.max) { r.count++; break; }
      }
    }
    return ranges;
  }, [gifts]);

  const maxRangeCount = useMemo(() => Math.max(...giftRanges.map((r) => r.count), 1), [giftRanges]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((g: any) => g.id)));
    }
  };

  const handleSelectRange = () => {
    if (!rangeInput.trim()) return;
    const ids = new Set<string>();
    const parts = rangeInput.split(",").map(s => s.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        if (!isNaN(a) && !isNaN(b)) {
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          for (let i = lo; i <= hi; i++) {
            if (i >= 1 && i <= filtered.length) ids.add(filtered[i - 1].id);
          }
        }
      } else {
        const n = Number(part);
        if (!isNaN(n) && n >= 1 && n <= filtered.length) ids.add(filtered[n - 1].id);
      }
    }
    setSelected(ids);
    setRangeInput("");
    if (ids.size > 0) onToast(`${ids.size} gift${ids.size > 1 ? "s" : ""} selected`, "success");
  };

  const handleSave = async (id: string) => {
    try {
      await updateGift(weddingId, id, editData);
      setEditing(null);
      setEditData({});
      onUpdate();
      onToast("Gift updated", "success");
    } catch {
      onToast("Failed to update gift", "error");
    }
  };

  const handleAdd = async () => {
    try {
      await createGift(weddingId, { fromName: "", fromSide: "Both", amount: 0, giftType: "Cash", received: "Yes", thankYou: "Pending", notes: "" });
      onUpdate();
      onToast("Gift added", "success");
    } catch {
      onToast("Failed to add gift", "error");
    }
  };

  const handleBulkAdd = async () => {
    if (bulkAddCount <= 0) return;
    try {
      await bulkAddGifts(weddingId, bulkAddCount);
      setShowBulkAdd(false);
      setBulkAddCount(5);
      onUpdate();
      onToast(`${bulkAddCount} row${bulkAddCount > 1 ? "s" : ""} created`);
    } catch {
      onToast("Failed to add rows", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGift(weddingId, id);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      onUpdate();
      onToast("Gift deleted", "success");
    } catch {
      onToast("Failed to delete gift", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    try {
      await bulkDeleteGifts(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`${selected.size} gift(s) deleted`, "success");
    } catch {
      onToast("Failed to delete gifts", "error");
    }
  };

  const handleBulkMarkThankYou = async () => {
    if (selected.size === 0) return;
    try {
      await bulkUpdateGifts(weddingId, Array.from(selected), { thankYou: "Sent" });
      setSelected(new Set());
      onUpdate();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: ["#D4AF37", "#8B0000", "#2E7D32"] });
      onToast(`${selected.size} thank-you(s) marked as sent`, "success");
    } catch {
      onToast("Failed to update gifts", "error");
    }
  };

  const handleSendThankYou = async (id: string) => {
    try {
      await updateGift(weddingId, id, { thankYou: "Sent" });
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: ["#D4AF37", "#8B0000", "#2E7D32"] });
      onUpdate();
      onToast("Thank-you marked as sent!");
      setThankYouModal(null);
    } catch {
      onToast("Failed to update", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-7">
        <div>
          <h2 className="text-2xl font-bold">Gift Tracker</h2>
          <p className="text-gray-500 text-sm">Track who gave what and send thank-yous</p>
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          {canEdit && gifts.length > 0 && (
            <>
              <button onClick={toggleSelectAll} className="btn-edit text-xs py-2 px-3">
                <i className="fas fa-check-double mr-1.5" /> {selected.size === filtered.length ? "Deselect All" : "Select All"}
              </button>
              <div className="flex items-center gap-1.5">
                <input value={rangeInput} onChange={(e) => setRangeInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSelectRange()} placeholder="e.g. 5-10, 3" className="card-input py-1.5 text-xs w-36" />
                <button onClick={handleSelectRange} className="btn-edit text-xs py-2 px-2.5"><i className="fas fa-arrow-right" /></button>
              </div>
            </>
          )}
          {canEdit && (
            <>
              <button onClick={() => exportToCSV(filtered.map((g: any, i: number) => ({ "#": i + 1, Name: g.fromName, Side: g.fromSide, Amount: g.amount, Type: g.giftType, Received: g.received, "Thank You": g.thankYou, Notes: g.notes || "" })), "gifts")} className="btn-edit text-xs py-2 px-3">
                <i className="fas fa-download mr-1.5" /> Export
              </button>
              <button onClick={() => setShowImport(true)} className="btn-maroon">
                <i className="fas fa-file-import" /> Import
              </button>
              <button onClick={handleAdd} className="btn-maroon">
                <i className="fas fa-plus" /> Add Gift
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { value: formatINR(totalReceived), label: "Total Received", color: "text-gray-900" },
            { value: totalCount.toString(), label: "Gifts", color: "text-blue-600" },
            { value: pendingThankYou.toString(), label: "Pending Thank-Yous", color: pendingThankYou > 0 ? "text-yellow" : "text-gray-900", pulse: pendingThankYou > 0 },
            { value: formatINR(avgGift), label: "Average Gift", color: "text-green" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <span className={`text-2xl font-extrabold block mb-1 ${s.color} ${s.pulse ? "animate-pulse" : ""}`}>{s.value}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Side Breakdown — Animated Bars */}
      {sideBreakdown.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">By Family Side</h4>
          <div className="space-y-3">
            {sideBreakdown.map((s) => {
              const cfg = SIDE_COLORS[s.side] || SIDE_COLORS.Both;
              return (
                <div key={s.side} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-28 shrink-0">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="text-sm font-semibold text-gray-700 truncate">{s.side}</span>
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${cfg.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.total / maxSideTotal) * 100}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-24 text-right shrink-0">{formatINR(s.total)}</span>
                  <span className="text-[10px] text-gray-400 w-10 text-right shrink-0">{s.count} gifts</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gift Range Histogram */}
      {totalCount > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Gift Distribution</h4>
          <div className="flex items-end gap-3 h-32">
            {giftRanges.map((r, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-500">{r.count}</span>
                <div className="w-full flex items-end" style={{ height: "80px" }}>
                  <motion.div
                    className={`w-full rounded-t-lg bg-gradient-to-t ${r.color}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${(r.count / maxRangeCount) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                    style={{ minHeight: r.count > 0 ? "4px" : "0" }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCount > 0 && <GiftAnalytics gifts={gifts} />}

      {/* Filters */}
      {totalCount > 0 && (
        <div className="mb-5 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..." className="w-full py-2 pl-9 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-maroon" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs">
                  <i className="fas fa-times" />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer shrink-0 ${showFilters || filterSide !== "All" || filterType !== "All" || filterThankYou !== "All" ? "bg-maroon text-white border-maroon" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              <i className="fas fa-filter text-xs" />
              Filters
              {(filterSide !== "All" || filterType !== "All" || filterThankYou !== "All") && <span className="w-1.5 h-1.5 bg-gold rounded-full" />}
            </button>
            {(search || filterSide !== "All" || filterType !== "All" || filterThankYou !== "All") && (
              <button onClick={() => { setSearch(""); setFilterSide("All"); setFilterType("All"); setFilterThankYou("All"); }} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                <i className="fas fa-times mr-1" /> Clear
              </button>
            )}
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <select value={filterSide} onChange={(e) => setFilterSide(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-maroon">
                {SIDES.map((s) => <option key={s} value={s}>{s === "All" ? "All Sides" : s}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-maroon">
                {TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
              </select>
              <select value={filterThankYou} onChange={(e) => setFilterThankYou(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-maroon">
                {THANK_YOU.map((t) => <option key={t} value={t}>{t === "All" ? "All Thank-Yous" : t}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Bulk actions */}
      {selected.size > 0 && canEdit && (
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={handleBulkDelete} className="btn-delete text-xs py-2 px-3">
            <i className="fas fa-trash mr-1" /> Delete
          </button>
          <button onClick={handleBulkMarkThankYou} className="btn-edit text-xs py-2 px-3">
            <i className="fas fa-check-double mr-1" /> Mark Thank-Yous Sent
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Clear</button>
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 md:p-16 text-center">
          <motion.div animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} className="text-6xl mb-4">🎁</motion.div>
          <h3 className="font-bold text-lg mb-2">No gifts tracked yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start tracking gifts (shagun) from your guests. See who gave what and send thank-yous.</p>
          {canEdit && (
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={handleAdd} className="btn-maroon">
                <i className="fas fa-plus" /> Add First Gift
              </button>
              <button onClick={() => setShowImport(true)} className="btn-cancel">
                <i className="fas fa-file-import mr-1.5" /> Import from CSV
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No gifts match your filters</div>
          ) : filtered.map((g: any, idx: number) => {
            const isEditing = editing === g.id;
            const isSelected = selected.has(g.id);

            return (
              <div key={g.id} className={`item-card ${isEditing ? "editing" : ""}`} style={{ borderLeft: `4px solid ${SIDE_COLORS[g.fromSide]?.color || "#D1D5DB"}` }}>
                <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-[0.65rem] font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 leading-none shrink-0">{idx + 1}</span>
                    {canEdit && <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(g.id)} className="w-4 h-4 rounded accent-maroon cursor-pointer shrink-0" />}
                    {isEditing ? (
                      <input value={editData.fromName ?? g.fromName} onChange={(e) => setEditData({ ...editData, fromName: e.target.value })} className="card-input py-1.5 font-bold w-full sm:w-60" placeholder="Guest name" />
                    ) : (
                      <h4 className="font-bold text-sm sm:text-base truncate min-w-0">{g.fromName || "\u2014"}</h4>
                    )}
                    {!isEditing && (
                      <span className={`status-badge hidden sm:inline-block ${g.thankYou === "Sent" ? "paid" : "planning"}`}>
                        {g.thankYou === "Sent" ? "Thanked" : "Pending"}
                      </span>
                    )}
                    {!isEditing && g.thankYou === "Pending" && canEdit && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setThankYouModal({ name: g.fromName, amount: g.amount || 0, id: g.id })}
                        className="text-xs px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-shadow"
                      >
                        💌 Thank You
                      </motion.button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        {canEdit && <button onClick={() => handleSave(g.id)} className="btn-save min-h-[44px] min-w-[44px]"><i className="fas fa-check sm:mr-1" /> <span className="hidden sm:inline">Save</span></button>}
                        <button onClick={() => { setEditing(null); setEditData({}); }} className="btn-cancel min-h-[44px] min-w-[44px]"><span className="hidden sm:inline">Cancel</span></button>
                      </>
                    ) : (
                      <>
                        {canEdit && <button onClick={() => { setEditing(g.id); setEditData({ fromName: g.fromName, fromSide: g.fromSide, amount: g.amount || 0, giftType: g.giftType, received: g.received, thankYou: g.thankYou, notes: g.notes }); }} className="btn-edit min-h-[44px] min-w-[44px]"><i className="fas fa-pen sm:mr-1" /> <span className="hidden sm:inline">Edit</span></button>}
                        {canEdit && <button onClick={() => handleDelete(g.id)} className="btn-delete min-h-[44px] min-w-[44px]"><i className="fas fa-trash sm:mr-1" /> <span className="hidden sm:inline">Delete</span></button>}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Amount</label>
                    {isEditing ? (
                      <CurrencyInput value={editData.amount ?? 0} onChange={(val) => setEditData({ ...editData, amount: val })} />
                    ) : (
                      <p className="text-sm font-semibold">{formatINR(g.amount)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Side</label>
                    {isEditing ? (
                      <select value={editData.fromSide ?? g.fromSide} onChange={(e) => setEditData({ ...editData, fromSide: e.target.value })} className="card-select">
                        <option>Paternal</option><option>Maternal</option><option>Groom</option><option>Friends</option><option>Colleagues</option><option>Both</option>
                      </select>
                    ) : (
                      <p className="text-sm">{g.fromSide}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Type</label>
                    {isEditing ? (
                      <select value={editData.giftType ?? g.giftType} onChange={(e) => setEditData({ ...editData, giftType: e.target.value })} className="card-select">
                        <option>Cash</option><option>Gold</option><option>Gift</option><option>Other</option>
                      </select>
                    ) : (
                      <p className="text-sm">{g.giftType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Thank You</label>
                    {isEditing ? (
                      <select value={editData.thankYou ?? g.thankYou} onChange={(e) => setEditData({ ...editData, thankYou: e.target.value })} className="card-select">
                        <option>Pending</option><option>Sent</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${g.thankYou === "Sent" ? "paid" : "planning"}`}>{g.thankYou}</span>
                    )}
                  </div>
                </div>

                {(isEditing || g.notes) && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notes</label>
                    {isEditing ? (
                      <input value={editData.notes ?? g.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="card-input" placeholder="Add notes" />
                    ) : (
                      <p className="text-sm text-gray-600">{g.notes}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {canEdit && (
            <button onClick={() => setShowBulkAdd(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-rose-400 hover:text-rose-500 transition-colors cursor-pointer">
              <i className="fas fa-plus mr-1.5" /> Add More Gifts
            </button>
          )}
        </div>
      )}

      {showBulkAdd && canEdit && (
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-lg">
          <span className="text-sm font-medium">Add how many gifts?</span>
          <input type="number" min={1} max={500} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center" />
          <button onClick={handleBulkAdd} className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600">Add</button>
          <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(5); }} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
        </div>
      )}

      {/* Thank You Modal */}
      <AnimatePresence>
        {thankYouModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4" onClick={() => setThankYouModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="font-bold text-lg mb-1">Send Thank You</h3>
              <p className="text-sm text-gray-500 mb-4">Choose a template for <strong>{thankYouModal.name}</strong> ({formatINR(thankYouModal.amount)})</p>
              <div className="space-y-2 mb-4">
                {THANK_YOU_TEMPLATES.map((t, i) => {
                  const msg = t.text.replace("{name}", thankYouModal.name).replace("{amount}", formatINR(thankYouModal.amount));
                  return (
                    <button key={i} onClick={() => setSelectedTemplate(i)} className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${selectedTemplate === i ? "border-maroon bg-maroon/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <span className="font-semibold text-xs text-gray-500 uppercase">{t.label}</span>
                      <p className="mt-1 text-gray-700 leading-relaxed">{msg}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const msg = THANK_YOU_TEMPLATES[selectedTemplate].text.replace("{name}", thankYouModal.name).replace("{amount}", formatINR(thankYouModal.amount));
                    navigator.clipboard.writeText(msg);
                    setCopiedTY(true);
                    setTimeout(() => setCopiedTY(false), 2000);
                  }}
                  className="flex-1 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  {copiedTY ? "✓ Copied!" : "Copy Message"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendThankYou(thankYouModal.id)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-bold hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-200"
                >
                  Mark as Sent 💌
                </motion.button>
              </div>
              <button onClick={() => setThankYouModal(null)} className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImportModal open={showImport} onClose={() => setShowImport(false)} type="gifts" onImport={async (items: any[]) => {
        try {
          await batchCreateGifts(weddingId, items);
          onUpdate();
          onToast(`${items.length} gift(s) imported`, "success");
        } catch {
          onToast("Failed to import gifts", "error");
        }
      }} />
    </div>
  );
}
