"use client";

import { useState } from "react";
import { updateVendor, createVendor, deleteVendor, batchCreateVendors, bulkDeleteVendors, bulkAddVendors } from "@/lib/actions";
import ImportModal from "@/components/ImportModal";

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

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Vendor Tracker</h2>
          <p className="text-gray-500 text-sm">Manage all your wedding vendors in one place</p>
        </div>
        <div className="flex gap-2.5">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
              <i className="fas fa-trash mr-1.5" /> Delete Selected ({selected.size})
            </button>
          )}
          <button onClick={() => setShowImport(true)} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg hover:shadow-md transition-all cursor-pointer">
            <i className="fas fa-file-import mr-1.5" /> Import Excel
          </button>
          <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add Vendor
          </button>
        </div>
      </div>

      {!vendors.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-store text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No vendors yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start adding your wedding vendors {'\u2014'} venue, caterer, photographer, and more.</p>
          <button onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add First Vendor
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="spreadsheet">
          <thead>
            <tr>
              <th className="w-12 text-center">
                <input
                  type="checkbox"
                  checked={selected.size === vendors.length && vendors.length > 0}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th>Category</th>
              <th>Vendor Name</th>
              <th>Contact</th>
              <th className="text-right">Quote ({'\u20B9'})</th>
              <th className="text-right">Paid ({'\u20B9'})</th>
              <th className="text-right">Balance ({'\u20B9'})</th>
              <th>Rating</th>
              <th>Contract</th>
              <th>Notes</th>
              <th className="w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v: any) => {
              const quote = editData.quote ?? v.quote;
              const paid = editData.paid ?? v.paid;
              const balance = quote - paid;
              return (
                <tr key={v.id} className={selected.has(v.id) ? "bg-blue-50" : ""}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(v.id)}
                      onChange={() => toggleSelect(v.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="font-semibold">{editing === v.id ? <input value={editData.category ?? v.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : v.category}</td>
                  <td>{editing === v.id ? <input value={editData.name ?? v.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : v.name}</td>
                  <td>{editing === v.id ? <input value={editData.contact ?? v.contact} onChange={(e) => setEditData({ ...editData, contact: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : v.contact}</td>
                  <td className="text-right">{editing === v.id ? <input type="number" value={editData.quote ?? v.quote} onChange={(e) => setEditData({ ...editData, quote: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded text-sm text-right" /> : `{'\u20B9'}${v.quote.toLocaleString("en-IN")}`}</td>
                  <td className="text-right">{editing === v.id ? <input type="number" value={editData.paid ?? v.paid} onChange={(e) => setEditData({ ...editData, paid: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded text-sm text-right" /> : `{'\u20B9'}${v.paid.toLocaleString("en-IN")}`}</td>
                  <td className="text-right font-medium">{'\u20B9'}{balance.toLocaleString("en-IN")}</td>
                  <td style={{ color: "#D4AF37" }}>{editing === v.id ? (
                    <select value={editData.rating ?? v.rating} onChange={(e) => setEditData({ ...editData, rating: e.target.value })} className="px-2 py-1 border rounded text-sm">
                      <option>{'\u2605\u2605\u2605\u2605\u2605'}</option><option>{'\u2605\u2605\u2605\u2605\u2606'}</option><option>{'\u2605\u2605\u2605\u2606\u2606'}</option><option>{'\u2605\u2605\u2606\u2606\u2606'}</option><option>{'\u2605\u2606\u2606\u2606\u2606'}</option>
                    </select>
                  ) : v.rating}</td>
                  <td>{editing === v.id ? (
                    <select value={editData.contract ?? v.contract} onChange={(e) => setEditData({ ...editData, contract: e.target.value })} className="px-2 py-1 border rounded text-sm">
                      <option>Pending</option><option>Signed</option><option>Completed</option>
                    </select>
                  ) : <span className={`status-badge ${v.contract === "Signed" ? "paid" : "pending"}`}>{v.contract}</span>}</td>
                  <td>{editing === v.id ? <input value={editData.notes ?? v.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="w-24 px-2 py-1 border rounded text-sm" /> : (v.notes || "\u2014")}</td>
                  <td>
                    {editing === v.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleSave(v.id)} className="text-xs px-2 py-1 bg-green-500 text-white rounded cursor-pointer">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded cursor-pointer">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(v.id); setEditData({}); }} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(v.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded cursor-pointer">Del</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}

      <div className="mt-4">
        {showBulkInput ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={bulkCount}
              onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 border rounded text-sm"
              placeholder="Count"
            />
            <button onClick={handleBulkAdd} className="px-3 py-1 text-sm font-semibold text-white bg-maroon rounded hover:bg-maroon-light cursor-pointer">
              Add {bulkCount} Row(s)
            </button>
            <button onClick={() => { setShowBulkInput(false); setBulkCount(1); }} className="px-3 py-1 text-sm font-semibold text-gray-600 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setShowBulkInput(true)} className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-layer-group mr-1.5" /> Add Multiple Rows
          </button>
        )}
      </div>

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
