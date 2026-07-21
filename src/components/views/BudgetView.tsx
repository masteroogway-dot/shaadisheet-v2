"use client";

import { useState } from "react";
import { updateBudgetItem, createBudgetItem, deleteBudgetItem, batchCreateBudgetItems, bulkDeleteBudgetItems, bulkAddBudgetItems } from "@/lib/actions";
import ImportModal from "@/components/ImportModal";

export default function BudgetView({ wedding, weddingId, onUpdate, onToast }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAddCount, setBulkAddCount] = useState(5);
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const items = wedding.budgetItems || [];

  const handleSave = async (id: string) => {
    const data = { ...editData };
    if (data.estimated !== undefined || data.paid !== undefined) {
      const item = items.find((i: any) => i.id === id);
      const estimated = data.estimated ?? item?.estimated ?? 0;
      const paid = data.paid ?? item?.paid ?? 0;
      data.balance = estimated - paid;
      if (paid >= estimated && estimated > 0) data.status = "Paid";
      else if (paid > 0) data.status = "Partial";
      else data.status = "Pending";
    }
    await updateBudgetItem(weddingId, id, data);
    setEditing(null);
    setEditData({});
    onUpdate();
    const row = items.find((i: any) => i.id === id);
    onToast(`Row ${(row?.order ?? 0) + 1} updated`);
  };

  const handleAdd = async () => {
    await createBudgetItem(weddingId, { category: "", item: "New Item", estimated: 0, actual: 0, paid: 0, balance: 0, status: "Pending", dueDate: "", notes: "" });
    onUpdate();
    onToast("Row created");
  };

  const handleDelete = async (id: string) => {
    const row = items.find((i: any) => i.id === id);
    await deleteBudgetItem(weddingId, id);
    onUpdate();
    onToast(`Row ${(row?.order ?? 0) + 1} deleted`);
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
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i: any) => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    const count = selected.size;
    await bulkDeleteBudgetItems(weddingId, Array.from(selected));
    setSelected(new Set());
    onUpdate();
    onToast(`${count} row${count > 1 ? "s" : ""} deleted`);
  };

  const handleBulkAdd = async () => {
    await bulkAddBudgetItems(weddingId, bulkAddCount);
    setShowBulkAdd(false);
    onUpdate();
    onToast(`${bulkAddCount} row${bulkAddCount > 1 ? "s" : ""} created`);
  };

  const totalEstimated = items.reduce((s: number, i: any) => s + (i.estimated || 0), 0) || 0;
  const totalPaid = items.reduce((s: number, i: any) => s + (i.paid || 0), 0) || 0;

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Budget Tracker</h2>
          <p className="text-gray-500 text-sm">Track every rupee {'\u2014'} from estimate to final payment</p>
        </div>
        <div className="flex gap-2.5 items-center">
          <button onClick={() => setShowImport(true)} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg hover:shadow-md transition-all cursor-pointer">
            <i className="fas fa-file-import mr-1.5" /> Import Excel
          </button>
          {items.length > 0 && (
            <>
              <div className="text-right mr-4">
                <div className="text-xs text-gray-500">Total Estimated</div>
                <div className="font-bold">{'\u20B9'}{totalEstimated.toLocaleString("en-IN")}</div>
              </div>
              <div className="text-right mr-4">
                <div className="text-xs text-gray-500">Total Paid</div>
                <div className="font-bold text-green">{'\u20B9'}{totalPaid.toLocaleString("en-IN")}</div>
              </div>
            </>
          )}
          <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add Item
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={handleBulkDelete} className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 cursor-pointer">
            <i className="fas fa-trash mr-1" /> Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Clear</button>
        </div>
      )}

      {showBulkAdd && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">Add how many rows?</span>
          <input type="number" min={1} max={50} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center" />
          <button onClick={handleBulkAdd} className="px-3 py-1 text-xs font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light cursor-pointer">Add</button>
          <button onClick={() => setShowBulkAdd(false)} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
        </div>
      )}

      {!items || items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-rupee-sign text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No budget items yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start tracking your wedding expenses by adding your first budget item.</p>
          <button onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add First Item
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="spreadsheet">
          <thead>
            <tr>
              <th className="w-12 text-center">
                <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleSelectAll} className="accent-maroon cursor-pointer" />
              </th>
              <th>#</th>
              <th>Category</th>
              <th>Item</th>
              <th className="text-right">Estimated ({'\u20B9'})</th>
              <th className="text-right">Actual ({'\u20B9'})</th>
              <th className="text-right">Paid ({'\u20B9'})</th>
              <th className="text-right">Balance ({'\u20B9'})</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Notes</th>
              <th className="w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => {
              const est = editData.estimated ?? item.estimated;
              const paid = editData.paid ?? item.paid;
              const balance = est - paid;
              return (
                <tr key={item.id} className={selected.has(item.id) ? "bg-maroon/5" : ""}>
                  <td className="text-center">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="accent-maroon cursor-pointer" />
                  </td>
                  <td className="text-center text-gray-400">{item.order + 1}</td>
                  <td className="font-semibold">{editing === item.id ? <input value={editData.category ?? item.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : item.category}</td>
                  <td>{editing === item.id ? <input value={editData.item ?? item.item} onChange={(e) => setEditData({ ...editData, item: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : item.item}</td>
                  <td className="text-right">{editing === item.id ? <input type="number" value={editData.estimated ?? item.estimated} onChange={(e) => setEditData({ ...editData, estimated: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded text-sm text-right" /> : `{'\u20B9'}${item.estimated.toLocaleString("en-IN")}`}</td>
                  <td className="text-right">{editing === item.id ? <input type="number" value={editData.actual ?? item.actual} onChange={(e) => setEditData({ ...editData, actual: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded text-sm text-right" /> : `{'\u20B9'}${item.actual.toLocaleString("en-IN")}`}</td>
                  <td className="text-right">{editing === item.id ? <input type="number" value={editData.paid ?? item.paid} onChange={(e) => setEditData({ ...editData, paid: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded text-sm text-right" /> : `{'\u20B9'}${item.paid.toLocaleString("en-IN")}`}</td>
                  <td className="text-right font-medium">{'\u20B9'}{balance.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`status-badge ${item.status === "Paid" ? "paid" : item.status === "Partial" ? "partial" : "pending"}`}>{item.status}</span>
                  </td>
                  <td>{editing === item.id ? <input value={editData.dueDate ?? item.dueDate} onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })} className="w-24 px-2 py-1 border rounded text-sm" /> : (item.dueDate || "\u2014")}</td>
                  <td>{editing === item.id ? <input value={editData.notes ?? item.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="w-24 px-2 py-1 border rounded text-sm" /> : (item.notes || "\u2014")}</td>
                  <td>
                    {editing === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleSave(item.id)} className="text-xs px-2 py-1 bg-green-500 text-white rounded cursor-pointer">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded cursor-pointer">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(item.id); setEditData({}); }} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded cursor-pointer">Del</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
          <button onClick={() => setShowBulkAdd(true)} className="text-sm font-medium text-maroon hover:underline cursor-pointer">
            <i className="fas fa-plus mr-1" /> Add Multiple Rows
          </button>
        </div>
        </div>
      )}
      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="budget"
        onImport={async (imported: any[]) => {
          await batchCreateBudgetItems(weddingId, imported);
          onUpdate();
          onToast(`${imported.length} row${imported.length > 1 ? "s" : ""} imported`);
        }}
      />
    </div>
  );
}
