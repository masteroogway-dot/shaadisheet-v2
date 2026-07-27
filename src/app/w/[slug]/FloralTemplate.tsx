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
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function FloralDivider({ color = "#E8A0BF" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "2rem 0" }}>
      <svg width="280" height="40" viewBox="0 0 280 40" fill="none">
        <path d="M0 20 H90" stroke={color} strokeWidth="0.5" opacity="0.5" />
        <path d="M190 20 H280" stroke={color} strokeWidth="0.5" opacity="0.5" />
        <g transform="translate(140,20)">
          <path d="M-8,-12 Q-4,-18 0,-12 Q4,-18 8,-12 Q12,-8 8,-4 Q4,0 0,-4 Q-4,0 -8,-4 Q-12,-8 -8,-12Z" fill={color} opacity="0.3" />
          <path d="M-6,-10 Q-3,-15 0,-10 Q3,-15 6,-10 Q9,-7 6,-4 Q3,-1 0,-4 Q-3,-1 -6,-4 Q-9,-7 -6,-10Z" fill={color} opacity="0.5" />
          <circle cx="0" cy="-7" r="2.5" fill={color} opacity="0.7" />
          <path d="M-3,2 Q0,8 3,2" stroke={color} strokeWidth="0.8" fill="none" />
          <path d="M-6,4 Q-8,0 -5,-2" stroke={color} strokeWidth="0.6" fill="none" />
          <path d="M6,4 Q8,0 5,-2" stroke={color} strokeWidth="0.6" fill="none" />
          <ellipse cx="-7" cy="0" rx="4" ry="2.5" fill={color} opacity="0.25" transform="rotate(-30 -7 0)" />
          <ellipse cx="7" cy="0" rx="4" ry="2.5" fill={color} opacity="0.25" transform="rotate(30 7 0)" />
        </g>
      </svg>
    </div>
  );
}

function FlowerCrown({ color = "#E8A0BF", accent = "#BA94D1" }: { color?: string; accent?: string }) {
  return (
    <svg width="320" height="100" viewBox="0 0 320 100" fill="none" style={{ display: "block", margin: "0 auto 1.5rem" }}>
      <path d="M40,80 Q80,20 160,30 Q240,20 280,80" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
      {[60, 100, 140, 180, 220, 260].map((x, i) => {
        const y = 55 - Math.sin((x - 40) / 240 * Math.PI) * 25;
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <circle r={5 + (i % 3) * 1.5} fill={i % 2 === 0 ? color : accent} opacity={0.5 + (i % 3) * 0.1} />
            <circle r={2} fill="white" opacity={0.6} />
          </g>
        );
      })}
      {[80, 160, 240].map((x, i) => {
        const y = 42 - Math.sin((x - 40) / 240 * Math.PI) * 25;
        return (
          <g key={`leaf-${i}`} transform={`translate(${x},${y})`}>
            <ellipse rx="8" ry="3.5" fill={color} opacity="0.2" transform={`rotate(${-20 + i * 20})`} />
          </g>
        );
      })}
    </svg>
  );
}

