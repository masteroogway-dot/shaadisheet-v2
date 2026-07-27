"use client";

import { useState, useRef } from "react";
import { generateWebsiteSlug, updateWebsiteConfig } from "@/lib/actions";

const THEMES = [
  { name: "Royal Maroon", primary: "#722F37", accent: "#D4AF37", background: "#FDF6EC", text: "#333333" },
  { name: "Blush Pink", primary: "#E8A0BF", accent: "#BA94D1", background: "#FFF5F9", text: "#333333" },
  { name: "Forest Green", primary: "#1B5E20", accent: "#C8A951", background: "#F5F5E8", text: "#333333" },
  { name: "Midnight Blue", primary: "#1A237E", accent: "#E6C9A8", background: "#F0F0FA", text: "#333333" },
  { name: "Terracotta", primary: "#C75B39", accent: "#E8C07A", background: "#FFF8F0", text: "#333333" },
  { name: "All White", primary: "#333333", accent: "#B8860B", background: "#FFFFFF", text: "#333333" },
  { name: "Deep Purple", primary: "#4A148C", accent: "#FFD54F", background: "#FBF5FF", text: "#333333" },
];

const STEPS = ["Basics", "Our Story", "Events", "Travel", "Hotels", "Registry", "FAQs", "Design"];

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) { if (w > h) { h = Math.round((h / w) * MAX); w = MAX; } else { w = Math.round((w / h) * MAX); h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function WeddingQuestionnaire({ open, onClose, wedding, websiteData, onUpdate }: {
  open: boolean; onClose: () => void; wedding: any;
  websiteData: { websiteSlug: string; config: any; name: string; weddingDate: string; weddingCity: string };
  onUpdate?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<any>(() => {
    const c = websiteData.config || {};
    return {
      tagline: c.tagline || "", photo: c.photo || "",
      story: c.story || { howWeMet: "", proposal: "", quote: "" },
      events: c.events?.length ? c.events : (wedding.events || []).map((e: any) => ({ ...e, dressCode: "", description: "" })),
      travel: c.travel || { venueName: "", venueAddress: "", mapsUrl: "", tips: "", hotels: [] },
      registry: c.registry || [], faq: c.faq || [],
      template: c.template || "classic",
      theme: c.theme || THEMES[0],
    };
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedSlug, setSavedSlug] = useState(websiteData.websiteSlug || "");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: string, val: any) => setConfig((p: any) => ({ ...p, [field]: val }));
  const updateStory = (field: string, val: string) => setConfig((p: any) => ({ ...p, story: { ...p.story, [field]: val } }));
  const updateTravel = (field: string, val: any) => setConfig((p: any) => ({ ...p, travel: { ...p.travel, [field]: val } }));

  const handlePhoto = async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    const dataUrl = await compressImage(file);
    update("photo", dataUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let slug = websiteData.websiteSlug;
      if (!slug) {
        const res = await generateWebsiteSlug(wedding.id);
        if (res?.slug) slug = res.slug;
      }
      await updateWebsiteConfig(wedding.id, config);
      if (slug) setSavedSlug(slug);
      setSaved(true);
      onUpdate?.();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (!open) return null;

  const websiteUrl = `https://shaadisheet.com/w/${savedSlug}`;

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wedding website is live!</h2>
            <p className="text-sm text-gray-500 mb-6">Share this link with your guests</p>

            <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
              <span className="text-sm text-gray-700 truncate flex-1 font-mono">{websiteUrl}</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { navigator.clipboard.writeText(websiteUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="w-full py-3 bg-[#722F37] text-white text-sm font-semibold rounded-lg hover:bg-[#5a1f2d] cursor-pointer flex items-center justify-center gap-2"
              >
                {copied ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied!</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy Link</>
                )}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out our wedding website!\n${websiteUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#1da851] cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share on WhatsApp
              </a>
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Preview Website
              </a>
            </div>

            <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-gray-600 cursor-pointer">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37] transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100"><div className="h-full bg-[#722F37] transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div><h2 className="text-lg font-semibold text-gray-900">{STEPS[step]}</h2><p className="text-xs text-gray-400 mt-0.5">Step {step + 1} of {STEPS.length}</p></div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Set the tone for your wedding website.</p>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label><input className={inputClass} value={config.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Together forever begins here" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couple Photo</label>
                {config.photo ? (
                  <div className="relative"><img src={config.photo} alt="Preview" className="w-full h-40 object-cover rounded-lg border" /><button onClick={() => update("photo", "")} className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full text-xs cursor-pointer">✕</button></div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#722F37]/50 cursor-pointer" onClick={() => fileRef.current?.click()}>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
                    <p className="text-sm text-gray-500"><span className="font-medium text-[#722F37]">Click to upload</span> or drag & drop</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Share your love story with guests.</p>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">How We Met</label><textarea className={inputClass + " resize-none"} rows={4} value={config.story.howWeMet} onChange={(e) => updateStory("howWeMet", e.target.value)} placeholder="Tell the story of how you first met..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">The Proposal</label><textarea className={inputClass + " resize-none"} rows={4} value={config.story.proposal} onChange={(e) => updateStory("proposal", e.target.value)} placeholder="How did the proposal happen?" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Favorite Quote</label><input className={inputClass} value={config.story.quote} onChange={(e) => updateStory("quote", e.target.value)} placeholder="A quote that represents your relationship" /></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Add dress codes and descriptions to your events.</p>
              {config.events.map((event: any, i: number) => (
                <div key={event.id || i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-gray-800">{event.name} <span className="text-gray-400 font-normal">• {event.date}</span></p>
                  <input className={inputClass} value={event.dressCode || ""} onChange={(e) => { const ev = [...config.events]; ev[i] = { ...ev[i], dressCode: e.target.value }; update("events", ev); }} placeholder="Dress code (e.g., Indian Formal, Cocktail)" />
                  <textarea className={inputClass + " resize-none"} rows={2} value={event.description || ""} onChange={(e) => { const ev = [...config.events]; ev[i] = { ...ev[i], description: e.target.value }; update("events", ev); }} placeholder="Brief description of this event" />
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Help guests find the venue.</p>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label><input className={inputClass} value={config.travel.venueName} onChange={(e) => updateTravel("venueName", e.target.value)} placeholder="e.g. The Grand Palace" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input className={inputClass} value={config.travel.venueAddress} onChange={(e) => updateTravel("venueAddress", e.target.value)} placeholder="Full venue address" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label><input className={inputClass} value={config.travel.mapsUrl} onChange={(e) => updateTravel("mapsUrl", e.target.value)} placeholder="https://maps.google.com/..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Travel Tips</label><textarea className={inputClass + " resize-none"} rows={3} value={config.travel.tips} onChange={(e) => updateTravel("tips", e.target.value)} placeholder="Any tips for traveling guests..." /></div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Recommend hotels for out-of-town guests.</p>
              {config.travel.hotels.map((hotel: any, i: number) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2 relative">
                  <button onClick={() => { const h = [...config.travel.hotels]; h.splice(i, 1); updateTravel("hotels", h); }} className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 cursor-pointer">Remove</button>
                  <input className={inputClass} value={hotel.name} onChange={(e) => { const h = [...config.travel.hotels]; h[i] = { ...h[i], name: e.target.value }; updateTravel("hotels", h); }} placeholder="Hotel name" />
                  <div className="grid grid-cols-2 gap-2"><input className={inputClass} value={hotel.link} onChange={(e) => { const h = [...config.travel.hotels]; h[i] = { ...h[i], link: e.target.value }; updateTravel("hotels", h); }} placeholder="Booking link" /><input className={inputClass} value={hotel.price || ""} onChange={(e) => { const h = [...config.travel.hotels]; h[i] = { ...h[i], price: e.target.value }; updateTravel("hotels", h); }} placeholder="Price range" /></div>
                  <input className={inputClass} value={hotel.groupCode || ""} onChange={(e) => { const h = [...config.travel.hotels]; h[i] = { ...h[i], groupCode: e.target.value }; updateTravel("hotels", h); }} placeholder="Group code (optional)" />
                </div>
              ))}
              <button onClick={() => updateTravel("hotels", [...config.travel.hotels, { name: "", link: "", groupCode: "", price: "" }])} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-[#722F37] hover:text-[#722F37] cursor-pointer">+ Add Hotel</button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Add gift registry links.</p>
              {config.registry.map((reg: any, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className={inputClass} value={reg.name} onChange={(e) => { const r = [...config.registry]; r[i] = { ...r[i], name: e.target.value }; update("registry", r); }} placeholder="Registry name" />
                  <input className={inputClass} value={reg.url} onChange={(e) => { const r = [...config.registry]; r[i] = { ...r[i], url: e.target.value }; update("registry", r); }} placeholder="URL" />
                  <button onClick={() => { const r = [...config.registry]; r.splice(i, 1); update("registry", r); }} className="text-red-400 hover:text-red-600 shrink-0 cursor-pointer">✕</button>
                </div>
              ))}
              <button onClick={() => update("registry", [...config.registry, { name: "", url: "" }])} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-[#722F37] hover:text-[#722F37] cursor-pointer">+ Add Registry</button>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Answer common guest questions.</p>
              {config.faq.map((item: any, i: number) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2 relative">
                  <button onClick={() => { const f = [...config.faq]; f.splice(i, 1); update("faq", f); }} className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 cursor-pointer">Remove</button>
                  <input className={inputClass} value={item.q} onChange={(e) => { const f = [...config.faq]; f[i] = { ...f[i], q: e.target.value }; update("faq", f); }} placeholder="Question" />
                  <textarea className={inputClass + " resize-none"} rows={2} value={item.a} onChange={(e) => { const f = [...config.faq]; f[i] = { ...f[i], a: e.target.value }; update("faq", f); }} placeholder="Answer" />
                </div>
              ))}
              <button onClick={() => update("faq", [...config.faq, { q: "", a: "" }])} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-[#722F37] hover:text-[#722F37] cursor-pointer">+ Add FAQ</button>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">Choose a design template and color theme.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "classic", name: "Classic", icon: "🏛️", desc: "Timeless elegance" },
                    { id: "floral", name: "Romantic Floral", icon: "🌸", desc: "Soft & dreamy" },
                    { id: "royal", name: "Royal Indian", icon: "🪷", desc: "Rich & ornate" },
                    { id: "editorial", name: "Modern", icon: "✨", desc: "Bold & editorial" },
                    { id: "boho", name: "Boho Natural", icon: "🌿", desc: "Earthy & organic" },
                    { id: "monogram", name: "Monogram", icon: "💍", desc: "Classic crest" },
                    { id: "tropical", name: "Tropical", icon: "🌴", desc: "Beach vibes" },
                  ].map((t) => (
                    <button key={t.id} onClick={() => update("template", t.id)} className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${config.template === t.id ? "border-[#722F37] bg-[#722F37]/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="text-lg mb-0.5">{t.icon}</div>
                      <div className="text-xs font-semibold">{t.name}</div>
                      <div className="text-[0.6rem] text-gray-400 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {THEMES.map((theme) => (
                    <button key={theme.name} onClick={() => update("theme", theme)} className={`p-2 rounded-lg border-2 text-center cursor-pointer transition-all ${config.theme?.primary === theme.primary ? "border-[#722F37] ring-1 ring-[#722F37]/30" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="flex gap-1 justify-center mb-1"><div className="w-4 h-4 rounded-full" style={{ background: theme.primary }} /><div className="w-4 h-4 rounded-full" style={{ background: theme.accent }} /></div>
                      <div className="text-[0.6rem] text-gray-500 leading-tight">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Colors</label>
                <div className="grid grid-cols-4 gap-2">
                  {[{ label: "Primary", field: "primary" }, { label: "Accent", field: "accent" }, { label: "Background", field: "background" }, { label: "Text", field: "text" }].map((c) => (
                    <div key={c.field} className="text-center">
                      <input type="color" value={config.theme?.[c.field] || "#000"} onChange={(e) => update("theme", { ...config.theme, [c.field]: e.target.value })} className="w-full h-8 rounded cursor-pointer border" />
                      <span className="text-[0.6rem] text-gray-400 mt-1 block">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 cursor-pointer">Back</button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="px-5 py-2 bg-[#722F37] text-white text-sm font-semibold rounded-lg hover:bg-[#5a1f2d] cursor-pointer">Next</button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-[#722F37] text-white text-sm font-semibold rounded-lg hover:bg-[#5a1f2d] disabled:opacity-50 cursor-pointer">{saving ? "Saving..." : "Save Website"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
