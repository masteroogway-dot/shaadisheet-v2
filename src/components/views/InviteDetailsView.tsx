"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createInviteDetail, updateInviteDetail, deleteInviteDetail, bulkDeleteInviteDetails, batchCreateInviteDetails, bulkAddInviteDetails } from "@/lib/actions";
import { formatCurrency, getCurrencySymbol } from "@/lib/format";
import { exportToCSV } from "@/lib/export";
import ImportModal from "@/components/ImportModal";

const TYPES = ["Save-the-Date", "Main Invite", "Digital Invite", "Follow-up", "Wedding Website", "WhatsApp"];
const STATUSES = ["Planning", "Designed", "Printed", "Dispatched", "Delivered"];

export default function InviteDetailsView({ wedding, weddingId, onUpdate, onToast, canEdit }: any) {
  const invites: any[] = wedding.inviteDetails || [];

  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState(5);
  const [whatsAppPreview, setWhatsAppPreview] = useState<any>(null);

  const filtered = invites.filter((i) => {
    if (filterType !== "All" && i.type !== filterType) return false;
    if (filterStatus !== "All" && i.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        i.description?.toLowerCase().includes(s) ||
        i.designer?.toLowerCase().includes(s) ||
        i.printer?.toLowerCase().includes(s) ||
        i.type?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalCost = invites.reduce((s, i) => s + (i.cost || 0), 0);
  const totalQty = invites.reduce((s, i) => s + (i.quantity || 0), 0);
  const sentQty = invites.filter((i) => ["Dispatched", "Delivered"].includes(i.status)).reduce((s, i) => s + (i.quantity || 0), 0);
  const pendingQty = totalQty - sentQty;
  const hasRsvpDeadline = invites.some((i) => i.rsvpDeadline);

  const handleSave = async (id: string) => {
    try {
      await updateInviteDetail(weddingId, id, editData);
      setEditing(null);
      setEditData({});
      onUpdate();
      onToast("Invite updated");
    } catch (e) {
      onToast("Failed to update invite", "error");
    }
  };

  const handleAdd = async () => {
    try {
      await createInviteDetail(weddingId, { type: "Main Invite", status: "Planning" });
      onUpdate();
      onToast("Invite added");
    } catch (e) {
      onToast("Failed to add invite", "error");
    }
  };

  const handleBulkAdd = async () => {
    if (bulkAddCount <= 0) return;
    try {
      await bulkAddInviteDetails(weddingId, bulkAddCount);
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
      await deleteInviteDetail(weddingId, id);
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      onUpdate();
      onToast("Invite deleted");
    } catch (e) {
      onToast("Failed to delete invite", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteInviteDetails(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`${selected.size} invites deleted`);
    } catch (e) {
      onToast("Failed to delete invites", "error");
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
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  const statusColor = (s: string) => {
    if (s === "Delivered") return "bg-green-100 text-green-800 border-green-200";
    if (s === "Dispatched") return "bg-blue-100 text-blue-800 border-blue-200";
    if (s === "Printed") return "bg-purple-100 text-purple-800 border-purple-200";
    if (s === "Designed") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Invitation Details</h2>
        <div className="flex gap-2">
          {canEdit && invites.length > 0 && (
            <button onClick={toggleSelectAll} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              <i className="fas fa-check-double mr-1" /> {selected.size === filtered.length ? "Deselect All" : "Select All"}
            </button>
          )}
          {canEdit && (
            <>
              <button onClick={() => setShowImport(true)} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                <i className="fas fa-file-import mr-1" /> Import
              </button>
              <button onClick={() => { exportToCSV(invites.map((inv, i) => ({ "#": i + 1, Type: inv.type, Description: inv.description, Designer: inv.designer, Printer: inv.printer, Quantity: inv.quantity, Cost: inv.cost, "Sent Date": inv.sentDate, "RSVP Deadline": inv.rsvpDeadline, Status: inv.status, Notes: inv.notes || "" })), "invite-details.csv"); onToast("Invites exported"); }} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                <i className="fas fa-download mr-1" /> Export
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { value: invites.length, label: "Total Invites", color: "text-gray-900" },
          { value: totalQty.toLocaleString("en-IN"), label: "Cards Printed", color: "text-blue-600" },
          { value: sentQty.toLocaleString("en-IN"), label: "Cards Sent", color: "text-green" },
          { value: pendingQty.toLocaleString("en-IN"), label: "Cards Pending", color: "text-amber-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Status Pipeline Overview */}
      {invites.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Invite Pipeline</h4>
          <div className="flex items-center justify-between relative overflow-x-auto pb-2">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 min-w-[calc(100%-2rem)]" />
            {STATUSES.map((status, idx) => {
              const count = invites.filter((i) => i.status === status).length;
              const isActive = count > 0;
              return (
                <div key={status} className="relative flex flex-col items-center z-10 shrink-0 mx-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${isActive ? "bg-maroon text-white border-maroon" : "bg-white text-gray-400 border-gray-300"}`}
                  >
                    {count}
                  </motion.div>
                  <span className="text-[9px] sm:text-[10px] text-gray-500 mt-1.5 font-medium text-center w-12 sm:w-14 leading-tight">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cost + RSVP Deadline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Total Invitation Cost</span>
          <div className="text-xl font-bold text-gray-900">{formatCurrency(totalCost, wedding.currency)}</div>
        </div>
        {hasRsvpDeadline && (
          <div className="text-right">
            <span className="text-sm text-gray-500">RSVP Deadline</span>
            <div className="text-lg font-bold text-rose-600">
              {invites.filter((i) => i.rsvpDeadline).sort((a, b) => new Date(a.rsvpDeadline).getTime() - new Date(b.rsvpDeadline).getTime())[0]?.rsvpDeadline}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input type="text" placeholder="Search invites..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg flex-1 min-w-0" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white">
          <option value="All">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
      {invites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-5xl mb-3">💌</motion.div>
          <p className="text-gray-700 font-semibold mb-1">No invitation details yet</p>
          <p className="text-gray-400 text-sm mb-4">Track every invite — from save-the-date to final delivery</p>
          {canEdit && (
            <button onClick={handleAdd} className="px-5 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 text-sm font-medium shadow-lg shadow-rose-200">
              Add First Invite
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <div key={i.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-rose-300 transition-colors">
              {canEdit && (
                <input type="checkbox" checked={selected.has(i.id)} onChange={() => toggleSelect(i.id)} className="mr-3" />
              )}
              {editing === i.id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                  <select value={editData.type || "Main Invite"} onChange={(e) => setEditData({ ...editData, type: e.target.value })} className="px-3 py-2 text-sm border rounded-lg bg-white">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input type="text" placeholder="Description" value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <input type="text" placeholder="Designer" value={editData.designer || ""} onChange={(e) => setEditData({ ...editData, designer: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <input type="text" placeholder="Printer" value={editData.printer || ""} onChange={(e) => setEditData({ ...editData, printer: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <input type="number" placeholder="Quantity" value={editData.quantity || ""} onChange={(e) => setEditData({ ...editData, quantity: parseInt(e.target.value) || 0 })} className="px-3 py-2 text-sm border rounded-lg" />
                  <input type="number" placeholder={`Cost (${getCurrencySymbol(wedding.currency)})`} value={editData.cost || ""} onChange={(e) => setEditData({ ...editData, cost: parseInt(e.target.value) || 0 })} className="px-3 py-2 text-sm border rounded-lg" />
                  <input type="date" placeholder="Sent Date" value={editData.sentDate || ""} onChange={(e) => setEditData({ ...editData, sentDate: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <input type="date" placeholder="RSVP Deadline" value={editData.rsvpDeadline || ""} onChange={(e) => setEditData({ ...editData, rsvpDeadline: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <select value={editData.status || "Planning"} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="px-3 py-2 text-sm border rounded-lg bg-white">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="text" placeholder="Notes" value={editData.notes || ""} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
                  <div className="flex gap-2 col-span-full">
                    <button onClick={() => handleSave(i.id)} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">Save</button>
                    <button onClick={() => { setEditing(null); setEditData({}); }} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{i.type || "—"}</span>
                      <span className="text-gray-300">|</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(i.status)}`}>
                        {i.status}
                      </span>
                    </div>
                    {i.description && <div className="text-sm text-gray-500 mt-1">{i.description}</div>}
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                      {i.printer && <span><i className="fas fa-print mr-1" />{i.printer}</span>}
                      {i.designer && <span><i className="fas fa-palette mr-1" />{i.designer}</span>}
                      {i.quantity ? <span><i className="fas fa-copy mr-1" />{i.quantity.toLocaleString("en-IN")} cards</span> : null}
                      {i.cost ? <span><i className="fas fa-rupee-sign mr-1" />{formatCurrency(i.cost, wedding.currency)}</span> : null}
                      {i.sentDate && <span><i className="fas fa-paper-plane mr-1" />Sent: {i.sentDate}</span>}
                      {i.rsvpDeadline && <span><i className="fas fa-calendar-check mr-1" />RSVP: {i.rsvpDeadline}</span>}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button onClick={() => setWhatsAppPreview(i)} className="px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded font-medium min-h-[44px] min-w-[44px] flex items-center justify-center" title="WhatsApp Preview">
                        <i className="fab fa-whatsapp" />
                      </button>
                      <button onClick={() => { setEditing(i.id); setEditData({ type: i.type, description: i.description, designer: i.designer, printer: i.printer, quantity: i.quantity, cost: i.cost, sentDate: i.sentDate, rsvpDeadline: i.rsvpDeadline, status: i.status, notes: i.notes }); }} className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center">Edit</button>
                      <button onClick={() => handleDelete(i.id)} className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded min-h-[44px] min-w-[44px] flex items-center justify-center">Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add More */}
      {canEdit && invites.length > 0 && (
        <button onClick={() => setShowBulkAdd(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-rose-400 hover:text-rose-500 text-sm font-medium transition-colors">
          <i className="fas fa-plus mr-1" /> Add Invite
        </button>
      )}

      {showBulkAdd && canEdit && (
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-lg">
          <span className="text-sm font-medium">Add how many invites?</span>
          <input type="number" min={1} max={500} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center" />
          <button onClick={handleBulkAdd} className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600">Add</button>
          <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(5); }} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
        </div>
      )}

      {/* WhatsApp Preview Modal */}
      <AnimatePresence>
        {whatsAppPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4" onClick={() => setWhatsAppPreview(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-bold text-lg mb-4">WhatsApp Preview</h3>
              {/* Phone mockup */}
              <div className="bg-[#ECE5DD] rounded-2xl p-4 relative" style={{ background: "linear-gradient(180deg, #075E54 0%, #075E54 12%, #ECE5DD 12%)" }}>
                <div className="text-white text-xs font-medium pt-0.5 pb-3 px-1">WhatsApp</div>
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%] ml-auto" style={{ borderRadius: "8px 0 8px 8px" }}>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    <strong>🎊 Wedding Invitation 🎊</strong><br /><br />
                    You are cordially invited to the wedding of<br />
                    <strong>{wedding?.partner1Name || "Partner 1"}</strong> & <strong>{wedding?.partner2Name || "Partner 2"}</strong><br /><br />
                    📋 {whatsAppPreview.type}: {whatsAppPreview.description || "—"}<br />
                    📅 {whatsAppPreview.sentDate || "Date TBD"}<br />
                    {whatsAppPreview.rsvpDeadline && <>💌 RSVP by: {whatsAppPreview.rsvpDeadline}<br /></>}
                    📊 Status: {whatsAppPreview.status}<br /><br />
                    <em>Sent via ShaadiSheet</em>
                  </p>
                  <div className="text-[10px] text-gray-400 text-right mt-1">12:00 PM ✓✓</div>
                </div>
              </div>
              <button onClick={() => {
                const msg = `🎊 Wedding Invitation 🎊\n\nYou are cordially invited to the wedding of\n${wedding?.partner1Name || "Partner 1"} & ${wedding?.partner2Name || "Partner 2"}\n\n📋 ${whatsAppPreview.type}: ${whatsAppPreview.description || "—"}\n📅 ${whatsAppPreview.sentDate || "Date TBD"}\n${whatsAppPreview.rsvpDeadline ? `💌 RSVP by: ${whatsAppPreview.rsvpDeadline}\n` : ""}📊 Status: ${whatsAppPreview.status}\n\nSent via ShaadiSheet`;
                navigator.clipboard.writeText(msg);
                onToast("Message copied!");
              }} className="w-full mt-4 py-2.5 bg-green text-white rounded-xl text-sm font-bold hover:bg-green/90 transition-colors flex items-center justify-center gap-2">
                <i className="fab fa-whatsapp text-lg" /> Copy for WhatsApp
              </button>
              <button onClick={() => setWhatsAppPreview(null)} className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="invites"
        onImport={async (items: any[]) => {
          await batchCreateInviteDetails(weddingId, items);
          onUpdate();
        }}
      />
    </div>
  );
}
