"use client";

import { useState, useMemo } from "react";
import { createHashtag, updateHashtag, deleteHashtag, bulkDeleteHashtags, batchCreateHashtags, bulkAddHashtags } from "@/lib/actions";
import ImportModal from "@/components/ImportModal";

const STYLES = ["All", "Romantic", "Funny", "Pun", "Traditional", "Modern"];

function generateHashtags(name1: string, name2: string): { text: string; language: string; style: string }[] {
  const n1 = name1.trim();
  const n2 = name2.trim();
  if (!n1 || !n2) return [];

  const n1Lower = n1.toLowerCase();
  const n2Lower = n2.toLowerCase();
  const n1Cap = n1.charAt(0).toUpperCase() + n1.slice(1).toLowerCase();
  const n2Cap = n2.charAt(0).toUpperCase() + n2.slice(1).toLowerCase();

  const results: { text: string; language: string; style: string }[] = [];

  // English Romantic
  results.push({ text: `#${n1Cap}Loves${n2Cap}`, language: "English", style: "Romantic" });
  results.push({ text: `#${n2Cap}Loves${n1Cap}`, language: "English", style: "Romantic" });
  results.push({ text: `#${n1Cap}And${n2Cap}`, language: "English", style: "Romantic" });
  results.push({ text: `#${n1Cap}Weds${n2Cap}`, language: "English", style: "Romantic" });
  results.push({ text: `#${n2Cap}Weds${n1Cap}`, language: "English", style: "Romantic" });
  results.push({ text: `#${n1Cap}${n2Cap}Forever`, language: "English", style: "Romantic" });
  results.push({ text: `#${n1Cap}Meets${n2Cap}`, language: "English", style: "Romantic" });
  results.push({ text: `#TogetherForever${n1Cap}${n2Cap}`, language: "English", style: "Romantic" });

  // English Funny
  results.push({ text: `#${n1Cap}KaSaudagar`, language: "English", style: "Funny" });
  results.push({ text: `#${n2Cap}KaSaudagar`, language: "English", style: "Funny" });
  results.push({ text: `#${n1Cap}Boss`, language: "English", style: "Funny" });
  results.push({ text: `#${n2Cap}Boss`, language: "English", style: "Funny" });
  results.push({ text: `#CoupleGoals${n1Cap}${n2Cap}`, language: "English", style: "Funny" });
  results.push({ text: `#${n1Cap}Ki${n2Cap}`, language: "English", style: "Funny" });
  results.push({ text: `#${n2Cap}Ki${n1Cap}`, language: "English", style: "Funny" });

  // English Pun
  results.push({ text: `#${n1Cap}Ki${n2Cap}`, language: "English", style: "Pun" });
  results.push({ text: `#${n2Cap}Ka${n1Cap}`, language: "English", style: "Pun" });
  results.push({ text: `#${n1Cap}Weds${n2Cap}`, language: "English", style: "Pun" });
  results.push({ text: `#ShaadiMubarak${n1Cap}${n2Cap}`, language: "English", style: "Pun" });
  results.push({ text: `#JodiPakki${n1Cap}${n2Cap}`, language: "English", style: "Pun" });
  results.push({ text: `#DulhaDulhan${n1Cap}${n2Cap}`, language: "English", style: "Pun" });

  // English Traditional
  results.push({ text: `#VivahaUtsav${n1Cap}${n2Cap}`, language: "English", style: "Traditional" });
  results.push({ text: `#ShubhVivaha${n1Cap}${n2Cap}`, language: "English", style: "Traditional" });
  results.push({ text: `#Grihastha${n1Cap}${n2Cap}`, language: "English", style: "Traditional" });
  results.push({ text: `#SaatPhere${n1Cap}${n2Cap}`, language: "English", style: "Traditional" });
  results.push({ text: `#MangalPheras`, language: "English", style: "Traditional" });

  // Hindi (Transliterated) Romantic
  results.push({ text: `#${n1Cap}Ki${n2Cap}`, language: "Hindi", style: "Romantic" });
  results.push({ text: `#${n2Cap}Ka${n1Cap}`, language: "Hindi", style: "Romantic" });
  results.push({ text: `#PyaarKaBandhan${n1Cap}${n2Cap}`, language: "Hindi", style: "Romantic" });
  results.push({ text: `#DilKiDhadkan${n1Cap}${n2Cap}`, language: "Hindi", style: "Romantic" });
  results.push({ text: `#IshqKaIzhaar${n1Cap}${n2Cap}`, language: "Hindi", style: "Romantic" });

  // Hindi Funny
  results.push({ text: `#${n1Cap}KiBoss`, language: "Hindi", style: "Funny" });
  results.push({ text: `#${n2Cap}KiBoss`, language: "Hindi", style: "Funny" });
  results.push({ text: `#ShaadiKaLadoo${n1Cap}${n2Cap}`, language: "Hindi", style: "Funny" });
  results.push({ text: `#PatiParmeshwar${n1Cap}`, language: "Hindi", style: "Funny" });
  results.push({ text: `#BiwiNo1${n2Cap}`, language: "Hindi", style: "Funny" });

  // Hindi Pun
  results.push({ text: `#MehendiLagaDungi`, language: "Hindi", style: "Pun" });
  results.push({ text: `#SangeetNights`, language: "Hindi", style: "Pun" });
  results.push({ text: `#DholAndSangeet`, language: "Hindi", style: "Pun" });
  results.push({ text: `#BandBaaja${n1Cap}${n2Cap}`, language: "Hindi", style: "Pun" });

  // Hindi Traditional
  results.push({ text: `#SindoorKiLaaj`, language: "Hindi", style: "Traditional" });
  results.push({ text: `#Mangalsutra`, language: "Hindi", style: "Traditional" });
  results.push({ text: `#Saptapadi`, language: "Hindi", style: "Traditional" });
  results.push({ text: `#VivahSanskar`, language: "Hindi", style: "Traditional" });

  // Modern / Bilingual
  results.push({ text: `#${n1Cap}X${n2Cap}`, language: "Bilingual", style: "Modern" });
  results.push({ text: `#${n2Cap}X${n1Cap}`, language: "Bilingual", style: "Modern" });
  results.push({ text: `#${n1Cap}${n2Cap}Wedding`, language: "Bilingual", style: "Modern" });
  results.push({ text: `#${n1Cap}${n2Cap}Shaadi`, language: "Bilingual", style: "Modern" });
  results.push({ text: `#JustMarried${n1Cap}${n2Cap}`, language: "Bilingual", style: "Modern" });
  results.push({ text: `#MrAndMrs${n1Cap}`, language: "Bilingual", style: "Modern" });
  results.push({ text: `#NewlyWed${n1Cap}${n2Cap}`, language: "Bilingual", style: "Modern" });
  results.push({ text: `#${n1Cap}${n2Cap}Vibes`, language: "Bilingual", style: "Modern" });

  return results;
}

