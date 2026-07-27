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

function PalmTree({ color = "#2D5A3D", x = 0 }: { color?: string; x?: number }) {
  return (
    <g transform={`translate(${x},0)`}>
      <path d="M0,200 Q2,150 0,100" stroke={color} strokeWidth="3" fill="none" opacity="0.6" />
      <path d="M0,100 Q-30,80 -50,90 Q-20,75 0,80" fill={color} opacity="0.3" />
      <path d="M0,100 Q30,75 55,85 Q25,70 0,78" fill={color} opacity="0.25" />
      <path d="M0,95 Q-20,60 -45,65 Q-15,55 0,65" fill={color} opacity="0.2" />
      <path d="M0,92 Q25,55 50,62 Q20,50 0,62" fill={color} opacity="0.2" />
      <path d="M0,88 Q-10,50 -35,52 Q-5,45 0,55" fill={color} opacity="0.15" />
    </g>
  );
}

function WaveDivider({ color = "#4ECDC4" }: { color?: string }) {
  return (
    <div style={{ margin: "2rem 0", overflow: "hidden", height: "30px" }}>
      <svg width="100%" height="30" viewBox="0 0 1200 30" preserveAspectRatio="none">
        <path d={`M0,15 Q150,0 300,15 Q450,30 600,15 Q750,0 900,15 Q1050,30 1200,15`} stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
        <path d={`M0,20 Q150,5 300,20 Q450,35 600,20 Q750,5 900,20 Q1050,35 1200,20`} stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />
      </svg>
    </div>
  );
}

