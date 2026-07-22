"use client";

import { useState } from "react";
import {
  createRoomAllocation,
  updateRoomAllocation,
  deleteRoomAllocation,
  batchCreateRoomAllocations,
  bulkDeleteRoomAllocations,
  bulkAddRoomAllocations,
} from "@/lib/actions";
import ImportModal from "@/components/ImportModal";
import DatePicker from "@/components/DatePicker";

export default function RoomAllocationView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void; canEdit?: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState(1);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const allocations = wedding.roomAllocations || [];
  const totalRooms = allocations.length;
  const reserved = allocations.filter((a: any) => a.status === "Reserved").length;
  const checkedIn = allocations.filter((a: any) => a.status === "Checked In").length;
  const cancelled = allocations.filter((a: any) => a.status === "Cancelled").length;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === allocations.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allocations.map((a: any) => a.id)));
    }
  };

  const handleSave = async (id: string) => {
    await updateRoomAllocation(weddingId, id, editData);
    setEditing(null);
    setEditData({});
    onUpdate();
    onToast("Room updated", "success");
  };

  const handleAdd = async () => {
    await createRoomAllocation(weddingId, {
      guestName: "",
      hotel: "",
      roomNumber: "",
      roomType: "Standard",
      checkIn: "",
      checkOut: "",
      status: "Reserved",
      notes: "",
    });
    onUpdate();
    onToast("Room allocation added", "success");
  };

  const handleDelete = async (id: string) => {
    await deleteRoomAllocation(weddingId, id);
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    onUpdate();
    onToast("Room deleted", "success");
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    await bulkDeleteRoomAllocations(weddingId, Array.from(selected));
    setSelected(new Set());
    onUpdate();
    onToast(`${selected.size} room(s) deleted`, "success");
  };

  const handleDeleteAll = async () => {
    await bulkDeleteRoomAllocations(weddingId, allocations.map((a: any) => a.id));
    setShowDeleteAllConfirm(false);
    setSelected(new Set());
    onUpdate();
    onToast("All rooms deleted", "success");
  };

  const handleBulkAdd = async () => {
    const count = Math.max(1, bulkAddCount);
    await bulkAddRoomAllocations(weddingId, count);
    setShowBulkAdd(false);
    setBulkAddCount(1);
    onUpdate();
    onToast(`${count} room(s) added`, "success");
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Room Allocations</h2>
          <p className="text-gray-500 text-sm">Assign guests to hotel rooms and track check-ins</p>
        </div>
        <div className="flex gap-2.5">
          {canEdit && (
            <button onClick={() => setShowImport(true)} className="btn-maroon">
              <i className="fas fa-file-import" /> Import
            </button>
          )}
          {canEdit && (
            <button onClick={handleAdd} className="btn-maroon">
              <i className="fas fa-plus" /> Add Room
            </button>
          )}
          {canEdit && totalRooms > 0 && (
            <button onClick={() => setShowDeleteAllConfirm(true)} className="btn-delete">
              <i className="fas fa-trash" /> Delete All
            </button>
          )}
        </div>
      </div>

      {totalRooms > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { num: totalRooms, label: "Total Rooms", color: "" },
            { num: reserved, label: "Reserved", color: "text-blue-600" },
            { num: checkedIn, label: "Checked In", color: "text-green" },
            { num: cancelled, label: "Cancelled", color: "text-red" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <span className={`text-2xl font-extrabold block mb-1 ${s.color}`}>{s.num}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {canEdit && selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={handleBulkDelete} className="btn-delete text-xs py-1 px-3">
            <i className="fas fa-trash mr-1" /> Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Clear</button>
        </div>
      )}

      {canEdit && showBulkAdd && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">Add how many rooms?</span>
          <input type="number" min={1} max={100} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="card-input w-20 py-1.5 text-center" />
          <button onClick={handleBulkAdd} className="btn-maroon text-xs py-1.5 px-3">Add</button>
          <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(1); }} className="btn-cancel text-xs py-1.5 px-3">Cancel</button>
        </div>
      )}

      {canEdit && showDeleteAllConfirm && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm font-medium text-red-700">Delete all {totalRooms} rooms? This cannot be undone.</span>
          <button onClick={handleDeleteAll} className="btn-delete text-xs py-1.5 px-3">
            <i className="fas fa-trash mr-1" /> Yes, Delete All
          </button>
          <button onClick={() => setShowDeleteAllConfirm(false)} className="btn-cancel text-xs py-1.5 px-3">Cancel</button>
        </div>
      )}

      {totalRooms === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-bed text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No rooms allocated yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start assigning guests to hotel rooms for the wedding.</p>
          {canEdit && (
            <button onClick={handleAdd} className="btn-maroon">
              <i className="fas fa-plus" /> Add First Room
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {allocations.map((a: any) => {
            const isEditing = editing === a.id;
            const isSelected = selected.has(a.id);

            return (
              <div key={a.id} className={`item-card ${isEditing ? "editing" : ""}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(a.id)}
                      className="w-4 h-4 rounded accent-maroon cursor-pointer shrink-0"
                    />
                    {isEditing ? (
                      <input value={editData.guestName ?? a.guestName} onChange={(e) => setEditData({ ...editData, guestName: e.target.value })} className="card-input py-1.5 font-bold w-60" placeholder="Guest name" />
                    ) : (
                      <h4 className="font-bold text-base">{a.guestName || '\u2014'}</h4>
                    )}
                    {!isEditing && (
                      <span className={`status-badge ${a.status === "Checked In" ? "paid" : a.status === "Cancelled" ? "pending" : "planning"}`}>{a.status}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSave(a.id)} className="btn-save"><i className="fas fa-check mr-1" /> Save</button>
                        <button onClick={() => { setEditing(null); setEditData({}); }} className="btn-cancel">Cancel</button>
                      </>
                    ) : (
                      <>
                        {canEdit && (
                          <button onClick={() => { setEditing(a.id); setEditData({}); }} className="btn-edit"><i className="fas fa-pen mr-1" /> Edit</button>
                        )}
                        {canEdit && (
                          <button onClick={() => handleDelete(a.id)} className="btn-delete"><i className="fas fa-trash mr-1" /> Delete</button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Hotel</label>
                    {isEditing ? (
                      <input value={editData.hotel ?? a.hotel} onChange={(e) => setEditData({ ...editData, hotel: e.target.value })} className="card-input" placeholder="Hotel name" />
                    ) : (
                      <p className="text-sm">{a.hotel || '\u2014'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Room #</label>
                    {isEditing ? (
                      <input value={editData.roomNumber ?? a.roomNumber} onChange={(e) => setEditData({ ...editData, roomNumber: e.target.value })} className="card-input" placeholder="Room number" />
                    ) : (
                      <p className="text-sm font-medium">{a.roomNumber || '\u2014'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Room Type</label>
                    {isEditing ? (
                      <select value={editData.roomType ?? a.roomType} onChange={(e) => setEditData({ ...editData, roomType: e.target.value })} className="card-select">
                        <option>Standard</option><option>Deluxe</option><option>Suite</option><option>Executive</option><option>Presidential</option><option>Family</option><option>Twin</option>
                      </select>
                    ) : (
                      <p className="text-sm">{a.roomType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
                    {isEditing ? (
                      <select value={editData.status ?? a.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="card-select">
                        <option>Reserved</option><option>Checked In</option><option>Checked Out</option><option>Cancelled</option><option>No Show</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${a.status === "Checked In" ? "paid" : a.status === "Cancelled" ? "pending" : "planning"}`}>{a.status}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Check In</label>
                    {isEditing ? (
                      <DatePicker value={editData.checkIn ?? a.checkIn} min={new Date().toISOString().split("T")[0]} onChange={(val) => setEditData({ ...editData, checkIn: val })} />
                    ) : (
                      <p className="text-sm text-gray-600">{a.checkIn || '\u2014'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Check Out</label>
                    {isEditing ? (
                      <DatePicker value={editData.checkOut ?? a.checkOut} min={editData.checkIn || a.checkIn || new Date().toISOString().split("T")[0]} onChange={(val) => setEditData({ ...editData, checkOut: val })} />
                    ) : (
                      <p className="text-sm text-gray-600">{a.checkOut || '\u2014'}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notes</label>
                    <input value={editData.notes ?? a.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="card-input" placeholder="Add notes" />
                  </div>
                )}
              </div>
            );
          })}

          {canEdit && (
            <button onClick={() => setShowBulkAdd(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-maroon hover:text-maroon transition-colors cursor-pointer">
              <i className="fas fa-plus mr-1.5" /> Add More Rooms
            </button>
          )}
        </div>
      )}

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="rooms"
        onImport={async (items: any[]) => {
          await batchCreateRoomAllocations(weddingId, items);
          onUpdate();
          onToast(`${items.length} room(s) imported`, "success");
        }}
      />
    </div>
  );
}
