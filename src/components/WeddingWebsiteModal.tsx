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

type Tab = "design" | "rsvp" | "gallery" | "travel" | "timeline";

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
  const [activeTab, setActiveTab] = useState<Tab>("design");

  // RSVP settings
  const [rsvpEnabled, setRsvpEnabled] = useState(true);
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [rsvpPlusOne, setRsvpPlusOne] = useState(true);
  const [rsvpDietary, setRsvpDietary] = useState(true);
  const [rsvpMessage, setRsvpMessage] = useState("We can't wait to celebrate with you!");

  // Gallery settings
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("Our Journey Together");

  // Travel settings
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [hotelBlock, setHotelBlock] = useState("");
  const [hotelCode, setHotelCode] = useState("");
  const [travelNotes, setTravelNotes] = useState("");

  // Timeline settings
  const [timelineEvents, setTimelineEvents] = useState<Array<{ name: string; time: string; venue: string }>>([
    { name: "Mehendi", time: "4:00 PM", venue: "Garden Lawn" },
    { name: "Wedding Ceremony", time: "7:00 PM", venue: "Main Hall" },
    { name: "Reception", time: "9:00 PM", venue: "Ballroom" },
  ]);

  const hasSlug = !!websiteData.websiteSlug;
  const websiteUrl = hasSlug ? `shaadisheet.com/w/${websiteData.websiteSlug}` : "";

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await generateWebsiteSlug(weddingId);
      if (result?.slug) onUpdate?.();
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
    const text = encodeURIComponent(`Check out our wedding website! https://${websiteUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, [websiteUrl]);

  const handlePreview = useCallback(() => {
    window.open(`/w/${websiteData.websiteSlug}`, "_blank");
  }, [websiteData.websiteSlug]);

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) { if (w > h) { h = Math.round((h / w) * MAX); w = MAX; } else { w = Math.round((w / h) * MAX); h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        setPhotoUrl(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGalleryUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) { if (w > h) { h = Math.round((h / w) * MAX); w = MAX; } else { w = Math.round((w / h) * MAX); h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        setGalleryPhotos((prev) => [...prev, canvas.toDataURL("image/jpeg", 0.7)]);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRegenerate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await generateWebsiteSlug(weddingId);
      if (result?.slug) onUpdate?.();
    } catch (err) {
      console.error("Failed to regenerate website slug:", err);
    } finally {
      setLoading(false);
    }
  }, [weddingId, onUpdate]);

  const addTimelineEvent = () => setTimelineEvents((prev) => [...prev, { name: "", time: "", venue: "" }]);
  const updateTimelineEvent = (idx: number, field: string, value: string) => {
    setTimelineEvents((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };
  const removeTimelineEvent = (idx: number) => setTimelineEvents((prev) => prev.filter((_, i) => i !== idx));

  if (!open) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Date TBD";
    try { return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); } catch { return dateStr; }
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "design", label: "Design", icon: "fa-palette" },
    { id: "rsvp", label: "RSVP", icon: "fa-envelope-open-text" },
    { id: "gallery", label: "Gallery", icon: "fa-images" },
    { id: "travel", label: "Travel", icon: "fa-plane" },
    { id: "timeline", label: "Timeline", icon: "fa-clock" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="wedding-website-modal-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[560px] mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 id="wedding-website-modal-title" className="text-lg font-semibold text-gray-900">Wedding Website</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        {hasSlug && (
          <div className="flex border-b border-gray-100 px-4 overflow-x-auto shrink-0">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-[#6b2737] text-[#6b2737]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                <i className={`fas ${tab.icon} text-[10px]`} /> {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {!hasSlug ? (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-start gap-4">
                  {websiteData.websitePhoto && <img src={websiteData.websitePhoto} alt={weddingName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                  <div>
                    <h3 className="font-semibold text-gray-900">{weddingName}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(websiteData.weddingDate)}</p>
                    {websiteData.weddingCity && <p className="text-sm text-gray-400">{websiteData.weddingCity}</p>}
                  </div>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-[#6b2737]/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#6b2737]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create your wedding website</h3>
                  <p className="text-sm text-gray-500 mt-1">A beautiful site with RSVP, gallery, travel info & timeline</p>
                </div>
              </div>
              <button onClick={handleGenerate} disabled={loading} className="w-full py-2.5 px-4 bg-[#6b2737] text-white rounded-lg font-medium text-sm hover:bg-[#5a1f2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating...</span> : "Generate Website"}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* URL */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Website URL</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-800 font-mono truncate">{websiteUrl}</div>
                  <button onClick={handleCopyLink} className="px-3 py-2 text-sm font-medium text-[#6b2737] bg-[#6b2737]/10 rounded-lg hover:bg-[#6b2737]/20 transition-colors flex-shrink-0">{copied ? "Copied!" : "Copy Link"}</button>
                </div>
              </div>

              {/* Share buttons */}
              <div className="flex gap-2">
                <button onClick={handleShareWhatsApp} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-[#25D366] bg-[#25D366]/10 rounded-lg hover:bg-[#25D366]/20 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </button>
                <button onClick={handlePreview} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-[#6b2737] bg-[#6b2737]/10 rounded-lg hover:bg-[#6b2737]/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  Preview
                </button>
              </div>

              {/* ── Design Tab ── */}
              {activeTab === "design" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Together forever begins here" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Couple Photo</label>
                    {photoUrl ? (
                      <div className="relative">
                        <img src={photoUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                        <button onClick={() => setPhotoUrl("")} className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xs transition-colors">✕</button>
                      </div>
                    ) : (
                      <div onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const file = e.dataTransfer.files?.[0]; if (file) handleFileUpload(file); }} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6b2737]/50 hover:bg-[#6b2737]/[0.02] transition-colors cursor-pointer" onClick={() => document.getElementById("photo-upload")?.click()}>
                        <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }} />
                        <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                        </div>
                        <p className="text-sm text-gray-500"><span className="font-medium text-[#6b2737]">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── RSVP Tab ── */}
              {activeTab === "rsvp" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Enable RSVP Form</span>
                    <button onClick={() => setRsvpEnabled(!rsvpEnabled)} className={`w-11 h-6 rounded-full transition-colors ${rsvpEnabled ? "bg-[#6b2737]" : "bg-gray-300"}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${rsvpEnabled ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                    </button>
                  </div>
                  {rsvpEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Deadline</label>
                        <input type="date" value={rsvpDeadline} onChange={(e) => setRsvpDeadline(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                        <textarea value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] resize-none" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Allow +1 / Plus One</span>
                          <button onClick={() => setRsvpPlusOne(!rsvpPlusOne)} className={`w-9 h-5 rounded-full transition-colors ${rsvpPlusOne ? "bg-[#6b2737]" : "bg-gray-300"}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${rsvpPlusOne ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Collect Dietary Preferences</span>
                          <button onClick={() => setRsvpDietary(!rsvpDietary)} className={`w-9 h-5 rounded-full transition-colors ${rsvpDietary ? "bg-[#6b2737]" : "bg-gray-300"}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${rsvpDietary ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
                          </button>
                        </div>
                      </div>
                      {/* RSVP Form Preview */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Form Preview</p>
                        <div className="space-y-2">
                          <input readOnly value="" placeholder="Full Name" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-400" />
                          <input readOnly value="" placeholder="Email" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-400" />
                          <select disabled className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-400"><option>Attending?</option></select>
                          {rsvpPlusOne && <input readOnly value="" placeholder="Plus One Name" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-400" />}
                          {rsvpDietary && <input readOnly value="" placeholder="Dietary Requirements" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-400" />}
                          <input readOnly value="" placeholder="Song Request (optional)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-400" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Gallery Tab ── */}
              {activeTab === "gallery" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Title</label>
                    <input type="text" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryPhotos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setGalleryPhotos((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-[10px]">✕</button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#6b2737]/50 hover:bg-[#6b2737]/[0.02] transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleGalleryUpload(file); }} />
                      <i className="fas fa-plus text-gray-400 text-lg mb-1" />
                      <span className="text-[10px] text-gray-400">Add Photo</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">Upload engagement photos, pre-wedding shoots, or couple portraits.</p>
                </div>
              )}

              {/* ── Travel Tab ── */}
              {activeTab === "travel" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                    <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="e.g. Grand Palace Banquet" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                    <input type="text" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="Full address with city" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]" />
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Hotel Block (optional)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hotel Name</label>
                        <input type="text" value={hotelBlock} onChange={(e) => setHotelBlock(e.target.value)} placeholder="Hotel name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Booking Code</label>
                        <input type="text" value={hotelCode} onChange={(e) => setHotelCode(e.target.value)} placeholder="e.g. SHAADI2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Travel Notes</label>
                    <textarea value={travelNotes} onChange={(e) => setTravelNotes(e.target.value)} rows={3} placeholder="Parking info, dress code, airport transfers..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] resize-none" />
                  </div>
                </div>
              )}

              {/* ── Timeline Tab ── */}
              {activeTab === "timeline" && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Add your wedding events so guests know the schedule.</p>
                  {timelineEvents.map((ev, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="w-8 h-8 rounded-full bg-[#6b2737]/10 flex items-center justify-center text-[#6b2737] text-xs font-bold shrink-0 mt-1">{i + 1}</div>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input type="text" value={ev.name} onChange={(e) => updateTimelineEvent(i, "name", e.target.value)} placeholder="Event" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]" />
                        <input type="text" value={ev.time} onChange={(e) => updateTimelineEvent(i, "time", e.target.value)} placeholder="Time" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]" />
                        <div className="flex gap-1">
                          <input type="text" value={ev.venue} onChange={(e) => updateTimelineEvent(i, "venue", e.target.value)} placeholder="Venue" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]" />
                          {timelineEvents.length > 1 && (
                            <button onClick={() => removeTimelineEvent(i)} className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                              <i className="fas fa-trash text-xs" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addTimelineEvent} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#6b2737]/50 hover:text-[#6b2737] text-sm font-medium transition-colors">
                    <i className="fas fa-plus mr-1" /> Add Event
                  </button>
                </div>
              )}

              {/* Save bar */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2 px-4 bg-[#6b2737] text-white rounded-lg font-medium text-sm hover:bg-[#5a1f2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={handleRegenerate} disabled={loading} className="py-2 px-3 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
