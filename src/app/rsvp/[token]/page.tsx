"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function RsvpPage() {
  const params = useParams();
  const token = params.token as string;
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [rsvp, setRsvp] = useState("Yes");
  const [dietary, setDietary] = useState("Veg");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/rsvp?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.wedding) setWedding(data.wedding);
        else setError(data.error || "Invalid link");
      })
      .catch(() => setError("Failed to load"));
    setLoading(false);
  }, [token]);

  const filteredGuests = wedding?.guests?.filter((g: any) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSubmit = async () => {
    if (!selectedGuest) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, guestId: selectedGuest.id, rsvp, dietary }),
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setError(data.error || "Failed to submit");
    } catch {
      setError("Failed to submit RSVP");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-link-slash text-red-500 text-xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-green-600 text-xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">RSVP Submitted!</h1>
          <p className="text-gray-500 text-sm mb-1">Thank you, <strong>{selectedGuest?.name}</strong></p>
          <p className="text-gray-400 text-xs">RSVP: {rsvp} | Dietary: {dietary}</p>
          <p className="text-gray-400 text-xs mt-4">You can close this page now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">{wedding?.name || "Wedding"} RSVP</h1>
          {wedding?.weddingDate && (
            <p className="text-gray-500 text-sm mt-1">
              {new Date(wedding.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {wedding.weddingCity && ` \u2022 ${wedding.weddingCity}`}
            </p>
          )}
        </div>

        {!selectedGuest ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-sm text-gray-700 mb-3">Find your name</h2>
            <div className="relative mb-4">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type your name..."
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                autoFocus
              />
            </div>
            {search && (
              <div className="max-h-60 overflow-y-auto">
                {filteredGuests.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No guests found</p>
                ) : (
                  filteredGuests.map((g: any) => (
                    <button
                      key={g.id}
                      onClick={() => { setSelectedGuest(g); setRsvp(g.rsvp === "Pending" ? "Yes" : g.rsvp); setDietary(g.dietary || "Veg"); }}
                      className="w-full text-left px-4 py-3 hover:bg-maroon/5 rounded-lg transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{g.name}</p>
                        <p className="text-xs text-gray-400">{g.side} side</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        g.rsvp === "Yes" ? "bg-green-100 text-green-700" :
                        g.rsvp === "Declined" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>{g.rsvp}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-gray-900">{selectedGuest.name}</h2>
                <p className="text-xs text-gray-400">{selectedGuest.side} side</p>
              </div>
              <button onClick={() => setSelectedGuest(null)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="fas fa-arrow-left mr-1" /> Change
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">RSVP</label>
                <div className="flex gap-2">
                  {["Yes", "Pending", "Declined"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setRsvp(opt)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        rsvp === opt
                          ? opt === "Yes" ? "bg-green-500 text-white" : opt === "Declined" ? "bg-red-500 text-white" : "bg-yellow-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {opt === "Yes" ? "Yes, Attending" : opt === "Declined" ? "Can't Make It" : "Maybe"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Dietary Preference</label>
                <div className="flex gap-2">
                  {["Veg", "Non-Veg", "Vegan", "Jain"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setDietary(opt)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        dietary === opt
                          ? "bg-maroon text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-maroon text-white font-semibold rounded-xl hover:bg-maroon-dark transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit RSVP"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
