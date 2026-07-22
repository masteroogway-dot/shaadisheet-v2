"use client";

import { useState } from "react";
import { updateGuest, createGuest, deleteGuest, batchCreateGuests, bulkDeleteGuests, bulkAddGuests } from "@/lib/actions";
import ImportModal from "@/components/ImportModal";

export default function GuestsView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void; canEdit?: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAddCount, setBulkAddCount] = useState<number>(5);
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const guests = wedding.guests || [];
  const totalGuests = guests.length;
  const rsvpYes = guests.filter((g: any) => g.rsvp === "Yes").length;
  const pending = guests.filter((g: any) => g.rsvp === "Pending").length;
  const declined = guests.filter((g: any) => g.rsvp === "Declined").length;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === guests.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(guests.map((g: any) => g.id)));
    }
  };

  const handleSave = async (id: string) => {
    try {
      await updateGuest(weddingId, id, editData);
      setEditing(null);
      setEditData({});
      onUpdate();
      onToast("Guest updated", "success");
    } catch {
      onToast("Failed to update guest", "error");
    }
  };

  const handleAdd = async () => {
    try {
      await createGuest(weddingId, { name: "New Guest", relation: "Friend", side: "Bride", rsvp: "Pending", dietary: "Veg", tableNum: 0, giftGiven: "No", thankYou: "No", notes: "" });
      onUpdate();
      onToast("Guest added", "success");
    } catch {
      onToast("Failed to add guest", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGuest(weddingId, id);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      onUpdate();
      onToast("Guest deleted", "success");
    } catch {
      onToast("Failed to delete guest", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    try {
      await bulkDeleteGuests(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`${selected.size} guest(s) deleted`, "success");
    } catch {
      onToast("Failed to delete guests", "error");
    }
  };

  const handleBulkAdd = async () => {
    if (bulkAddCount <= 0) return;
    try {
      await bulkAddGuests(weddingId, bulkAddCount);
      setShowBulkAdd(false);
      setBulkAddCount(5);
      onUpdate();
      onToast(`${bulkAddCount} row${bulkAddCount > 1 ? "s" : ""} created`, "success");
    } catch {
      onToast("Failed to add rows", "error");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Guest List & RSVP</h2>
          <p className="text-gray-500 text-sm">Track every guest {'\u2014'} RSVP, dietary needs, gifts</p>
        </div>
        <div className="flex gap-2.5">
          {canEdit && (
            <>
              <button onClick={() => setShowImport(true)} className="btn-maroon">
                <i className="fas fa-file-import" /> Import
              </button>
              <button onClick={handleAdd} className="btn-maroon">
                <i className="fas fa-plus" /> Add Guest
              </button>
            </>
          )}
        </div>
      </div>

      {totalGuests > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { num: totalGuests, label: "Total Invited", color: "" },
            { num: rsvpYes, label: "RSVP'd Yes", color: "text-green" },
            { num: pending, label: "Pending", color: "text-yellow" },
            { num: declined, label: "Declined", color: "text-red" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <span className={`text-2xl font-extrabold block mb-1 ${s.color}`}>{s.num}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {selected.size > 0 && canEdit && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={handleBulkDelete} className="btn-delete text-xs py-1 px-3">
            <i className="fas fa-trash mr-1" /> Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Clear</button>
        </div>
      )}

      {showBulkAdd && canEdit && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">Add how many guests?</span>
          <input type="number" min={1} max={500} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="card-input w-20 py-1.5 text-center" />
          <button onClick={handleBulkAdd} className="btn-maroon text-xs py-1.5 px-3">Add</button>
          <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(5); }} className="btn-cancel text-xs py-1.5 px-3">Cancel</button>
        </div>
      )}

      {totalGuests === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-users text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No guests yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start building your guest list and track RSVPs for your wedding.</p>
          {canEdit && (
            <button onClick={handleAdd} className="btn-maroon">
              <i className="fas fa-plus" /> Add First Guest
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {guests.map((g: any) => {
            const isEditing = editing === g.id;
            const isSelected = selected.has(g.id);

            return (
              <div key={g.id} className={`item-card ${isEditing ? "editing" : ""}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(g.id)}
                      className="w-4 h-4 rounded accent-maroon cursor-pointer shrink-0"
                    />
                    {isEditing ? (
                      <input value={editData.name ?? g.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="card-input py-1.5 font-bold w-60" placeholder="Guest name" />
                    ) : (
                      <h4 className="font-bold text-base">{g.name}</h4>
                    )}
                    {!isEditing && (
                      <span className={`status-badge ${g.rsvp === "Yes" ? "paid" : g.rsvp === "Pending" ? "planning" : "pending"}`}>{g.rsvp}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSave(g.id)} className="btn-save"><i className="fas fa-check mr-1" /> Save</button>
                        <button onClick={() => { setEditing(null); setEditData({}); }} className="btn-cancel">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditing(g.id); setEditData({}); }} className="btn-edit"><i className="fas fa-pen mr-1" /> Edit</button>
                        {canEdit && (
                          <button onClick={() => handleDelete(g.id)} className="btn-delete"><i className="fas fa-trash mr-1" /> Delete</button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Relation</label>
                    {isEditing ? (
                      <input value={editData.relation ?? g.relation} onChange={(e) => setEditData({ ...editData, relation: e.target.value })} className="card-input" placeholder="e.g. Friend, Family" />
                    ) : (
                      <p className="text-sm">{g.relation}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Side</label>
                    {isEditing ? (
                      <select value={editData.side ?? g.side} onChange={(e) => setEditData({ ...editData, side: e.target.value })} className="card-select">
                        <option>Bride</option><option>Groom</option><option>Both</option>
                      </select>
                    ) : (
                      <p className="text-sm">{g.side}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">RSVP</label>
                    {isEditing ? (
                      <select value={editData.rsvp ?? g.rsvp} onChange={(e) => setEditData({ ...editData, rsvp: e.target.value })} className="card-select">
                        <option>Yes</option><option>Pending</option><option>Declined</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${g.rsvp === "Yes" ? "paid" : g.rsvp === "Pending" ? "planning" : "pending"}`}>{g.rsvp}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Dietary</label>
                    {isEditing ? (
                      <select value={editData.dietary ?? g.dietary} onChange={(e) => setEditData({ ...editData, dietary: e.target.value })} className="card-select">
                        <option>Veg</option><option>Non-Veg</option><option>Vegan</option><option>Jain</option>
                      </select>
                    ) : (
                      <p className="text-sm">{g.dietary}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notes</label>
                    <input value={editData.notes ?? g.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="card-input" placeholder="Add notes" />
                  </div>
                )}
              </div>
            );
          })}

          {canEdit && (
            <button onClick={() => setShowBulkAdd(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-maroon hover:text-maroon transition-colors cursor-pointer">
              <i className="fas fa-plus mr-1.5" /> Add More Guests
            </button>
          )}
        </div>
      )}

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="guests"
        onImport={async (items: any[]) => {
          try {
            await batchCreateGuests(weddingId, items);
            onUpdate();
            onToast(`${items.length} guest(s) imported`, "success");
          } catch {
            onToast("Failed to import guests", "error");
          }
        }}
      />
    </div>
  );
}
