"use client";

import { useState } from "react";
import { updateGuest, createGuest, deleteGuest, batchCreateGuests, bulkDeleteGuests, bulkAddGuests, getRsvpToken } from "@/lib/actions";
import { exportToCSV } from "@/lib/export";
import ImportModal from "@/components/ImportModal";

export default function GuestsView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error", options?: { undoAction?: () => void }) => void; canEdit?: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAddCount, setBulkAddCount] = useState<number>(5);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [rangeInput, setRangeInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterSide, setFilterSide] = useState("All");
  const [filterRsvp, setFilterRsvp] = useState("All");
  const [filterDietary, setFilterDietary] = useState("All");
  const [rsvpLink, setRsvpLink] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const guests = wedding.guests || [];
  const filteredGuests = guests.filter((g: any) => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSide !== "All" && g.side !== filterSide) return false;
    if (filterRsvp !== "All" && g.rsvp !== filterRsvp) return false;
    if (filterDietary !== "All" && g.dietary !== filterDietary) return false;
    return true;
  });
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
            if (i >= 1 && i <= guests.length) ids.add(guests[i - 1].id);
          }
        }
      } else {
        const n = Number(part);
        if (!isNaN(n) && n >= 1 && n <= guests.length) ids.add(guests[n - 1].id);
      }
    }
    setSelected(ids);
    setRangeInput("");
    if (ids.size > 0) onToast(`${ids.size} guest${ids.size > 1 ? "s" : ""} selected`, "success");
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
    const guest = guests.find((g: any) => g.id === id);
    try {
      await deleteGuest(weddingId, id);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      onUpdate();
      onToast("Guest deleted", "success", guest ? {
        undoAction: async () => {
          try {
            await createGuest(weddingId, { name: guest.name, relation: guest.relation, side: guest.side, rsvp: guest.rsvp, dietary: guest.dietary, tableNum: guest.tableNum || 0, giftGiven: guest.giftGiven || "No", thankYou: guest.thankYou || "No", notes: guest.notes || "" });
            onUpdate();
            onToast("Guest restored", "success");
          } catch {
            onToast("Failed to restore guest", "error");
          }
        }
      } : undefined);
    } catch {
      onToast("Failed to delete guest", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const toDelete = guests.filter((g: any) => selected.has(g.id));
    try {
      await bulkDeleteGuests(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`${toDelete.length} guest(s) deleted`, "success", {
        undoAction: async () => {
          try {
            await batchCreateGuests(weddingId, toDelete.map((g: any) => ({ name: g.name, relation: g.relation, side: g.side, rsvp: g.rsvp, dietary: g.dietary, tableNum: g.tableNum || 0, giftGiven: g.giftGiven || "No", thankYou: g.thankYou || "No", notes: g.notes || "" })));
            onUpdate();
            onToast("Guests restored", "success");
          } catch {
            onToast("Failed to restore guests", "error");
          }
        }
      });
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

  const handleShareRsvp = async () => {
    try {
      const token = await getRsvpToken(weddingId);
      const link = `${window.location.origin}/rsvp/${token}`;
      setRsvpLink(link);
      await navigator.clipboard.writeText(link);
      onToast("RSVP link copied to clipboard!", "success");
    } catch {
      onToast("Failed to generate link", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-7">
        <div>
          <h2 className="text-2xl font-bold">Guest List & RSVP</h2>
          <p className="text-gray-500 text-sm">Track every guest {'\u2014'} RSVP, dietary needs, gifts</p>
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          {canEdit && guests.length > 0 && (
            <>
              <button onClick={toggleSelectAll} className="btn-edit text-xs py-2 px-3">
                <i className="fas fa-check-double mr-1.5" /> {selected.size === guests.length ? "Deselect All" : "Select All"}
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
          {canEdit && (
            <>
              <button onClick={handleShareRsvp} className="btn-edit text-xs py-2 px-3">
                <i className="fas fa-share-nodes mr-1.5" /> Share RSVP Link
              </button>
              <button onClick={() => exportToCSV(filteredGuests.map((g: any, i: number) => ({ "#": i + 1, Name: g.name, Relation: g.relation, Side: g.side, RSVP: g.rsvp, Dietary: g.dietary, Notes: g.notes || "" })), "guests")} className="btn-edit text-xs py-2 px-3">
                <i className="fas fa-download mr-1.5" /> Export
              </button>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      {totalGuests > 0 && (
        <div className="mb-5 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guests..."
                className="w-full py-2 pl-9 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-maroon"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs">
                  <i className="fas fa-times" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer shrink-0 ${
                showFilters || filterSide !== "All" || filterRsvp !== "All" || filterDietary !== "All"
                  ? "bg-maroon text-white border-maroon"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <i className="fas fa-filter text-xs" />
              Filters
              {(filterSide !== "All" || filterRsvp !== "All" || filterDietary !== "All") && (
                <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              )}
            </button>
            {(search || filterSide !== "All" || filterRsvp !== "All" || filterDietary !== "All") && (
              <button onClick={() => { setSearch(""); setFilterSide("All"); setFilterRsvp("All"); setFilterDietary("All"); }} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                <i className="fas fa-times mr-1" /> Clear
              </button>
            )}
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <select value={filterSide} onChange={(e) => setFilterSide(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-maroon">
                <option value="All">All Sides</option>
                <option value="Bride">Bride</option>
                <option value="Groom">Groom</option>
                <option value="Both">Both</option>
              </select>
              <select value={filterRsvp} onChange={(e) => setFilterRsvp(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-maroon">
                <option value="All">All RSVP</option>
                <option value="Yes">Yes</option>
                <option value="Pending">Pending</option>
                <option value="Declined">Declined</option>
              </select>
              <select value={filterDietary} onChange={(e) => setFilterDietary(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-maroon">
                <option value="All">All Dietary</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
                <option value="Jain">Jain</option>
              </select>
            </div>
          )}
        </div>
      )}

      {selected.size > 0 && canEdit && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={handleBulkDelete} className="btn-delete text-xs py-2 px-3">
            <i className="fas fa-trash mr-1" /> Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Clear</button>
        </div>
      )}

      {showBulkAdd && canEdit && (
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">Add how many guests?</span>
          <input type="number" min={1} max={500} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="card-input w-20 py-1.5 text-center" />
          <button onClick={handleBulkAdd} className="btn-maroon text-xs py-2 px-4">Add</button>
          <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(5); }} className="btn-cancel text-xs py-2 px-4">Cancel</button>
        </div>
      )}

      {totalGuests === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-16 text-center">
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
          {filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No guests match your filters</div>
          ) : filteredGuests.map((g: any, idx: number) => {
            const isEditing = editing === g.id;
            const isSelected = selected.has(g.id);

            return (
              <div key={g.id} className={`item-card ${isEditing ? "editing" : ""}`}>
                <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-[0.65rem] font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 leading-none shrink-0">{idx + 1}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(g.id)}
                      className="w-4 h-4 rounded accent-maroon cursor-pointer shrink-0"
                    />
                    {isEditing ? (
                      <input value={editData.name ?? g.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="card-input py-1.5 font-bold w-full sm:w-60" placeholder="Guest name" />
                    ) : (
                      <h4 className="font-bold text-sm sm:text-base truncate min-w-0">{g.name}</h4>
                    )}
                    {!isEditing && (
                      <span className={`status-badge hidden sm:inline-block ${g.rsvp === "Yes" ? "paid" : g.rsvp === "Pending" ? "planning" : "pending"}`}>{g.rsvp}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        {canEdit && <button onClick={() => handleSave(g.id)} className="btn-save"><i className="fas fa-check sm:mr-1" /> <span className="hidden sm:inline">Save</span></button>}
                        <button onClick={() => { setEditing(null); setEditData({}); }} className="btn-cancel"><span className="hidden sm:inline">Cancel</span></button>
                      </>
                    ) : (
                      <>
                        {canEdit && <button onClick={() => { setEditing(g.id); setEditData({}); }} className="btn-edit"><i className="fas fa-pen sm:mr-1" /> <span className="hidden sm:inline">Edit</span></button>}
                        {canEdit && (
                          <button onClick={() => handleDelete(g.id)} className="btn-delete"><i className="fas fa-trash sm:mr-1" /> <span className="hidden sm:inline">Delete</span></button>
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
                      <p className="text-sm truncate">{g.relation}</p>
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
