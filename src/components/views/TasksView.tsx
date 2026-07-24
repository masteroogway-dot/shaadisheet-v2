"use client";

import { useState } from "react";
import { createTask, deleteTask, updateTask } from "@/lib/actions";
import DatePicker from "@/components/DatePicker";

const PERIODS = ["12+ Months", "9-12 Months", "6-9 Months", "3-6 Months", "1-3 Months", "Last Month"];

export default function TasksView({ wedding, weddingId, onToggle, canEdit = true }: { wedding: any; weddingId: string; onToggle: (id: string, done: boolean) => void; canEdit?: boolean }) {
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editDueDate, setEditDueDate] = useState("");

  const tasksByPeriod: Record<string, any[]> = {};
  PERIODS.forEach((p) => { tasksByPeriod[p] = []; });
  wedding.tasks?.forEach((t: any) => {
    if (!tasksByPeriod[t.period]) tasksByPeriod[t.period] = [];
    tasksByPeriod[t.period].push(t);
  });

  const today = new Date().toISOString().split("T")[0];

  const isOverdue = (task: any) => {
    if (task.done || !task.dueDate) return false;
    return task.dueDate < today;
  };

  const handleAddTask = async (period: string) => {
    if (!newTaskText.trim()) return;
    await createTask(weddingId, { period, text: newTaskText.trim(), dueDate: newTaskDueDate });
    setNewTaskText("");
    setNewTaskDueDate("");
    setAddingTo(null);
    window.location.reload();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(weddingId, id);
    window.location.reload();
  };

  const handleUpdateDueDate = async (id: string, dueDate: string) => {
    await updateTask(weddingId, id, { dueDate });
    setEditingTaskId(null);
    window.location.reload();
  };

  const hasTasks = wedding.tasks && wedding.tasks.length > 0;

  const overdueCount = wedding.tasks?.filter((t: any) => isOverdue(t)).length || 0;

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold">Task Checklist</h2>
        <p className="text-gray-500 text-sm">12-month countdown {'\u2014'} nothing gets missed</p>
      </div>

      {overdueCount > 0 && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <i className="fas fa-exclamation-circle text-red-500" />
          <span className="text-sm font-medium text-red-700">{overdueCount} task{overdueCount > 1 ? "s" : ""} overdue</span>
        </div>
      )}

      {!hasTasks && !addingTo ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-tasks text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No tasks yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Create your wedding task checklist to stay organized.</p>
          {canEdit && (
            <button onClick={() => { setAddingTo("12+ Months"); }} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
              <i className="fas fa-plus mr-1.5" /> Add First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByPeriod).map(([period, tasks]) => {
            const done = tasks.filter((t) => t.done).length;
            if (tasks.length === 0 && !addingTo) return null;
            return (
              <div key={period} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold flex items-center gap-2.5">
                    <i className="fas fa-calendar-alt text-gray-400" /> {period}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium">{done} / {tasks.length} done</span>
                    {canEdit && (
                      <button onClick={() => setAddingTo(period)} className="text-xs px-3 py-2 bg-maroon text-white rounded cursor-pointer hover:bg-maroon-light">
                        <i className="fas fa-plus mr-1" /> Add
                      </button>
                    )}
                  </div>
                </div>
                {addingTo === period && (
                  <div className="flex flex-col sm:flex-row gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50">
                    <input
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTask(period)}
                      placeholder="Enter task..."
                      className="flex-1 px-3 py-2 border rounded text-sm"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="px-3 py-2 border rounded text-sm text-gray-600"
                        placeholder="Due date"
                      />
                      <button onClick={() => handleAddTask(period)} className="px-3 py-2 bg-green-500 text-white rounded text-sm cursor-pointer">Add</button>
                      <button onClick={() => { setAddingTo(null); setNewTaskText(""); setNewTaskDueDate(""); }} className="px-3 py-2 bg-gray-200 rounded text-sm cursor-pointer">Cancel</button>
                    </div>
                  </div>
                )}
                {tasks.map((task: any) => {
                  const overdue = isOverdue(task);
                  return (
                    <div key={task.id} className={`flex items-center gap-3.5 px-6 py-3.5 border-b border-gray-100 last:border-0 ${task.done ? "opacity-50" : ""} ${overdue ? "bg-red-50/50" : ""}`}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => onToggle(task.id, !task.done)}
                        disabled={!canEdit}
                        className="w-[18px] h-[18px] accent-maroon cursor-pointer"
                      />
                      <span className={`flex-1 text-sm truncate ${task.done ? "line-through text-gray-400" : ""}`}>{task.text}</span>
                      {task.dueDate && (
                        <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          overdue ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                        }`}>
                          {overdue && <i className="fas fa-exclamation-triangle mr-1" />}
                          {new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                      {canEdit && !task.dueDate && !task.done && (
                        <button
                          onClick={() => { setEditingTaskId(task.id); setEditDueDate(""); }}
                          className="text-[0.65rem] text-gray-400 hover:text-maroon cursor-pointer px-1.5 py-1 shrink-0"
                          title="Set due date"
                        >
                          <i className="fas fa-calendar-plus" />
                        </button>
                      )}
                      {editingTaskId === task.id && (
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="px-2 py-1 border rounded text-xs"
                          />
                          <button onClick={() => handleUpdateDueDate(task.id, editDueDate)} className="text-xs text-green-600 hover:text-green-700 cursor-pointer px-1">
                            <i className="fas fa-check" />
                          </button>
                          <button onClick={() => setEditingTaskId(null)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer px-1">
                            <i className="fas fa-times" />
                          </button>
                        </div>
                      )}
                      {canEdit && (
                        <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-gray-400 hover:text-red-500 cursor-pointer min-w-[44px] min-h-[44px] inline-flex items-center justify-center"><i className="fas fa-trash" /></button>
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
