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
  const [guestSearch, setGuestSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCount, setBulkCount] = useState(1);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [rangeInput, setRangeInput] = useState("");

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
            if (i >= 1 && i <= tables.length) ids.add(tables[i - 1].id);
          }
        }
      } else {
        const n = Number(part);
        if (!isNaN(n) && n >= 1 && n <= tables.length) ids.add(tables[n - 1].id);
      }
    }
    setSelected(ids);
    setRangeInput("");
    if (ids.size > 0) onToast(`${ids.size} table${ids.size > 1 ? "s" : ""} selected`, "success");
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
      setShowBulkInput(false); setBulkCount(1); onUpdate(); onToast(`${bulkCount} table${bulkCount > 1 ? "s" : ""} added`, "success");
    } catch { onToast("Failed to add tables", "error"); }
  };

  const handleAutoAssign = async () => {
    if (tables.length === 0 || unassignedGuests.length === 0) return;
    const brideTables = tables.filter((t: any) => {
      let g: string[] = [];
      try { g = JSON.parse(t.guests || "[]"); } catch { g = []; }
      return g.length < (t.capacity || 8);
    });
    if (brideTables.length === 0) { onToast("No tables with space available", "error"); return; }

    let assigned = 0;
    for (const guest of unassignedGuests) {
      const side = guest.side === "Bride" ? "Bride" : guest.side === "Groom" ? "Groom" : "Both";
      let targetTable = brideTables.find((t: any) => {
        let g: string[] = [];
        try { g = JSON.parse(t.guests || "[]"); } catch { g = []; }
        if (g.length >= (t.capacity || 8)) return false;
        const tableName = (t.name || "").toLowerCase();
        if (side === "Bride" && (tableName.includes("bride") || tableName.includes("family"))) return true;
        if (side === "Groom" && (tableName.includes("groom") || tableName.includes("family"))) return true;
        return true;
      });
      if (!targetTable) targetTable = brideTables.find((t: any) => {
        let g: string[] = [];
        try { g = JSON.parse(t.guests || "[]"); } catch { g = []; }
        return g.length < (t.capacity || 8);
      });
      if (!targetTable) break;

      let currentGuests: string[] = [];
      try { currentGuests = JSON.parse(targetTable.guests || "[]"); } catch { currentGuests = []; }
      currentGuests.push(guest.name);
      await updateSeatingTable(weddingId, targetTable.id, { guests: JSON.stringify(currentGuests) });
      assigned++;
      if (currentGuests.length >= (targetTable.capacity || 8)) {
        const idx = brideTables.indexOf(targetTable);
        if (idx > -1) brideTables.splice(idx, 1);
      }
    }
    if (assigned > 0) { onUpdate(); onToast(`Auto-assigned ${assigned} guest${assigned > 1 ? "s" : ""}`, "success"); }
    else { onToast("Could not auto-assign guests", "error"); }
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
  const unassignedLocal = unassignedGuests.filter((g: any) => g.accommodation === "Local / Floating");
  const unassignedOutstation = unassignedGuests.filter((g: any) => g.accommodation !== "Local / Floating");

  const totalSeats = tables.reduce((s: number, t: any) => s + (t.capacity || 0), 0);
  const filledSeats = tables.reduce((s: number, t: any) => {
    let g: string[] = [];
    try { g = JSON.parse(t.guests || "[]"); } catch { g = []; }
    return s + g.length;
  }, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-7">
        <div>
          <h2 className="text-2xl font-bold">Seating Chart</h2>
          <p className="text-gray-500 text-sm">Plan where every guest sits</p>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          {canEdit && selected.size > 0 && (
            <button onClick={handleBulkDelete} className="btn-delete">
              <i className="fas fa-trash mr-1.5" /> Delete Selected ({selected.size})
            </button>
          )}
          {canEdit && tables.length > 0 && (
            <>
              <button onClick={toggleSelectAll} className="btn-edit text-xs py-2 px-3">
                <i className="fas fa-check-double mr-1.5" /> {selected.size === tables.length ? "Deselect All" : "Select All"}
              </button>
              <div className="flex items-center gap-1.5">
                <input
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectRange()}
                  placeholder="e.g. 5-10, 3"
                  className="card-input py-1.5 text-xs w-36"
                />
                <button onClick={handleSelectRange} className="btn-edit text-xs py-2 px-2.5"><i className="fas fa-arrow-right" /></button>
              </div>
            </>
          )}
          {canEdit && unassignedGuests.length > 0 && tables.length > 0 && (
            <button onClick={handleAutoAssign} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
              <i className="fas fa-wand-magic-sparkles mr-1.5" /> Auto-Assign
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
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">Add how many tables?</span>
          <input type="number" min={1} value={bulkCount} onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)} className="card-input w-20 py-1.5 text-center" autoFocus onKeyDown={(e) => e.key === "Enter" && handleBulkAdd()} />
          <button onClick={handleBulkAdd} className="btn-maroon text-xs py-2 px-3">Add</button>
          <button onClick={() => { setShowBulkInput(false); setBulkCount(1); }} className="btn-cancel text-xs py-2 px-3">Cancel</button>
        </div>
      )}

      {unassignedGuests.length > 0 && (
        <div className="space-y-3 mb-5">
          {unassignedOutstation.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h4 className="font-bold text-sm mb-3">
                <i className="fas fa-plane mr-1.5 text-purple-500" />
                Unassigned Guests — Outstation ({unassignedOutstation.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {unassignedOutstation.map((g: any) => (
                  <span key={g.id} className="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-medium text-purple-800 truncate max-w-[150px]">{g.name}</span>
                ))}
              </div>
            </div>
          )}
          {unassignedLocal.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h4 className="font-bold text-sm mb-3">
                <i className="fas fa-home mr-1.5 text-blue-500" />
                Local / Floating Guests — Unassigned ({unassignedLocal.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {unassignedLocal.map((g: any) => (
                  <span key={g.id} className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-800 truncate max-w-[150px]">{g.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tables.map((table: any, idx: number) => {
          let tableGuests: string[] = [];
          try { tableGuests = JSON.parse(table.guests || "[]"); } catch { tableGuests = []; }
          const isEditing = editing === table.id;
          const fillPct = table.capacity > 0 ? Math.round((tableGuests.length / table.capacity) * 100) : 0;

          return (
            <div key={table.id} className={`item-card ${isEditing ? "editing" : ""}`}>
              {/* Header row: checkbox, row number, name, count */}
              <div className="flex items-center gap-2 mb-2">
                {canEdit && (
                  <input
                    type="checkbox"
                    checked={selected.has(table.id)}
                    onChange={() => toggleSelect(table.id)}
                    className="w-4 h-4 shrink-0 rounded accent-maroon cursor-pointer"
                  />
                )}
                <span className="text-[0.6rem] font-bold text-gray-400 bg-gray-100 rounded px-1 py-0.5 leading-none shrink-0">{idx + 1}</span>
                {isEditing ? (
                  <input value={editData.name ?? table.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="card-input py-1 font-bold text-sm flex-1 min-w-0" placeholder="Table name" />
                ) : (
                  <h4 className="font-bold text-sm truncate min-w-0 flex-1">{table.name}</h4>
                )}
                <span className="text-[0.65rem] font-semibold text-gray-400 shrink-0">{tableGuests.length}/{table.capacity}</span>
              </div>

              {isEditing && (
                <div className="mb-3">
                  <input type="number" value={editData.capacity ?? table.capacity} onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) || 8 })} className="card-input py-1.5 text-sm" placeholder="Capacity" />
                </div>
              )}

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-maroon to-gold rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                </div>
              </div>

              {/* Dietary breakdown */}
              {tableGuests.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(() => {
                    const counts: Record<string, number> = {};
                    tableGuests.forEach((gn: string) => {
                      const gObj = guests.find((g: any) => g.name === gn);
                      const d = gObj?.dietary || "Veg";
                      counts[d] = (counts[d] || 0) + 1;
                    });
                    return Object.entries(counts).map(([diet, count]) => (
                      <span key={diet} className={`text-[0.55rem] font-semibold px-1.5 py-0.5 rounded-full ${diet === "Veg" ? "bg-green-100 text-green-700" : diet === "Non-Veg" ? "bg-red-100 text-red-700" : diet === "Jain" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                        {count} {diet}
                      </span>
                    ));
                  })()}
                </div>
              )}

              {/* Guest tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tableGuests.length > 0 ? (
                  tableGuests.map((g, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium flex items-center gap-1 truncate max-w-[130px]">
                      {g}
                      {canEdit && <button onClick={() => handleRemoveGuestFromTable(table, i)} className="text-gray-400 hover:text-red-500 cursor-pointer ml-0.5"><i className="fas fa-times text-[0.55rem]" /></button>}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 bg-gray-50 rounded-full text-xs font-medium text-gray-400">Empty</span>
                )}
              </div>

              {/* Add guest search */}
              {addingGuest === table.id && (
                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="relative">
                    <input
                      value={guestSearch}
                      onChange={(e) => { setGuestSearch(e.target.value); setNewGuestName(""); }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") { setAddingGuest(null); setGuestSearch(""); setNewGuestName(""); }
                      }}
                      placeholder="Search guest name..."
                      className="card-input py-1.5 text-xs"
                      autoFocus
                    />
                    {guestSearch && guestSearch !== newGuestName && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {guests
                          .filter((g: any) => g.name.toLowerCase().includes(guestSearch.toLowerCase()))
                          .filter((g: any) => {
                            let currentGuests: string[] = [];
                            try { currentGuests = JSON.parse(table.guests || "[]"); } catch { currentGuests = []; }
                            return !currentGuests.includes(g.name);
                          })
                          .slice(0, 8)
                          .map((g: any) => (
                            <button
                              key={g.id}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-maroon/5 cursor-pointer flex items-center gap-2"
                              onClick={() => { setNewGuestName(g.name); setGuestSearch(g.name); }}
                            >
                              <span className="truncate">{g.name}</span>
                              <span className="text-[0.6rem] text-gray-400 shrink-0">{g.rsvp || "pending"}</span>
                            </button>
                          ))}
                        {guests.filter((g: any) => g.name.toLowerCase().includes(guestSearch.toLowerCase())).length === 0 && (
                          <div className="px-3 py-1.5 text-xs text-gray-400">No matches</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { handleAddGuestToTable(table); setGuestSearch(""); }} disabled={!newGuestName.trim()} className="btn-save text-xs py-1.5 px-3 disabled:opacity-40">Add</button>
                    <button onClick={() => { setAddingGuest(null); setGuestSearch(""); setNewGuestName(""); }} className="btn-cancel text-xs py-1.5 px-3">Cancel</button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-1.5">
                {isEditing ? (
                  <>
                    {canEdit && <button onClick={() => handleSaveTable(table.id)} className="btn-save text-xs py-1.5 px-4">Save</button>}
                    <button onClick={() => setEditing(null)} className="btn-cancel text-xs py-1.5 px-3">Cancel</button>
                  </>
                ) : (
                  <>
                    {canEdit && <button onClick={() => setAddingGuest(table.id)} className="btn-edit text-xs py-1.5 px-3"><i className="fas fa-plus mr-1" />Guest</button>}
                    {canEdit && <button onClick={() => { setEditing(table.id); setEditData({}); }} className="btn-edit text-xs py-1.5 px-3">Edit</button>}
                    {canEdit && <button onClick={() => handleDeleteTable(table.id)} className="btn-delete text-xs py-1.5 px-3">Del</button>}
                  </>
                )}
              </div>
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
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chair text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No tables yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Create seating tables and assign guests for your wedding.</p>
          {canEdit && (
            <div className="flex flex-wrap gap-3 justify-center">
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
