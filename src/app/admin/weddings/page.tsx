"use client";

import { useEffect, useState } from "react";

interface Wedding {
  id: string;
  name: string;
  religion: string | null;
  weddingDate: string | null;
  budget: number;
  createdAt: string;
  user: { name: string; email: string };
  _count: { guests: number; vendors: number; tasks: number };
}

export default function AdminWeddings() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadWeddings = () => {
    fetch("/api/admin/weddings")
      .then((r) => r.json())
      .then(setWeddings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWeddings(); }, []);

  const filtered = weddings.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return w.name?.toLowerCase().includes(q) || w.user?.name?.toLowerCase().includes(q) || w.user?.email?.toLowerCase().includes(q);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete this wedding and ALL its data.")) return;
    setActionLoading(id);
    await fetch(`/api/admin/weddings/${id}`, { method: "DELETE" });
    setActionLoading(null);
    loadWeddings();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><i className="fas fa-spinner fa-spin text-2xl text-gray-400" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wedding Management</h1>

      <div className="relative mb-6">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search weddings by name or owner..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon"
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} wedding{filtered.length !== 1 ? "s" : ""} found</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">#</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Owner</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Religion</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Guests</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Vendors</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Budget</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Created</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((w, i) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium">{w.name || "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{w.user?.name || w.user?.email}</td>
                  <td className="px-5 py-3 text-gray-500">{w.religion || "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{w._count.guests}</td>
                  <td className="px-5 py-3 text-gray-500">{w._count.vendors}</td>
                  <td className="px-5 py-3 text-gray-500">₹{(w.budget || 0).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(w.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleDelete(w.id)}
                        disabled={actionLoading === w.id}
                        className="px-2.5 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading === w.id ? <i className="fas fa-spinner fa-spin mr-1" /> : <i className="fas fa-trash mr-1" />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
