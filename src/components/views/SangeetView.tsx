"use client";

import { useState, useMemo } from "react";
import {
  createSangeetSong, updateSangeetSong, deleteSangeetSong, bulkAddSangeetSongs,
  createSangeetPerformance, updateSangeetPerformance, deleteSangeetPerformance,
  createSangeetPractice, updateSangeetPractice, deleteSangeetPractice,
} from "@/lib/actions";
import MusicPlayer from "@/components/MusicPlayer";
import { detectMusicPlatform, getMusicPlatformLabel, getMusicPlatformColor, type MusicPlatform } from "@/lib/music";

interface Props {
  wedding: any;
  weddingId: string;
  onUpdate: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  canEdit?: boolean;
}

const SONG_TYPES = ["Solo", "Duet", "Group", "Medley"];

function formatDuration(seconds: number) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SangeetView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: Props) {
  const songs = wedding.sangeetSongs || [];
  const practices = wedding.sangeetPractices || [];

  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddPractice, setShowAddPractice] = useState(false);
  const [editingSong, setEditingSong] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [newSong, setNewSong] = useState({ title: "", artist: "", duration: 0, type: "Group", event: "Sangeet", notes: "", musicUrl: "", musicPlatform: "" });
  const [newPerfSong, setNewPerfSong] = useState<string | null>(null);
  const [newPerfName, setNewPerfName] = useState("");
  const [newPractice, setNewPractice] = useState({ date: "", time: "", location: "", notes: "", attendees: "[]" });
  const [filterType, setFilterType] = useState("All");
  const [activeTab, setActiveTab] = useState<"songs" | "practice">("songs");

  const totalDuration = useMemo(() => songs.reduce((sum: number, s: any) => sum + (s.duration || 0), 0), [songs]);
  const totalPerformers = useMemo(() => songs.reduce((sum: number, s: any) => sum + (s.performances?.length || 0), 0), [songs]);
  const confirmedPerformers = useMemo(
    () => songs.reduce((sum: number, s: any) => sum + (s.performances?.filter((p: any) => p.confirmed)?.length || 0), 0),
    [songs]
  );

  const filteredSongs = useMemo(() => {
    if (filterType === "All") return songs;
    return songs.filter((s: any) => s.type === filterType);
  }, [songs, filterType]);

  const handleAddSong = async () => {
    try {
      await createSangeetSong(weddingId, newSong);
      setNewSong({ title: "", artist: "", duration: 0, type: "Group", event: "Sangeet", notes: "", musicUrl: "", musicPlatform: "" });
      setShowAddSong(false);
      onUpdate();
      onToast("Song added");
    } catch { onToast("Failed to add song", "error"); }
  };

  const handleSaveSong = async (id: string) => {
    try {
      await updateSangeetSong(weddingId, id, editData);
      setEditingSong(null);
      setEditData({});
      onUpdate();
      onToast("Song updated");
    } catch { onToast("Failed to update song", "error"); }
  };

  const handleDeleteSong = async (id: string) => {
    try {
      await deleteSangeetSong(weddingId, id);
      onUpdate();
      onToast("Song deleted");
    } catch { onToast("Failed to delete song", "error"); }
  };

  const handleAddPerformance = async (songId: string) => {
    if (!newPerfName.trim()) return;
    try {
      await createSangeetPerformance(songId, { personName: newPerfName.trim() });
      setNewPerfName("");
      setNewPerfSong(null);
      onUpdate();
      onToast("Performer added");
    } catch { onToast("Failed to add performer", "error"); }
  };

  const handleToggleConfirmed = async (songId: string, perfId: string, current: boolean) => {
    try {
      await updateSangeetPerformance(songId, perfId, { confirmed: !current });
      onUpdate();
    } catch { onToast("Failed to update", "error"); }
  };

  const handleDeletePerformance = async (songId: string, perfId: string) => {
    try {
      await deleteSangeetPerformance(songId, perfId);
      onUpdate();
      onToast("Performer removed");
    } catch { onToast("Failed to remove performer", "error"); }
  };

  const handleAddPractice = async () => {
    try {
      await createSangeetPractice(weddingId, newPractice);
      setNewPractice({ date: "", time: "", location: "", notes: "", attendees: "[]" });
      setShowAddPractice(false);
      onUpdate();
      onToast("Practice session added");
    } catch { onToast("Failed to add practice", "error"); }
  };

  const handleSavePractice = async (id: string, data: any) => {
    try {
      await updateSangeetPractice(weddingId, id, data);
      onUpdate();
      onToast("Practice updated");
    } catch { onToast("Failed to update practice", "error"); }
  };

  const handleDeletePractice = async (id: string) => {
    try {
      await deleteSangeetPractice(weddingId, id);
      onUpdate();
      onToast("Practice deleted");
    } catch { onToast("Failed to delete practice", "error"); }
  };

  const handleBulkAdd = async () => {
    try {
      await bulkAddSangeetSongs(weddingId, 5);
      onUpdate();
      onToast("5 empty songs added");
    } catch { onToast("Failed to add songs", "error"); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Sangeet Planner</h1>
          <p className="text-sm text-gray-500 mt-1">Plan performances, track rehearsals, and manage your Sangeet night</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button onClick={handleBulkAdd} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium cursor-pointer">
              <i className="fas fa-plus mr-1" /> Add 5
            </button>
            <button onClick={() => setShowAddSong(true)} className="px-4 py-2 text-sm bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark cursor-pointer">
              <i className="fas fa-plus mr-1" /> Add Song
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Songs", value: songs.length, icon: "fa-music", color: "bg-purple-100 text-purple-600" },
          { label: "Performers", value: totalPerformers, icon: "fa-microphone", color: "bg-blue-100 text-blue-600" },
          { label: "Confirmed", value: confirmedPerformers, icon: "fa-check-circle", color: "bg-green-100 text-green-600" },
          { label: "Duration", value: formatDuration(totalDuration), icon: "fa-clock", color: "bg-amber-100 text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <i className={`fas ${s.icon} text-sm`} />
            </div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {(["songs", "practice"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {tab === "songs" ? "Songs & Performers" : "Practice Schedule"}
          </button>
        ))}
      </div>

      {activeTab === "songs" && (
        <>
          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {["All", ...SONG_TYPES].map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${filterType === t ? "bg-maroon text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Song List */}
          <div className="space-y-3">
            {filteredSongs.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-music text-4xl mb-3" />
                <p>No songs yet. Add your first Sangeet song!</p>
              </div>
            )}
            {filteredSongs.map((song: any) => (
              <div key={song.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {editingSong === song.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input value={editData.title ?? song.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} placeholder="Song title" className="px-3 py-2 border rounded-lg text-sm" />
                          <input value={editData.artist ?? song.artist} onChange={(e) => setEditData({ ...editData, artist: e.target.value })} placeholder="Artist" className="px-3 py-2 border rounded-lg text-sm" />
                          <input type="number" value={editData.duration ?? song.duration} onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) || 0 })} placeholder="Duration (sec)" className="px-3 py-2 border rounded-lg text-sm" />
                          <select value={editData.type ?? song.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                            {SONG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <input
                          value={editData.musicUrl ?? song.musicUrl ?? ""}
                          onChange={(e) => {
                            const url = e.target.value;
                            const platform = detectMusicPlatform(url);
                            setEditData({ ...editData, musicUrl: url, musicPlatform: platform || "" });
                          }}
                          placeholder="Paste YouTube, Spotify, or Apple Music link"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        {(editData.musicPlatform || song.musicPlatform) && (
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${getMusicPlatformColor((editData.musicPlatform || song.musicPlatform) as MusicPlatform)}`}>
                            {getMusicPlatformLabel((editData.musicPlatform || song.musicPlatform) as MusicPlatform)} detected
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900">{song.title || "Untitled"}</span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{song.type}</span>
                          {song.musicPlatform && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getMusicPlatformColor(song.musicPlatform as MusicPlatform)}`}>
                              {getMusicPlatformLabel(song.musicPlatform as MusicPlatform)}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{formatDuration(song.duration)}</span>
                        </div>
                        {song.artist && <p className="text-sm text-gray-500 mt-0.5">{song.artist}</p>}
                        {song.musicUrl && song.musicPlatform && (
                          <MusicPlayer url={song.musicUrl} platform={song.musicPlatform as MusicPlatform} compact />
                        )}
                      </>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      {editingSong === song.id ? (
                        <>
                          <button onClick={() => handleSaveSong(song.id)} className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center cursor-pointer"><i className="fas fa-check text-xs" /></button>
                          <button onClick={() => { setEditingSong(null); setEditData({}); }} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center cursor-pointer"><i className="fas fa-times text-xs" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingSong(song.id); setEditData({}); }} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center cursor-pointer"><i className="fas fa-pen text-xs" /></button>
                          <button onClick={() => handleDeleteSong(song.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center cursor-pointer"><i className="fas fa-trash text-xs" /></button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Performers */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {song.performances?.map((perf: any) => (
                      <div key={perf.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${perf.confirmed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        <span>{perf.personName}</span>
                        {canEdit && (
                          <>
                            <button onClick={() => handleToggleConfirmed(song.id, perf.id, perf.confirmed)} className="cursor-pointer" title={perf.confirmed ? "Confirmed" : "Mark confirmed"}>
                              <i className={`fas ${perf.confirmed ? "fa-check-circle" : "fa-circle"}`} />
                            </button>
                            <button onClick={() => handleDeletePerformance(song.id, perf.id)} className="cursor-pointer text-gray-400 hover:text-red-500"><i className="fas fa-times" /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {canEdit && (
                    newPerfSong === song.id ? (
                      <div className="flex gap-2">
                        <input value={newPerfName} onChange={(e) => setNewPerfName(e.target.value)} placeholder="Performer name" className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                          onKeyDown={(e) => e.key === "Enter" && handleAddPerformance(song.id)} />
                        <button onClick={() => handleAddPerformance(song.id)} className="px-3 py-1.5 bg-maroon text-white rounded-lg text-sm font-medium cursor-pointer">Add</button>
                        <button onClick={() => { setNewPerfSong(null); setNewPerfName(""); }} className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-pointer">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setNewPerfSong(song.id)} className="text-xs text-maroon font-semibold hover:underline cursor-pointer">
                        <i className="fas fa-plus mr-1" /> Add Performer
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "practice" && (
        <>
          {canEdit && (
            <div className="mb-4">
              <button onClick={() => setShowAddPractice(true)} className="px-4 py-2 text-sm bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark cursor-pointer">
                <i className="fas fa-plus mr-1" /> Add Practice Session
              </button>
            </div>
          )}

          <div className="space-y-3">
            {practices.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-calendar-check text-4xl mb-3" />
                <p>No practice sessions scheduled yet.</p>
              </div>
            )}
            {practices.map((practice: any) => (
              <div key={practice.id} className={`bg-white rounded-xl border p-4 ${practice.completed ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{practice.date || "No date"}</span>
                      {practice.time && <span className="text-sm text-gray-500">at {practice.time}</span>}
                      {practice.completed && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completed</span>}
                    </div>
                    {practice.location && <p className="text-sm text-gray-500 mt-0.5"><i className="fas fa-map-marker-alt mr-1" />{practice.location}</p>}
                    {practice.notes && <p className="text-xs text-gray-400 mt-1">{practice.notes}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleSavePractice(practice.id, { completed: !practice.completed })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${practice.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        <i className={`fas ${practice.completed ? "fa-undo" : "fa-check"} text-xs`} />
                      </button>
                      <button onClick={() => handleDeletePractice(practice.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center cursor-pointer">
                        <i className="fas fa-trash text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Song Modal */}
      {showAddSong && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddSong(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Song</h3>
            <div className="space-y-3">
              <input value={newSong.title} onChange={(e) => setNewSong({ ...newSong, title: e.target.value })} placeholder="Song title" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input value={newSong.artist} onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })} placeholder="Artist" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Music Link (optional)</label>
                <input
                  value={newSong.musicUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    const platform = detectMusicPlatform(url);
                    setNewSong({ ...newSong, musicUrl: url, musicPlatform: platform || "" });
                  }}
                  placeholder="Paste YouTube, Spotify, or Apple Music link"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                {newSong.musicPlatform && (
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${getMusicPlatformColor(newSong.musicPlatform as MusicPlatform)}`}>
                    {getMusicPlatformLabel(newSong.musicPlatform as MusicPlatform)} detected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Duration (seconds)</label>
                  <input type="number" value={newSong.duration || ""} onChange={(e) => setNewSong({ ...newSong, duration: parseInt(e.target.value) || 0 })} placeholder="180" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type</label>
                  <select value={newSong.type} onChange={(e) => setNewSong({ ...newSong, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    {SONG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <textarea value={newSong.notes} onChange={(e) => setNewSong({ ...newSong, notes: e.target.value })} placeholder="Notes (optional)" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddSong} className="flex-1 py-2 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark cursor-pointer">Add Song</button>
              <button onClick={() => setShowAddSong(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Practice Modal */}
      {showAddPractice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddPractice(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Practice Session</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date</label>
                  <input type="date" value={newPractice.date} onChange={(e) => setNewPractice({ ...newPractice, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Time</label>
                  <input type="time" value={newPractice.time} onChange={(e) => setNewPractice({ ...newPractice, time: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <input value={newPractice.location} onChange={(e) => setNewPractice({ ...newPractice, location: e.target.value })} placeholder="Location" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea value={newPractice.notes} onChange={(e) => setNewPractice({ ...newPractice, notes: e.target.value })} placeholder="Notes (optional)" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddPractice} className="flex-1 py-2 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark cursor-pointer">Add Session</button>
              <button onClick={() => setShowAddPractice(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
