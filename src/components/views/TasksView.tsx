"use client";

export default function TasksView({ wedding, onToggle }: { wedding: any; onToggle: (id: string, done: boolean) => void }) {
  const tasksByPeriod: Record<string, any[]> = {};
  wedding.tasks?.forEach((t: any) => {
    if (!tasksByPeriod[t.period]) tasksByPeriod[t.period] = [];
    tasksByPeriod[t.period].push(t);
  });

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold">Task Checklist</h2>
        <p className="text-gray-500 text-sm">12-month countdown — nothing gets missed</p>
      </div>

      <div className="space-y-6">
        {Object.entries(tasksByPeriod).map(([period, tasks]) => {
          const done = tasks.filter((t) => t.done).length;
          return (
            <div key={period} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold flex items-center gap-2.5">
                  <i className="fas fa-calendar-alt text-gray-400" /> {period}
                </h3>
                <span className="text-sm text-gray-500 font-medium">{done} / {tasks.length} done</span>
              </div>
              {tasks.map((task: any) => (
                <div key={task.id} className={`flex items-center gap-3.5 px-6 py-3.5 border-b border-gray-100 last:border-0 ${task.done ? "opacity-50" : ""}`}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggle(task.id, !task.done)}
                    className="w-[18px] h-[18px] accent-maroon cursor-pointer"
                  />
                  <span className={`flex-1 text-sm ${task.done ? "line-through text-gray-400" : ""}`}>{task.text}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
