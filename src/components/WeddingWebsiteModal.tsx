"use client";
import { useState, useCallback } from "react";
import { generateWebsiteSlug, updateWeddingWebsite } from "@/lib/actions";

interface WebsiteData {
  websiteSlug: string | null;
  websitePhoto: string | null;
  websiteTagline: string | null;
  name: string;
  weddingDate: string | null;
  weddingCity: string | null;
}

interface WeddingWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  weddingId: string;
  weddingName: string;
  websiteData: WebsiteData;
  onUpdate?: () => void;
}

export default function WeddingWebsiteModal({
  open,
  onClose,
  weddingId,
  weddingName,
  websiteData,
  onUpdate,
}: WeddingWebsiteModalProps) {
  const [loading, setLoading] = useState(false);
  const [tagline, setTagline] = useState(websiteData.websiteTagline ?? "");
  const [photoUrl, setPhotoUrl] = useState(websiteData.websitePhoto ?? "");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasSlug = !!websiteData.websiteSlug;
  const websiteUrl = hasSlug
    ? `shaadisheet.com/w/${websiteData.websiteSlug}`
    : "";

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await generateWebsiteSlug(weddingId);
      if (result?.slug) {
        onUpdate?.();
      }
    } catch (err) {
      console.error("Failed to generate website slug:", err);
    } finally {
      setLoading(false);
    }
  }, [weddingId, onUpdate]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateWeddingWebsite(weddingId, {
        websiteTagline: tagline || "",
        websitePhoto: photoUrl || "",
      });
      onUpdate?.();
    } catch (err) {
      console.error("Failed to update website:", err);
    } finally {
      setSaving(false);
    }
  }, [weddingId, tagline, photoUrl, onUpdate]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`https://${websiteUrl}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [websiteUrl]);

  const handleShareWhatsApp = useCallback(() => {
    const text = encodeURIComponent(
      `Check out our wedding website! https://${websiteUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, [websiteUrl]);

  const handlePreview = useCallback(() => {
    window.open(`/w/${websiteData.websiteSlug}`, "_blank");
  }, [websiteData.websiteSlug]);

  const handleRegenerate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await generateWebsiteSlug(weddingId);
      if (result?.slug) {
        onUpdate?.();
      }
    } catch (err) {
      console.error("Failed to regenerate website slug:", err);
    } finally {
      setLoading(false);
    }
  }, [weddingId, onUpdate]);

  if (!open) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Date TBD";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wedding-website-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[500px] mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2
            id="wedding-website-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            Wedding Website
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {!hasSlug ? (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-start gap-4">
                  {websiteData.websitePhoto && (
                    <img
                      src={websiteData.websitePhoto}
                      alt={weddingName}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {weddingName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatDate(websiteData.weddingDate)}
                    </p>
                    {websiteData.weddingCity && (
                      <p className="text-sm text-gray-400">
                        {websiteData.weddingCity}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-[#6b2737]/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#6b2737]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Create your wedding website
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Create a beautiful wedding website you can share with guests
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#6b2737] text-white rounded-lg font-medium text-sm hover:bg-[#5a1f2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate Website"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Website URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-800 font-mono truncate">
                    {websiteUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 text-sm font-medium text-[#6b2737] bg-[#6b2737]/10 rounded-lg hover:bg-[#6b2737]/20 transition-colors flex-shrink-0"
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-[#25D366] bg-[#25D366]/10 rounded-lg hover:bg-[#25D366]/20 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={handlePreview}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-[#6b2737] bg-[#6b2737]/10 rounded-lg hover:bg-[#6b2737]/20 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                  Preview
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="tagline"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tagline
                  </label>
                  <input
                    id="tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Together forever begins here"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="photoUrl"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Photo URL
                  </label>
                  <input
                    id="photoUrl"
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 px-4 bg-[#6b2737] text-white rounded-lg font-medium text-sm hover:bg-[#5a1f2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="py-2 px-3 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Regenerating..." : "Regenerate Link"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
