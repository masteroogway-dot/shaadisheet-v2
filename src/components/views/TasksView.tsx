"use client";

import { useState } from "react";
import { createTask, deleteTask } from "@/lib/actions";

const PERIODS = ["12+ Months", "9-12 Months", "6-9 Months", "3-6 Months", "1-3 Months", "Last Month"];

export default function TasksView({ wedding, weddingId, onToggle }: { wedding: any; weddingId: string; onToggle: (id: string, done: boolean) => void }) {
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");

  const tasksByPeriod: Record<string, any[]> = {};
  PERIODS.forEach((p) => { tasksByPeriod[p] = []; });
  wedding.tasks?.forEach((t: any) => {
    if (!tasksByPeriod[t.period]) tasksByPeriod[t.period] = [];
    tasksByPeriod[t.period].push(t);
  });

  const handleAddTask = async (period: string) => {
    if (!newTaskText.trim()) return;
    await createTask(weddingId, { period, text: newTaskText.trim() });
    setNewTaskText("");
    setAddingTo(null);
    window.location.reload();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(weddingId, id);
    window.location.reload();
  };

  const hasTasks = wedding.tasks && wedding.tasks.length > 0;

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold">Task Checklist</h2>
        <p className="text-gray-500 text-sm">12-month countdown {'\u2014'} nothing gets missed</p>
      </div>

      {!hasTasks ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-tasks text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No tasks yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Create your wedding task checklist to stay organized.</p>
          <button onClick={() => { setAddingTo("12+ Months"); }} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add First Task
          </button>
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
                    <button onClick={() => setAddingTo(period)} className="text-xs px-2 py-1 bg-maroon text-white rounded cursor-pointer hover:bg-maroon-light">
                      <i className="fas fa-plus mr-1" /> Add
                    </button>
                  </div>
                </div>
                {addingTo === period && (
                  <div className="flex gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50">
                    <input
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTask(period)}
                      placeholder="Enter task..."
                      className="flex-1 px-3 py-2 border rounded text-sm"
                      autoFocus
                    />
                    <button onClick={() => handleAddTask(period)} className="px-3 py-2 bg-green-500 text-white rounded text-sm cursor-pointer">Add</button>
                    <button onClick={() => { setAddingTo(null); setNewTaskText(""); }} className="px-3 py-2 bg-gray-200 rounded text-sm cursor-pointer">Cancel</button>
                  </div>
                )}
                {tasks.map((task: any) => (
                  <div key={task.id} className={`flex items-center gap-3.5 px-6 py-3.5 border-b border-gray-100 last:border-0 ${task.done ? "opacity-50" : ""}`}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => onToggle(task.id, !task.done)}
                      className="w-[18px] h-[18px] accent-maroon cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${task.done ? "line-through text-gray-400" : ""}`}>{task.text}</span>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-gray-400 hover:text-red-500 cursor-pointer"><i className="fas fa-trash" /></button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
