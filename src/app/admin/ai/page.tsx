"use client";

import { useEffect, useState } from "react";

interface AiStats {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
  messagesThisMonth: number;
  topUsers: { userId: string; name: string; email: string; count: number }[];
  dailyUsage: { date: string; count: number }[];
}

export default function AdminAi() {
  const [stats, setStats] = useState<AiStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ai")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><i className="fas fa-spinner fa-spin text-2xl text-gray-400" /></div>;
  if (!stats) return <div className="text-center py-20 text-gray-500">Failed to load AI stats</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Usage Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Messages", value: stats.totalMessages, color: "from-blue-500 to-blue-600" },
          { label: "Today", value: stats.messagesToday, color: "from-green-500 to-green-600" },
          { label: "This Week", value: stats.messagesThisWeek, color: "from-purple-500 to-purple-600" },
          { label: "This Month", value: stats.messagesThisMonth, color: "from-amber-500 to-amber-600" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
              <i className="fas fa-robot text-white text-sm" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Users by Usage</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.topUsers.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">No AI usage yet</p>
            )}
            {stats.topUsers.map((u, i) => (
              <div key={u.userId} className="px-5 py-3 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name || u.email}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className="text-sm font-bold text-maroon">{u.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Usage Chart (simple bar chart) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Daily Usage (Last 7 Days)</h2>
          </div>
          <div className="p-5">
            {stats.dailyUsage.length === 0 && (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
            <div className="flex items-end gap-2 h-40">
              {stats.dailyUsage.map((d) => {
                const max = Math.max(...stats.dailyUsage.map((x) => x.count), 1);
                const height = (d.count / max) * 100;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-medium">{d.count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-maroon to-gold rounded-t"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[10px] text-gray-400">{d.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
