"use client";

import { useState, useMemo } from "react";
import { createChecklistItem, updateChecklistItem, deleteChecklistItem, bulkDeleteChecklistItems, bulkUpdateChecklistItems, batchCreateChecklistItems } from "@/lib/actions";

const TABS = [
  { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
  { id: "Priest Requirements", icon: "fa-om", label: "Priest Requirements" },
  { id: "Vidaai Essentials", icon: "fa-heart-crack", label: "Vidaai Essentials" },
];

const DEFAULTS: Record<string, string[]> = {
  "Emergency Kit": [
    "Phone charger + power bank",
    "Cash (small notes for tips)",
    "First aid kit (band-aids, painkillers, antacid)",
    "Safety pins (multiple sizes)",
    "Stain remover pen",
    "Sewing kit (needle, thread, buttons)",
    "Deodorant / perfume",
    "Tissues / wet wipes",
    "Mouth freshener / mints",
    "Hair ties / bobby pins",
    "Clear nail polish (for stocking runs)",
    "Double-sided tape (for outfit fixes)",
    "Blister plasters",
    "Electrolyte packets",
  ],
  "Priest Requirements": [
    "Havan samagri (samagri kit)",
    "Rice (akshat) — 1 kg",
    "Ghee — 500g",
    "Coconuts (2-3)",
    "Kumkum / sindoor",
    "Turmeric (haldi)",
    "Sandalwood paste (chandan)",
    "Flowers / garlands",
    "Kalash (copper/brass)",
    "Mango leaves",
    "Banana leaves (for seating)",
    "Paan leaves",
    "Supari (areca nuts)",
    "Cloves / elaichi",
    "Camphor (kapur)",
    "Annadaan rice (for charity)",
  ],
  "Vidaai Essentials": [
    "Rice for vidaai (to throw behind bride)",
    "Coins (for vidaai ritual)",
    "Sweets (for distribution)",
    "Rose water / ittar",
    "Coconut (wrapped in red cloth)",
    "Choora (bangles) set",
    "Churiya (anklets)",
    "Wedding outfit for next day",
    "Toiletries for travel",
    "Snacks for journey",
  ],
};

const TAB_ICONS: Record<string, string> = {
  "Emergency Kit": "🏥",
  "Priest Requirements": "🙏",
  "Vidaai Essentials": "💔",
};

export default function CulturalChecklistsView({ wedding, weddingId, onUpdate, onToast, canEdit, initialTab }: any) {
  const allItems: any[] = wedding.checklistItems || [];
  const [activeTab, setActiveTab] = useState(initialTab || "Emergency Kit");
  const [newItemText, setNewItemText] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const items = useMemo(() => allItems.filter((i) => i.category === activeTab), [allItems, activeTab]);

  const totalByTab = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {};
    for (const tab of TABS) {
      const tabItems = allItems.filter((i) => i.category === tab.id);
      counts[tab.id] = { total: tabItems.length, done: tabItems.filter((i) => i.done).length };
    }
    return counts;
  }, [allItems]);

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleAdd = async () => {
    if (!newItemText.trim()) return;
    try {
      await createChecklistItem(weddingId, { category: activeTab, text: newItemText.trim() });
      setNewItemText("");
      onUpdate();
      onToast("Item added");
    } catch (e) {
      onToast("Failed to add item", "error");
    }
  };

  const handleToggle = async (id: string, done: boolean) => {
    try {
      await updateChecklistItem(weddingId, id, { done: !done });
      onUpdate();
    } catch (e) {
      onToast("Failed to update item", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChecklistItem(weddingId, id);
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      onUpdate();
      onToast("Item deleted");
    } catch (e) {
      onToast("Failed to delete item", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteChecklistItems(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`${selected.size} items deleted`);
    } catch (e) {
      onToast("Failed to delete items", "error");
    }
  };

  const handleBulkToggle = async (done: boolean) => {
    try {
      await bulkUpdateChecklistItems(weddingId, Array.from(selected), { done });
      setSelected(new Set());
      onUpdate();
      onToast(`${selected.size} items ${done ? "completed" : "uncompleted"}`);
    } catch (e) {
      onToast("Failed to update items", "error");
    }
  };

  const handleLoadDefaults = async () => {
    const defaults = DEFAULTS[activeTab] || [];
    const existingTexts = new Set(allItems.filter((i) => i.category === activeTab).map((i) => i.text.toLowerCase()));
    const newDefaults = defaults.filter((d) => !existingTexts.has(d.toLowerCase()));
    if (newDefaults.length === 0) {
      onToast("All defaults already added");
      return;
    }
    try {
      await batchCreateChecklistItems(weddingId, newDefaults.map((text) => ({ category: activeTab, text })));
      onUpdate();
      onToast(`Added ${newDefaults.length} default items`);
    } catch (e) {
      onToast("Failed to load defaults", "error");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Cultural Checklists</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const counts = totalByTab[tab.id] || { total: 0, done: 0 };
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelected(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300"
              }`}
            >
              <span>{TAB_ICONS[tab.id]}</span>
              <span>{tab.label}</span>
              {counts.total > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
                  {counts.done}/{counts.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-medium text-gray-900">{doneCount}/{totalCount} ({progress}%)</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkToggle(true)} className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">Complete</button>
            <button onClick={() => handleBulkToggle(false)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium">Uncomplete</button>
            <button onClick={handleBulkDelete} className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">Delete</button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Clear</button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">{TAB_ICONS[activeTab]}</div>
          <p className="text-gray-500 mb-1">No items in {activeTab} yet</p>
          <p className="text-xs text-gray-400 mb-4">Load defaults or add your own items</p>
          {canEdit && (
            <div className="flex gap-2 justify-center">
              <button onClick={handleLoadDefaults} className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-sm font-medium">
                Load Defaults
              </button>
              <button onClick={() => { setNewItemText(""); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium">
                Add Manually
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Checklist Items */}
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group">
                {canEdit && (
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500"
                  />
                )}
                <button
                  onClick={() => canEdit && handleToggle(item.id, item.done)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    item.done
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-rose-400"
                  }`}
                >
                  {item.done && <i className="fas fa-check text-xs" />}
                </button>
                <span className={`flex-1 text-sm ${item.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {item.text}
                </span>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-opacity"
                  >
                    <i className="fas fa-trash" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Load Defaults Button */}
          {canEdit && (
            <button onClick={handleLoadDefaults} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-rose-400 hover:text-rose-500 text-sm font-medium transition-colors">
              <i className="fas fa-download mr-1" /> Load Missing Defaults
            </button>
          )}
        </>
      )}

      {/* Add Item */}
      {canEdit && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Add item to ${activeTab}...`}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          />
          <button
            onClick={handleAdd}
            disabled={!newItemText.trim()}
            className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
