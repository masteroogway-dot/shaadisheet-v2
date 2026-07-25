"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  bannedAt: string | null;
  bannedReason: string | null;
  _count: { weddings: number; collaborations: number };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "user" | "admin" | "banned">("all");
  const [banModal, setBanModal] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.role === filter;
    return matchSearch && matchFilter;
  });

  const handleBan = async (user: User) => {
    setActionLoading(user.id);
    await fetch(`/api/admin/users/${user.id}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: banReason }),
    });
    setBanModal(null);
    setBanReason("");
    setActionLoading(null);
    loadUsers();
  };

  const handleUnban = async (userId: string) => {
    setActionLoading(userId);
    await fetch(`/api/admin/users/${userId}/unban`, { method: "POST" });
    setActionLoading(null);
    loadUsers();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure? This will delete the user and ALL their data.")) return;
    setActionLoading(userId);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setActionLoading(null);
    loadUsers();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><i className="fas fa-spinner fa-spin text-2xl text-gray-400" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "user", "admin", "banned"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === f ? "bg-maroon text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} user{filtered.length !== 1 ? "s" : ""} found</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">#</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Role</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Weddings</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Joined</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium">{u.name || "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === "admin" ? "bg-red-100 text-red-700" :
                      u.role === "banned" ? "bg-gray-100 text-gray-500" :
                      "bg-green-100 text-green-700"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u._count.weddings}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {u.role !== "admin" && (
                        <>
                          {u.role === "banned" ? (
                            <button
                              onClick={() => handleUnban(u.id)}
                              disabled={actionLoading === u.id}
                              className="px-2.5 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 cursor-pointer disabled:opacity-50"
                            >
                              <i className="fas fa-check-circle mr-1" />Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => setBanModal(u)}
                              disabled={actionLoading === u.id}
                              className="px-2.5 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 cursor-pointer disabled:opacity-50"
                            >
                              <i className="fas fa-ban mr-1" />Ban
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={actionLoading === u.id}
                            className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded text-xs font-medium hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                          >
                            <i className="fas fa-trash mr-1" />Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => setBanModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">Ban User</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ban <strong>{banModal.name || banModal.email}</strong>? They will lose access to all features.
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:border-maroon resize-none"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setBanModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
              <button
                onClick={() => handleBan(banModal)}
                disabled={actionLoading === banModal.id}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                {actionLoading === banModal.id ? <i className="fas fa-spinner fa-spin mr-1" /> : <i className="fas fa-ban mr-1" />}
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
