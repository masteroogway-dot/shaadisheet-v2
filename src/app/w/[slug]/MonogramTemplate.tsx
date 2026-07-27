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
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function MonogramCrest({ initials = "A&B", color = "#D4AF37" }: { initials?: string; color?: string }) {
  const parts = initials.split("&").map(s => s.trim());
  const left = parts[0] || "A";
  const right = parts[1] || "B";
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" style={{ display: "block", margin: "0 auto" }}>
      {/* Outer ornamental ring */}
      <circle cx="100" cy="100" r="90" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <circle cx="100" cy="100" r="85" stroke={color} strokeWidth="1" opacity="0.4" />
      <circle cx="100" cy="100" r="80" stroke={color} strokeWidth="0.3" opacity="0.2" />
      {/* Corner flourishes */}
      {[0, 90, 180, 270].map((angle) => {
        const rad = angle * Math.PI / 180;
        const x = 100 + Math.cos(rad) * 82;
        const y = 100 + Math.sin(rad) * 82;
        return <circle key={angle} cx={x} cy={y} r="3" fill={color} opacity="0.3" />;
      })}
      {/* Decorative arcs */}
      <path d="M40,100 Q100,30 160,100" stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />
      <path d="M40,100 Q100,170 160,100" stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />
      {/* Inner circle */}
      <circle cx="100" cy="100" r="55" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Initials */}
      <text x={parts.length > 1 ? "72" : "100"} y="112" textAnchor="middle" fill={color} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="48" fontWeight="300" opacity="0.8">{left}</text>
      {parts.length > 1 && (
        <>
          <text x="100" y="98" textAnchor="middle" fill={color} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="20" fontWeight="300" fontStyle="italic" opacity="0.5">&amp;</text>
          <text x="128" y="112" textAnchor="middle" fill={color} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="48" fontWeight="300" opacity="0.8">{right}</text>
        </>
      )}
      {/* Bottom ribbon */}
      <path d="M70,145 L100,155 L130,145" stroke={color} strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function OrnamentalFrame({ color = "#D4AF37" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "2rem 0" }}>
      <svg width="300" height="20" viewBox="0 0 300 20" fill="none">
        <path d="M0 10 H110" stroke={color} strokeWidth="0.5" opacity="0.3" />
        <path d="M190 10 H300" stroke={color} strokeWidth="0.5" opacity="0.3" />
        <g transform="translate(150,10)">
          <path d="M-20,0 L-8,-6 L0,0 L8,-6 L20,0" stroke={color} strokeWidth="0.8" fill="none" opacity="0.4" />
          <path d="M-20,0 L-8,6 L0,0 L8,6 L20,0" stroke={color} strokeWidth="0.8" fill="none" opacity="0.4" />
          <circle cx="0" cy="0" r="2" fill={color} opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

