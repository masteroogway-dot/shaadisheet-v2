"use client";

import { useState } from "react";
import { updateBudgetItem, createBudgetItem, deleteBudgetItem, batchCreateBudgetItems, bulkDeleteBudgetItems, bulkAddBudgetItems } from "@/lib/actions";
import { exportToCSV } from "@/lib/export";
import ImportModal from "@/components/ImportModal";
import DatePicker from "@/components/DatePicker";

function formatINR(n: number): string {
  if (n === 0) return "0";
  if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  return n.toLocaleString("en-IN");
}

export default function BudgetView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void; canEdit?: boolean }) {
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
    onToast("Item updated", "success");
  };

  const handleAdd = async () => {
    await createBudgetItem(weddingId, { category: "", item: "New Item", estimated: 0, actual: 0, paid: 0, balance: 0, status: "Pending", dueDate: "", notes: "" });
    onUpdate();
    onToast("Item created", "success");
  };

  const handleDelete = async (id: string) => {
    await deleteBudgetItem(weddingId, id);
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    onUpdate();
    onToast("Item deleted", "success");
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
    onToast(`${count} item${count > 1 ? "s" : ""} deleted`, "success");
  };

  const handleBulkAdd = async () => {
    await bulkAddBudgetItems(weddingId, bulkAddCount);
    setShowBulkAdd(false);
    onUpdate();
    onToast(`${bulkAddCount} item${bulkAddCount > 1 ? "s" : ""} created`, "success");
  };

  const totalBudget = wedding.budget || 0;
  const totalEstimated = items.reduce((s: number, i: any) => s + (i.estimated || 0), 0) || 0;
  const totalPaid = items.reduce((s: number, i: any) => s + (i.paid || 0), 0) || 0;
  const totalBalance = totalEstimated - totalPaid;
  const paidCount = items.filter((i: any) => i.status === "Paid").length;
  const budgetRemaining = totalBudget - totalEstimated;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-7">
        <div>
          <h2 className="text-2xl font-bold">Budget Tracker</h2>
          <p className="text-gray-500 text-sm">Track every rupee {'\u2014'} from estimate to final payment</p>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          {canEdit && items.length > 0 && (
            <button onClick={() => exportToCSV(items.map((i: any, idx: number) => ({ "#": idx + 1, Category: i.category, Item: i.item, Estimated: i.estimated, Paid: i.paid, Balance: i.balance, Status: i.status, "Due Date": i.dueDate || "", Notes: i.notes || "" })), "budget")} className="btn-edit text-xs py-2 px-3">
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
              <i className="fas fa-plus" /> Add Item
            </button>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold block">{'\u20B9'}{formatINR(totalBudget)}</span>
            <span className="text-xs text-gray-500">Total Budget</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold block text-blue-600">{'\u20B9'}{formatINR(totalEstimated)}</span>
            <span className="text-xs text-gray-500">Allocated ({items.length} items)</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-extrabold block text-green">{'\u20B9'}{formatINR(totalPaid)}</span>
            <span className="text-xs text-gray-500">Paid</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <span className={`text-2xl font-extrabold block ${budgetRemaining > 0 ? "text-yellow" : "text-green"}`}>{'\u20B9'}{formatINR(budgetRemaining)}</span>
            <span className="text-xs text-gray-500">Remaining</span>
          </div>
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

      {showBulkAdd && (
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">Add how many items?</span>
          <input type="number" min={1} max={50} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="card-input w-20 py-1.5 text-center" />
          <button onClick={handleBulkAdd} className="btn-maroon text-xs py-2 px-4">Add</button>
          <button onClick={() => setShowBulkAdd(false)} className="btn-cancel text-xs py-2 px-4">Cancel</button>
        </div>
      )}

      {!items || items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-rupee-sign text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No budget items yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start tracking your wedding expenses by adding your first budget item.</p>
          {canEdit && (
            <button onClick={handleAdd} className="btn-maroon">
              <i className="fas fa-plus" /> Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => {
            const isEditing = editing === item.id;
            const isSelected = selected.has(item.id);
            const est = isEditing ? (editData.estimated ?? item.estimated) : item.estimated;
            const paid = isEditing ? (editData.paid ?? item.paid) : item.paid;
            const balance = est - paid;

            return (
              <div key={item.id} className={`item-card ${isEditing ? "editing" : ""}`}>
                <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded accent-maroon cursor-pointer shrink-0"
                    />
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <input value={editData.category ?? item.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="card-input py-1.5 w-full sm:w-40 font-bold" placeholder="Category" />
                        <input value={editData.item ?? item.item} onChange={(e) => setEditData({ ...editData, item: e.target.value })} className="card-input py-1.5 flex-1" placeholder="Item name" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase truncate shrink-0">{item.category}</span>
                        <h4 className="font-bold text-sm sm:text-base truncate min-w-0">{item.item}</h4>
                      </div>
                    )}
                    {!isEditing && (
                      <span className={`status-badge hidden sm:inline-block ${item.status === "Paid" ? "paid" : item.status === "Partial" ? "partial" : "pending"}`}>{item.status}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        {canEdit && <button onClick={() => handleSave(item.id)} className="btn-save"><i className="fas fa-check sm:mr-1" /> <span className="hidden sm:inline">Save</span></button>}
                        <button onClick={() => { setEditing(null); setEditData({}); }} className="btn-cancel"><span className="hidden sm:inline">Cancel</span></button>
                      </>
                    ) : (
                      <>
                        {canEdit && <button onClick={() => { setEditing(item.id); setEditData({}); }} className="btn-edit"><i className="fas fa-pen sm:mr-1" /> <span className="hidden sm:inline">Edit</span></button>}
                        {canEdit && (
                          <button onClick={() => handleDelete(item.id)} className="btn-delete"><i className="fas fa-trash sm:mr-1" /> <span className="hidden sm:inline">Delete</span></button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Estimated</label>
                    {isEditing ? (
                      <div className="input-currency"><span className="currency-symbol">{'\u20B9'}</span><input type="number" value={editData.estimated ?? ""} placeholder="0" onChange={(e) => setEditData({ ...editData, estimated: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })} className="card-input" /></div>
                    ) : (
                      <p className="text-sm font-bold">{'\u20B9'}{item.estimated.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Actual</label>
                    {isEditing ? (
                      <div className="input-currency"><span className="currency-symbol">{'\u20B9'}</span><input type="number" value={editData.actual ?? ""} placeholder="0" onChange={(e) => setEditData({ ...editData, actual: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })} className="card-input" /></div>
                    ) : (
                      <p className="text-sm">{'\u20B9'}{item.actual.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Paid</label>
                    {isEditing ? (
                      <div className="input-currency"><span className="currency-symbol">{'\u20B9'}</span><input type="number" value={editData.paid ?? ""} placeholder="0" onChange={(e) => setEditData({ ...editData, paid: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })} className="card-input" /></div>
                    ) : (
                      <p className="text-sm font-bold text-green">{'\u20B9'}{item.paid.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Balance</label>
                    <p className={`text-sm font-bold ${balance > 0 ? "text-yellow" : "text-green"}`}>{'\u20B9'}{balance.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Due Date</label>
                    {isEditing ? (
                      <DatePicker value={editData.dueDate ?? item.dueDate} min={new Date().toISOString().split("T")[0]} onChange={(val) => setEditData({ ...editData, dueDate: val })} />
                    ) : (
                      <p className="text-sm text-gray-600">{item.dueDate || '\u2014'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notes</label>
                    {isEditing ? (
                      <input value={editData.notes ?? item.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="card-input" placeholder="Add notes" />
                    ) : (
                      <p className="text-sm text-gray-500 truncate">{item.notes || '\u2014'}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {canEdit && (
            <button onClick={() => setShowBulkAdd(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-maroon hover:text-maroon transition-colors cursor-pointer">
              <i className="fas fa-plus mr-1.5" /> Add More Items
            </button>
          )}
        </div>
      )}

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="budget"
        onImport={async (imported: any[]) => {
          await batchCreateBudgetItems(weddingId, imported);
          onUpdate();
          onToast(`${imported.length} item${imported.length > 1 ? "s" : ""} imported`);
        }}
      />
    </div>
  );
}
