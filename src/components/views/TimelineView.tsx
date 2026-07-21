"use client";

import { useState, useEffect } from "react";
import {
  getWeddingTimelineItems,
  createWeddingTimelineItem,
  updateWeddingTimelineItem,
  deleteWeddingTimelineItem,
  seedWeddingTimeline,
} from "@/lib/actions";
import TimePicker from "@/components/TimePicker";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  duration: number;
  isHighlight: boolean;
  isSimultaneous: boolean;
  order: number;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getEndTimeStr(startTime: string, duration: number): string {
  const end = timeToMinutes(startTime) + duration;
  const eh = Math.floor(end / 60) % 24;
  const em = end % 60;
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

function checkOverlaps(items: TimelineItem[]): Map<string, string[]> {
  const overlaps = new Map<string, string[]>();
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (a.isSimultaneous && b.isSimultaneous) continue;
      const aStart = timeToMinutes(a.startTime);
      const aEnd = aStart + a.duration;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = bStart + b.duration;
      if (aStart < bEnd && bStart < aEnd) {
        if (!overlaps.has(a.id)) overlaps.set(a.id, []);
        if (!overlaps.has(b.id)) overlaps.set(b.id, []);
        overlaps.get(a.id)!.push(b.title);
        overlaps.get(b.id)!.push(a.title);
      }
    }
  }
  return overlaps;
}

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
];

export default function TimelineView({ wedding, weddingId }: { wedding: any; weddingId: string }) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TimelineItem>>({});
  const [loading, setLoading] = useState(true);
  const [overlaps, setOverlaps] = useState<Map<string, string[]>>(new Map());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadItems = async () => {
    try {
      await seedWeddingTimeline(weddingId);
      const data = await getWeddingTimelineItems(weddingId);
      setItems(data);
      setOverlaps(checkOverlaps(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [weddingId]);

  const handleSave = async (id: string) => {
    await updateWeddingTimelineItem(weddingId, id, editData);
    setEditing(null);
    setEditData({});
    const data = await getWeddingTimelineItems(weddingId);
    setItems(data);
    setOverlaps(checkOverlaps(data));
  };

  const handleAdd = async () => {
    const newItem = await createWeddingTimelineItem(weddingId, {
      title: "New Item",
      description: "",
      startTime: "09:00",
      duration: 30,
      isHighlight: false,
    });
    setItems([...items, newItem]);
    setEditing(newItem.id);
    setEditData(newItem);
  };

  const handleDelete = async (id: string) => {
    await deleteWeddingTimelineItem(weddingId, id);
    setDeleteConfirm(null);
    const data = await getWeddingTimelineItems(weddingId);
    setItems(data);
    setOverlaps(checkOverlaps(data));
  };

  const startEdit = (item: TimelineItem) => {
    setEditing(item.id);
    setEditData({
      title: item.title,
      description: item.description,
      startTime: item.startTime,
      duration: item.duration,
      isHighlight: item.isHighlight,
      isSimultaneous: item.isSimultaneous,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData({});
  };

  const overlapCount = overlaps.size;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Wedding Day Timeline</h2>
          <p className="text-gray-500 text-sm">Minute-by-minute schedule for your big day</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer"
        >
          <i className="fas fa-plus mr-1.5" /> Add Item
        </button>
      </div>

      {overlapCount > 0 && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-medium text-red-700">
            {overlapCount} timeline item{overlapCount > 1 ? "s" : ""} overlap{overlapCount === 1 ? "s" : ""} — adjust times or durations to resolve
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-clock text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No timeline items yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Add your first timeline item to start planning your wedding day schedule.</p>
          <button onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add First Item
          </button>
        </div>
      ) : (
        <div className="relative pl-10">
          <div className="absolute left-[15px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-maroon to-gold rounded-full" />

          {items.map((item) => {
            const isEditing = editing === item.id;
            const isOverlapping = overlaps.has(item.id);

            return (
              <div key={item.id} className="relative mb-4">
                <div className={`absolute left-[-33px] top-6 w-3.5 h-3.5 bg-white border-[3px] rounded-full z-10 ${
                  isOverlapping ? "border-red-500" : "border-maroon"
                }`} />
                {item.isHighlight && !isOverlapping && (
                  <div className="absolute left-[-36px] top-[22px] w-5 h-5 border-4 border-maroon/20 rounded-full" />
                )}

                <div className={`bg-white border rounded-xl p-5 transition-all ${
                  isOverlapping ? "border-red-400 bg-red-50/30" : item.isHighlight ? "border-l-4 border-l-maroon border-gray-200" : "border-gray-200 hover:shadow-md"
                }`}>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Title</label>
                          <input
                            value={editData.title ?? ""}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                          <input
                            value={editData.description ?? ""}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Time</label>
                          <TimePicker
                            value={editData.startTime ?? "09:00"}
                            onChange={(val) => setEditData({ ...editData, startTime: val })}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
                          <select
                            value={editData.duration ?? 30}
                            onChange={(e) => setEditData({ ...editData, duration: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon cursor-pointer"
                          >
                            {DURATION_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end gap-4">
                          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer pb-2">
                            <input
                              type="checkbox"
                              checked={editData.isHighlight ?? false}
                              onChange={(e) => setEditData({ ...editData, isHighlight: e.target.checked })}
                              className="w-4 h-4 accent-maroon rounded"
                            />
                            Highlight
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer pb-2">
                            <input
                              type="checkbox"
                              checked={editData.isSimultaneous ?? false}
                              onChange={(e) => setEditData({ ...editData, isSimultaneous: e.target.checked })}
                              className="w-4 h-4 accent-maroon rounded"
                            />
                            Simultaneous
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={cancelEdit} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg cursor-pointer">Cancel</button>
                        <button onClick={() => handleSave(item.id)} className="px-4 py-1.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="text-xs font-bold text-maroon uppercase tracking-wide mb-1">
                          {formatTime(item.startTime)} — {formatTime(getEndTimeStr(item.startTime, item.duration))}
                          <span className="text-gray-400 ml-2 normal-case">({formatDuration(item.duration)})</span>
                        </div>
                        <h4 className="font-bold text-sm">{item.title}</h4>
                        {item.description && <p className="text-gray-500 text-sm">{item.description}</p>}
                        {isOverlapping && (
                          <span className="inline-block mt-2 text-[0.65rem] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                            Overlaps with: {overlaps.get(item.id)?.join(", ")}
                          </span>
                        )}
                        {item.isSimultaneous && (
                          <span className="inline-block mt-2 text-[0.65rem] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-semibold">
                            Simultaneous
                          </span>
                        )}
                      </div>
                      <div className="flex items-start gap-1.5 shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-maroon transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <i className="fas fa-pen text-xs" />
                        </button>
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(item.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded cursor-pointer">Yes</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded cursor-pointer">No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <i className="fas fa-trash text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
