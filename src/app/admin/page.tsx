"use client";

import { useEffect, useState } from "react";

interface AdminStats {
  totalUsers: number;
  totalWeddings: number;
  totalGuests: number;
  totalVendors: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  bannedUsers: number;
  aiMessagesToday: number;
  recentUsers: { id: string; name: string; email: string; createdAt: string; role: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><i className="fas fa-spinner fa-spin text-2xl text-gray-400" /></div>;
  if (!stats) return <div className="text-center py-20 text-gray-500">Failed to load stats</div>;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: "fa-users", color: "from-blue-500 to-blue-600" },
    { label: "Total Weddings", value: stats.totalWeddings, icon: "fa-heart", color: "from-maroon to-maroon-light" },
    { label: "Total Guests", value: stats.totalGuests, icon: "fa-user-friends", color: "from-emerald-500 to-emerald-600" },
    { label: "Total Vendors", value: stats.totalVendors, icon: "fa-store", color: "from-amber-500 to-amber-600" },
    { label: "New This Week", value: stats.newUsersThisWeek, icon: "fa-user-plus", color: "from-purple-500 to-purple-600" },
    { label: "New This Month", value: stats.newUsersThisMonth, icon: "fa-calendar", color: "from-pink-500 to-pink-600" },
    { label: "Banned Users", value: stats.bannedUsers, icon: "fa-ban", color: "from-red-500 to-red-600" },
    { label: "AI Messages Today", value: stats.aiMessagesToday, icon: "fa-robot", color: "from-cyan-500 to-cyan-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                <i className={`fas ${c.icon} text-white text-sm`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{c.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Role</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{u.name || "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === "admin" ? "bg-red-100 text-red-700" :
                      u.role === "banned" ? "bg-gray-100 text-gray-500" :
                      "bg-green-100 text-green-700"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
