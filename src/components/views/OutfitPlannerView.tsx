"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createOutfit, updateOutfit, deleteOutfit, bulkDeleteOutfits, batchCreateOutfits, bulkAddOutfits } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import { exportToCSV } from "@/lib/export";
import ImportModal from "@/components/ImportModal";

const PERSONS = ["Bride", "Groom", "Bride's Mother", "Groom's Mother", "Bride's Father", "Groom's Father", "Bridesmaid", "Groomsman", "Other"];
const STATUSES = ["Shopping", "Tailored", "Ready"];

function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
  return `#${[f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("")}`;
}

function getComplementaryPalette(colorName: string): string[] {
  const nameToHex: Record<string, string> = {
    red: "#E53935", blue: "#1E88E5", green: "#43A047", yellow: "#FDD835", purple: "#8E24AA",
    pink: "#EC407A", orange: "#FB8C00", white: "#FFFFFF", black: "#212121", gold: "#D4AF37",
    maroon: "#8B0000", navy: "#1565C0", teal: "#00897B", beige: "#F5F5DC", cream: "#FFFDD0",
    coral: "#FF7043", lavender: "#CE93D8", mint: "#66BB6A", peach: "#FFAB91", ivory: "#FFFFF0",
  };
  const hex = nameToHex[colorName.toLowerCase()] || (colorName.startsWith("#") ? colorName : "#8B0000");
  const hsl = hexToHSL(hex);
  if (!hsl) return [hex, hex, hex];
  return [
    hslToHex((hsl.h + 30) % 360, Math.min(hsl.s + 10, 100), Math.min(hsl.l + 15, 85)),
    hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 210) % 360, Math.min(hsl.s + 5, 100), Math.min(hsl.l + 10, 80)),
  ];
}