export default function HashtagGeneratorView({ wedding, weddingId, onUpdate, onToast, canEdit }: any) {
  const hashtags: any[] = wedding.hashtags || [];

  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [activeStyle, setActiveStyle] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState(5);

  const filteredHashtags = useMemo(() => {
    let list = [...hashtags];
    if (activeStyle !== "All") {
      list = list.filter((h) => h.style === activeStyle);
    }
    if (showSaved) {
      return list.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    }
    return list;
  }, [hashtags, activeStyle, showSaved]);

  const favorites = useMemo(() => hashtags.filter((h) => h.favorite), [hashtags]);
  const totalCount = hashtags.length;
  const favCount = favorites.length;

  const handleGenerate = async () => {
    if (!name1.trim() || !name2.trim()) {
      onToast("Please enter both names", "error");
      return;
    }
    const generated = generateHashtags(name1.trim(), name2.trim());
    const existingTexts = new Set(hashtags.map((h) => h.text.toLowerCase()));
    const newHashtags = generated.filter((h) => !existingTexts.has(h.text.toLowerCase()));
    if (newHashtags.length === 0) {
      onToast("All hashtags already generated");
      return;
    }
    try {
      await batchCreateHashtags(weddingId, newHashtags);
      onUpdate();
      onToast(`Generated ${newHashtags.length} hashtags`);
    } catch (e) {
      onToast("Failed to generate hashtags", "error");
    }
  };

  const handleBulkAdd = async () => {
    if (bulkAddCount <= 0) return;
    try {
      await bulkAddHashtags(weddingId, bulkAddCount);
      setShowBulkAdd(false);
      setBulkAddCount(5);
      onUpdate();
      onToast(`${bulkAddCount} row${bulkAddCount > 1 ? "s" : ""} created`);
    } catch {
      onToast("Failed to add rows", "error");
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      onToast("Copied!");
    } catch {
      onToast("Failed to copy", "error");
    }
  };

  const handleCopyAll = async () => {
    const allText = filteredHashtags.map((h) => h.text).join("\n");
    try {
      await navigator.clipboard.writeText(allText);
      onToast("All hashtags copied!");
    } catch {
      onToast("Failed to copy", "error");
    }
  };

  const handleCopyFavorites = async () => {
    if (favorites.length === 0) {
      onToast("No favorites to copy", "error");
      return;
    }
    const favText = favorites.map((h) => h.text).join("\n");
    try {
      await navigator.clipboard.writeText(favText);
      onToast("Favorites copied!");
    } catch {
      onToast("Failed to copy", "error");
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      await updateHashtag(weddingId, id, { favorite: !current });
      onUpdate();
    } catch (e) {
      onToast("Failed to update hashtag", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHashtag(weddingId, id);
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      onUpdate();
      onToast("Hashtag deleted");
    } catch (e) {
      onToast("Failed to delete hashtag", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteHashtags(weddingId, Array.from(selected));
      setSelected(new Set());
      onUpdate();
      onToast(`${selected.size} hashtags deleted`);
    } catch (e) {
      onToast("Failed to delete hashtags", "error");
    }
  };

  const handleBulkFavorite = async (fav: boolean) => {
    try {
      for (const id of Array.from(selected)) {
        await updateHashtag(weddingId, id, { favorite: fav });
      }
      setSelected(new Set());
      onUpdate();
      onToast(`${selected.size} hashtags ${fav ? "favorited" : "unfavorited"}`);
    } catch (e) {
      onToast("Failed to update hashtags", "error");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const languageBadge = (lang: string) => {
    if (lang === "Hindi") return "bg-orange-100 text-orange-700 border-orange-200";
    if (lang === "Bilingual") return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const styleBadge = (style: string) => {
    const colors: Record<string, string> = {
      Romantic: "bg-pink-100 text-pink-700",
      Funny: "bg-yellow-100 text-yellow-700",
      Pun: "bg-green-100 text-green-700",
      Traditional: "bg-red-100 text-red-700",
      Modern: "bg-indigo-100 text-indigo-700",
    };
    return colors[style] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Hashtag Generator</h2>
        {canEdit && (
          <button onClick={() => setShowImport(true)} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            <i className="fas fa-file-import mr-1" /> Import
          </button>
        )}
      </div>

      {/* Name Input */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Partner 1</label>
            <input
              type="text"
              placeholder="e.g. Rahul"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
            />
          </div>
          <span className="text-2xl text-rose-400 pb-1 hidden sm:block">×</span>
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Partner 2</label>
            <input
              type="text"
              placeholder="e.g. Radhika"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!name1.trim() || !name2.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-200"
          >
            <i className="fas fa-wand-magic-sparkles mr-1" /> Generate
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-rose-500">{favCount}</div>
          <div className="text-xs text-gray-500">Favorites</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{totalCount - favCount}</div>
          <div className="text-xs text-gray-500">Generated</div>
        </div>
      </div>

      {/* Style Filters */}
      <div className="flex flex-wrap gap-2">
        {STYLES.map((style) => (
          <button
            key={style}
            onClick={() => setActiveStyle(style)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeStyle === style
                ? "bg-rose-500 text-white shadow"
                : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300"
            }`}
          >
            {style}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkFavorite(true)} className="px-3 py-1 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium">Favorite</button>
            <button onClick={() => handleBulkFavorite(false)} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Unfavorite</button>
            <button onClick={handleBulkDelete} className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">Delete</button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Clear</button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {hashtags.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <i className="fas fa-hashtag text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 mb-1">No hashtags yet</p>
          <p className="text-xs text-gray-400">Enter both names above and click Generate</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHashtags.map((h) => (
            <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:border-rose-300 transition-colors flex items-center gap-3 group">
              {canEdit && (
                <input type="checkbox" checked={selected.has(h.id)} onChange={() => toggleSelect(h.id)} className="w-4 h-4 text-rose-500 rounded border-gray-300" />
              )}
              <button
                onClick={() => canEdit && handleToggleFavorite(h.id, h.favorite)}
                className={`text-lg transition-colors ${h.favorite ? "text-rose-500" : "text-gray-300 hover:text-rose-400"}`}
              >
                {h.favorite ? "❤️" : "🤍"}
              </button>
              <span className="flex-1 font-mono text-sm font-medium text-gray-800">{h.text}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${languageBadge(h.language)}`}>
                {h.language}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styleBadge(h.style)}`}>
                {h.style}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(h.text, h.id)}
                  className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  {copiedId === h.id ? "✓" : "Copy"}
                </button>
                {canEdit && (
                  <button onClick={() => handleDelete(h.id)} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={handleCopyAll} className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
            <i className="fas fa-copy mr-1" /> Copy All
          </button>
          <button onClick={handleCopyFavorites} className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
            <i className="fas fa-heart mr-1" /> Copy Favorites
          </button>
          <button
            onClick={() => {
              const csv = filteredHashtags.map((h) => `${h.text},${h.language},${h.style},${h.favorite ? "Yes" : "No"}`).join("\n");
              const blob = new Blob(["Hashtag,Language,Style,Favorite\n" + csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "hashtags.csv";
              a.click();
              URL.revokeObjectURL(url);
              onToast("Hashtags exported");
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            <i className="fas fa-download mr-1" /> Export CSV
          </button>
        </div>
      )}

      {/* Add More */}
      {canEdit && (
        <button onClick={() => setShowBulkAdd(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-rose-400 hover:text-rose-500 text-sm font-medium transition-colors">
          <i className="fas fa-plus mr-1" /> Add Blank Hashtags
        </button>
      )}

      {showBulkAdd && canEdit && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-lg">
          <span className="text-sm font-medium">Add how many hashtags?</span>
          <input type="number" min={1} max={500} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center" />
          <button onClick={handleBulkAdd} className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600">Add</button>
          <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(5); }} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
        </div>
      )}

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="hashtags"
        onImport={async (items: any[]) => {
          await batchCreateHashtags(weddingId, items);
          onUpdate();
        }}
      />
    </div>
  );
}
