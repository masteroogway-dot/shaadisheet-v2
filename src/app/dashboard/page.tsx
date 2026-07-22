"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getAllWeddings, createWedding, updateWedding, deleteWedding } from "@/lib/actions";
import ProfileMenu from "@/components/ProfileMenu";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [weddings, setWeddings] = useState<any[]>([]);
  const [collaborated, setCollaborated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (status === "authenticated") loadWeddings();
  }, [status, router]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const loadWeddings = async () => {
    try {
      const data = await getAllWeddings();
      setWeddings(data.owned);
      setCollaborated(data.collaborated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWedding = async () => {
    setCreating(true);
    try {
      const wedding = await createWedding();
      router.push(`/dashboard/${wedding.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleStartRename = (wedding: any) => {
    setEditingId(wedding.id);
    setEditName(wedding.name || "");
  };

  const handleSaveName = async (id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await updateWedding({ weddingId: id, name: editName.trim() });
      setWeddings((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name: editName.trim() } : w))
      );
    } catch (e) {
      console.error(e);
    }
    setEditingId(null);
  };

  const handleDeleteWedding = async (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 4000);
      return;
    }
    try {
      await deleteWedding(id);
      setWeddings((prev) => prev.filter((w) => w.id !== id));
    } catch (e) {
      console.error(e);
    }
    setDeletingId(null);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatBudget = (budget: number) => {
    if (budget === 0) return "Not set";
    if (budget >= 10000000) {
      const c = budget / 10000000;
      return c % 1 === 0 ? `\u20B9${c} Cr` : `\u20B9${c.toFixed(1)} Cr`;
    }
    const l = budget / 100000;
    return l % 1 === 0 ? `\u20B9${l}L` : `\u20B9${l.toFixed(1)}L`;
  };

  const formatGuestCount = (count: number) => {
    if (count === 0) return "Not set";
    return count.toLocaleString("en-IN");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your weddings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "55px", width: "auto" }} />
        </Link>
        <ProfileMenu user={session?.user} />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">My Weddings</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Manage all your wedding plans in one place</p>
          </div>
          <button
            onClick={handleCreateWedding}
            disabled={creating}
            className="px-5 md:px-6 py-2.5 md:py-3 bg-maroon text-white font-semibold rounded-lg hover:bg-maroon-dark transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm md:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {creating ? "Creating..." : "New Wedding"}
          </button>
        </div>

        {weddings.length === 0 && collaborated.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No weddings yet</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Start planning your first wedding by creating a new wedding planner.</p>
            <button
              onClick={handleCreateWedding}
              disabled={creating}
              className="px-8 py-3 bg-maroon text-white font-semibold rounded-lg hover:bg-maroon-dark transition-colors disabled:opacity-50 cursor-pointer"
            >
              {creating ? "Creating..." : "Create Your First Wedding"}
            </button>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {weddings.map((wedding) => (
              <div
                key={wedding.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-maroon/30 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="h-3 bg-gradient-to-r from-maroon to-gold" />
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      {editingId === wedding.id ? (
                        <input
                          ref={editInputRef}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveName(wedding.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          onBlur={() => handleSaveName(wedding.id)}
                          className="text-lg font-bold w-full px-2 py-1 border-2 border-maroon rounded-lg focus:outline-none"
                          placeholder="Wedding name"
                        />
                      ) : (
                        <h3
                          className="text-lg font-bold text-gray-900 cursor-pointer hover:text-maroon transition-colors truncate"
                          onClick={() => handleStartRename(wedding)}
                          title="Click to rename"
                        >
                          {wedding.name || "Unnamed Wedding"}
                        </h3>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {wedding.religion ? wedding.religion.charAt(0).toUpperCase() + wedding.religion.slice(1) : "Not set"}
                        {wedding.region && " \u2022 " + wedding.region}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        wedding.religion ? "bg-maroon/10 text-maroon" : "bg-gray-100 text-gray-500"
                      }`}>
                        {wedding.religion ? "Configured" : "Setup needed"}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteWedding(wedding.id); }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          deletingId === wedding.id
                            ? "bg-red-500 text-white"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                        }`}
                        title={deletingId === wedding.id ? "Click again to confirm delete" : "Delete wedding"}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(wedding.weddingDate)}</span>
                      {wedding.weddingCity && (
                        <>
                          <span className="text-gray-300">{"\u2022"}</span>
                          <span>{wedding.weddingCity}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Budget: {formatBudget(wedding.budget)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Guests: {formatGuestCount(wedding.guestCount)}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Link
                      href={`/dashboard/${wedding.id}`}
                      className="block text-center py-2.5 text-sm font-semibold text-maroon bg-maroon/5 rounded-xl hover:bg-maroon/10 transition-colors"
                    >
                      Open Planner {"\u2192"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {collaborated.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shared with You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {collaborated.map((wedding: any) => (
                  <div key={wedding.id} className="bg-white rounded-2xl border border-gray-200 hover:border-maroon/30 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-400" />
                    <div className="p-4 md:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{wedding.name || "Unnamed Wedding"}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {wedding.religion ? wedding.religion.charAt(0).toUpperCase() + wedding.religion.slice(1) : "Not set"}
                            {wedding.region && " \u2022 " + wedding.region}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                          {wedding.userRole === "co-owner" ? "Co-Owner" : wedding.userRole === "editor" ? "Editor" : "Viewer"}
                        </span>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(wedding.weddingDate)}</span>
                          {wedding.weddingCity && (
                            <>
                              <span className="text-gray-300">{"\u2022"}</span>
                              <span>{wedding.weddingCity}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>by {wedding.owner?.name || wedding.owner?.email || "Unknown"}</span>
                        </div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <Link href={`/dashboard/${wedding.id}`}
                          className="block text-center py-2.5 text-sm font-semibold text-maroon bg-maroon/5 rounded-xl hover:bg-maroon/10 transition-colors">
                          Open Planner {"\u2192"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}
