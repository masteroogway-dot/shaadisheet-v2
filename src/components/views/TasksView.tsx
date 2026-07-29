"use client";

import { useState, useMemo } from "react";
import { createTask, deleteTask, updateTask } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

const PERIODS = ["12+ Months", "9-12 Months", "6-9 Months", "3-6 Months", "1-3 Months", "Last Month"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const PRIORITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Low: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  Medium: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  High: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  Urgent: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

export default function TasksView({ wedding, weddingId, onToggle, canEdit = true }: { wedding: any; weddingId: string; onToggle: (id: string, done: boolean) => void; canEdit?: boolean }) {
  const [tasks, setTasks] = useState<any[]>(wedding.tasks || []);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [undoStack, setUndoStack] = useState<{ task: any; period: string }[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    tasks.forEach((t) => { if (t.category) cats.add(t.category); });
    return Array.from(cats).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.text.toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q));
    }
    if (filterPriority !== "All") list = list.filter((t) => (t.priority || "Medium") === filterPriority);
    if (filterCategory !== "All") list = list.filter((t) => (t.category || "") === filterCategory);
    if (filterStatus === "Done") list = list.filter((t) => t.done);
    if (filterStatus === "Pending") list = list.filter((t) => !t.done);
    if (filterStatus === "Overdue") list = list.filter((t) => !t.done && t.dueDate && t.dueDate < today);
    return list;
  }, [tasks, search, filterPriority, filterCategory, filterStatus, today]);

  const tasksByPeriod: Record<string, any[]> = {};
  PERIODS.forEach((p) => { tasksByPeriod[p] = []; });
  filteredTasks.forEach((t) => {
    if (!tasksByPeriod[t.period]) tasksByPeriod[t.period] = [];
    tasksByPeriod[t.period].push(t);
  });

  const isOverdue = (task: any) => {
    if (task.done || !task.dueDate) return false;
    return task.dueDate < today;
  };

  const overdueCount = tasks.filter((t) => isOverdue(t)).length || 0;
  const totalDone = tasks.filter((t) => t.done).length;

  const handleAddTask = async (period: string) => {
    if (!newTaskText.trim()) return;
    const tempId = `temp-${Date.now()}`;
    const newTask = { id: tempId, period, text: newTaskText.trim(), done: false, dueDate: newTaskDueDate, priority: newTaskPriority, category: newTaskCategory, order: 0 };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText(""); setNewTaskDueDate(""); setNewTaskPriority("Medium"); setNewTaskCategory(""); setAddingTo(null);
    try {
      const created = await createTask(weddingId, { period, text: newTask.text, dueDate: newTaskDueDate, priority: newTaskPriority, category: newTaskCategory });
      setTasks((prev) => prev.map((t) => t.id === tempId ? created : t));
    } catch { setTasks((prev) => prev.filter((t) => t.id !== tempId)); }
  };

  const handleDeleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setUndoStack((prev) => [...prev, { task, period: task.period }]);
    try { await deleteTask(weddingId, id); } catch {
      setTasks((prev) => [...prev, task]);
      setUndoStack((prev) => prev.filter((u) => u.task.id !== id));
    }
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setTasks((prev) => [...prev, last.task]);
    try { await createTask(weddingId, { period: last.period, text: last.task.text, done: last.task.done, dueDate: last.task.dueDate, priority: last.task.priority, category: last.task.category }); } catch {}
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    const oldTask = tasks.find((t) => t.id === id);
    if (!oldTask) return;
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
    setEditingTaskId(null);
    try { await updateTask(weddingId, id, updates); } catch {
      setTasks((prev) => prev.map((t) => t.id === id ? oldTask : t));
    }
  };

  const handleBulkDelete = async () => {
    const toDelete = tasks.filter((t) => selected.has(t.id));
    setTasks((prev) => prev.filter((t) => !selected.has(t.id)));
    setSelected(new Set());
    for (const t of toDelete) { try { await deleteTask(weddingId, t.id); } catch {} }
  };

  const handleBulkComplete = async (done: boolean) => {
    const ids = Array.from(selected);
    setTasks((prev) => prev.map((t) => ids.includes(t.id) ? { ...t, done } : t));
    setSelected(new Set());
    for (const id of ids) { try { await updateTask(weddingId, id, { done }); } catch {} }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Task Checklist</h2>
          <p className="text-gray-500 text-sm">12-month countdown — nothing gets missed</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selected.size > 0 && canEdit && (
            <>
              <button onClick={() => handleBulkComplete(true)} className="px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium">
                <i className="fas fa-check mr-1" /> Complete ({selected.size})
              </button>
              <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium">
                <i className="fas fa-trash mr-1" /> Delete ({selected.size})
              </button>
              <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                Clear
              </button>
            </>
          )}
          {canEdit && tasks.length > 0 && (
            <button onClick={() => setSelected(selected.size === filteredTasks.length ? new Set() : new Set(filteredTasks.map((t) => t.id)))} className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              {selected.size === filteredTasks.length ? "Deselect" : "Select All"}
            </button>
          )}
        </div>
      </div>

      {undoStack.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm">
          <i className="fas fa-undo" />
          <span>Task deleted</span>
          <button onClick={handleUndo} className="underline font-medium hover:text-gray-300">Undo</button>
        </motion.div>
      )}

      {overdueCount > 0 && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <i className="fas fa-exclamation-circle text-red-500" />
          <span className="text-sm font-medium text-red-700">{overdueCount} task{overdueCount > 1 ? "s" : ""} overdue</span>
        </div>
      )}

      {/* Summary bar */}
      {tasks.length > 0 && (
        <div className="mb-5 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Overall Progress</span>
            <span className="text-sm font-bold text-maroon">{totalDone} / {tasks.length} ({tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0}%)</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-maroon to-[#D4AF37]" initial={{ width: 0 }} animate={{ width: `${tasks.length > 0 ? (totalDone / tasks.length) * 100 : 0}%` }} transition={{ duration: 0.6 }} />
          </div>
        </div>
      )}

      {/* Search and filters */}
      {tasks.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg" />
          </div>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="All">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="All">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Done">Done</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      )}

      {!tasks.length && !addingTo ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-tasks text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No tasks yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Create your wedding task checklist to stay organized.</p>
          {canEdit && (
            <button onClick={() => setAddingTo("12+ Months")} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
              <i className="fas fa-plus mr-1.5" /> Add First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByPeriod).map(([period, ptasks]) => {
            const done = ptasks.filter((t) => t.done).length;
            if (ptasks.length === 0 && !addingTo) return null;
            return (
              <div key={period} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold flex items-center gap-2.5">
                    <i className="fas fa-calendar-alt text-gray-400" /> {period}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium">{done} / {ptasks.length} done</span>
                    {canEdit && (
                      <button onClick={() => setAddingTo(period)} className="text-xs px-3 py-2 bg-maroon text-white rounded cursor-pointer hover:bg-maroon-light">
                        <i className="fas fa-plus mr-1" /> Add
                      </button>
                    )}
                  </div>
                </div>
                {addingTo === period && (
                  <div className="flex flex-col gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTask(period)} placeholder="Enter task..." className="flex-1 px-3 py-2 border rounded text-sm" autoFocus />
                      <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="px-3 py-2 border rounded text-sm text-gray-600" />
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="px-2 py-1.5 border rounded text-xs bg-white">
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} placeholder="Category (e.g. Venue)" className="px-2 py-1.5 border rounded text-xs w-36" list="taskCategories" />
                      <datalist id="taskCategories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                      <button onClick={() => handleAddTask(period)} className="px-3 py-2 bg-green-500 text-white rounded text-sm cursor-pointer">Add</button>
                      <button onClick={() => { setAddingTo(null); setNewTaskText(""); setNewTaskDueDate(""); setNewTaskPriority("Medium"); setNewTaskCategory(""); }} className="px-3 py-2 bg-gray-200 rounded text-sm cursor-pointer">Cancel</button>
                    </div>
                  </div>
                )}
                {ptasks.map((task: any) => {
                  const overdue = isOverdue(task);
                  const pc = PRIORITY_COLORS[task.priority || "Medium"];
                  return (
                    <div key={task.id} className={`flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-gray-100 last:border-0 ${task.done ? "opacity-50" : ""} ${overdue ? "bg-red-50/50" : ""}`}>
                      {canEdit && (
                        <input type="checkbox" checked={selected.has(task.id)} onChange={(e) => { const n = new Set(selected); e.target.checked ? n.add(task.id) : n.delete(task.id); setSelected(n); }} className="w-4 h-4 accent-maroon cursor-pointer shrink-0" />
                      )}
                      <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id, !task.done)} disabled={!canEdit} className="w-[18px] h-[18px] accent-maroon cursor-pointer shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm block truncate ${task.done ? "line-through text-gray-400" : ""}`}>{task.text}</span>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {task.priority && task.priority !== "Medium" && (
                            <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${pc.dot} mr-1`} />{task.priority}
                            </span>
                          )}
                          {task.category && (
                            <span className="text-[0.6rem] font-medium px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{task.category}</span>
                          )}
                        </div>
                      </div>
                      {task.dueDate && (
                        <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded-full shrink-0 ${overdue ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                          {overdue && <i className="fas fa-exclamation-triangle mr-1" />}
                          {new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                      {canEdit && editingTaskId !== task.id && (
                        <div className="flex items-center gap-1 shrink-0">
                          {!task.dueDate && !task.done && (
                            <button onClick={() => { setEditingTaskId(task.id); setEditDueDate(""); setEditPriority(task.priority || "Medium"); setEditCategory(task.category || ""); }} className="text-[0.65rem] text-gray-400 hover:text-maroon cursor-pointer p-1" title="Edit task">
                              <i className="fas fa-pen" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-gray-400 hover:text-red-500 cursor-pointer p-1 min-w-[44px] min-h-[44px] inline-flex items-center justify-center">
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      )}
                      {editingTaskId === task.id && (
                        <div className="flex items-center gap-1 shrink-0 flex-wrap">
                          <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="px-2 py-1 border rounded text-xs" />
                          <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="px-1 py-1 border rounded text-xs bg-white">
                            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="Category" className="px-2 py-1 border rounded text-xs w-24" />
                          <button onClick={() => handleUpdateTask(task.id, { dueDate: editDueDate, priority: editPriority, category: editCategory })} className="text-xs text-green-600 hover:text-green-700 cursor-pointer px-1"><i className="fas fa-check" /></button>
                          <button onClick={() => setEditingTaskId(null)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer px-1"><i className="fas fa-times" /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