export default function TropicalTemplate({
  wedding, countdown, rsvpGuests, guestSearch, onRsvpSearch, onGuestSelect,
  selectedGuest, rsvpStatus, onRsvpStatusChange, dietary, onDietaryChange,
  notes, onNotesChange, onRsvpSubmit, submitting, submitSuccess,
}: TemplateProps) {
  const config = wedding.config || {};
  const theme = config.theme || {};
  const primary = theme.primary || "#1B6B5A";
  const accent = theme.accent || "#FF7F50";
  const background = theme.background || "#FFF8F0";
  const textColor = theme.text || "#2C3E3A";
  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredGuests = rsvpGuests.filter((g: any) => g.name?.toLowerCase().includes(guestSearch.toLowerCase()));

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Quicksand', sans-serif", color: textColor, backgroundColor: background, lineHeight: 1.7 }}>

        {/* HERO */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden", background: `linear-gradient(180deg, #87CEEB 0%, #FFB347 40%, #FF6B6B 70%, #C850C0 100%)` }}>
          {config.photo && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${config.photo})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.35)" }} />}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px" }}>
            <svg width="100%" height="120" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,80 Q200,20 400,60 Q600,100 800,50 Q1000,10 1200,70 L1200,120 L0,120 Z" fill={background} opacity="0.9" />
            </svg>
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, width: "150px", height: "100%" }}>
            <PalmTree color="rgba(0,0,0,0.08)" x={30} />
          </div>
          <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "100%" }}>
            <PalmTree color="rgba(0,0,0,0.08)" x={80} />
          </div>
          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "5px", textTransform: "uppercase", color: "#fff", marginBottom: "0.5rem", fontWeight: 300, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
              {config.tagline || "Together Forever"}
            </p>
            <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 700, margin: "0.5rem 0", color: "#fff", lineHeight: 1.2, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
              {wedding.name || "Our Wedding"}
            </h1>
            <div style={{ width: "60px", height: "3px", backgroundColor: "#fff", margin: "1.5rem auto", borderRadius: "2px", opacity: 0.8 }} />
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "2.5rem", fontWeight: 300, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>
            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hours, label: "Hours" },
                { val: countdown.minutes, label: "Minutes" },
                { val: countdown.seconds, label: "Seconds" },
              ].map((item) => (
                <div key={item.label} style={{ padding: "1rem 1.5rem", minWidth: "80px", backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>{item.val}</div>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "2px", textTransform: "uppercase", marginTop: "0.3rem", color: "rgba(255,255,255,0.8)" }}>{item.label}</div>
                </div>
              ))}
            </div>
            <a href="#events" style={{ color: "#fff" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: "bounce 2s infinite" }}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }`}</style>
        </section>

        {/* EVENTS */}
        <section id="events" style={{ padding: "5rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <WaveDivider color={primary} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 600, color: primary, marginBottom: "0.5rem" }}>Wedding Events</h2>
          <p style={{ textAlign: "center", fontSize: "0.8rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "3rem", fontWeight: 300 }}>Our Island Celebrations</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {events.map((event: any, idx: number) => (
              <div key={event.id || idx} style={{ display: "flex", gap: "1.5rem", padding: "1.5rem", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 15px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ minWidth: "60px", height: "60px", borderRadius: "50%", background: `linear-gradient(135deg, ${primary}, ${accent})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{new Date(event.date).getDate()}</div>
                  <div style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>{new Date(event.date).toLocaleDateString("en-US", { month: "short" })}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.15rem", fontWeight: 600, color: primary }}>{event.name}</h3>
                  <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "#888" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                  {event.location && <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#999" }}>📍 {event.location}</p>}
                  {event.dressCode && <span style={{ display: "inline-block", fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", padding: "3px 10px", borderRadius: "20px", backgroundColor: `${accent}15`, color: accent, fontWeight: 600 }}>{event.dressCode}</span>}
                  {event.description && <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#aaa" }}>{event.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STORY */}
        <section id="story" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <WaveDivider color={primary} />
          <h2 style={{ fontSize: "2rem", fontWeight: 600, color: primary, marginBottom: "2rem" }}>Our Story</h2>
          {story.quote && (
            <blockquote style={{ fontSize: "1.3rem", fontStyle: "italic", color: accent, margin: "0 0 2rem", padding: "1.5rem", backgroundColor: `${accent}08`, borderRadius: "16px", lineHeight: 1.8 }}>
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          )}
          {story.howWeMet && (
            <div style={{ marginBottom: "2rem", textAlign: "left" }}>
              <h3 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", fontWeight: 600 }}>How We Met</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#666" }}>{story.howWeMet}</p>
            </div>
          )}
          {story.proposal && (
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", fontWeight: 600 }}>The Proposal</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#666" }}>{story.proposal}</p>
            </div>
          )}
        </section>

        {/* TRAVEL */}
        <section id="travel" style={{ padding: "5rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <WaveDivider color={primary} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 600, color: primary, marginBottom: "0.5rem" }}>Getting There</h2>
          <p style={{ textAlign: "center", fontSize: "0.8rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "3rem", fontWeight: 300 }}>Travel & Accommodations</p>
          {travel.venueName && (
            <div style={{ marginBottom: "2rem", padding: "2rem", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 15px rgba(0,0,0,0.04)", textAlign: "center" }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 600, color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 1rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.6rem 2rem", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", textDecoration: "none", borderRadius: "24px", fontSize: "0.8rem", letterSpacing: "1px", fontWeight: 600 }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} style={{ padding: "1.5rem", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 15px rgba(0,0,0,0.04)" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 600, color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "#888" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: accent, fontWeight: 600 }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.4rem 1.2rem", border: `1.5px solid ${primary}`, color: primary, textDecoration: "none", borderRadius: "20px", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>Book</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div style={{ padding: "1.5rem", backgroundColor: `${accent}08`, borderRadius: "16px", borderLeft: `3px solid ${accent}` }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, fontWeight: 600 }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, color: "#777" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <WaveDivider color={primary} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 600, color: primary, marginBottom: "3rem" }}>Registry</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} style={{ padding: "2rem", textAlign: "center", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 15px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎁</div>
                <h4 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1.5rem", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", textDecoration: "none", borderRadius: "24px", fontSize: "0.75rem", letterSpacing: "1px", fontWeight: 600 }}>Visit</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <WaveDivider color={primary} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 600, color: primary, marginBottom: "3rem" }}>FAQ</h2>
          {faq.map((item: any, idx: number) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} style={{ marginBottom: "0.5rem" }}>
                <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.2rem", backgroundColor: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontFamily: "'Quicksand', sans-serif", fontSize: "0.95rem", fontWeight: 500, color: textColor, textAlign: "left", boxShadow: "0 1px 5px rgba(0,0,0,0.03)" }}>
                  <span>{item.q}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0, marginLeft: "1rem" }}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div style={{ maxHeight: isOpen ? "300px" : "0", overflow: "hidden", transition: "max-height 0.4s ease", padding: isOpen ? "0 1.2rem" : "0 1.2rem" }}>
                  <p style={{ padding: "0.8rem 0", margin: 0, fontSize: "0.9rem", color: "#888", lineHeight: 1.7 }}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* RSVP */}
        <section id="rsvp" style={{ padding: "5rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <WaveDivider color={primary} />
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 600, color: primary, marginBottom: "0.5rem" }}>RSVP</h2>
          <p style={{ textAlign: "center", fontSize: "0.8rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "2.5rem", fontWeight: 300 }}>Join the Celebration</p>
          {submitSuccess ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 15px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌴</div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 600, color: primary, margin: "0 0 0.5rem" }}>Thank You!</h3>
              <p style={{ color: "#888", fontSize: "0.95rem" }}>Your response has been recorded. See you in paradise!</p>
            </div>
          ) : (
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 15px rgba(0,0,0,0.04)", padding: "2rem" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 600 }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem", fontFamily: "'Quicksand', sans-serif", border: `1.5px solid ${accent}33`, backgroundColor: "#FAFAFA", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "12px" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: `1px solid ${accent}33`, borderRadius: "12px", marginTop: "4px", maxHeight: "200px", overflowY: "auto", zIndex: 10, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
                    {filteredGuests.map((guest: any) => (
                      <button key={guest.id} onClick={() => { onGuestSelect(guest); onRsvpSearch(guest.name); setSearchOpen(false); }} style={{ width: "100%", padding: "0.7rem 1rem", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}15`, cursor: "pointer", fontFamily: "'Quicksand', sans-serif", fontSize: "0.9rem", color: textColor, borderRadius: "0" }}>{guest.name}</button>
                    ))}
                  </div>
                )}
              </div>
              {selectedGuest && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 600 }}>Will you attend?</label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[{ val: "yes", label: "Count me in!" }, { val: "no", label: "Can't make it" }, { val: "maybe", label: "Maybe" }].map((opt) => (
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{ padding: "0.6rem 1.4rem", fontSize: "0.8rem", fontFamily: "'Quicksand', sans-serif", fontWeight: 600, borderRadius: "24px", border: `1.5px solid ${rsvpStatus === opt.val ? accent : `${accent}33`}`, backgroundColor: rsvpStatus === opt.val ? accent : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor, cursor: "pointer" }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 600 }}>Dietary</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem", fontFamily: "'Quicksand', sans-serif", border: `1.5px solid ${accent}33`, backgroundColor: "#FAFAFA", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "12px" }}>
                      <option value="">Select...</option>
                      <option value="veg">Vegetarian</option>
                      <option value="nonveg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="jain">Jain</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 600 }}>Notes</label>
                    <textarea placeholder="Any special requests..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem", fontFamily: "'Quicksand', sans-serif", border: `1.5px solid ${accent}33`, backgroundColor: "#FAFAFA", color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box", borderRadius: "12px" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} style={{ width: "100%", padding: "0.9rem", fontSize: "0.85rem", fontFamily: "'Quicksand', sans-serif", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", background: !rsvpStatus || submitting ? `${accent}44` : `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", border: "none", borderRadius: "24px", cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer" }}>
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <WaveDivider color={primary} />
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#bbb" }}>Made with love</p>
          <p style={{ margin: 0, fontSize: "0.6rem", color: "#ddd", letterSpacing: "3px", fontWeight: 300 }}>SHAADISHEET</p>
        </footer>
      </body>
    </html>
  );
}
