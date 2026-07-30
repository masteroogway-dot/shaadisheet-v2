"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { createChecklistItem, updateChecklistItem, deleteChecklistItem, bulkDeleteChecklistItems, bulkUpdateChecklistItems, batchCreateChecklistItems, bulkAddChecklistItems } from "@/lib/actions";
import ImportModal from "@/components/ImportModal";

function getTabsForWedding(wedding: any) {
  const religion = wedding?.religion || "hindu";
  const country = wedding?.country || "india";

  const tabsByReligion: Record<string, Array<{ id: string; icon: string; label: string }>> = {
    hindu: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Priest Requirements", icon: "fa-om", label: "Priest Requirements" },
      { id: "Vidaai Essentials", icon: "fa-heart-crack", label: "Vidaai Essentials" },
    ],
    muslim: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Nikah Preparation", icon: "fa-book-open", label: "Nikah Preparation" },
      { id: "Walima Essentials", icon: "fa-utensils", label: "Walima Essentials" },
    ],
    sikh: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Gurdwara Requirements", icon: "fa-landmark", label: "Gurdwara Requirements" },
      { id: "Anand Karaj Essentials", icon: "fa-music", label: "Anand Karaj Essentials" },
      { id: "Langar Planning", icon: "fa-bowl-food", label: "Langar Planning" },
    ],
    jain: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Jain Catering Rules", icon: "fa-leaf", label: "Jain Catering Rules" },
      { id: "Ceremony Essentials", icon: "fa-fire", label: "Ceremony Essentials" },
    ],
    christian: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Church Requirements", icon: "fa-church", label: "Church Requirements" },
      { id: "Roce Ceremony", icon: "fa-droplet", label: "Roce Ceremony" },
    ],
    buddhist: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Poruwa Preparation", icon: "fa-torii-gate", label: "Poruwa Preparation" },
      { id: "Nekath Planning", icon: "fa-star", label: "Nekath Planning" },
    ],
    parsi: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Priest Requirements", icon: "fa-fire", label: "Priest Requirements" },
      { id: "Fire Ceremony", icon: "fa-fire-flame-curved", label: "Fire Ceremony" },
    ],
  };

  const tabsByCountry: Record<string, Array<{ id: string; icon: string; label: string }>> = {
    pakistan: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Dholki Essentials", icon: "fa-drum", label: "Dholki Essentials" },
      { id: "Baraat Planning", icon: "fa-horse", label: "Baraat Planning" },
      { id: "Nikah Preparation", icon: "fa-book-open", label: "Nikah Preparation" },
    ],
    bangladesh: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Gaye Holud Essentials", icon: "fa-sun", label: "Gaye Holud Essentials" },
      { id: "Nikah Preparation", icon: "fa-book-open", label: "Nikah Preparation" },
    ],
    sri_lanka: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Poruwa Preparation", icon: "fa-torii-gate", label: "Poruwa Preparation" },
      { id: "Nekath Planning", icon: "fa-star", label: "Nekath Planning" },
    ],
    nepal: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Janti Planning", icon: "fa-music", label: "Janti Planning" },
      { id: "Dubo Ko Mala", icon: "fa-seedling", label: "Dubo Ko Mala" },
    ],
    maldives: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Henna Night", icon: "fa-hand-sparkles", label: "Henna Night" },
      { id: "Nikah Preparation", icon: "fa-book-open", label: "Nikah Preparation" },
      { id: "Resort Coordination", icon: "fa-umbrella-beach", label: "Resort Coordination" },
    ],
    afghanistan: [
      { id: "Emergency Kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "Khwara Essentials", icon: "fa-ring", label: "Khwara Essentials" },
      { id: "Nikah Preparation", icon: "fa-book-open", label: "Nikah Preparation" },
      { id: "Attan Dance Planning", icon: "fa-music", label: "Attan Dance Planning" },
      { id: "Mahr Documentation", icon: "fa-file-contract", label: "Mahr Documentation" },
    ],
  };

  if (country !== "india" && tabsByCountry[country]) {
    return tabsByCountry[country];
  }
  return tabsByReligion[religion] || tabsByReligion.hindu;
}

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
  "Nikah Preparation": [
    "Nikah-nama (marriage contract) printed",
    "Mahr amount decided and documented",
    "Two male Muslim witnesses confirmed",
    "Qazi (officiant) booked",
    "Quran for Aarsi Mushaf ceremony",
    "Venue booking confirmed",
    "Catering arranged (halal)",
    "Stage decoration planned",
  ],
  "Walima Essentials": [
    "Catering booking confirmed",
    "Stage decoration finalized",
    "Lighting and sound arranged",
    "Guest seating planned",
    "Welcome desk setup",
    "Photography/videography booked",
    "Gifts for guests arranged",
  ],
  "Gurdwara Requirements": [
    "Gurdwara booking confirmed",
    "Head coverings for all guests arranged",
    "Kirpan for groom",
    "Chooda set (21 bangles) bought",
    "Rumala (cloth for Guru Granth Sahib)",
    "Karah Prashad ingredients",
    "Flower decorations for Palki Sahib",
  ],
  "Anand Karaj Essentials": [
    "Granthi (priest) confirmed",
    "Laavan hymns booklets printed",
    "Flower decorations for Palki Sahib",
    "Floor seating for guests arranged",
    "Musicians (Rababi) booked",
    "Langar kitchen coordination done",
  ],
  "Langar Planning": [
    "Langar menu decided",
    "Volunteer cooks confirmed",
    "Langar hall booking confirmed",
    "Utensils and plates arranged",
    "Washing area setup",
    "Food serving volunteers briefed",
  ],
  "Jain Catering Rules": [
    "No root vegetables confirmed with caterer",
    "Jain caterer booked",
    "Kitchen purity maintained",
    "Separate utensils for Jain food",
    "No onion/garlic in any dish verified",
    "Fruit-based sweets only",
  ],
  "Ceremony Essentials": [
    "Mada Mandap decorated",
    "Sacred fire arranged",
    "Mangal Pheras setup ready",
    "Granthi Bandhan (tying the knot) items",
    "Saptapadi items prepared",
    "Ashirwad (blessings) plan finalized",
  ],
  "Church Requirements": [
    "Church booking confirmed",
    "Pastor/priest confirmed",
    "Pre-marriage counseling completed",
    "Banns announced",
    "Church decoration planned",
    "Music/choir arranged",
  ],
  "Roce Ceremony": [
    "Turmeric paste prepared",
    "Coconut milk arranged",
    "Roce outfit for bride/groom ready",
    "Guest arrangements confirmed",
    "Music playlist prepared",
    "Photography booked",
  ],
  "Poruwa Preparation": [
    "Poruwa (wooden platform) constructed",
    "Platform decorated with flowers",
    "Astrologer consultation (Nekath) done",
    "Betel leaves for elders arranged",
    "Gold thread for Nalangu prepared",
    "Oil lamp for ceremony arranged",
  ],
  "Nekath Planning": [
    "Astrologer consulted for auspicious times",
    "Nekath (astrological requirements) documented",
    "Poruwa construction timeline set",
    "Traditional items list prepared",
    "Blessings ceremony安排 confirmed",
  ],
  "Dholki Essentials": [
    "Dholak (drum) arranged",
    "Song list prepared",
    "Guest snacks arranged",
    "Seating arrangement done",
    "Microphone/speaker arranged",
  ],
  "Baraat Planning": [
    "Horse/car booking for groom confirmed",
    "Dhol (drum) players booked",
    "Baraat route planned",
    "Joota Chupai plan (sisters hide shoes) ready",
    "Doodh Pilai arrangement done",
    "Welcome refreshments planned",
  ],
  "Gaye Holud Essentials": [
    "Turmeric paste prepared",
    "Sweets and gifts from groom's family arranged",
    "Decorated rohu fish prepared",
    "Yellow theme decorations done",
    "Folk music (dhol, ektara) arranged",
    "Guest seating planned",
  ],
  "Janti Planning": [
    "Panche Baja musicians booked",
    "Groom's horse/car decorated",
    "Baraat route planned",
    "Welcome refreshments arranged",
    "Flower garlands for groom ready",
  ],
  "Dubo Ko Mala": [
    "Bermuda grass garlands prepared (never wilt)",
    "Garlands for bride and groom ready",
    "Symbolic of long marriage — explained to family",
    "Backup artificial garlands arranged",
  ],
  "Henna Night": [
    "Henna artist booked",
    "Bridal henna design decided",
    "Guest henna arrangements made",
    "Yellow/green theme decorations",
    "Traditional music arranged",
    "Refreshments planned",
  ],
  "Resort Coordination": [
    "Resort booking confirmed",
    "Guest travel arrangements made",
    "Accommodation for guests arranged",
    "Catering menu finalized",
    "Decor and lighting planned",
    "Photography/videography booked",
  ],
  "Khwara Essentials": [
    "Engagement gifts exchanged",
    "Mahr (bride price) negotiated",
    "Families formally introduced",
    "Date for Nikah set",
    "Traditional sweets served",
  ],
  "Attan Dance Planning": [
    "Attan musicians booked",
    "Dance circle space arranged",
    "Traditional drums (tabla/zirbaghali) arranged",
    "Guest participation encouraged",
    "Performance area cleared",
    "Music playlist prepared",
  ],
  "Mahr Documentation": [
    "Mahr amount agreed upon",
    "Written contract prepared",
    "Witnesses signed",
    "Mahr items prepared",
    "Family consent documented",
    "Gifts for bride listed",
  ],
  "Fire Ceremony": [
    "Atash (sacred fire) arranged",
    "Parsi priest (Mobed) confirmed",
    "Haath Boravanu items prepared",
    "Lagan ceremony setup",
    "Flowers and decorations",
    "Parsi wedding attire ready",
  ],
};