export default function FloralTemplate({
  wedding, countdown, rsvpGuests, guestSearch, onRsvpSearch, onGuestSelect,
  selectedGuest, rsvpStatus, onRsvpStatusChange, dietary, onDietaryChange,
  notes, onNotesChange, onRsvpSubmit, submitting, submitSuccess,
}: TemplateProps) {
  const config = wedding.config || {};
  const theme = config.theme || {};
  const primary = theme.primary || "#C75B7A";
  const accent = theme.accent || "#BA94D1";
  const background = theme.background || "#FFF5F7";
  const textColor = theme.text || "#4A3B3B";
  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredGuests = rsvpGuests.filter((g: any) =>
    g.name?.toLowerCase().includes(guestSearch.toLowerCase())
  );

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Playfair Display', Georgia, serif", color: textColor, backgroundColor: background, lineHeight: 1.7 }}>

        {/* HERO */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: config.photo ? `url(${config.photo})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.35) saturate(1.2)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${primary}33 0%, ${accent}55 50%, ${primary}77 100%)` }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            <FlowerCrown color={accent} />
            <p style={{ fontSize: "1rem", fontFamily: "'Dancing Script', cursive", color: accent, marginBottom: "0.5rem", letterSpacing: "1px" }}>
              {config.tagline || "Together Forever"}
            </p>
            <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 400, margin: "0.5rem 0", color: "#fff", lineHeight: 1.2, letterSpacing: "2px" }}>
              {wedding.name || "Our Wedding"}
            </h1>
            <div style={{ width: "80px", height: "1px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "1.5rem auto" }} />
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "2.5rem" }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>
            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hours, label: "Hours" },
                { val: countdown.minutes, label: "Minutes" },
                { val: countdown.seconds, label: "Seconds" },
              ].map((item) => (
                <div key={item.label} style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(255,255,255,0.12)", border: `1px solid ${accent}55`, borderRadius: "12px", padding: "1rem 1.5rem", minWidth: "80px" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>{item.val}</div>
                  <div style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", marginTop: "0.3rem", color: accent }}>{item.label}</div>
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
          <FloralDivider color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2.2rem", fontWeight: 400, color: primary, marginBottom: "0.5rem" }}>Wedding Events</h2>
          <p style={{ fontFamily: "'Dancing Script', cursive", color: accent, marginBottom: "3rem", fontSize: "1.1rem" }}>Schedule of Celebrations</p>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: `linear-gradient(180deg, transparent, ${accent}, transparent)`, transform: "translateX(-50%)" }} />
            {events.map((event: any, idx: number) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={event.id || idx} style={{ display: "flex", justifyContent: isLeft ? "flex-end" : "flex-start", paddingLeft: isLeft ? 0 : "calc(50% + 30px)", paddingRight: isLeft ? "calc(50% + 30px)" : 0, marginBottom: "3rem", position: "relative" }}>
                  <div style={{ position: "absolute", left: "50%", top: "20px", width: "12px", height: "12px", background: `radial-gradient(circle, ${accent}, ${primary})`, border: `3px solid ${background}`, borderRadius: "50%", transform: "translateX(-50%)", zIndex: 1 }} />
                  <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${accent}33`, borderRadius: "16px", padding: "1.5rem", maxWidth: "350px", width: "100%", boxShadow: `0 4px 20px ${primary}11` }}>
                    <div style={{ fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: "0.3rem" }}>{formatDate(event.date)}</div>
                    <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.3rem", color: primary }}>{event.name}</h3>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#777" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                    {event.location && <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#888" }}>📍 {event.location}</p>}
                    {event.dressCode && <span style={{ display: "inline-block", fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", padding: "4px 12px", borderRadius: "20px", backgroundColor: `${accent}15`, color: accent, marginBottom: "0.5rem" }}>{event.dressCode}</span>}
                    {event.description && <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#999", fontStyle: "italic" }}>{event.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* OUR STORY */}
        <section id="story" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <FloralDivider color={accent} />
          <h2 style={{ fontSize: "2.2rem", fontWeight: 400, color: primary, marginBottom: "2rem" }}>Our Story</h2>
          {story.quote && (
            <blockquote style={{ fontSize: "1.3rem", fontFamily: "'Dancing Script', cursive", color: primary, margin: "0 0 2rem", padding: "0 1rem", lineHeight: 1.8 }}>
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          )}
          {story.howWeMet && (
            <div style={{ marginBottom: "2rem", textAlign: "left" }}>
              <h3 style={{ fontSize: "0.9rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.8rem" }}>How We Met</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#666" }}>{story.howWeMet}</p>
            </div>
          )}
          {story.proposal && (
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: "0.9rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.8rem" }}>The Proposal</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#666" }}>{story.proposal}</p>
            </div>
          )}
        </section>

        {/* TRAVEL */}
        <section id="travel" style={{ padding: "5rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
          <FloralDivider color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2.2rem", fontWeight: 400, color: primary, marginBottom: "0.5rem" }}>Travel & Stay</h2>
          <p style={{ textAlign: "center", fontSize: "1.1rem", fontFamily: "'Dancing Script', cursive", color: accent, marginBottom: "3rem" }}>Accommodations</p>
          {travel.venueName && (
            <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${accent}33`, borderRadius: "16px", padding: "2rem", marginBottom: "2rem", textAlign: "center" }}>
              <h3 style={{ fontSize: "1.4rem", color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.95rem", color: "#777", margin: "0 0 1rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.6rem 1.8rem", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", textDecoration: "none", borderRadius: "24px", fontSize: "0.85rem", letterSpacing: "1px" }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${accent}33`, borderRadius: "16px", padding: "1.5rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#777" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: accent }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1.2rem", backgroundColor: `${accent}15`, color: primary, textDecoration: "none", borderRadius: "20px", fontSize: "0.8rem", letterSpacing: "1px" }}>Book Now</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div style={{ backgroundColor: `${accent}0D`, border: `1px solid ${accent}22`, borderRadius: "16px", padding: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "1rem", color: primary }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, color: "#666" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <FloralDivider color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2.2rem", fontWeight: 400, color: primary, marginBottom: "3rem" }}>Registry</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${accent}33`, borderRadius: "16px", padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎁</div>
                <h4 style={{ margin: "0 0 1rem", fontSize: "1rem", color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1.5rem", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", textDecoration: "none", borderRadius: "24px", fontSize: "0.8rem", letterSpacing: "1px" }}>Visit Registry</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <FloralDivider color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2.2rem", fontWeight: 400, color: primary, marginBottom: "3rem" }}>Frequently Asked Questions</h2>
          <div style={{ borderTop: `1px solid ${accent}33` }}>
            {faq.map((item: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 0", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}33`, cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", color: textColor, textAlign: "left" }}>
                    <span>{item.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0, marginLeft: "1rem" }}><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div style={{ maxHeight: isOpen ? "300px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                    <p style={{ padding: "0 0 1.2rem", margin: 0, fontSize: "0.95rem", color: "#777", lineHeight: 1.7 }}>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RSVP */}
        <section id="rsvp" style={{ padding: "5rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <FloralDivider color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2.2rem", fontWeight: 400, color: primary, marginBottom: "0.5rem" }}>RSVP</h2>
          <p style={{ textAlign: "center", fontSize: "1.1rem", fontFamily: "'Dancing Script', cursive", color: accent, marginBottom: "2.5rem" }}>Kindly Respond</p>
          {submitSuccess ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "rgba(255,255,255,0.85)", border: `1px solid ${accent}33`, borderRadius: "16px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
              <h3 style={{ color: primary, fontSize: "1.3rem", margin: "0 0 0.5rem" }}>Thank You!</h3>
              <p style={{ color: "#777", fontSize: "0.95rem" }}>Your response has been recorded. We look forward to celebrating with you!</p>
            </div>
          ) : (
            <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${accent}33`, borderRadius: "16px", padding: "2rem" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "1rem", fontFamily: "'Playfair Display', Georgia, serif", border: `1px solid ${accent}33`, borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.6)", color: textColor, outline: "none", boxSizing: "border-box" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: `1px solid ${accent}33`, borderRadius: "12px", marginTop: "4px", maxHeight: "200px", overflowY: "auto", zIndex: 10, boxShadow: `0 4px 20px ${primary}15` }}>
                    {filteredGuests.map((guest: any) => (
                      <button key={guest.id} onClick={() => { onGuestSelect(guest); onRsvpSearch(guest.name); setSearchOpen(false); }} style={{ width: "100%", padding: "0.7rem 1rem", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}15`, cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.95rem", color: textColor }}>{guest.name}</button>
                    ))}
                  </div>
                )}
              </div>
              {selectedGuest && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Will you attend?</label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[{ val: "yes", label: "Joyfully Accept" }, { val: "no", label: "Regretfully Decline" }, { val: "maybe", label: "Maybe" }].map((opt) => (
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{ padding: "0.6rem 1.4rem", fontSize: "0.85rem", fontFamily: "'Playfair Display', Georgia, serif", borderRadius: "24px", border: `1.5px solid ${rsvpStatus === opt.val ? primary : `${accent}33`}`, backgroundColor: rsvpStatus === opt.val ? primary : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor, cursor: "pointer", transition: "all 0.3s" }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Dietary Preference</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "1rem", fontFamily: "'Playfair Display', Georgia, serif", border: `1px solid ${accent}33`, borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.6)", color: textColor, outline: "none", boxSizing: "border-box" }}>
                      <option value="">Select...</option>
                      <option value="veg">Vegetarian</option>
                      <option value="nonveg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="jain">Jain</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Notes</label>
                    <textarea placeholder="Any special requests or messages..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "1rem", fontFamily: "'Playfair Display', Georgia, serif", border: `1px solid ${accent}33`, borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.6)", color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} style={{ width: "100%", padding: "0.9rem", fontSize: "1rem", fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "2px", textTransform: "uppercase", background: !rsvpStatus || submitting ? `${accent}44` : `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", border: "none", borderRadius: "24px", cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer" }}>
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "3rem 2rem", textAlign: "center", borderTop: `1px solid ${accent}22` }}>
          <FloralDivider color={accent} />
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#aaa" }}>Made with love</p>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "#ccc", letterSpacing: "2px" }}>SHAADISHEET</p>
        </footer>
      </body>
    </html>
  );
}
