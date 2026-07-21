"use client";

import { useState } from "react";
import { createSeatingTable, updateSeatingTable, deleteSeatingTable, bulkDeleteSeatingTables, bulkAddSeatingTables } from "@/lib/actions";

export default function SeatingView({ wedding, weddingId, onUpdate, onToast }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void }) {
  const tables = wedding.seatingTables || [];
  const guests = wedding.guests || [];
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [addingGuest, setAddingGuest] = useState<string | null>(null);
  const [newGuestName, setNewGuestName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCount, setBulkCount] = useState(1);
  const [showBulkInput, setShowBulkInput] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === tables.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tables.map((t: any) => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const count = selected.size;
    try {
      await bulkDeleteSeatingTables(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`${count} table${count > 1 ? "s" : ""} deleted`, "success");
    } catch {
      onToast("Failed to delete tables", "error");
    }
  };

  const handleBulkAdd = async () => {
    if (bulkCount < 1) return;
    try {
      await bulkAddSeatingTables(weddingId, bulkCount);
      setShowBulkInput(false);
      setBulkCount(1);
      onUpdate();
      onToast(`${bulkCount} table${bulkCount > 1 ? "s" : ""} added`, "success");
    } catch {
      onToast("Failed to add tables", "error");
    }
  };

  const handleAddTable = async () => {
    try {
      await createSeatingTable(weddingId, { name: "New Table", capacity: 8, guests: "[]" });
      onUpdate();
      onToast("Table added", "success");
    } catch {
      onToast("Failed to add table", "error");
    }
  };

  const handleSaveTable = async (id: string) => {
    try {
      await updateSeatingTable(weddingId, id, editData);
      setEditing(null);
      onUpdate();
      onToast("Table updated", "success");
    } catch {
      onToast("Failed to update table", "error");
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await deleteSeatingTable(weddingId, id);
      onUpdate();
      onToast("Table deleted", "success");
    } catch {
      onToast("Failed to delete table", "error");
    }
  };

  const handleAddGuestToTable = async (table: any) => {
    if (!newGuestName.trim()) return;
    let currentGuests: string[] = [];
    try { currentGuests = JSON.parse(table.guests || "[]"); } catch { currentGuests = []; }
    currentGuests.push(newGuestName.trim());
    try {
      await updateSeatingTable(weddingId, table.id, { guests: JSON.stringify(currentGuests) });
      setNewGuestName("");
      setAddingGuest(null);
      onUpdate();
      onToast("Guest added to table", "success");
    } catch {
      onToast("Failed to add guest", "error");
    }
  };

  const handleRemoveGuestFromTable = async (table: any, guestIdx: number) => {
    let currentGuests: string[] = [];
    try { currentGuests = JSON.parse(table.guests || "[]"); } catch { currentGuests = []; }
    currentGuests.splice(guestIdx, 1);
    try {
      await updateSeatingTable(weddingId, table.id, { guests: JSON.stringify(currentGuests) });
      onUpdate();
      onToast("Guest removed from table", "success");
    } catch {
      onToast("Failed to remove guest", "error");
    }
  };

  const unassignedGuests = guests.filter((g: any) => {
    for (const t of tables) {
      let tGuests: string[] = [];
      try { tGuests = JSON.parse(t.guests || "[]"); } catch { tGuests = []; }
      if (tGuests.includes(g.name)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Seating Chart</h2>
          <p className="text-gray-500 text-sm">Plan where every guest sits</p>
        </div>
        <div className="flex gap-2 items-center">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
              <i className="fas fa-trash mr-1.5" /> Delete Selected ({selected.size})
            </button>
          )}
          {showBulkInput ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={bulkCount}
                onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 border rounded text-sm"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleBulkAdd()}
              />
              <button onClick={handleBulkAdd} className="px-3 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">Add</button>
              <button onClick={() => { setShowBulkInput(false); setBulkCount(1); }} className="px-3 py-2 text-sm font-semibold bg-gray-200 rounded-lg transition-colors cursor-pointer">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowBulkInput(true)} className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
              <i className="fas fa-layer-group mr-1.5" /> Add Multiple
            </button>
          )}
          <button onClick={handleAddTable} className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add Table
          </button>
        </div>
      </div>

      {unassignedGuests.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <h4 className="font-bold text-sm mb-3">Unassigned Guests ({unassignedGuests.length})</h4>
          <div className="flex flex-wrap gap-1.5">
            {unassignedGuests.map((g: any) => (
              <span key={g.id} className="px-2.5 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-medium text-yellow-800">{g.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tables.map((table: any) => {
          let tableGuests: string[] = [];
          try { tableGuests = JSON.parse(table.guests || "[]"); } catch { tableGuests = []; }
          return (
            <div key={table.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative">
              <div className="absolute top-3 left-3">
                <input
                  type="checkbox"
                  checked={selected.has(table.id)}
                  onChange={() => toggleSelect(table.id)}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
              {editing === table.id ? (
                <div className="space-y-2 mb-3 ml-6">
                  <input value={editData.name ?? table.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm font-bold" placeholder="Table name" />
                  <input type="number" value={editData.capacity ?? table.capacity} onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) || 8 })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Capacity" />
                </div>
              ) : (
                <div className="flex items-center justify-between mb-1 ml-6">
                  <h4 className="font-bold">{table.name}</h4>
                  <span className="text-xs text-gray-400">{tableGuests.length} / {table.capacity}</span>
                </div>
              )}
              <div className="text-sm text-gray-500 mb-3 ml-6">{tableGuests.length} / {table.capacity} seats filled</div>
              <div className="flex flex-wrap gap-1.5 mb-3 ml-6">
                {tableGuests.length > 0 ? (
                  tableGuests.map((g, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium flex items-center gap-1">
                      {g}
                      <button onClick={() => handleRemoveGuestFromTable(table, i)} className="text-gray-400 hover:text-red-500 cursor-pointer ml-0.5"><i className="fas fa-times text-[0.6rem]" /></button>
                    </span>
                  ))
                ) : (
                  <span className="px-2.5 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-400">Empty</span>
                )}
              </div>
              {addingGuest === table.id ? (
                <div className="flex gap-1.5 ml-6">
                  <input value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddGuestToTable(table)} placeholder="Guest name" className="flex-1 px-2 py-1 border rounded text-xs" autoFocus />
                  <button onClick={() => handleAddGuestToTable(table)} className="text-xs px-2 py-1 bg-green-500 text-white rounded cursor-pointer">Add</button>
                  <button onClick={() => { setAddingGuest(null); setNewGuestName(""); }} className="text-xs px-2 py-1 bg-gray-200 rounded cursor-pointer">X</button>
                </div>
              ) : (
                <div className="flex gap-1.5 mt-2 ml-6">
                  {editing === table.id ? (
                    <>
                      <button onClick={() => handleSaveTable(table.id)} className="text-xs px-3 py-1 bg-green-500 text-white rounded cursor-pointer">Save</button>
                      <button onClick={() => setEditing(null)} className="text-xs px-3 py-1 bg-gray-200 rounded cursor-pointer">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setAddingGuest(table.id)} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer"><i className="fas fa-plus mr-1" />Guest</button>
                      <button onClick={() => { setEditing(table.id); setEditData({}); }} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer">Edit</button>
                      <button onClick={() => handleDeleteTable(table.id)} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded cursor-pointer">Del</button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tables.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={tables.length > 0 && selected.size === tables.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm text-gray-500">Select all ({tables.length})</span>
        </div>
      )}
    </div>
  );
}
