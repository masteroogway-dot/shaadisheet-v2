"use client";

import { useState } from "react";
import { updateGuest, createGuest, deleteGuest, batchCreateGuests, bulkDeleteGuests, bulkAddGuests } from "@/lib/actions";
import ImportModal from "@/components/ImportModal";

export default function GuestsView({ wedding, weddingId, onUpdate, onToast }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAddCount, setBulkAddCount] = useState<number>(0);
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const totalGuests = wedding.guests?.length || 0;
  const rsvpYes = wedding.guests?.filter((g: any) => g.rsvp === "Yes").length || 0;
  const pending = wedding.guests?.filter((g: any) => g.rsvp === "Pending").length || 0;
  const declined = wedding.guests?.filter((g: any) => g.rsvp === "Declined").length || 0;

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selected.length === (wedding.guests?.length || 0)) {
      setSelected([]);
    } else {
      setSelected(wedding.guests?.map((g: any) => g.id) || []);
    }
  };

  const handleSave = async (id: string) => {
    try {
      await updateGuest(weddingId, id, editData);
      setEditing(null);
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
      onUpdate();
      onToast("Guest deleted", "success");
    } catch {
      onToast("Failed to delete guest", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      await bulkDeleteGuests(weddingId, selected);
      setSelected([]);
      onUpdate();
      onToast(`${selected.length} guest(s) deleted`, "success");
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
      onToast(`${bulkAddCount} row${bulkAddCount > 1 ? "s" : ""} created`);
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
          <button onClick={() => setShowImport(true)} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg hover:shadow-md transition-all cursor-pointer">
            <i className="fas fa-file-import mr-1.5" /> Import Excel
          </button>
          <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add Guest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { num: totalGuests, label: "Total Invited", color: "" },
          { num: rsvpYes, label: "RSVP'd Yes", color: "text-green" },
          { num: pending, label: "Pending", color: "text-yellow" },
          { num: declined, label: "Declined", color: "text-red" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <span className={`text-3xl font-extrabold block mb-1 ${s.color}`}>{s.num}</span>
            <span className="text-sm text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      {totalGuests === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-users text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No guests yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start building your guest list and track RSVPs for your wedding.</p>
          <button onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add First Guest
          </button>
        </div>
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <span className="text-sm text-gray-500">{selected.length} selected</span>
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 transition-colors cursor-pointer">
              <i className="fas fa-trash-alt mr-1" /> Delete Selected ({selected.length})
            </button>
          )}
        </div>
        <table className="spreadsheet">
          <thead>
            <tr>
              <th className="w-12 text-center">
                <input
                  type="checkbox"
                  checked={selected.length === (wedding.guests?.length || 0) && (wedding.guests?.length || 0) > 0}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="w-12 text-center">#</th>
              <th>Guest Name</th>
              <th>Relation</th>
              <th>Side</th>
              <th>RSVP</th>
              <th>Dietary</th>
              <th>Notes</th>
              <th className="w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {wedding.guests?.map((g: any) => (
              <tr key={g.id}>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(g.id)}
                    onChange={() => toggleSelect(g.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="text-center text-gray-400">{g.order + 1}</td>
                <td className="font-semibold">{editing === g.id ? <input value={editData.name ?? g.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : g.name}</td>
                <td>{editing === g.id ? <input value={editData.relation ?? g.relation} onChange={(e) => setEditData({ ...editData, relation: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : g.relation}</td>
                <td>{editing === g.id ? (
                  <select value={editData.side ?? g.side} onChange={(e) => setEditData({ ...editData, side: e.target.value })} className="px-2 py-1 border rounded text-sm">
                    <option>Bride</option><option>Groom</option><option>Both</option>
                  </select>
                ) : g.side}</td>
                <td>{editing === g.id ? (
                  <select value={editData.rsvp ?? g.rsvp} onChange={(e) => setEditData({ ...editData, rsvp: e.target.value })} className="px-2 py-1 border rounded text-sm">
                    <option>Yes</option><option>Pending</option><option>Declined</option>
                  </select>
                ) : <span className={`status-badge ${g.rsvp === "Yes" ? "paid" : g.rsvp === "Pending" ? "planning" : "pending"}`}>{g.rsvp}</span>}</td>
                <td>{editing === g.id ? (
                  <select value={editData.dietary ?? g.dietary} onChange={(e) => setEditData({ ...editData, dietary: e.target.value })} className="px-2 py-1 border rounded text-sm">
                    <option>Veg</option><option>Non-Veg</option><option>Vegan</option><option>Jain</option>
                  </select>
                ) : g.dietary}</td>
                <td>{editing === g.id ? <input value={editData.notes ?? g.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="w-24 px-2 py-1 border rounded text-sm" /> : (g.notes || "\u2014")}</td>
                <td>
                  {editing === g.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleSave(g.id)} className="text-xs px-2 py-1 bg-green-500 text-white rounded cursor-pointer">Save</button>
                      <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(g.id); setEditData({}); }} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(g.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded cursor-pointer">Del</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-4 py-3 border-t border-gray-200">
          {showBulkAdd ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Add</span>
              <input
                type="number"
                min={1}
                value={bulkAddCount || ""}
                onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border rounded text-sm"
                placeholder="# rows"
              />
              <span className="text-sm text-gray-600">rows</span>
              <button onClick={handleBulkAdd} className="px-3 py-1 text-xs font-semibold text-white bg-maroon rounded hover:bg-maroon-light transition-colors cursor-pointer">
                Add
              </button>
              <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(0); }} className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setShowBulkAdd(true)} className="text-sm text-maroon font-semibold hover:underline cursor-pointer">
              <i className="fas fa-plus mr-1" /> Add Multiple Rows
            </button>
          )}
        </div>
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
