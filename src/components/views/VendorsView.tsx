"use client";

import { useState } from "react";
import { updateVendor, createVendor, deleteVendor, batchCreateVendors, bulkDeleteVendors, bulkAddVendors } from "@/lib/actions";
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

export default function VendorsView({ wedding, weddingId, onUpdate, onToast }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCount, setBulkCount] = useState<number>(1);
  const [showBulkInput, setShowBulkInput] = useState(false);

  const vendors: any[] = wedding.vendors ?? [];

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
    try {
      await deleteVendor(weddingId, id);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      onUpdate();
      onToast("Vendor deleted", "success");
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

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    try {
      await bulkDeleteVendors(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`Deleted ${selected.size} vendor(s)`, "success");
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
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Vendor Tracker</h2>
          <p className="text-gray-500 text-sm">Manage all your wedding vendors in one place</p>
        </div>
        <div className="flex gap-2.5 items-center">
          <button onClick={() => setShowImport(true)} className="btn-maroon">
            <i className="fas fa-file-import" /> Import
          </button>
          <button onClick={handleAdd} className="btn-maroon">
            <i className="fas fa-plus" /> Add Vendor
          </button>
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

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={handleBulkDelete} className="btn-delete text-xs py-1 px-3">
            <i className="fas fa-trash mr-1" /> Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Clear</button>
        </div>
      )}

      {showBulkInput && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">Add how many vendors?</span>
          <input type="number" min={1} max={100} value={bulkCount} onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)} className="card-input w-20 py-1.5 text-center" />
          <button onClick={handleBulkAdd} className="btn-maroon text-xs py-1.5 px-3">Add</button>
          <button onClick={() => { setShowBulkInput(false); setBulkCount(1); }} className="btn-cancel text-xs py-1.5 px-3">Cancel</button>
        </div>
      )}

      {!vendors.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-store text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No vendors yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start adding your wedding vendors {'\u2014'} venue, caterer, photographer, and more.</p>
          <button onClick={handleAdd} className="btn-maroon">
            <i className="fas fa-plus" /> Add First Vendor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v: any) => {
            const isEditing = editing === v.id;
            const isSelected = selected.has(v.id);
            const quote = isEditing ? (editData.quote ?? v.quote) : v.quote;
            const paid = isEditing ? (editData.paid ?? v.paid) : v.paid;
            const balance = quote - paid;

            return (
              <div key={v.id} className={`item-card ${isEditing ? "editing" : ""}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
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
                        <button onClick={() => handleSave(v.id)} className="btn-save"><i className="fas fa-check mr-1" /> Save</button>
                        <button onClick={() => { setEditing(null); setEditData({}); }} className="btn-cancel">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditing(v.id); setEditData({}); }} className="btn-edit"><i className="fas fa-pen mr-1" /> Edit</button>
                        <button onClick={() => handleDelete(v.id)} className="btn-delete"><i className="fas fa-trash mr-1" /> Delete</button>
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
                      <p className="text-sm font-medium">{v.name || '\u2014'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Contact</label>
                    {isEditing ? (
                      <input value={editData.contact ?? v.contact} onChange={(e) => setEditData({ ...editData, contact: e.target.value })} className="card-input" placeholder="Phone or email" />
                    ) : (
                      <p className="text-sm">{v.contact || '\u2014'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Quote ({'\u20B9'})</label>
                    {isEditing ? (
                      <input type="number" value={editData.quote ?? v.quote} onChange={(e) => setEditData({ ...editData, quote: parseInt(e.target.value) || 0 })} className="card-input text-right" />
                    ) : (
                      <p className="text-sm font-semibold">{'\u20B9'}{v.quote.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Paid ({'\u20B9'})</label>
                    {isEditing ? (
                      <input type="number" value={editData.paid ?? v.paid} onChange={(e) => setEditData({ ...editData, paid: parseInt(e.target.value) || 0 })} className="card-input text-right" />
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

          <button onClick={() => setShowBulkInput(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-maroon hover:text-maroon transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add More Vendors
          </button>
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
