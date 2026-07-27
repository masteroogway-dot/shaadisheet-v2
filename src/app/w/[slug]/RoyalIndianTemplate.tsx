"use client";

import React, { useState } from "react";

interface TemplateProps {
  wedding: { name: string; weddingDate: string; weddingCity: string; config: any };
  countdown: { days: number; hours: number; minutes: number; seconds: number };
  rsvpGuests: any[];
  guestSearch: string;
  onRsvpSearch: (val: string) => void;
  onGuestSelect: (guest: any) => void;
  selectedGuest: any;
  rsvpStatus: string | null;
  onRsvpStatusChange: (status: string) => void;
  dietary: string;
  onDietaryChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  onRsvpSubmit: () => void;
  submitting: boolean;
  submitSuccess: boolean;
}

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function Mandala({ color = "#D4AF37", size = 120 }: { color?: string; size?: number }) {
  const layers = 4;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ display: "block", margin: "0 auto" }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        return (
          <g key={i}>
            <ellipse cx={60 + Math.cos(angle) * 25} cy={60 + Math.sin(angle) * 25} rx="8" ry="3" fill={color} opacity="0.15" transform={`rotate(${i * 30} ${60 + Math.cos(angle) * 25} ${60 + Math.sin(angle) * 25})`} />
            <ellipse cx={60 + Math.cos(angle) * 38} cy={60 + Math.sin(angle) * 38} rx="6" ry="2" fill={color} opacity="0.1" transform={`rotate(${i * 30} ${60 + Math.cos(angle) * 38} ${60 + Math.sin(angle) * 38})`} />
          </g>
        );
      })}
      {[20, 30, 42, 52].map((r, i) => (
        <circle key={i} cx="60" cy="60" r={r} stroke={color} strokeWidth={0.5 + i * 0.2} fill="none" opacity={0.2 + i * 0.05} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45) * Math.PI / 180;
        return <line key={i} x1={60 + Math.cos(angle) * 18} y1={60 + Math.sin(angle) * 18} x2={60 + Math.cos(angle) * 50} y2={60 + Math.sin(angle) * 50} stroke={color} strokeWidth="0.3" opacity="0.2" />;
      })}
      <circle cx="60" cy="60" r="6" fill={color} opacity="0.3" />
      <circle cx="60" cy="60" r="3" fill={color} opacity="0.5" />
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 60) * Math.PI / 180;
        return <circle key={`d-${i}`} cx={60 + Math.cos(angle) * 12} cy={60 + Math.sin(angle) * 12} r="1.5" fill={color} opacity="0.4" />;
      })}
    </svg>
  );
}

function PaisleyBorder({ color = "#D4AF37" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "2rem 0" }}>
      <svg width="300" height="24" viewBox="0 0 300 24" fill="none">
        <path d="M0 12 H100" stroke={color} strokeWidth="0.5" opacity="0.3" />
        <path d="M200 12 H300" stroke={color} strokeWidth="0.5" opacity="0.3" />
        <g transform="translate(150,12)">
          <path d="M-8,-6 C-8,-10 -2,-12 2,-8 C6,-4 4,2 0,6 C-4,2 -6,-2 -8,-6Z" fill={color} opacity="0.25" />
          <path d="M8,-6 C8,-10 2,-12 -2,-8 C-6,-4 -4,2 0,6 C4,2 6,-2 8,-6Z" fill={color} opacity="0.25" />
          <circle cx="0" cy="0" r="2" fill={color} opacity="0.4" />
        </g>
        {[120, 140, 160, 180].map((x, i) => (
          <circle key={i} cx={x} cy="12" r={1.5 - Math.abs(i - 1.5) * 0.3} fill={color} opacity="0.3" />
        ))}
      </svg>
    </div>
  );
}

