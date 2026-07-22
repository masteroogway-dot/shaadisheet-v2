"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

interface Props {
  weddingId: string;
  weddingName: string;
  open: boolean;
  onClose: () => void;
}

export default function InviteModal({ weddingId, weddingName, open, onClose }: Props) {
  const [role, setRole] = useState("viewer");
  const [link, setLink] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [showList, setShowList] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchInvites();
      setLink("");
      setQrDataUrl("");
      setCopied(false);
      setShowList(false);
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
      <div ref={modalRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[fadeInUp_0.2s_ease]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Invite Collaborators</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Permission Level</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-maroon transition-colors text-sm">
              <option value="viewer">Viewer - Can view only</option>
              <option value="editor">Editor - Can edit everything except budget & guest count</option>
              <option value="co-owner">Co-Owner - Full access except delete</option>
            </select>
          </div>

          <button onClick={generateInvite} disabled={loading}
            className="w-full px-4 py-2.5 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition-colors disabled:opacity-50 cursor-pointer text-sm">
            {loading ? "Generating..." : "Generate Invite Link"}
          </button>

          {link && (
            <div className="bg-cream/50 rounded-xl p-4 border border-gray-100 space-y-3">
              <div className="flex items-center gap-2">
                <input type="text" value={link} readOnly className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 font-mono" />
                <button onClick={copyLink}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${copied ? "bg-green-100 text-green-700" : "bg-maroon text-white hover:bg-maroon-dark"}`}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {qrDataUrl && (
                <div className="flex justify-center">
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
                </div>
              )}
              <p className="text-xs text-gray-400 text-center">Link expires in 7 days</p>
            </div>
          )}

          <div>
            <button onClick={() => setShowList(!showList)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-maroon transition-colors cursor-pointer">
              <svg className={`w-4 h-4 transition-transform ${showList ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Pending Invites ({invites.filter((i) => i.status === "pending").length})
            </button>
            {showList && (
              <div className="mt-2 space-y-2">
                {invites.filter((i) => i.status === "pending").map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-xs font-mono text-gray-400">{inv.token.slice(0, 8)}...</span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-maroon/10 text-maroon rounded-full font-semibold">{inv.role}</span>
                    </div>
                    <button onClick={() => revokeInvite(inv.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer">
                      Revoke
                    </button>
                  </div>
                ))}
                {invites.filter((i) => i.status === "pending").length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">No pending invites</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
