"use client";

import { useState, useEffect } from "react";
import {
  getWeddingEvents,
  createWeddingEvent,
  updateWeddingEvent,
  deleteWeddingEvent,
  seedWeddingEvents,
} from "@/lib/actions";
import DatePicker from "@/components/DatePicker";
import TimePicker from "@/components/TimePicker";

interface WeddingEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  duration: number;
  location: string;
  isRitual: boolean;
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

function getEndTime(startTime: string, duration: number): number {
  return timeToMinutes(startTime) + duration;
}

function checkOverlaps(events: WeddingEvent[]): Map<string, string[]> {
  const overlaps = new Map<string, string[]>();

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      if (a.date !== b.date) continue;
      if (a.isSimultaneous && b.isSimultaneous) continue;

      const aStart = timeToMinutes(a.startTime);
      const aEnd = getEndTime(a.startTime, a.duration);
      const bStart = timeToMinutes(b.startTime);
      const bEnd = getEndTime(b.startTime, b.duration);

      if (aStart < bEnd && bStart < aEnd) {
        if (!overlaps.has(a.id)) overlaps.set(a.id, []);
        if (!overlaps.has(b.id)) overlaps.set(b.id, []);
        overlaps.get(a.id)!.push(b.name);
        overlaps.get(b.id)!.push(a.name);
      }
    }
  }

  return overlaps;
}

function groupByDate(events: WeddingEvent[]): Map<string, WeddingEvent[]> {
  const groups = new Map<string, WeddingEvent[]>();
  for (const e of events) {
    const key = e.date || "unscheduled";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return groups;
}

const DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2.5 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
  { value: 480, label: "Full day" },
];

