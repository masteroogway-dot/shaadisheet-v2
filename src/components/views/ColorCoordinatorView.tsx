"use client";

import { useState, useMemo } from "react";
import {
  createEventColorTheme, updateEventColorTheme, deleteEventColorTheme,
  createOutfitColor, updateOutfitColor, deleteOutfitColor,
} from "@/lib/actions";

interface Props {
  wedding: any;
  weddingId: string;
  onUpdate: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  canEdit?: boolean;
}

const MOODS = ["Vibrant", "Elegant", "Traditional", "Modern", "Romantic", "Rustic"];
const PRESETS: Record<string, { primary: string; secondary: string; accent: string }> = {
  Mehendi: { primary: "#228B22", secondary: "#90EE90", accent: "#FFD700" },
  Haldi: { primary: "#FFD700", secondary: "#FFA500", accent: "#FFF8DC" },
  Sangeet: { primary: "#DAA520", secondary: "#FFD700", accent: "#8B0000" },
  Wedding: { primary: "#DC143C", secondary: "#FF6347", accent: "#FFD700" },
  Reception: { primary: "#4B0082", secondary: "#9370DB", accent: "#C0C0C0" },
};

function hexToName(hex: string) {
  const colors: Record<string, string> = {
    "#DC143C": "Crimson", "#FFD700": "Gold", "#228B22": "Forest Green",
    "#4B0082": "Indigo", "#FF6347": "Tomato", "#90EE90": "Light Green",
    "#FFA500": "Orange", "#8B0000": "Dark Red", "#C0C0C0": "Silver",
    "#FFF8DC": "Cornsilk", "#9370DB": "Medium Purple", "#DAA520": "Goldenrod",
  };
  return colors[hex.toUpperCase()] || hex;
}

