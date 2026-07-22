"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface InviteData {
  id: string;
  role: string;
  wedding: { id: string; name: string; religion: string; weddingDate: string | null; weddingCity: string | null };
  inviter: { name: string | null; email: string | null };
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setInvite(d.invite);
      })
      .catch(() => setError("Failed to load invite"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const r = await fetch(`/api/invite/${token}/accept`, { method: "POST" });
      const d = await r.json();
      if (d.error) { setError(d.error); return; }
      setAccepted(true);
      setTimeout(() => router.push(`/dashboard/${d.weddingId}`), 2000);
    } catch {
      setError("Failed to accept invite");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/invite/${token}/decline`, { method: "POST" });
      router.push("/dashboard");
    } catch {
      setError("Failed to decline invite");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "55px", width: "auto", margin: "0 auto 24px" }} />
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Invite</h1>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link href="/auth" className="inline-block px-6 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition-colors">
              Go to ShaadiSheet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "55px", width: "auto", margin: "0 auto 24px" }} />
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Welcome to the team!</h1>
            <p className="text-gray-500">Redirecting you to the wedding planner...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invite) return null;

  const roleLabel = invite.role === "co-owner" ? "Co-Owner" : invite.role === "editor" ? "Editor" : "Viewer";
  const weddingDate = invite.wedding.weddingDate
    ? new Date(invite.wedding.weddingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Date TBD";

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "55px", width: "auto", margin: "0 auto" }} />
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">You&apos;ve been invited!</h1>
            <p className="text-gray-500 text-sm">
              <span className="font-semibold">{invite.inviter.name || invite.inviter.email}</span> wants you to collaborate on
            </p>
          </div>

          <div className="bg-cream/50 rounded-xl p-5 mb-6 border border-gray-100">
            <h2 className="font-bold text-lg text-gray-900 mb-1">{invite.wedding.name || "My Wedding"}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>{weddingDate}</span>
              {invite.wedding.weddingCity && <><span>·</span><span>{invite.wedding.weddingCity}</span></>}
            </div>
            <div className="inline-block px-3 py-1 bg-maroon/10 text-maroon text-xs font-semibold rounded-full">
              {roleLabel}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleDecline} disabled={actionLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer">
              Decline
            </button>
            <button onClick={handleAccept} disabled={actionLoading}
              className="flex-1 px-4 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition-colors disabled:opacity-50 cursor-pointer">
              {actionLoading ? "Accepting..." : "Accept"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