const TAB_ICONS: Record<string, string> = {
  "Emergency Kit": "\uD83C\uDFE5",
  "Priest Requirements": "\uD83D\uDE4F",
  "Vidaai Essentials": "\uD83D\uDC94",
  "Nikah Preparation": "\uD83D\uDCD6",
  "Walima Essentials": "\uD83C\uDF7D",
  "Gurdwara Requirements": "\uD83C\uDFDB",
  "Anand Karaj Essentials": "\uD83C\uDFB5",
  "Langar Planning": "\uD83C\uDF72",
  "Jain Catering Rules": "\uD83C\uDF3F",
  "Ceremony Essentials": "\uD83D\uDD25",
  "Church Requirements": "\u26EA",
  "Roce Ceremony": "\uD83D\uDCA7",
  "Poruwa Preparation": "\u26E9",
  "Nekath Planning": "\u2B50",
  "Dholki Essentials": "\uD83E\uDD41",
  "Baraat Planning": "\uD83D\uDC34",
  "Gaye Holud Essentials": "\u2600",
  "Janti Planning": "\uD83C\uDFB6",
  "Dubo Ko Mala": "\uD83C\uDF31",
  "Henna Night": "\uD83E\uDDC4",
  "Resort Coordination": "\uD83C\uDFD6",
  "Khwara Essentials": "\uD83D\uDC8D",
  "Attan Dance Planning": "\uD83C\uDFB5",
  "Mahr Documentation": "\uD83D\uDCC4",
  "Fire Ceremony": "\uD83D\uDD25",
};

