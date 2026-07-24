"use client";

import { useState } from "react";
import { updateVendor, createVendor, deleteVendor, batchCreateVendors, bulkDeleteVendors, bulkAddVendors } from "@/lib/actions";
import { exportToCSV } from "@/lib/export";
import ImportModal from "@/components/ImportModal";

function StarRating({ value, onChange, readonly }: { value: string; onChange?: (v: string) => void; readonly?: boolean }) {
  const stars = 5;
  const filled = value.split("\u2605").length - 1;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: stars }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(`\u2605`.repeat(i + 1) + `\u2606`.repeat(stars - i - 1))}
          className={`text-lg transition-transform ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          style={{ color: i < filled ? "#D4AF37" : "#d1d5db" }}
        >
          {i < filled ? "\u2605" : "\u2606"}
        </button>
      ))}
    </div>
  );
}

export default function VendorsView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error", options?: { undoAction?: () => void }) => void; canEdit?: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCount, setBulkCount] = useState<number>(1);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [rangeInput, setRangeInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterContract, setFilterContract] = useState("All");

  const vendors: any[] = wedding.vendors ?? [];
  const filteredVendors = vendors.filter((v: any) => {
    if (search) {
      const q = search.toLowerCase();
      if (!v.category?.toLowerCase().includes(q) && !v.name?.toLowerCase().includes(q)) return false;
    }
    if (filterContract !== "All" && v.contract !== filterContract) return false;
    return true;
  });

  const handleSave = async (id: string) => {
    const data = { ...editData };
    if (data.quote !== undefined || data.paid !== undefined) {
      const v = vendors.find((x: any) => x.id === id);
      const quote = data.quote ?? v?.quote ?? 0;
      const paid = data.paid ?? v?.paid ?? 0;
      data.balance = quote - paid;
    }
    try {
      await updateVendor(weddingId, id, data);
      setEditing(null);
      setEditData({});
      onUpdate();
      onToast("Vendor updated", "success");
    } catch {
      onToast("Failed to update vendor", "error");
    }
  };

  const handleAdd = async () => {
    try {
      await createVendor(weddingId, { category: "New Vendor", name: "", contact: "", quote: 0, paid: 0, balance: 0, rating: "\u2605\u2605\u2605\u2605\u2606", contract: "Pending", notes: "" });
      onUpdate();
      onToast("Vendor added", "success");
    } catch {
      onToast("Failed to add vendor", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const vendor = vendors.find((v: any) => v.id === id);
    try {
      await deleteVendor(weddingId, id);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      onUpdate();
      onToast("Vendor deleted", "success", vendor ? {
        undoAction: async () => {
          try {
            await createVendor(weddingId, { category: vendor.category, name: vendor.name, contact: vendor.contact, quote: vendor.quote || 0, paid: vendor.paid || 0, balance: vendor.balance || 0, rating: vendor.rating || "\u2605\u2605\u2605\u2605\u2606", contract: vendor.contract || "Pending", notes: vendor.notes || "" });
            onUpdate();
            onToast("Vendor restored", "success");
          } catch {
            onToast("Failed to restore vendor", "error");
          }
        }
      } : undefined);
    } catch {
      onToast("Failed to delete vendor", "error");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === vendors.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(vendors.map((v: any) => v.id)));
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
            if (i >= 1 && i <= vendors.length) ids.add(vendors[i - 1].id);
          }
        }
      } else {
        const n = Number(part);
        if (!isNaN(n) && n >= 1 && n <= vendors.length) ids.add(vendors[n - 1].id);
      }
    }
    setSelected(ids);
    setRangeInput("");
    if (ids.size > 0) onToast(`${ids.size} vendor${ids.size > 1 ? "s" : ""} selected`, "success");
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const toDelete = vendors.filter((v: any) => selected.has(v.id));
    try {
      await bulkDeleteVendors(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`Deleted ${toDelete.length} vendor(s)`, "success", {
        undoAction: async () => {
          try {
            await batchCreateVendors(weddingId, toDelete.map((v: any) => ({ category: v.category, name: v.name, contact: v.contact, quote: v.quote || 0, paid: v.paid || 0, balance: v.balance || 0, rating: v.rating || "\u2605\u2605\u2605\u2605\u2606", contract: v.contract || "Pending", notes: v.notes || "" })));
            onUpdate();
            onToast("Vendors restored", "success");
          } catch {
            onToast("Failed to restore vendors", "error");
          }
        }
      });
    } catch {
      onToast("Failed to bulk delete", "error");
    }
  };

  const handleBulkAdd = async () => {
    const count = Math.max(1, Math.min(100, bulkCount));
    try {
      await bulkAddVendors(weddingId, count);
      setShowBulkInput(false);
      setBulkCount(1);
      onUpdate();
      onToast(`Added ${count} vendor(s)`, "success");
    } catch {
      onToast("Failed to bulk add vendors", "error");
    }
  };

  const totalQuote = vendors.reduce((s: number, v: any) => s + (v.quote || 0), 0);
  const totalPaid = vendors.reduce((s: number, v: any) => s + (v.paid || 0), 0);
  const booked = vendors.filter((v: any) => v.contract === "Signed").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-7">
        <div>
          <h2 className="text-2xl font-bold">Vendor Tracker</h2>
          <p className="text-gray-500 text-sm">Manage all your wedding vendors in one place</p>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          {canEdit && vendors.length > 0 && (
            <>
              <button onClick={toggleSelectAll} className="btn-edit text-xs py-2 px-3">
                <i className="fas fa-check-double mr-1.5" /> {selected.size === vendors.length ? "Deselect All" : "Select All"}
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
            <button onClick={() => exportToCSV(filteredVendors.map((v: any, i: number) => ({ "#": i + 1, Category: v.category, Name: v.name, Contact: v.contact, Quote: v.quote, Paid: v.paid, Balance: v.balance, Rating: v.rating, Contract: v.contract, Notes: v.notes || "" })), "vendors")} className="btn-edit text-xs py-2 px-3">
              <i className="fas fa-download mr-1.5" /> Export
            </button>
          )}
          {canEdit && (
            <button onClick={() => setShowImport(true)} className="btn-maroon">
              <i className="fas fa-file-import" /> Import
            </button>
          )}
          {canEdit && (
            <button onClick={handleAdd} className="btn-maroon">
              <i className="fas fa-plus" /> Add Vendor
            </button>
          )}
        </div>
      </div>

      {vendors.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold block">{vendors.length}</span>
            <span className="text-xs text-gray-500">Total Vendors</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold text-green block">{booked}</span>
            <span className="text-xs text-gray-500">Booked</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold block">{'\u20B9'}{(totalQuote / 100000).toFixed(1)}L</span>
            <span className="text-xs text-gray-500">Total Quote</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold text-green block">{'\u20B9'}{(totalPaid / 100000).toFixed(1)}L</span>
            <span className="text-xs text-gray-500">Total Paid</span>
          </div>
        </div>
      )}

      {vendors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="card-input py-2 pl-8 text-sm w-full"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs">
                <i className="fas fa-times" />
              </button>
            )}
          </div>
          <select value={filterContract} onChange={(e) => setFilterContract(e.target.value)} className="card-select py-2 text-sm">
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Signed">Signed</option>
            <option value="Completed">Completed</option>
          </select>
          {(search || filterContract !== "All") && (
            <button onClick={() => { setSearch(""); setFilterContract("All"); }} className="btn-cancel text-xs py-2 px-3">
              <i className="fas fa-times mr-1" /> Clear
            </button>
          )}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          {canEdit && (
            <button onClick={handleBulkDelete} className="btn-delete text-xs py-2 px-3">
              <i className="fas fa-trash mr-1" /> Delete Selected
            </button>
          )}
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Clear</button>
        </div>
      )}

      {showBulkInput && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">Add how many vendors?</span>
          <input type="number" min={1} max={100} value={bulkCount} onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)} className="card-input w-20 py-1.5 text-center" />
          {canEdit && <button onClick={handleBulkAdd} className="btn-maroon text-xs py-2 px-4">Add</button>}
          <button onClick={() => { setShowBulkInput(false); setBulkCount(1); }} className="btn-cancel text-xs py-2 px-4">Cancel</button>
        </div>
      )}

      {!vendors.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-store text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No vendors yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start adding your wedding vendors {'\u2014'} venue, caterer, photographer, and more.</p>
          {canEdit && (
            <button onClick={handleAdd} className="btn-maroon">
              <i className="fas fa-plus" /> Add First Vendor
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No vendors match your filters</div>
          ) : filteredVendors.map((v: any, idx: number) => {
            const isEditing = editing === v.id;
            const isSelected = selected.has(v.id);
            const quote = isEditing ? (editData.quote ?? v.quote) : v.quote;
            const paid = isEditing ? (editData.paid ?? v.paid) : v.paid;
            const balance = quote - paid;

            return (
              <div key={v.id} className={`item-card ${isEditing ? "editing" : ""}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[0.65rem] font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 leading-none shrink-0">{idx + 1}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(v.id)}
                      className="w-4 h-4 rounded accent-maroon cursor-pointer shrink-0"
                    />
                    {isEditing ? (
                      <input value={editData.category ?? v.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="card-input py-1.5 font-bold" placeholder="Category" />
                    ) : (
                      <h4 className="font-bold text-base truncate">{v.category}</h4>
                    )}
                    {v.contract === "Signed" && !isEditing && (
                      <span className="status-badge paid text-[0.7rem]">Booked</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        {canEdit && <button onClick={() => handleSave(v.id)} className="btn-save"><i className="fas fa-check mr-1" /> Save</button>}
                        <button onClick={() => { setEditing(null); setEditData({}); }} className="btn-cancel">Cancel</button>
                      </>
                    ) : (
                      <>
                        {canEdit && <button onClick={() => { setEditing(v.id); setEditData({}); }} className="btn-edit"><i className="fas fa-pen mr-1" /> Edit</button>}
                        {canEdit && <button onClick={() => handleDelete(v.id)} className="btn-delete"><i className="fas fa-trash mr-1" /> Delete</button>}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Vendor Name</label>
                    {isEditing ? (
                      <input value={editData.name ?? v.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="card-input" placeholder="Enter name" />
                    ) : (
                      <p className="text-sm font-medium truncate">{v.name || '\u2014'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Contact</label>
                    {isEditing ? (
                      <input value={editData.contact ?? v.contact} onChange={(e) => setEditData({ ...editData, contact: e.target.value })} className="card-input" placeholder="Phone or email" />
                    ) : (
                      <p className="text-sm truncate">{v.contact || '\u2014'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Quote</label>
                    {isEditing ? (
                      <div className="input-currency"><span className="currency-symbol">{'\u20B9'}</span><input type="number" value={editData.quote ?? ""} placeholder="0" onChange={(e) => setEditData({ ...editData, quote: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })} className="card-input" /></div>
                    ) : (
                      <p className="text-sm font-semibold">{'\u20B9'}{v.quote.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Paid</label>
                    {isEditing ? (
                      <div className="input-currency"><span className="currency-symbol">{'\u20B9'}</span><input type="number" value={editData.paid ?? ""} placeholder="0" onChange={(e) => setEditData({ ...editData, paid: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })} className="card-input" /></div>
                    ) : (
                      <p className="text-sm font-semibold text-green">{'\u20B9'}{v.paid.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Balance</label>
                    <p className={`text-sm font-bold ${balance > 0 ? "text-yellow" : "text-green"}`}>{'\u20B9'}{balance.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Rating</label>
                    {isEditing ? (
                      <StarRating value={editData.rating ?? v.rating} onChange={(val) => setEditData({ ...editData, rating: val })} />
                    ) : (
                      <StarRating value={v.rating} readonly />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Contract</label>
                    {isEditing ? (
                      <select value={editData.contract ?? v.contract} onChange={(e) => setEditData({ ...editData, contract: e.target.value })} className="card-select">
                        <option>Pending</option><option>Signed</option><option>Completed</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${v.contract === "Signed" ? "paid" : "pending"}`}>{v.contract}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notes</label>
                    {isEditing ? (
                      <input value={editData.notes ?? v.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="card-input" placeholder="Add notes" />
                    ) : (
                      <p className="text-sm text-gray-500 truncate">{v.notes || '\u2014'}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {canEdit && (
            <button onClick={() => setShowBulkInput(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-maroon hover:text-maroon transition-colors cursor-pointer">
              <i className="fas fa-plus mr-1.5" /> Add More Vendors
            </button>
          )}
        </div>
      )}

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="vendors"
        onImport={async (items: any[]) => {
          await batchCreateVendors(weddingId, items);
          onUpdate();
          onToast(`Imported ${items.length} vendor(s)`, "success");
        }}
      />
    </div>
  );
}
