"use client";

import { useState } from "react";
import { createSeatingTable, updateSeatingTable, deleteSeatingTable, bulkDeleteSeatingTables, bulkAddSeatingTables } from "@/lib/actions";

export default function SeatingView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void; canEdit?: boolean }) {
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
    } catch (e) {
      console.error("Failed to add table:", e);
      onToast("Failed to add table", "error");
    }
  };

  const handleSaveTable = async (id: string) => {
    try {
      await updateSeatingTable(weddingId, id, editData);
      setEditing(null);
      setEditData({});
      onUpdate();
      onToast("Table updated", "success");
    } catch {
      onToast("Failed to update table", "error");
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await deleteSeatingTable(weddingId, id);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
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

  const totalSeats = tables.reduce((s: number, t: any) => s + (t.capacity || 0), 0);
  const filledSeats = tables.reduce((s: number, t: any) => {
    let g: string[] = [];
    try { g = JSON.parse(t.guests || "[]"); } catch { g = []; }
    return s + g.length;
  }, 0);

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Seating Chart</h2>
          <p className="text-gray-500 text-sm">Plan where every guest sits</p>
        </div>
        <div className="flex gap-2.5 items-center">
          {canEdit && selected.size > 0 && (
            <button onClick={handleBulkDelete} className="btn-delete">
              <i className="fas fa-trash mr-1.5" /> Delete Selected ({selected.size})
            </button>
          )}
          {canEdit && (
            <button onClick={handleAddTable} className="btn-maroon">
              <i className="fas fa-plus" /> Add Table
            </button>
          )}
        </div>
      </div>

      {tables.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold block">{tables.length}</span>
            <span className="text-xs text-gray-500">Tables</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold block">{filledSeats} / {totalSeats}</span>
            <span className="text-xs text-gray-500">Seats Filled</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold text-yellow block">{unassignedGuests.length}</span>
            <span className="text-xs text-gray-500">Unassigned</span>
          </div>
        </div>
      )}

      {showBulkInput && canEdit && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">Add how many tables?</span>
          <input type="number" min={1} value={bulkCount} onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)} className="card-input w-20 py-1.5 text-center" autoFocus onKeyDown={(e) => e.key === "Enter" && handleBulkAdd()} />
          <button onClick={handleBulkAdd} className="btn-maroon text-xs py-1.5 px-3">Add</button>
          <button onClick={() => { setShowBulkInput(false); setBulkCount(1); }} className="btn-cancel text-xs py-1.5 px-3">Cancel</button>
        </div>
      )}

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
          const isEditing = editing === table.id;
          const fillPct = table.capacity > 0 ? Math.round((tableGuests.length / table.capacity) * 100) : 0;

          return (
            <div key={table.id} className={`item-card ${isEditing ? "editing" : ""} relative`}>
              <div className="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={selected.has(table.id)}
                  onChange={() => toggleSelect(table.id)}
                  className="w-4 h-4 rounded accent-maroon cursor-pointer"
                />
              </div>

              {isEditing ? (
                <div className="space-y-2 mb-4 ml-7">
                  <input value={editData.name ?? table.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="card-input py-1.5 font-bold" placeholder="Table name" />
                  <input type="number" value={editData.capacity ?? table.capacity} onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) || 8 })} className="card-input py-1.5" placeholder="Capacity" />
                </div>
              ) : (
                <div className="flex items-center justify-between mb-1 ml-7">
                  <h4 className="font-bold text-base">{table.name}</h4>
                  <span className="text-xs text-gray-400">{tableGuests.length}/{table.capacity}</span>
                </div>
              )}

              <div className="ml-7 mb-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-maroon to-gold rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                </div>
                <span className="text-xs text-gray-400 mt-1 block">{tableGuests.length} / {table.capacity} seats filled</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3 ml-7">
                {tableGuests.length > 0 ? (
                  tableGuests.map((g, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium flex items-center gap-1">
                      {g}
                      {canEdit && <button onClick={() => handleRemoveGuestFromTable(table, i)} className="text-gray-400 hover:text-red-500 cursor-pointer ml-0.5"><i className="fas fa-times text-[0.6rem]" /></button>}
                    </span>
                  ))
                ) : (
                  <span className="px-2.5 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-400">Empty</span>
                )}
              </div>

              {addingGuest === table.id ? (
                <div className="flex gap-1.5 ml-7">
                  <input value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddGuestToTable(table)} placeholder="Guest name" className="card-input flex-1 py-1 text-xs" autoFocus />
                  <button onClick={() => handleAddGuestToTable(table)} className="btn-save text-xs py-1 px-2.5">Add</button>
                  <button onClick={() => { setAddingGuest(null); setNewGuestName(""); }} className="btn-cancel text-xs py-1 px-2.5">X</button>
                </div>
              ) : (
                <div className="flex gap-1.5 mt-2 ml-7">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSaveTable(table.id)} className="btn-save text-xs py-1 px-3">Save</button>
                      <button onClick={() => setEditing(null)} className="btn-cancel text-xs py-1 px-3">Cancel</button>
                    </>
                  ) : (
                    <>
                      {canEdit && <button onClick={() => setAddingGuest(table.id)} className="btn-edit text-xs py-1 px-3"><i className="fas fa-plus mr-1" />Guest</button>}
                      {canEdit && <button onClick={() => { setEditing(table.id); setEditData({}); }} className="btn-edit text-xs py-1 px-3">Edit</button>}
                      {canEdit && <button onClick={() => handleDeleteTable(table.id)} className="btn-delete text-xs py-1 px-3">Del</button>}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {tables.length > 0 && canEdit && (
          <>
            <button onClick={handleAddTable} className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-maroon hover:text-maroon transition-colors cursor-pointer min-h-[120px]">
              <i className="fas fa-plus text-xl" />
              <span className="text-sm font-semibold">Add Table</span>
            </button>
            {showBulkInput ? null : (
              <button onClick={() => setShowBulkInput(true)} className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-maroon hover:text-maroon transition-colors cursor-pointer min-h-[120px]">
                <i className="fas fa-layer-group text-xl" />
                <span className="text-sm font-semibold">Add Multiple</span>
              </button>
            )}
          </>
        )}
      </div>

      {tables.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chair text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No tables yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Create seating tables and assign guests for your wedding.</p>
          {canEdit && (
            <div className="flex gap-3 justify-center">
              <button onClick={handleAddTable} className="btn-maroon">
                <i className="fas fa-plus" /> Add First Table
              </button>
              <button onClick={() => setShowBulkInput(true)} className="btn-cancel">
                <i className="fas fa-layer-group mr-1.5" /> Add Multiple
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
