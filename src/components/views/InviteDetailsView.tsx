"use client";

import { useState } from "react";
import { createInviteDetail, updateInviteDetail, deleteInviteDetail, bulkDeleteInviteDetails, batchCreateInviteDetails, bulkAddInviteDetails } from "@/lib/actions";
import { formatINR } from "@/lib/format";
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
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{invites.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Invites</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalQty.toLocaleString("en-IN")}</div>
          <div className="text-xs text-gray-500 mt-1">Cards Printed</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{sentQty.toLocaleString("en-IN")}</div>
          <div className="text-xs text-gray-500 mt-1">Cards Sent</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{pendingQty.toLocaleString("en-IN")}</div>
          <div className="text-xs text-gray-500 mt-1">Cards Pending</div>
        </div>
      </div>

      {/* Cost + RSVP Deadline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Total Invitation Cost</span>
          <div className="text-xl font-bold text-gray-900">{formatINR(totalCost)}</div>
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
        <input type="text" placeholder="Search invites..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg flex-1 min-w-[150px]" />
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
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <i className="fas fa-envelope-open-text text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 mb-3">No invitation details yet</p>
          {canEdit && (
            <button onClick={handleAdd} className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-sm font-medium">
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
                  <input type="number" placeholder="Cost (₹)" value={editData.cost || ""} onChange={(e) => setEditData({ ...editData, cost: parseInt(e.target.value) || 0 })} className="px-3 py-2 text-sm border rounded-lg" />
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
                      {i.cost ? <span><i className="fas fa-rupee-sign mr-1" />{formatINR(i.cost)}</span> : null}
                      {i.sentDate && <span><i className="fas fa-paper-plane mr-1" />Sent: {i.sentDate}</span>}
                      {i.rsvpDeadline && <span><i className="fas fa-calendar-check mr-1" />RSVP: {i.rsvpDeadline}</span>}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(i.id); setEditData({ type: i.type, description: i.description, designer: i.designer, printer: i.printer, quantity: i.quantity, cost: i.cost, sentDate: i.sentDate, rsvpDeadline: i.rsvpDeadline, status: i.status, notes: i.notes }); }} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">Edit</button>
                      <button onClick={() => handleDelete(i.id)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">Delete</button>
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