export default function OutfitPlannerView({ wedding, weddingId, onUpdate, onToast, canEdit }: any) {
  const outfits: any[] = wedding.outfits || [];
  const events: any[] = wedding.events || [];

  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterEvent, setFilterEvent] = useState("All");
  const [filterPerson, setFilterPerson] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState(5);
  const [view, setView] = useState<"list" | "matrix">("list");
  const [colorInput, setColorInput] = useState("");
  const [showPackList, setShowPackList] = useState(false);

  const eventNames = [...new Set(outfits.map((o) => o.event).filter(Boolean))];
  const personNames = [...new Set(outfits.map((o) => o.person).filter(Boolean))];

  const filtered = outfits.filter((o) => {
    if (filterEvent !== "All" && o.event !== filterEvent) return false;
    if (filterPerson !== "All" && o.person !== filterPerson) return false;
    if (filterStatus !== "All" && o.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        o.description?.toLowerCase().includes(s) ||
        o.designer?.toLowerCase().includes(s) ||
        o.person?.toLowerCase().includes(s) ||
        o.event?.toLowerCase().includes(s) ||
        o.jewelryPairing?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalCost = outfits.reduce((s, o) => s + (o.cost || 0), 0);
  const readyCount = outfits.filter((o) => o.status === "Ready").length;
  const shoppingCount = outfits.filter((o) => o.status === "Shopping").length;
  const tailoredCount = outfits.filter((o) => o.status === "Tailored").length;
  const uniqueEvents = [...new Set(outfits.map((o) => o.event).filter(Boolean))].length;

  const handleSave = async (id: string) => {
    try {
      await updateOutfit(weddingId, id, editData);
      setEditing(null);
      setEditData({});
      onUpdate();
      onToast("Outfit updated");
    } catch (e) {
      onToast("Failed to update outfit", "error");
    }
  };

  const handleAdd = async () => {
    try {
      await createOutfit(weddingId, { event: "", person: "Bride", description: "", status: "Shopping" });
      onUpdate();
      onToast("Outfit added");
    } catch (e) {
      onToast("Failed to add outfit", "error");
    }
  };

  const handleBulkAdd = async () => {
    if (bulkAddCount <= 0) return;
    try {
      await bulkAddOutfits(weddingId, bulkAddCount);
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
      await deleteOutfit(weddingId, id);
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      onUpdate();
      onToast("Outfit deleted");
    } catch (e) {
      onToast("Failed to delete outfit", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteOutfits(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`${selected.size} outfits deleted`);
    } catch (e) {
      onToast("Failed to delete outfits", "error");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((o) => o.id)));
    }
  };

  const statusColor = (s: string) => {
    if (s === "Ready") return "bg-green-100 text-green-800 border-green-200";
    if (s === "Tailored") return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const statusIcon = (s: string) => {
    if (s === "Ready") return "✅";
    if (s === "Tailored") return "✂️";
    return "🛒";
  };

  const matrixData = () => {
    const allEvents = [...new Set(outfits.map((o) => o.event).filter(Boolean))];
    const allPersons = [...new Set(outfits.map((o) => o.person).filter(Boolean))];
    return { allEvents, allPersons };
  };

  const getOutfitForCell = (event: string, person: string) => {
    return outfits.find((o) => o.event === event && o.person === person);
  };

  const { allEvents, allPersons } = matrixData();

  const clashes = useMemo(() => {
    const map: Record<string, Record<string, string[]>> = {};
    for (const o of outfits) {
      if (!o.event || !o.person || !o.description) continue;
      const key = o.event;
      if (!map[key]) map[key] = {};
      const desc = o.description.toLowerCase();
      if (!map[key][desc]) map[key][desc] = [];
      map[key][desc].push(o.person);
    }
    const result: { event: string; color: string; people: string[] }[] = [];
    for (const [event, colors] of Object.entries(map)) {
      for (const [color, people] of Object.entries(colors)) {
        if (people.length > 1) result.push({ event, color, people });
      }
    }
    return result;
  }, [outfits]);

  const packList = useMemo(() => {
    const byEvent: Record<string, { person: string; desc: string; status: string; jewelry: string }[]> = {};
    for (const o of outfits) {
      if (!o.event) continue;
      if (!byEvent[o.event]) byEvent[o.event] = [];
      byEvent[o.event].push({ person: o.person, desc: o.description || "—", status: o.status, jewelry: o.jewelryPairing || "" });
    }
    return byEvent;
  }, [outfits]);

  const palette = useMemo(() => colorInput ? getComplementaryPalette(colorInput) : [], [colorInput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Outfit Planner</h2>
        <div className="flex gap-2">
          {canEdit && outfits.length > 0 && (
            <button onClick={toggleSelectAll} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              <i className="fas fa-check-double mr-1" /> {selected.size === filtered.length ? "Deselect All" : "Select All"}
            </button>
          )}
          {canEdit && (
            <>
              <button onClick={() => setShowImport(true)} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                <i className="fas fa-file-import mr-1" /> Import
              </button>
              <button onClick={() => { exportToCSV(outfits.map((o, i) => ({ "#": i + 1, Event: o.event, Person: o.person, Description: o.description, Designer: o.designer, Status: o.status, Cost: o.cost, "Jewelry Pairing": o.jewelryPairing, Notes: o.notes || "" })), "outfit-planner.csv"); onToast("Outfits exported"); }} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                <i className="fas fa-download mr-1" /> Export
              </button>
            </>
          )}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView("list")} className={`px-3 py-1 text-sm rounded-md font-medium ${view === "list" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
              <i className="fas fa-list mr-1" /> List
            </button>
            <button onClick={() => setView("matrix")} className={`px-3 py-1 text-sm rounded-md font-medium ${view === "matrix" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
              <i className="fas fa-table mr-1" /> Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{outfits.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Outfits</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{readyCount}</div>
          <div className="text-xs text-gray-500 mt-1">Ready</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{tailoredCount}</div>
          <div className="text-xs text-gray-500 mt-1">Tailored</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{shoppingCount}</div>
          <div className="text-xs text-gray-500 mt-1">Shopping</div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Total Outfit Cost</span>
          <div className="text-xl font-bold text-gray-900">{formatINR(totalCost)}</div>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">Events Covered</span>
          <div className="text-xl font-bold text-gray-900">{uniqueEvents}</div>
        </div>
      </div>

      {/* Color Palette Picker */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg">🎨</span>
          <h4 className="text-sm font-bold text-gray-700">Color Palette Generator</h4>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <input
            type="text"
            placeholder="Type a color (e.g. Royal Blue, Maroon, Gold)"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            className="flex-1 w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
          />
          {palette.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
              {palette.map((hex, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl border-2 border-white shadow-md" style={{ background: hex }} />
                  <span className="text-[10px] text-gray-500 font-mono">{hex}</span>
                </motion.div>
              ))}
              <div className="ml-2 text-xs text-gray-500">
                <p className="font-medium">Jewelry</p>
                <p className="font-medium">Shoes</p>
                <p className="font-medium">Makeup</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Clash Warnings */}
      {clashes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-amber-800 mb-2">⚠️ Color Clashes Detected</h4>
          <div className="space-y-1">
            {clashes.map((c, i) => (
              <p key={i} className="text-xs text-amber-700">
                <strong>{c.event}</strong>: {c.people.join(" & ")} both wearing <span className="font-mono font-bold">{c.color}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Pack List Button */}
      {outfits.length > 0 && (
        <button onClick={() => setShowPackList(true)} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200 transition-all">
          🧳 Generate Pack List for Destination Wedding
        </button>
      )}

      {/* Matrix View */}
      {view === "matrix" && allEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 text-gray-500 font-medium">Event / Person</th>
                {allPersons.map((p) => (
                  <th key={p} className="text-center p-3 text-gray-500 font-medium">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allEvents.map((ev) => (
                <tr key={ev} className="border-b border-gray-100">
                  <td className="p-3 font-medium text-gray-900">{ev}</td>
                  {allPersons.map((p) => {
                    const o = getOutfitForCell(ev, p);
                    return (
                      <td key={p} className="p-2 text-center">
                        {o ? (
                          <div className="text-xs p-2 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="font-medium truncate">{o.description || "—"}</div>
                            <div className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor(o.status)}`}>
                              {statusIcon(o.status)} {o.status}
                            </div>
                            {o.cost ? <div className="text-gray-400 mt-0.5">{formatINR(o.cost)}</div> : null}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input type="text" placeholder="Search outfits..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg flex-1 min-w-[150px]" />
        <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
          <option value="All">All Events</option>
          {eventNames.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
          <option value="All">All People</option>
          {personNames.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
          <option value="All">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkDelete} className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">Delete</button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Clear</button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {outfits.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl mb-3">👗</motion.div>
          <p className="text-gray-700 font-semibold mb-1">No outfits yet</p>
          <p className="text-gray-400 text-sm mb-4">Plan every outfit for every event — from mehendi to reception</p>
          {canEdit && (
            <button onClick={handleAdd} className="px-5 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 text-sm font-medium shadow-lg shadow-rose-200">
              Add First Outfit
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-rose-300 transition-colors">
              {canEdit && (
                <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSelect(o.id)} className="mr-3" />
              )}
              {editing === o.id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                  <input type="text" placeholder="Event" value={editData.event || ""} onChange={(e) => setEditData({ ...editData, event: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <select value={editData.person || "Bride"} onChange={(e) => setEditData({ ...editData, person: e.target.value })} className="px-3 py-2 text-sm border rounded-lg bg-white">
                    {PERSONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="text" placeholder="Description" value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <input type="text" placeholder="Designer" value={editData.designer || ""} onChange={(e) => setEditData({ ...editData, designer: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <select value={editData.status || "Shopping"} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="px-3 py-2 text-sm border rounded-lg bg-white">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="number" placeholder="Cost (₹)" value={editData.cost || ""} onChange={(e) => setEditData({ ...editData, cost: parseInt(e.target.value) || 0 })} className="px-3 py-2 text-sm border rounded-lg" />
                  <input type="text" placeholder="Jewelry Pairing" value={editData.jewelryPairing || ""} onChange={(e) => setEditData({ ...editData, jewelryPairing: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <input type="text" placeholder="Notes" value={editData.notes || ""} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <div className="flex gap-2 col-span-full">
                    <button onClick={() => handleSave(o.id)} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">Save</button>
                    <button onClick={() => { setEditing(null); setEditData({}); }} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{o.person || "—"}</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">{o.event || "—"}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(o.status)}`}>
                        {statusIcon(o.status)} {o.status}
                      </span>
                    </div>
                    {o.description && <div className="text-sm text-gray-500 mt-1">{o.description}</div>}
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                      {o.designer && <span><i className="fas fa-palette mr-1" />{o.designer}</span>}
                      {o.cost ? <span><i className="fas fa-rupee-sign mr-1" />{formatINR(o.cost)}</span> : null}
                      {o.jewelryPairing && <span><i className="fas fa-gem mr-1" />{o.jewelryPairing}</span>}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(o.id); setEditData({ event: o.event, person: o.person, description: o.description, designer: o.designer, status: o.status, cost: o.cost, jewelryPairing: o.jewelryPairing, notes: o.notes }); }} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">Edit</button>
                      <button onClick={() => handleDelete(o.id)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add More */}
      {canEdit && outfits.length > 0 && (
        <button onClick={() => setShowBulkAdd(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-rose-400 hover:text-rose-500 text-sm font-medium transition-colors">
          <i className="fas fa-plus mr-1" /> Add Outfit
        </button>
      )}

      {showBulkAdd && canEdit && (
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-lg">
          <span className="text-sm font-medium">Add how many outfits?</span>
          <input type="number" min={1} max={500} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center" />
          <button onClick={handleBulkAdd} className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600">Add</button>
          <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(5); }} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
        </div>
      )}

      {/* Pack List Modal */}
      <AnimatePresence>
        {showPackList && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPackList(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">🧳 Pack List</h3>
                <button onClick={() => setShowPackList(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              {Object.entries(packList).map(([event, items]) => (
                <div key={event} className="mb-4">
                  <h4 className="font-bold text-sm text-maroon mb-2">{event}</h4>
                  <div className="space-y-1.5">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${item.status === "Ready" ? "bg-green" : item.status === "Tailored" ? "bg-blue" : "bg-yellow"}`} />
                        <span className="font-medium">{item.person}</span>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-600 truncate">{item.desc}</span>
                        {item.jewelry && <span className="text-xs text-gray-400 ml-auto shrink-0">💎 {item.jewelry}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const text = Object.entries(packList).map(([event, items]) => `${event}\n${items.map((i) => `  ☐ ${i.person} — ${i.desc}${i.jewelry ? ` (💎 ${i.jewelry})` : ""}`).join("\n")}`).join("\n\n");
                navigator.clipboard.writeText(text);
                onToast("Pack list copied!");
              }} className="w-full py-2.5 bg-maroon text-white rounded-xl text-sm font-bold hover:bg-maroon-dark transition-colors mt-2">
                Copy Pack List
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="outfits"
        onImport={async (items: any[]) => {
          await batchCreateOutfits(weddingId, items);
          onUpdate();
        }}
      />
    </div>
  );
}