export default function MonogramTemplate({
  wedding, countdown, rsvpGuests, guestSearch, onRsvpSearch, onGuestSelect,
  selectedGuest, rsvpStatus, onRsvpStatusChange, dietary, onDietaryChange,
  notes, onNotesChange, onRsvpSubmit, submitting, submitSuccess,
}: TemplateProps) {
  const config = wedding.config || {};
  const theme = config.theme || {};
  const primary = theme.primary || "#1A1A1A";
  const accent = theme.accent || "#D4AF37";
  // Monogram always uses elegant white — theme can't override
  const background = "#FFFFFF";
  const textColor = theme.primary || "#1A1A1A";
  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredGuests = rsvpGuests.filter((g: any) => g.name?.toLowerCase().includes(guestSearch.toLowerCase()));
  const initials = wedding.name ? wedding.name.split(/\s+&\s+|\s+and\s+/i).map((w: string) => w[0]).join("&").toUpperCase() : "A&B";

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", color: textColor, backgroundColor: background, lineHeight: 1.7 }}>

        {/* HERO */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: config.photo ? `url(${config.photo})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.2) grayscale(0.3)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)` }} />
          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            <MonogramCrest initials={initials} color={accent} />
            <p style={{ fontSize: "0.75rem", letterSpacing: "8px", textTransform: "uppercase", color: accent, margin: "1.5rem 0 0.5rem", fontWeight: 300 }}>
              {config.tagline || "Together Forever"}
            </p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, margin: "0.5rem 0", color: "#fff", letterSpacing: "6px", textTransform: "uppercase" }}>
              {wedding.name || "Our Wedding"}
            </h1>
            <div style={{ width: "80px", height: "1px", backgroundColor: accent, margin: "1.5rem auto" }} />
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "2.5rem", fontWeight: 300 }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>
            <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hours, label: "Hours" },
                { val: countdown.minutes, label: "Minutes" },
                { val: countdown.seconds, label: "Seconds" },
              ].map((item) => (
                <div key={item.label} style={{ minWidth: "80px" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 300, color: accent, lineHeight: 1 }}>{item.val}</div>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "3px", textTransform: "uppercase", marginTop: "0.3rem", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <a href="#events" style={{ color: accent }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ animation: "bounce 2s infinite" }}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }`}</style>
        </section>

        {/* EVENTS */}
        <section id="events" style={{ padding: "5rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <OrnamentalFrame color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "0.5rem" }}>Wedding Events</h2>
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: accent, marginBottom: "3rem", fontStyle: "italic" }}>Schedule of Celebrations</p>
          {events.map((event: any, idx: number) => (
            <div key={event.id || idx} style={{ display: "flex", gap: "2rem", padding: "2rem 0", borderBottom: idx < events.length - 1 ? `1px solid ${accent}22` : "none" }}>
              <div style={{ minWidth: "100px", textAlign: "right", borderRight: `1px solid ${accent}33`, paddingRight: "2rem" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.3rem" }}>{new Date(event.date).toLocaleDateString("en-US", { month: "long" })}</div>
                <div style={{ fontSize: "2rem", fontWeight: 300, color: primary, lineHeight: 1 }}>{new Date(event.date).getDate()}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.3rem", fontWeight: 400, letterSpacing: "2px", color: primary }}>{event.name}</h3>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#888" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                {event.location && <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#999" }}>📍 {event.location}</p>}
                {event.dressCode && <span style={{ display: "inline-block", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", padding: "3px 10px", border: `1px solid ${accent}33`, color: accent }}>{event.dressCode}</span>}
                {event.description && <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#aaa", fontStyle: "italic" }}>{event.description}</p>}
              </div>
            </div>
          ))}
        </section>

        {/* STORY */}
        <section id="story" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <OrnamentalFrame color={accent} />
          <h2 style={{ fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "2rem" }}>Our Story</h2>
          {story.quote && (
            <blockquote style={{ fontSize: "1.4rem", fontStyle: "italic", color: accent, margin: "0 0 2rem", padding: "0 2rem", lineHeight: 1.8 }}>
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          )}
          {story.howWeMet && (
            <div style={{ marginBottom: "2rem", textAlign: "left" }}>
              <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", fontWeight: 400 }}>How We Met</h3>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#666" }}>{story.howWeMet}</p>
            </div>
          )}
          {story.proposal && (
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", fontWeight: 400 }}>The Proposal</h3>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#666" }}>{story.proposal}</p>
            </div>
          )}
        </section>

        {/* TRAVEL */}
        <section id="travel" style={{ padding: "5rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <OrnamentalFrame color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "0.5rem" }}>Travel & Stay</h2>
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: accent, marginBottom: "3rem", fontStyle: "italic" }}>Accommodations</p>
          {travel.venueName && (
            <div style={{ padding: "2.5rem", border: `1px solid ${accent}22`, marginBottom: "2rem", textAlign: "center" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 400, letterSpacing: "3px", color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.95rem", color: "#888", margin: "0 0 1.2rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.6rem 2rem", backgroundColor: primary, color: "#fff", textDecoration: "none", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase" }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} style={{ padding: "1.5rem", border: `1px solid ${accent}22` }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 400, color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#888" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: accent }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.4rem 1.2rem", border: `1px solid ${primary}`, color: primary, textDecoration: "none", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>Book</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div style={{ padding: "1.5rem", borderLeft: `2px solid ${accent}`, backgroundColor: `${accent}05` }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: "#777" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <OrnamentalFrame color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "3rem" }}>Registry</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} style={{ padding: "2rem", textAlign: "center", border: `1px solid ${accent}22` }}>
                <h4 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 400, letterSpacing: "2px", color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1.5rem", backgroundColor: primary, color: "#fff", textDecoration: "none", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>Visit</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <OrnamentalFrame color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "3rem" }}>FAQ</h2>
          {faq.map((item: any, idx: number) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} style={{ borderBottom: `1px solid ${accent}22` }}>
                <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 0", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.05rem", color: textColor, textAlign: "left" }}>
                  <span>{item.q}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0, marginLeft: "1rem" }}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div style={{ maxHeight: isOpen ? "300px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                  <p style={{ padding: "0 0 1.2rem", margin: 0, fontSize: "0.95rem", color: "#888", lineHeight: 1.7 }}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* RSVP */}
        <section id="rsvp" style={{ padding: "5rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <OrnamentalFrame color={accent} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "0.5rem" }}>RSVP</h2>
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: accent, marginBottom: "2.5rem", fontStyle: "italic" }}>Kindly Respond</p>
          {submitSuccess ? (
            <div style={{ textAlign: "center", padding: "3rem", border: `1px solid ${accent}22` }}>
              <MonogramCrest initials={initials} color={accent} />
              <h3 style={{ fontSize: "1.3rem", fontWeight: 300, letterSpacing: "3px", color: primary, margin: "1rem 0 0.5rem" }}>Thank You!</h3>
              <p style={{ color: "#888", fontSize: "0.95rem" }}>Your response has been recorded.</p>
            </div>
          ) : (
            <div style={{ border: `1px solid ${accent}22`, padding: "2.5rem" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "1rem", fontFamily: "'Cormorant Garamond', Georgia, serif", border: `1px solid ${accent}33`, backgroundColor: "transparent", color: textColor, outline: "none", boxSizing: "border-box" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: background, border: `1px solid ${accent}33`, marginTop: "4px", maxHeight: "200px", overflowY: "auto", zIndex: 10 }}>
                    {filteredGuests.map((guest: any) => (
                      <button key={guest.id} onClick={() => { onGuestSelect(guest); onRsvpSearch(guest.name); setSearchOpen(false); }} style={{ width: "100%", padding: "0.7rem 1rem", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}15`, cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem", color: textColor }}>{guest.name}</button>
                    ))}
                  </div>
                )}
              </div>
              {selectedGuest && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Will you attend?</label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[{ val: "yes", label: "Joyfully Accept" }, { val: "no", label: "Regretfully Decline" }, { val: "maybe", label: "Maybe" }].map((opt) => (
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{ padding: "0.5rem 1.4rem", fontSize: "0.85rem", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "1px", border: `1px solid ${rsvpStatus === opt.val ? primary : `${accent}33`}`, backgroundColor: rsvpStatus === opt.val ? primary : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor, cursor: "pointer" }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Dietary</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "1rem", fontFamily: "'Cormorant Garamond', Georgia, serif", border: `1px solid ${accent}33`, backgroundColor: "transparent", color: textColor, outline: "none", boxSizing: "border-box" }}>
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
                    <textarea placeholder="Any special requests..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "1rem", fontFamily: "'Cormorant Garamond', Georgia, serif", border: `1px solid ${accent}33`, backgroundColor: "transparent", color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} style={{ width: "100%", padding: "0.8rem", fontSize: "0.75rem", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "4px", textTransform: "uppercase", backgroundColor: !rsvpStatus || submitting ? "transparent" : primary, color: !rsvpStatus || submitting ? primary : "#fff", border: !rsvpStatus || submitting ? `1px solid ${primary}44` : "none", cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer" }}>
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "3rem 2rem", textAlign: "center", borderTop: `1px solid ${accent}22` }}>
          <OrnamentalFrame color={accent} />
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#bbb", fontStyle: "italic" }}>Made with love</p>
          <p style={{ margin: 0, fontSize: "0.6rem", color: "#ddd", letterSpacing: "3px", fontWeight: 300 }}>SHAADISHEET</p>
        </footer>
      </body>
    </html>
  );
}