export default function CulturalChecklistsView({ wedding, weddingId, onUpdate, onToast, canEdit, initialTab }: any) {
  const allItems: any[] = wedding.checklistItems || [];
  const TABS = getTabsForWedding(wedding);
  const [activeTab, setActiveTab] = useState(initialTab || TABS[0]?.id || "Emergency Kit");
  const [newItemText, setNewItemText] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState(5);
  const [showPriestCard, setShowPriestCard] = useState(false);
  const prevProgress = useRef(0);

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

  const handleBulkAdd = async () => {
    if (bulkAddCount <= 0) return;
    try {
      await bulkAddChecklistItems(weddingId, bulkAddCount, activeTab);
      setShowBulkAdd(false);
      setBulkAddCount(5);
      onUpdate();
      onToast(`${bulkAddCount} row${bulkAddCount > 1 ? "s" : ""} created`);
    } catch {
      onToast("Failed to add rows", "error");
    }
  };

  const handleToggle = async (id: string, done: boolean) => {
    try {
      await updateChecklistItem(weddingId, id, { done: !done });
      onUpdate();
      // Confetti on completion
      if (!done) {
        const newDone = items.filter((i) => i.id === id ? true : i.done).length + 1;
        if (newDone === items.length && items.length > 0) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ["#D4AF37", "#8B0000", "#2E7D32", "#FF6B6B"] });
        }
      }
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

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Cultural Checklists</h2>
        <div className="flex gap-2">
          {canEdit && items.length > 0 && (
            <button onClick={toggleSelectAll} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              <i className="fas fa-check-double mr-1" /> {selected.size === items.length ? "Deselect All" : "Select All"}
            </button>
          )}
          {canEdit && (
            <button onClick={() => setShowImport(true)} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              <i className="fas fa-file-import mr-1" /> Import
            </button>
          )}
        </div>
      </div>

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
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-bold text-gray-900">{doneCount}/{totalCount} ({progress}%)</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full transition-all duration-500"
              style={{ background: progress === 100 ? "linear-gradient(90deg, #2E7D32, #4CAF50)" : "linear-gradient(90deg, #E53935, #D4AF37, #8B0000)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          {progress === 100 && (
            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-bold text-green mt-2">
              🎉 All items complete! You&apos;re ready!
            </motion.p>
          )}
        </div>
      )}

      {/* Priest Card Button */}
      {activeTab === "Priest Requirements" && items.length > 0 && (
        <button onClick={() => setShowPriestCard(true)} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200 transition-all">
          🙏 Print Priest Instruction Card
        </button>
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
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl mb-3">{TAB_ICONS[activeTab]}</motion.div>
          <p className="text-gray-700 font-semibold mb-1">No items in {activeTab} yet</p>
          <p className="text-gray-400 text-sm mb-4">Load defaults or add your own items</p>
          {canEdit && (
            <div className="flex gap-2 justify-center">
              <button onClick={handleLoadDefaults} className="px-5 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 text-sm font-medium shadow-lg shadow-rose-200">
                Load Defaults
              </button>
              <button onClick={() => { setNewItemText(""); }} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 text-sm font-medium">
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
                    className="sm:opacity-0 sm:group-hover:opacity-100 px-2.5 py-2 text-xs text-red-500 hover:bg-red-50 rounded transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <i className="fas fa-trash" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Load Defaults Button */}
          {canEdit && (
            <>
              <button onClick={handleLoadDefaults} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-rose-400 hover:text-rose-500 text-sm font-medium transition-colors">
                <i className="fas fa-download mr-1" /> Load Missing Defaults
              </button>
              <button onClick={() => setShowBulkAdd(true)} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-rose-400 hover:text-rose-500 text-sm font-medium transition-colors">
                <i className="fas fa-plus mr-1" /> Add Blank Items
              </button>
            </>
          )}
        </>
      )}

      {/* Bulk Add */}
      {showBulkAdd && canEdit && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-lg">
          <span className="text-sm font-medium">Add how many items?</span>
          <input type="number" min={1} max={500} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center" />
          <button onClick={handleBulkAdd} className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600">Add</button>
          <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(5); }} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
        </div>
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

      {/* Priest Card Modal */}
      <AnimatePresence>
        {showPriestCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPriestCard(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">🙏 Priest Instruction Card</h3>
                <button onClick={() => setShowPriestCard(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div id="priest-card" className="border-2 border-amber-300 rounded-xl p-5" style={{ background: "linear-gradient(135deg, #FFFBF0, #FFF8E8)" }}>
                <div className="text-center mb-3">
                  <p className="text-amber-800 text-xs tracking-widest uppercase font-bold">Puja Samagri</p>
                  <h4 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                    {wedding?.partner1Name || "Partner 1"} & {wedding?.partner2Name || "Partner 2"}
                  </h4>
                </div>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.done ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}>
                        {item.done && <span className="text-[10px]">✓</span>}
                      </span>
                      <span className={item.done ? "line-through text-gray-400" : "text-gray-800"}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-4 border-t border-amber-200 pt-2">Generated by ShaadiSheet</p>
              </div>
              <button onClick={() => {
                const text = `PUJA SAMAGRI\n${wedding?.partner1Name || "Partner 1"} & ${wedding?.partner2Name || "Partner 2"}\n\n${items.map((i) => `☐ ${i.text}`).join("\n")}`;
                navigator.clipboard.writeText(text);
                onToast("Card copied!");
              }} className="w-full mt-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors">
                Copy to Clipboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="checklists"
        onImport={async (items: any[]) => {
          const withCategory = items.map((item) => ({ ...item, category: item.category || activeTab }));
          await batchCreateChecklistItems(weddingId, withCategory);
          onUpdate();
        }}
      />
    </div>
  );
}