export default function ColorCoordinatorView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: Props) {
  const themes = wedding.colorThemes || [];
  const outfitColors = wedding.outfitColors || [];
  const events = JSON.parse(wedding.selectedEvents || "[]");

  const [activeTab, setActiveTab] = useState<"themes" | "outfits">("themes");
  const [showAddTheme, setShowAddTheme] = useState(false);
  const [showAddOutfit, setShowAddOutfit] = useState(false);
  const [newTheme, setNewTheme] = useState({ eventName: "", primaryColor: "#DC143C", secondaryColor: "", accentColor: "", mood: "", notes: "" });
  const [newOutfit, setNewOutfit] = useState({ eventName: "", person: "", outfitDesc: "", primaryColor: "", secondaryColor: "", accentColor: "", matchScore: 50, notes: "" });
  const [editingTheme, setEditingTheme] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleAddTheme = async () => {
    if (!newTheme.eventName.trim()) return onToast("Event name is required", "error");
    try {
      await createEventColorTheme(weddingId, newTheme);
      setNewTheme({ eventName: "", primaryColor: "#DC143C", secondaryColor: "", accentColor: "", mood: "", notes: "" });
      setShowAddTheme(false);
      onUpdate();
      onToast("Color theme added");
    } catch { onToast("Failed to add theme", "error"); }
  };

  const handleSaveTheme = async (id: string) => {
    try {
      await updateEventColorTheme(weddingId, id, editData);
      setEditingTheme(null);
      setEditData({});
      onUpdate();
      onToast("Theme updated");
    } catch { onToast("Failed to update", "error"); }
  };

  const handleDeleteTheme = async (id: string) => {
    try {
      await deleteEventColorTheme(weddingId, id);
      onUpdate();
      onToast("Theme deleted");
    } catch { onToast("Failed to delete", "error"); }
  };

  const handleAddOutfit = async () => {
    if (!newOutfit.eventName.trim()) return onToast("Event name is required", "error");
    try {
      await createOutfitColor(weddingId, newOutfit);
      setNewOutfit({ eventName: "", person: "", outfitDesc: "", primaryColor: "", secondaryColor: "", accentColor: "", matchScore: 50, notes: "" });
      setShowAddOutfit(false);
      onUpdate();
      onToast("Outfit added");
    } catch { onToast("Failed to add outfit", "error"); }
  };

  const handleSaveOutfit = async (id: string, data: any) => {
    try {
      await updateOutfitColor(weddingId, id, data);
      onUpdate();
      onToast("Outfit updated");
    } catch { onToast("Failed to update", "error"); }
  };

  const handleDeleteOutfit = async (id: string) => {
    try {
      await deleteOutfitColor(weddingId, id);
      onUpdate();
      onToast("Outfit deleted");
    } catch { onToast("Failed to delete", "error"); }
  };

  const applyPreset = (eventName: string) => {
    const preset = PRESETS[eventName];
    if (preset) {
      setNewTheme({ ...newTheme, eventName, primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent });
    } else {
      setNewTheme({ ...newTheme, eventName });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Color Coordinator</h1>
          <p className="text-sm text-gray-500 mt-1">Coordinate color themes across all your wedding events</p>
        </div>
        {canEdit && (
          <button onClick={() => activeTab === "themes" ? setShowAddTheme(true) : setShowAddOutfit(true)}
            className="px-4 py-2 text-sm bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark cursor-pointer">
            <i className="fas fa-plus mr-1" /> Add {activeTab === "themes" ? "Theme" : "Outfit"}
          </button>
        )}
      </div>

      {/* Color Journey Preview */}
      {themes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Color Journey</h3>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {themes.map((theme: any, i: number) => (
              <div key={theme.id} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-0.5">
                    <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: theme.primaryColor }} title={theme.eventName} />
                    {theme.secondaryColor && <div className="w-4 h-4 rounded-full border border-gray-200 mt-1" style={{ backgroundColor: theme.secondaryColor }} />}
                  </div>
                  <span className="text-[0.6rem] text-gray-500 font-medium">{theme.eventName}</span>
                </div>
                {i < themes.length - 1 && <div className="w-6 h-0.5 bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {(["themes", "outfits"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {tab === "themes" ? "Event Themes" : "Outfit Colors"}
          </button>
        ))}
      </div>

      {activeTab === "themes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400">
              <i className="fas fa-palette text-4xl mb-3" />
              <p>No color themes yet. Add your first event theme!</p>
            </div>
          )}
          {themes.map((theme: any) => (
            <div key={theme.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-bold text-gray-900">{theme.eventName}</span>
                  {theme.mood && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">{theme.mood}</span>}
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingTheme(theme.id); setEditData({}); }}
                      className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center cursor-pointer"><i className="fas fa-pen text-xs" /></button>
                    <button onClick={() => handleDeleteTheme(theme.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center cursor-pointer"><i className="fas fa-trash text-xs" /></button>
                  </div>
                )}
              </div>

              {editingTheme === theme.id ? (
                <div className="space-y-2">
                  <input value={editData.eventName ?? theme.eventName} onChange={(e) => setEditData({ ...editData, eventName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Event name" />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[0.65rem] text-gray-500 block mb-1">Primary</label>
                      <input type="color" value={editData.primaryColor ?? theme.primaryColor} onChange={(e) => setEditData({ ...editData, primaryColor: e.target.value })} className="w-full h-9 rounded-lg border cursor-pointer" />
                    </div>
                    <div>
                      <label className="text-[0.65rem] text-gray-500 block mb-1">Secondary</label>
                      <input type="color" value={editData.secondaryColor ?? (theme.secondaryColor || "#ffffff")} onChange={(e) => setEditData({ ...editData, secondaryColor: e.target.value })} className="w-full h-9 rounded-lg border cursor-pointer" />
                    </div>
                    <div>
                      <label className="text-[0.65rem] text-gray-500 block mb-1">Accent</label>
                      <input type="color" value={editData.accentColor ?? (theme.accentColor || "#ffffff")} onChange={(e) => setEditData({ ...editData, accentColor: e.target.value })} className="w-full h-9 rounded-lg border cursor-pointer" />
                    </div>
                  </div>
                  <select value={editData.mood ?? theme.mood} onChange={(e) => setEditData({ ...editData, mood: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Select mood</option>
                    {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button onClick={() => handleSaveTheme(theme.id)} className="w-full py-2 bg-maroon text-white rounded-lg text-sm font-semibold cursor-pointer">Save</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1 h-12 rounded-lg border border-gray-200" style={{ backgroundColor: theme.primaryColor }} title={`Primary: ${hexToName(theme.primaryColor)}`} />
                    {theme.secondaryColor && <div className="flex-1 h-12 rounded-lg border border-gray-200" style={{ backgroundColor: theme.secondaryColor }} title={`Secondary: ${hexToName(theme.secondaryColor)}`} />}
                    {theme.accentColor && <div className="flex-1 h-12 rounded-lg border border-gray-200" style={{ backgroundColor: theme.accentColor }} title={`Accent: ${hexToName(theme.accentColor)}`} />}
                  </div>
                  <div className="flex gap-2 text-[0.65rem] text-gray-500">
                    <span>{hexToName(theme.primaryColor)}</span>
                    {theme.secondaryColor && <span>| {hexToName(theme.secondaryColor)}</span>}
                    {theme.accentColor && <span>| {hexToName(theme.accentColor)}</span>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "outfits" && (
        <div className="space-y-3">
          {outfitColors.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <i className="fas fa-shirt text-4xl mb-3" />
              <p>No outfit colors yet. Add your first outfit!</p>
            </div>
          )}
          {outfitColors.map((outfit: any) => (
            <div key={outfit.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{outfit.person || "Unknown"}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{outfit.eventName}</span>
                    {outfit.matchScore > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${outfit.matchScore >= 80 ? "bg-green-100 text-green-700" : outfit.matchScore >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {outfit.matchScore}% match
                      </span>
                    )}
                  </div>
                  {outfit.outfitDesc && <p className="text-sm text-gray-500 mt-0.5">{outfit.outfitDesc}</p>}
                  <div className="flex gap-1.5 mt-2">
                    {outfit.primaryColor && <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: outfit.primaryColor }} />}
                    {outfit.secondaryColor && <div className="w-4 h-4 rounded-full border border-gray-200 mt-0.5" style={{ backgroundColor: outfit.secondaryColor }} />}
                    {outfit.accentColor && <div className="w-3 h-3 rounded-full border border-gray-200 mt-1" style={{ backgroundColor: outfit.accentColor }} />}
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleDeleteOutfit(outfit.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center cursor-pointer"><i className="fas fa-trash text-xs" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Theme Modal */}
      {showAddTheme && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddTheme(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Color Theme</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Event Name</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {Object.keys(PRESETS).map((name) => (
                    <button key={name} onClick={() => applyPreset(name)}
                      className={`px-2.5 py-1 text-xs rounded-full border cursor-pointer ${newTheme.eventName === name ? "bg-maroon text-white border-maroon" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                      {name}
                    </button>
                  ))}
                </div>
                <input value={newTheme.eventName} onChange={(e) => setNewTheme({ ...newTheme, eventName: e.target.value })} placeholder="Or type custom event name" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[0.65rem] text-gray-500 block mb-1">Primary</label>
                  <input type="color" value={newTheme.primaryColor} onChange={(e) => setNewTheme({ ...newTheme, primaryColor: e.target.value })} className="w-full h-9 rounded-lg border cursor-pointer" />
                </div>
                <div>
                  <label className="text-[0.65rem] text-gray-500 block mb-1">Secondary</label>
                  <input type="color" value={newTheme.secondaryColor || "#ffffff"} onChange={(e) => setNewTheme({ ...newTheme, secondaryColor: e.target.value })} className="w-full h-9 rounded-lg border cursor-pointer" />
                </div>
                <div>
                  <label className="text-[0.65rem] text-gray-500 block mb-1">Accent</label>
                  <input type="color" value={newTheme.accentColor || "#ffffff"} onChange={(e) => setNewTheme({ ...newTheme, accentColor: e.target.value })} className="w-full h-9 rounded-lg border cursor-pointer" />
                </div>
              </div>
              <select value={newTheme.mood} onChange={(e) => setNewTheme({ ...newTheme, mood: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Select mood (optional)</option>
                {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddTheme} className="flex-1 py-2 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark cursor-pointer">Add Theme</button>
              <button onClick={() => setShowAddTheme(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Outfit Modal */}
      {showAddOutfit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddOutfit(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Outfit Color</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Event</label>
                  <input value={newOutfit.eventName} onChange={(e) => setNewOutfit({ ...newOutfit, eventName: e.target.value })} placeholder="e.g. Wedding" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Person</label>
                  <input value={newOutfit.person} onChange={(e) => setNewOutfit({ ...newOutfit, person: e.target.value })} placeholder="e.g. Bride" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <input value={newOutfit.outfitDesc} onChange={(e) => setNewOutfit({ ...newOutfit, outfitDesc: e.target.value })} placeholder="Outfit description" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[0.65rem] text-gray-500 block mb-1">Primary</label>
                  <input type="color" value={newOutfit.primaryColor || "#000000"} onChange={(e) => setNewOutfit({ ...newOutfit, primaryColor: e.target.value })} className="w-full h-9 rounded-lg border cursor-pointer" />
                </div>
                <div>
                  <label className="text-[0.65rem] text-gray-500 block mb-1">Secondary</label>
                  <input type="color" value={newOutfit.secondaryColor || "#ffffff"} onChange={(e) => setNewOutfit({ ...newOutfit, secondaryColor: e.target.value })} className="w-full h-9 rounded-lg border cursor-pointer" />
                </div>
                <div>
                  <label className="text-[0.65rem] text-gray-500 block mb-1">Accent</label>
                  <input type="color" value={newOutfit.accentColor || "#ffffff"} onChange={(e) => setNewOutfit({ ...newOutfit, accentColor: e.target.value })} className="w-full h-9 rounded-lg border cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Match Score: {newOutfit.matchScore}%</label>
                <input type="range" min={0} max={100} value={newOutfit.matchScore} onChange={(e) => setNewOutfit({ ...newOutfit, matchScore: parseInt(e.target.value) })} className="w-full" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddOutfit} className="flex-1 py-2 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark cursor-pointer">Add Outfit</button>
              <button onClick={() => setShowAddOutfit(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
