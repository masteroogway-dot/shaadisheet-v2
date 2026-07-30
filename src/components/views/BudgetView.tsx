"use client";

import { useState, useMemo } from "react";
import { updateBudgetItem, createBudgetItem, deleteBudgetItem, batchCreateBudgetItems, bulkDeleteBudgetItems, bulkAddBudgetItems } from "@/lib/actions";
import { formatCurrency, getCurrencySymbol } from "@/lib/format";
import { exportToCSV } from "@/lib/export";
import ImportModal from "@/components/ImportModal";
import DatePicker from "@/components/DatePicker";
import CurrencyInput from "@/components/CurrencyInput";
import BudgetInsights from "@/components/BudgetInsights";
import { motion } from "framer-motion";

export default function BudgetView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: { wedding: any; weddingId: string; onUpdate: () => void; onToast: (msg: string, type?: "success" | "error") => void; canEdit?: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAddCount, setBulkAddCount] = useState(5);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("category");
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped");

  const items = wedding.budgetItems || [];
  const today = new Date().toISOString().split("T")[0];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((i: any) => { if (i.category) cats.add(i.category); });
    return Array.from(cats).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let list = [...items];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i: any) => i.item.toLowerCase().includes(q) || (i.category || "").toLowerCase().includes(q) || (i.notes || "").toLowerCase().includes(q));
    }
    if (filterCategory !== "All") list = list.filter((i: any) => i.category === filterCategory);
    if (filterStatus !== "All") list = list.filter((i: any) => i.status === filterStatus);
    list.sort((a: any, b: any) => {
      switch (sortBy) {
        case "amount-desc": return (b.estimated || 0) - (a.estimated || 0);
        case "amount-asc": return (a.estimated || 0) - (b.estimated || 0);
        case "status": return (a.status || "Pending").localeCompare(b.status || "Pending");
        case "due-date": return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
        case "name": return a.item.localeCompare(b.item);
        default: return (a.category || "").localeCompare(b.category || "") || a.item.localeCompare(b.item);
      }
    });
    return list;
  }, [items, search, filterCategory, filterStatus, sortBy]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredItems.forEach((item: any) => {
      const cat = item.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  const totalBudget = wedding.budget || 0;
  const totalEstimated = items.reduce((s: number, i: any) => s + (i.estimated || 0), 0) || 0;
  const totalPaid = items.reduce((s: number, i: any) => s + (i.paid || 0), 0) || 0;
  const totalBalance = totalEstimated - totalPaid;
  const paidCount = items.filter((i: any) => i.status === "Paid").length;
  const budgetRemaining = totalBudget - totalEstimated;
  const budgetUsedPercent = totalBudget > 0 ? Math.min((totalEstimated / totalBudget) * 100, 100) : 0;
  const paidPercent = totalEstimated > 0 ? Math.min((totalPaid / totalEstimated) * 100, 100) : 0;

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
    setEditing(null); setEditData({});
    onUpdate(); onToast("Item updated", "success");
  };

  const handleAdd = async () => {
    await createBudgetItem(weddingId, { category: "", item: "New Item", estimated: 0, actual: 0, paid: 0, balance: 0, status: "Pending", dueDate: "", notes: "" });
    onUpdate(); onToast("Item created", "success");
  };

  const handleDelete = async (id: string) => {
    await deleteBudgetItem(weddingId, id);
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    onUpdate(); onToast("Item deleted", "success");
  };

  const handleBulkDelete = async () => {
    const count = selected.size;
    await bulkDeleteBudgetItems(weddingId, Array.from(selected));
    setSelected(new Set()); onUpdate(); onToast(`${count} item${count > 1 ? "s" : ""} deleted`, "success");
  };

  const handleBulkAdd = async () => {
    await bulkAddBudgetItems(weddingId, bulkAddCount);
    setShowBulkAdd(false); onUpdate(); onToast(`${bulkAddCount} item${bulkAddCount > 1 ? "s" : ""} created`, "success");
  };

  const isOverdue = (item: any) => item.dueDate && item.dueDate < today && item.status !== "Paid";

  const renderRow = (item: any) => {
    const isEditing = editing === item.id;
    const isSelected = selected.has(item.id);
    const est = isEditing ? (editData.estimated ?? item.estimated) : item.estimated;
    const paid = isEditing ? (editData.paid ?? item.paid) : item.paid;
    const balance = est - paid;
    const overdue = isOverdue(item);

    return (
      <div key={item.id} className={`item-card ${isEditing ? "editing" : ""} ${overdue ? "border-l-4 border-l-red-400" : ""}`}>
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <input type="checkbox" checked={isSelected} onChange={() => { const n = new Set(selected); isSelected ? n.delete(item.id) : n.add(item.id); setSelected(n); }} className="w-4 h-4 rounded accent-maroon cursor-pointer shrink-0" />
            {isEditing ? (
              <div className="grid grid-cols-[auto_1fr] gap-2 w-full items-center">
                <input value={editData.category ?? item.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="py-1.5 px-3.5 w-32 sm:w-40 border border-gray-200 rounded-[10px] text-[0.875rem] text-gray-800 bg-[#fafafa] font-bold focus:border-[#8B0000] focus:shadow-[0_0_0_3px_rgba(139,0,0,0.08)] focus:bg-white outline-none transition-all" placeholder="Category" />
                <input value={editData.item ?? item.item} onChange={(e) => setEditData({ ...editData, item: e.target.value })} className="py-1.5 px-3.5 min-w-0 border border-gray-200 rounded-[10px] text-[0.875rem] text-gray-800 bg-[#fafafa] focus:border-[#8B0000] focus:shadow-[0_0_0_3px_rgba(139,0,0,0.08)] focus:bg-white outline-none transition-all" placeholder="Item name" />
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase truncate shrink-0">{item.category}</span>
                <h4 className="font-bold text-sm sm:text-base truncate min-w-0">{item.item}</h4>
                {overdue && <i className="fas fa-exclamation-triangle text-red-500 text-xs shrink-0" title="Overdue" />}
              </div>
            )}
            {!isEditing && <span className={`status-badge hidden sm:inline-block ${item.status === "Paid" ? "paid" : item.status === "Partial" ? "partial" : "pending"}`}>{item.status}</span>}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isEditing ? (
              <>
                {canEdit && <button onClick={() => handleSave(item.id)} className="btn-save"><i className="fas fa-check sm:mr-1" /> <span className="hidden sm:inline">Save</span></button>}
                <button onClick={() => { setEditing(null); setEditData({}); }} className="btn-cancel"><span className="hidden sm:inline">Cancel</span></button>
              </>
            ) : (
              <>
                {canEdit && <button onClick={() => { setEditing(item.id); setEditData({ category: item.category, item: item.item, estimated: item.estimated, actual: item.actual, paid: item.paid, balance: item.balance, dueDate: item.dueDate, notes: item.notes, status: item.status }); }} className="btn-edit"><i className="fas fa-pen sm:mr-1" /> <span className="hidden sm:inline">Edit</span></button>}
                {canEdit && <button onClick={() => handleDelete(item.id)} className="btn-delete"><i className="fas fa-trash sm:mr-1" /> <span className="hidden sm:inline">Delete</span></button>}
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Estimated</label>
            {isEditing ? <CurrencyInput value={editData.estimated ?? 0} onChange={(val) => setEditData({ ...editData, estimated: val })} currency={wedding.currency} /> : <p className="text-sm font-bold">{formatCurrency(item.estimated, wedding.currency)}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Actual</label>
            {isEditing ? <CurrencyInput value={editData.actual ?? 0} onChange={(val) => setEditData({ ...editData, actual: val })} currency={wedding.currency} /> : <p className="text-sm">{formatCurrency(item.actual, wedding.currency)}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Paid</label>
            {isEditing ? <CurrencyInput value={editData.paid ?? 0} onChange={(val) => setEditData({ ...editData, paid: val })} currency={wedding.currency} /> : <p className="text-sm font-bold text-green">{formatCurrency(item.paid, wedding.currency)}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Balance</label>
            <p className={`text-sm font-bold ${balance > 0 ? "text-yellow" : "text-green"}`}>{formatCurrency(balance, wedding.currency)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Due Date</label>
            {isEditing ? <DatePicker value={editData.dueDate ?? item.dueDate} min={today} onChange={(val) => setEditData({ ...editData, dueDate: val })} /> : <p className={`text-sm ${overdue ? "text-red-600 font-semibold" : "text-gray-600"}`}>{item.dueDate ? new Date(item.dueDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : '\u2014'}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notes</label>
            {isEditing ? <input value={editData.notes ?? item.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="card-input" placeholder="Add notes" /> : <p className="text-sm text-gray-500 truncate">{item.notes || '\u2014'}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-7">
        <div>
          <h2 className="text-2xl font-bold">Budget Tracker</h2>
          <p className="text-gray-500 text-sm">Track every {getCurrencySymbol(wedding.currency)} — from estimate to final payment</p>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          {canEdit && items.length > 0 && (
            <button onClick={() => exportToCSV(items.map((i: any, idx: number) => ({ "#": idx + 1, Category: i.category, Item: i.item, Estimated: i.estimated, Paid: i.paid, Balance: i.balance, Status: i.status, "Due Date": i.dueDate || "", Notes: i.notes || "" })), "budget")} className="btn-edit text-xs py-2 px-3">
              <i className="fas fa-download mr-1.5" /> Export
            </button>
          )}
          {canEdit && <button onClick={() => setShowImport(true)} className="btn-maroon"><i className="fas fa-file-import" /> Import</button>}
          {canEdit && <button onClick={handleAdd} className="btn-maroon"><i className="fas fa-plus" /> Add Item</button>}
        </div>
      </div>

      {/* Summary Cards + Progress Bar */}
      {items.length > 0 && (
        <div className="mb-6">
          <BudgetInsights items={items} totalBudget={totalBudget} wedding={wedding} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <span className="text-2xl font-extrabold block">{formatCurrency(totalBudget, wedding.currency)}</span>
              <span className="text-xs text-gray-500">Total Budget</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <span className="text-2xl font-extrabold block text-blue-600">{formatCurrency(totalEstimated, wedding.currency)}</span>
              <span className="text-xs text-gray-500">Allocated ({items.length} items)</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <span className="text-2xl font-extrabold block text-green">{formatCurrency(totalPaid, wedding.currency)}</span>
              <span className="text-xs text-gray-500">Paid ({paidCount}/{items.length})</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <span className={`text-2xl font-extrabold block ${budgetRemaining > 0 ? "text-yellow" : "text-red"}`}>{formatCurrency(budgetRemaining, wedding.currency)}</span>
              <span className="text-xs text-gray-500">Remaining</span>
            </div>
          </div>
          {/* Visual Progress */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">Budget Usage</span>
              <span className="text-xs font-bold text-maroon">{Math.round(budgetUsedPercent)}% allocated, {Math.round(paidPercent)}% paid</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-gray-200 to-gray-300" style={{ width: `${budgetUsedPercent}%` }} />
            </div>
            <div className="h-2 mt-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-green to-green-600" style={{ width: `${paidPercent}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      {items.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input type="text" placeholder="Search budget items..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="All">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="category">Sort: Category</option>
            <option value="amount-desc">Sort: Highest Amount</option>
            <option value="amount-asc">Sort: Lowest Amount</option>
            <option value="status">Sort: Status</option>
            <option value="due-date">Sort: Due Date</option>
            <option value="name">Sort: Name</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grouped")} className={`px-3 py-2 text-xs font-medium ${viewMode === "grouped" ? "bg-maroon text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}><i className="fas fa-layer-group" /></button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-xs font-medium ${viewMode === "list" ? "bg-maroon text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}><i className="fas fa-list" /></button>
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-maroon/5 border border-maroon/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          {canEdit && <button onClick={handleBulkDelete} className="btn-delete text-xs py-2 px-3"><i className="fas fa-trash mr-1" /> Delete Selected</button>}
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
          {canEdit && <button onClick={handleAdd} className="btn-maroon"><i className="fas fa-plus" /> Add First Item</button>}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm">No items match your filters.</div>
      ) : viewMode === "grouped" ? (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([cat, catItems]) => {
            const catTotal = catItems.reduce((s: number, i: any) => s + (i.estimated || 0), 0);
            const catPaid = catItems.reduce((s: number, i: any) => s + (i.paid || 0), 0);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-maroon inline-block" />{cat}
                    <span className="text-xs font-normal text-gray-400">({catItems.length})</span>
                  </h3>
                  <div className="text-xs font-semibold text-gray-500">{formatCurrency(catTotal, wedding.currency)} est. / {formatCurrency(catPaid, wedding.currency)} paid</div>
                </div>
                <div className="space-y-3">{catItems.map((item: any) => renderRow(item))}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">{filteredItems.map((item: any) => renderRow(item))}</div>
      )}

      {canEdit && items.length > 0 && (
        <button onClick={() => setShowBulkAdd(true)} className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-maroon hover:text-maroon transition-colors cursor-pointer">
          <i className="fas fa-plus mr-1.5" /> Add More Items
        </button>
      )}

      <ImportModal open={showImport} onClose={() => setShowImport(false)} type="budget" onImport={async (imported: any[]) => { await batchCreateBudgetItems(weddingId, imported); onUpdate(); onToast(`${imported.length} item${imported.length > 1 ? "s" : ""} imported`); }} />
    </div>
  );
}