export default function RoyalIndianTemplate({
  wedding, countdown, rsvpGuests, guestSearch, onRsvpSearch, onGuestSelect,
  selectedGuest, rsvpStatus, onRsvpStatusChange, dietary, onDietaryChange,
  notes, onNotesChange, onRsvpSubmit, submitting, submitSuccess,
}: TemplateProps) {
  const config = wedding.config || {};
  const theme = config.theme || {};
  const primary = theme.primary || "#722F37";
  const accent = theme.accent || "#D4AF37";
  // Royal Indian always uses dark palette — theme can't override background/text
  const background = "#0F0508";
  const textColor = "#F0E0D0";
  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredGuests = rsvpGuests.filter((g: any) => g.name?.toLowerCase().includes(guestSearch.toLowerCase()));

  const sectionBg = "rgba(255,255,255,0.04)";
  const cardBg = "rgba(255,255,255,0.06)";

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Poppins', sans-serif", color: textColor, backgroundColor: background, lineHeight: 1.7 }}>

        {/* HERO */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: config.photo ? `url(${config.photo})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.25) saturate(1.3)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${primary}CC 0%, ${background}EE 60%, ${primary}CC 100%)` }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: `repeating-conic-gradient(${accent} 0% 25%, transparent 0% 50%)`, backgroundSize: "30px 30px" }} />
          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            <Mandala color={accent} size={140} />
            <p style={{ fontSize: "0.8rem", letterSpacing: "6px", textTransform: "uppercase", color: accent, margin: "1rem 0 0.5rem", fontWeight: 300 }}>
              {config.tagline || "Together Forever"}
            </p>
            <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: "0.5rem 0", color: "#fff", lineHeight: 1.2, letterSpacing: "3px" }}>
              {wedding.name || "Our Wedding"}
            </h1>
            <div style={{ width: "120px", height: "1px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "1.5rem auto" }} />
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.75)", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "2.5rem", fontWeight: 300 }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>
            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hours, label: "Hours" },
                { val: countdown.minutes, label: "Minutes" },
                { val: countdown.seconds, label: "Seconds" },
              ].map((item) => (
                <div key={item.label} style={{ border: `1px solid ${accent}44`, borderRadius: "4px", padding: "1rem 1.5rem", minWidth: "80px", backgroundColor: "rgba(0,0,0,0.3)" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 300, color: accent, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>{item.val}</div>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "3px", textTransform: "uppercase", marginTop: "0.3rem", color: "rgba(255,255,255,0.5)" }}>{item.label}</div>
                </div>
              ))}
            </div>
            <a href="#events" style={{ color: accent }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: "bounce 2s infinite" }}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }`}</style>
        </section>

        {/* EVENTS */}
        <section id="events" style={{ padding: "5rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
          <PaisleyBorder color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 400, color: accent, marginBottom: "0.5rem" }}>Wedding Events</h2>
          <p style={{ textAlign: "center", fontSize: "0.8rem", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "3rem" }}>Schedule of Celebrations</p>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: `linear-gradient(180deg, transparent, ${accent}44, transparent)`, transform: "translateX(-50%)" }} />
            {events.map((event: any, idx: number) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={event.id || idx} style={{ display: "flex", justifyContent: isLeft ? "flex-end" : "flex-start", paddingLeft: isLeft ? 0 : "calc(50% + 30px)", paddingRight: isLeft ? "calc(50% + 30px)" : 0, marginBottom: "3rem", position: "relative" }}>
                  <div style={{ position: "absolute", left: "50%", top: "20px", width: "10px", height: "10px", backgroundColor: accent, border: `3px solid ${background}`, borderRadius: "50%", transform: "translateX(-50%)", zIndex: 1 }} />
                  <div style={{ backgroundColor: cardBg, backdropFilter: "blur(8px)", border: `1px solid ${accent}22`, borderRadius: "4px", padding: "1.5rem", maxWidth: "350px", width: "100%" }}>
                    <div style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.3rem" }}>{formatDate(event.date)}</div>
                    <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontFamily: "'Playfair Display', serif", color: "#fff" }}>{event.name}</h3>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                    {event.location && <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>📍 {event.location}</p>}
                    {event.dressCode && <span style={{ display: "inline-block", fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", padding: "3px 10px", border: `1px solid ${accent}44`, color: accent, marginBottom: "0.5rem" }}>{event.dressCode}</span>}
                    {event.description && <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>{event.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STORY */}
        <section id="story" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <PaisleyBorder color={accent} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 400, color: accent, marginBottom: "2rem" }}>Our Story</h2>
          {story.quote && (
            <blockquote style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontStyle: "italic", color: accent, margin: "0 0 2rem", padding: "0 1rem", lineHeight: 1.8, borderLeft: `2px solid ${accent}44` }}>
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          )}
          {story.howWeMet && (
            <div style={{ marginBottom: "2rem", textAlign: "left" }}>
              <h3 style={{ fontSize: "0.8rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem" }}>How We Met</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.7)" }}>{story.howWeMet}</p>
            </div>
          )}
          {story.proposal && (
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: "0.8rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem" }}>The Proposal</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.7)" }}>{story.proposal}</p>
            </div>
          )}
        </section>

        {/* TRAVEL */}
        <section id="travel" style={{ padding: "5rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
          <PaisleyBorder color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 400, color: accent, marginBottom: "0.5rem" }}>Travel & Stay</h2>
          <p style={{ textAlign: "center", fontSize: "0.8rem", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "3rem" }}>Accommodations</p>
          {travel.venueName && (
            <div style={{ backgroundColor: cardBg, border: `1px solid ${accent}22`, borderRadius: "4px", padding: "2rem", marginBottom: "2rem", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#fff", margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.6)", margin: "0 0 1rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.6rem 1.8rem", backgroundColor: accent, color: background, textDecoration: "none", fontSize: "0.85rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500 }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} style={{ backgroundColor: cardBg, border: `1px solid ${accent}22`, borderRadius: "4px", padding: "1.5rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", fontFamily: "'Playfair Display', serif", color: "#fff" }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: accent }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1.2rem", border: `1px solid ${accent}44`, color: accent, textDecoration: "none", fontSize: "0.8rem", letterSpacing: "1px" }}>Book Now</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div style={{ backgroundColor: `${accent}0D`, border: `1px solid ${accent}22`, borderRadius: "4px", padding: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "1rem", color: accent }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <PaisleyBorder color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 400, color: accent, marginBottom: "3rem" }}>Registry</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} style={{ backgroundColor: cardBg, border: `1px solid ${accent}22`, borderRadius: "4px", padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎁</div>
                <h4 style={{ margin: "0 0 1rem", fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "#fff" }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1.5rem", backgroundColor: accent, color: background, textDecoration: "none", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase" }}>Visit Registry</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <PaisleyBorder color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 400, color: accent, marginBottom: "3rem" }}>Frequently Asked Questions</h2>
          <div style={{ borderTop: `1px solid ${accent}22` }}>
            {faq.map((item: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 0", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}22`, cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: "0.95rem", color: textColor, textAlign: "left" }}>
                    <span>{item.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0, marginLeft: "1rem" }}><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div style={{ maxHeight: isOpen ? "300px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                    <p style={{ padding: "0 0 1.2rem", margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RSVP */}
        <section id="rsvp" style={{ padding: "5rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <PaisleyBorder color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 400, color: accent, marginBottom: "0.5rem" }}>RSVP</h2>
          <p style={{ textAlign: "center", fontSize: "0.8rem", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "2.5rem" }}>Kindly Respond</p>
          {submitSuccess ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: cardBg, border: `1px solid ${accent}22`, borderRadius: "4px" }}>
              <Mandala color={accent} size={60} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: accent, fontSize: "1.3rem", margin: "1rem 0 0.5rem" }}>Thank You!</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>Your response has been recorded. We look forward to celebrating with you!</p>
            </div>
          ) : (
            <div style={{ backgroundColor: cardBg, border: `1px solid ${accent}22`, borderRadius: "4px", padding: "2rem" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem", fontFamily: "'Poppins', sans-serif", border: `1px solid ${accent}55`, backgroundColor: "rgba(0,0,0,0.3)", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "2px" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && !selectedGuest && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#1A0A0A", border: `1px solid ${accent}55`, borderTop: "none", marginTop: "-1px", maxHeight: "200px", overflowY: "auto", zIndex: 10, boxShadow: `0 8px 24px rgba(0,0,0,0.5)` }}>
                    {filteredGuests.map((guest: any) => (
                      <button key={guest.id} onClick={() => { onGuestSelect(guest); setSearchOpen(false); }} style={{ width: "100%", padding: "0.8rem 1rem", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}22`, cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: "0.9rem", color: textColor, transition: "background-color 0.2s" }}>{guest.name}</button>
                    ))}
                  </div>
                )}
                {searchOpen && guestSearch && filteredGuests.length === 0 && !selectedGuest && guestSearch.length >= 2 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#1A0A0A", border: `1px solid ${accent}55`, borderTop: "none", marginTop: "-1px", zIndex: 10, padding: "1rem", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Poppins', sans-serif" }}>No guests found. Check the spelling or try a different name.</p>
                  </div>
                )}
              </div>
              {selectedGuest && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Will you attend?</label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[{ val: "yes", label: "Joyfully Accept" }, { val: "no", label: "Regretfully Decline" }, { val: "maybe", label: "Maybe" }].map((opt) => (
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{ padding: "0.6rem 1.4rem", fontSize: "0.8rem", fontFamily: "'Poppins', sans-serif", letterSpacing: "1px", borderRadius: "2px", border: `1px solid ${rsvpStatus === opt.val ? accent : `${accent}33`}`, backgroundColor: rsvpStatus === opt.val ? accent : "transparent", color: rsvpStatus === opt.val ? background : textColor, cursor: "pointer", textTransform: "uppercase" }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Dietary Preference</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem", fontFamily: "'Poppins', sans-serif", border: `1px solid ${accent}33`, backgroundColor: "rgba(0,0,0,0.3)", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "2px" }}>
                      <option value="">Select...</option>
                      <option value="veg">Vegetarian</option>
                      <option value="nonveg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="jain">Jain</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Notes</label>
                    <textarea placeholder="Any special requests or messages..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem", fontFamily: "'Poppins', sans-serif", border: `1px solid ${accent}33`, backgroundColor: "rgba(0,0,0,0.3)", color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box", borderRadius: "2px" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} style={{ width: "100%", padding: "0.9rem", fontSize: "0.85rem", fontFamily: "'Poppins', sans-serif", letterSpacing: "3px", textTransform: "uppercase", backgroundColor: !rsvpStatus || submitting ? `${accent}44` : accent, color: background, border: "none", cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer", fontWeight: 500 }}>
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "3rem 2rem", textAlign: "center", borderTop: `1px solid ${accent}22` }}>
          <Mandala color={accent} size={40} />
          <p style={{ margin: "1rem 0 0.5rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>Made with love</p>
          <p style={{ margin: 0, fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", letterSpacing: "3px" }}>SHAADISHEET</p>
        </footer>
      </body>
    </html>
  );
}
