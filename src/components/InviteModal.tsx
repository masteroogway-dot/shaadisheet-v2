"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";

interface Props {
  weddingId: string;
  weddingName: string;
  open: boolean;
  onClose: () => void;
}

const ROLES = [
  {
    value: "viewer",
    label: "Viewer",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: "Can view the entire planner",
    access: "View only",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    activeColor: "bg-blue-100 text-blue-700 border-blue-400",
  },
  {
    value: "editor",
    label: "Editor",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    description: "Can edit budget items, vendors, guests & more",
    access: "Cannot change budget total or guest count",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    activeColor: "bg-amber-100 text-amber-700 border-amber-400",
  },
  {
    value: "co-owner",
    label: "Co-Owner",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    description: "Full access to edit everything",
    access: "Cannot delete the wedding",
    color: "bg-maroon/10 text-maroon border-maroon/30",
    activeColor: "bg-maroon/20 text-maroon border-maroon",
  },
];

export default function InviteModal({ weddingId, weddingName, open, onClose }: Props) {
  const [role, setRole] = useState("viewer");
  const [link, setLink] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (open) {
      fetchInvites();
      setLink("");
      setQrDataUrl("");
      setCopied(false);
      setShowList(false);
      setRole("viewer");
    }
  }, [open, weddingId]);

  const fetchInvites = async () => {
    try {
      const r = await fetch(`/api/weddings/${weddingId}/invites`);
      const d = await r.json();
      if (d.invites) setInvites(d.invites);
    } catch {}
  };

  const generateInvite = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/weddings/${weddingId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const d = await r.json();
      if (d.link) {
        setLink(d.link);
        const qr = await QRCode.toDataURL(d.link, { width: 256, margin: 2, color: { dark: "#8B0000", light: "#FFFFFF" } });
        setQrDataUrl(qr);
        fetchInvites();
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revokeInvite = async (inviteId: string) => {
    try {
      await fetch(`/api/weddings/${weddingId}/invites/${inviteId}`, { method: "DELETE" });
      fetchInvites();
    } catch {}
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[fadeInUp_0.2s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Invite Collaborators</h2>
            <p className="text-xs text-gray-400 mt-0.5">to {weddingName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Choose a role</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    role === r.value
                      ? `${r.activeColor} border-current`
                      : `${r.color} border-transparent hover:border-gray-200`
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${role === r.value ? "text-current" : "text-gray-400"}`}>
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{r.label}</span>
                      {role === r.value && (
                        <svg className="w-4 h-4 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">{r.description}</p>
                    <p className="text-[0.65rem] opacity-50 mt-1">{r.access}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button onClick={generateInvite} disabled={loading}
            className="w-full px-4 py-3 bg-maroon text-white rounded-xl font-semibold hover:bg-maroon-dark transition-all disabled:opacity-50 cursor-pointer text-sm shadow-sm hover:shadow-md">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Generating...
              </span>
            ) : "Generate Invite Link"}
          </button>

          {/* Link + QR */}
          {link && (
            <div className="bg-gradient-to-br from-cream/80 to-white rounded-xl p-5 border border-gray-100 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.914-3.814a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  <span className="text-xs text-gray-500 truncate font-mono flex-1">{link}</span>
                </div>
                <button onClick={copyLink}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-maroon text-white hover:bg-maroon-dark"
                  }`}>
                  {copied ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      Copied
                    </span>
                  ) : "Copy"}
                </button>
              </div>
              {qrDataUrl && (
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 rounded-lg" />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Link expires in 7 days
              </div>
            </div>
          )}

          {/* Pending Invites */}
          {invites.filter((i) => i.status === "pending").length > 0 && (
            <div>
              <button onClick={() => setShowList(!showList)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-maroon transition-colors cursor-pointer">
                <svg className={`w-4 h-4 transition-transform ${showList ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Pending Invites
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                  {invites.filter((i) => i.status === "pending").length}
                </span>
              </button>
              {showList && (
                <div className="mt-3 space-y-2">
                  {invites.filter((i) => i.status === "pending").map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.914-3.814a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-xs font-mono text-gray-400">{inv.token.slice(0, 12)}...</span>
                          <span className="ml-2 text-[0.65rem] px-2 py-0.5 bg-maroon/10 text-maroon rounded-full font-semibold uppercase">{inv.role}</span>
                        </div>
                      </div>
                      <button onClick={() => revokeInvite(inv.id)}
                        className="text-xs text-gray-400 hover:text-red-500 font-medium cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