export default function EventsView({ wedding, weddingId }: { wedding: any; weddingId: string }) {
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<WeddingEvent>>({});
  const [loading, setLoading] = useState(true);
  const [overlaps, setOverlaps] = useState<Map<string, string[]>>(new Map());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      await seedWeddingEvents(weddingId);
      const data = await getWeddingEvents(weddingId);
      setEvents(data);
      setOverlaps(checkOverlaps(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [weddingId]);

  const today = new Date().toISOString().split("T")[0];
  const weddingStart = wedding.weddingDate
    ? new Date(wedding.weddingDate).toISOString().split("T")[0]
    : today;
  const weddingEnd = (() => {
    if (!weddingStart) return "";
    const d = new Date(weddingStart);
    d.setDate(d.getDate() + (wedding.weddingDays || 1) - 1);
    return d.toISOString().split("T")[0];
  })();

  const handleSave = async (id: string) => {
    await updateWeddingEvent(weddingId, id, editData);
    setEditing(null);
    setEditData({});
    const data = await getWeddingEvents(weddingId);
    setEvents(data);
    setOverlaps(checkOverlaps(data));
  };

  const handleAdd = async () => {
    const newEvent = await createWeddingEvent(weddingId, {
      name: "New Event",
      description: "",
      date: weddingStart || "",
      startTime: "10:00",
      duration: 60,
      location: wedding.weddingCity || "",
      isRitual: false,
    });
    setEvents([...events, newEvent]);
    setEditing(newEvent.id);
    setEditData(newEvent);
  };

  const handleDelete = async (id: string) => {
    await deleteWeddingEvent(weddingId, id);
    setDeleteConfirm(null);
    const data = await getWeddingEvents(weddingId);
    setEvents(data);
    setOverlaps(checkOverlaps(data));
  };

  const startEdit = (event: WeddingEvent) => {
    setEditing(event.id);
    setEditData({
      name: event.name,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      duration: event.duration,
      location: event.location,
      isRitual: event.isRitual,
      isSimultaneous: event.isSimultaneous,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData({});
  };

  const grouped = groupByDate(events);
  const sortedDates = Array.from(grouped.keys()).sort();

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
          <h2 className="text-2xl font-bold">Event Timeline</h2>
          <p className="text-gray-500 text-sm">Every event, every ritual, every detail — on schedule</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer"
        >
          <i className="fas fa-plus mr-1.5" /> Add Event
        </button>
      </div>

      {overlapCount > 0 && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-medium text-red-700">
            {overlapCount} event{overlapCount > 1 ? "s" : ""} overlap{overlapCount === 1 ? "s" : ""} — adjust times or dates to resolve
          </span>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-calendar text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No events yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Add your first event to start building your wedding timeline.</p>
          <button onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add First Event
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const dayEvents = grouped.get(date)!;
            const d = date !== "unscheduled" ? new Date(date + "T00:00:00") : null;
            const dayName = d ? d.toLocaleDateString("en-US", { weekday: "long" }) : "Unscheduled";
            const dayNum = d ? d.getDate() : "?";
            const monthStr = d ? d.toLocaleDateString("en-US", { month: "short" }) : "";
            const yearStr = d ? d.getFullYear() : "";

            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 text-center shrink-0">
                    <span className="text-xl font-extrabold block leading-none">{dayNum}</span>
                    <span className="text-xs text-gray-500 font-semibold uppercase">{monthStr}</span>
                  </div>
                  <div>
                    <span className="font-bold text-sm">{dayName}</span>
                    <span className="text-xs text-gray-400 ml-2">{yearStr}</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-3 ml-6">
                  {dayEvents.map((event) => {
                    const isEditing = editing === event.id;
                    const isOverlapping = overlaps.has(event.id);
                    const isWedding = event.name.includes("Wedding") || event.name.includes("Nikah") || event.name.includes("Anand Karaj");

                    return (
                      <div
                        key={event.id}
                        className={`bg-white border rounded-xl p-5 transition-all ${
                          isOverlapping ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:shadow-md"
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Event Name</label>
                                <input
                                  value={editData.name ?? ""}
                                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
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
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
                                <DatePicker
                                  value={editData.date ?? ""}
                                  min={weddingStart || undefined}
                                  max={weddingEnd || undefined}
                                  onChange={(val) => setEditData({ ...editData, date: val })}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Time</label>
                                <TimePicker
                                  value={editData.startTime ?? "10:00"}
                                  onChange={(val) => setEditData({ ...editData, startTime: val })}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
                                <select
                                  value={editData.duration ?? 60}
                                  onChange={(e) => setEditData({ ...editData, duration: Number(e.target.value) })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon cursor-pointer"
                                >
                                  {DURATION_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Location</label>
                                <input
                                  value={editData.location ?? ""}
                                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-5">
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editData.isRitual ?? false}
                                    onChange={(e) => setEditData({ ...editData, isRitual: e.target.checked })}
                                    className="w-4 h-4 accent-maroon rounded"
                                  />
                                  Ritual
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editData.isSimultaneous ?? false}
                                    onChange={(e) => setEditData({ ...editData, isSimultaneous: e.target.checked })}
                                    className="w-4 h-4 accent-maroon rounded"
                                  />
                                  Simultaneous
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={cancelEdit} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg cursor-pointer">Cancel</button>
                                <button onClick={() => handleSave(event.id)} className="px-4 py-1.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">Save</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-5">
                            <div className="w-[52px] text-center shrink-0">
                              <span className={`text-xl font-extrabold block leading-none ${isWedding ? "text-maroon" : "text-gray-900"}`}>{d ? d.getDate() : "?"}</span>
                              <span className="text-[0.65rem] text-gray-400 font-semibold uppercase">{monthStr}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold">{event.name}</h3>
                                {isOverlapping && (
                                  <span className="text-[0.65rem] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                                    Overlap
                                  </span>
                                )}
                              </div>
                              {event.description && <p className="text-gray-500 text-sm mb-2">{event.description}</p>}
                              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                {event.startTime && (() => {
                                  const endMins = getEndTime(event.startTime, event.duration);
                                  const eh = Math.floor(endMins / 60) % 24;
                                  const em = endMins % 60;
                                  const endStr = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
                                  return (
                                    <span className="flex items-center gap-1">
                                      <i className="fas fa-clock" />
                                      {formatTime(event.startTime)} — {formatTime(endStr)}
                                      <span className="text-gray-400">({formatDuration(event.duration)})</span>
                                    </span>
                                  );
                                })()}
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <i className="fas fa-map-marker-alt" />
                                    {event.location}
                                  </span>
                                )}
                                {event.isRitual && (
                                  <span className="flex items-center gap-1">
                                    <i className="fas fa-om" />
                                    Ritual
                                  </span>
                                )}
                                {event.isSimultaneous && (
                                  <span className="flex items-center gap-1 text-purple-600">
                                    <i className="fas fa-layer-group" />
                                    Simultaneous
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-start gap-1.5 shrink-0">
                              <button
                                onClick={() => startEdit(event)}
                                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-maroon transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <i className="fas fa-pen text-xs" />
                              </button>
                              {deleteConfirm === event.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDelete(event.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded cursor-pointer">Yes</button>
                                  <button onClick={() => setDeleteConfirm(null)} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded cursor-pointer">No</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(event.id)}
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
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
