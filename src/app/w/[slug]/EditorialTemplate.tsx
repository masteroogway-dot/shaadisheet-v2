"use client";

import React, { useState, useEffect } from "react";

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

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()} ${d.getDate()}`;
}

export default function EditorialTemplate({
  wedding, countdown, rsvpGuests, guestSearch, onRsvpSearch, onGuestSelect,
  selectedGuest, rsvpStatus, onRsvpStatusChange, dietary, onDietaryChange,
  notes, onNotesChange, onRsvpSubmit, submitting, submitSuccess,
}: TemplateProps) {
  const config = wedding.config || {};
  const theme = config.theme || {};
  const primary = theme.primary || "#1A1A2E";
  const accent = theme.accent || "#E94560";
  const background = "#FFFFFF";
  const textColor = theme.primary || "#1A1A2E";
  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [animCountdown, setAnimCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const duration = 2000;
    const fps = 60;
    const steps = duration / (1000 / fps);
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const p = Math.min(frame / steps, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimCountdown({
        days: Math.round(countdown.days * ease),
        hours: Math.round(countdown.hours * ease),
        minutes: Math.round(countdown.minutes * ease),
        seconds: Math.round(countdown.seconds * ease),
      });
      if (p >= 1) clearInterval(timer);
    }, 1000 / fps);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("style", e.target.getAttribute("style") + "opacity:1 !important;transform:translateY(0) !important;");
          }
        });
      },
      { threshold: 0.12 }
    );
    const timer2 = setTimeout(() => {
      document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    }, 100);

    const onScroll = () => {
      const bg = document.querySelector("[data-parallax]");
      if (bg) (bg as HTMLElement).style.transform = `translateY(${window.scrollY * 0.2}px) scale(1.05)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => { clearInterval(timer); clearTimeout(timer2); observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [countdown]);

  const filteredGuests = rsvpGuests.filter((g: any) => g.name?.toLowerCase().includes(guestSearch.toLowerCase()));

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
          @keyframes fade-in-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
          @keyframes scale-in { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
          @keyframes glow-pulse { 0%,100%{box-shadow:0 0 20px rgba(233,69,96,0.3)} 50%{box-shadow:0 0 40px rgba(233,69,96,0.6)} }
          @keyframes success-pop { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
          @keyframes slide-in-left { from{opacity:0;transform:translateX(-60px)} to{opacity:1;transform:translateX(0)} }
          @keyframes slide-in-right { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
          @keyframes geometric-rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          @keyframes pulse-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }

          .anim-section {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s ease, transform 0.8s ease;
          }
          .vis {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
          .hover-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .hover-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.1);
          }
          .rsvp-success {
            animation: success-pop 0.6s ease forwards;
          }
          .hero-geometric {
            position: absolute;
            opacity: 0.15;
            animation: geometric-rotate 20s linear infinite;
          }
          .glow-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            animation: pulse-glow 3s ease-in-out infinite;
          }
        ` }} />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', sans-serif", color: textColor, backgroundColor: background, lineHeight: 1.6, WebkitFontSmoothing: "antialiased" }}>

        {/* HERO — Split layout with parallax */}
        <section id="hero" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem 5rem", backgroundColor: primary, color: "#fff", overflow: "hidden" }}>
            {/* Floating geometric shapes */}
            <div className="hero-geometric" style={{ top: "10%", right: "10%", width: "120px", height: "120px", border: "2px solid rgba(255,255,255,0.2)", animationDuration: "15s" }} />
            <div className="hero-geometric" style={{ bottom: "15%", left: "8%", width: "80px", height: "80px", border: "2px solid rgba(255,255,255,0.15)", borderRadius: "50%", animationDuration: "25s", animationDirection: "reverse" }} />
            <div className="hero-geometric" style={{ top: "40%", left: "5%", width: "60px", height: "2px", backgroundColor: "rgba(233,69,96,0.3)", transform: "rotate(45deg)", animationDuration: "18s" }} />
            <div className="hero-geometric" style={{ top: "20%", right: "25%", width: "40px", height: "40px", backgroundColor: "rgba(233,69,96,0.1)", animationDuration: "22s", animationDirection: "reverse" }} />

            {/* Glow orbs */}
            <div className="glow-orb" style={{ top: "-20%", right: "-10%", width: "300px", height: "300px", backgroundColor: accent }} />
            <div className="glow-orb" style={{ bottom: "-15%", left: "-5%", width: "200px", height: "200px", backgroundColor: accent, animationDelay: "1.5s" }} />

            <p style={{ fontSize: "0.7rem", letterSpacing: "6px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 600, animation: "fade-in-up 0.8s ease 0.2s both", position: "relative", zIndex: 1 }}>
              {config.tagline || "Together Forever"}
            </p>
            <h1 style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)", fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: "0 0 1rem", lineHeight: 1.05, animation: "fade-in-up 0.8s ease 0.4s both", position: "relative", zIndex: 1 }}>
              {wedding.name || "Our Wedding"}
            </h1>
            <div style={{ width: "60px", height: "3px", backgroundColor: accent, marginBottom: "1.5rem", animation: "scale-in 0.6s ease 0.6s both", position: "relative", zIndex: 1 }} />
            <p style={{ fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 300, color: "rgba(255,255,255,0.7)", marginBottom: "3rem", animation: "fade-in-up 0.8s ease 0.8s both", position: "relative", zIndex: 1 }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>
            <div style={{ display: "flex", gap: "2rem", animation: "fade-in-up 0.8s ease 1s both", position: "relative", zIndex: 1 }}>
              {[
                { val: animCountdown.days, label: "Days" },
                { val: animCountdown.hours, label: "Hours" },
                { val: animCountdown.minutes, label: "Min" },
                { val: animCountdown.seconds, label: "Sec" },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, color: accent, lineHeight: 1 }}>{item.val}</div>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "2px", textTransform: "uppercase", marginTop: "0.3rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", minHeight: "100vh" }}>
            <div data-parallax style={{ position: "absolute", inset: "-5%", width: "110%", height: "110%", willChange: "transform" }}>
              {config.photo ? (
                <img src={config.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${accent}22, ${primary}22)` }} />
              )}
            </div>
            <div style={{ position: "absolute", bottom: "2rem", left: "2rem", right: "2rem", zIndex: 2 }}>
              <a href="#events" style={{ color: "#fff", textDecoration: "none", fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Scroll
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </a>
            </div>
          </div>
        </section>

        {/* EVENTS — Grid cards */}
        <section id="events" className="anim-section" style={{ padding: "6rem 4rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem", fontWeight: 700, color: primary, margin: 0 }}>Events</h2>
            <div style={{ flex: 1, height: "1px", backgroundColor: `${primary}15` }} />
          </div>
          <p style={{ fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "3rem", fontWeight: 600 }}>Schedule of Celebrations</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {events.map((event: any, idx: number) => (
              <div key={event.id || idx} className="hover-card" style={{ borderTop: `3px solid ${accent}`, padding: "2rem", backgroundColor: idx % 2 === 0 ? `${primary}04` : "transparent", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: accent, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>{formatDateShort(event.date)}</div>
                  </div>
                  {event.isRitual && <span style={{ fontSize: "0.6rem", letterSpacing: "2px", textTransform: "uppercase", padding: "4px 10px", backgroundColor: primary, color: "#fff", fontWeight: 600 }}>Ritual</span>}
                </div>
                <h3 style={{ margin: "0 0 0.8rem", fontSize: "1.4rem", fontWeight: 700, color: primary }}>{event.name}</h3>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#666" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                {event.location && <p style={{ margin: "0 0 0.8rem", fontSize: "0.9rem", color: "#888" }}>📍 {event.location}</p>}
                {event.dressCode && <div style={{ display: "inline-block", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", padding: "4px 12px", border: `1px solid ${accent}33`, color: accent, fontWeight: 600, marginBottom: "0.8rem" }}>{event.dressCode}</div>}
                {event.description && <p style={{ margin: "0.8rem 0 0", fontSize: "0.85rem", color: "#999", lineHeight: 1.6 }}>{event.description}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* STORY — Editorial layout */}
        <section id="story" className="anim-section" style={{ padding: "6rem 4rem", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem", fontWeight: 700, color: primary, margin: 0 }}>Our Story</h2>
            <div style={{ flex: 1, height: "1px", backgroundColor: `${primary}15` }} />
          </div>
          {story.quote && (
            <blockquote style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontStyle: "italic", color: accent, margin: "2rem 0", padding: "0", lineHeight: 1.6, borderLeft: `3px solid ${accent}`, paddingLeft: "1.5rem" }}>
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          )}
          {story.howWeMet && (
            <div style={{ marginBottom: "2.5rem" }}>
              <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 700 }}>How We Met</h3>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#555" }}>{story.howWeMet}</p>
            </div>
          )}
          {story.proposal && (
            <div>
              <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 700 }}>The Proposal</h3>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#555" }}>{story.proposal}</p>
            </div>
          )}
        </section>

        {/* TRAVEL — Clean cards */}
        <section id="travel" className="anim-section" style={{ padding: "6rem 4rem", maxWidth: "1000px", margin: "0 auto", backgroundColor: `${primary}03` }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem", fontWeight: 700, color: primary, margin: 0 }}>Travel</h2>
            <div style={{ flex: 1, height: "1px", backgroundColor: `${primary}15` }} />
          </div>
          <p style={{ fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "3rem", fontWeight: 600 }}>Getting There</p>
          {travel.venueName && (
            <div className="hover-card" style={{ marginBottom: "2.5rem", padding: "2.5rem", backgroundColor: "#fff", border: `1px solid ${primary}10` }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.95rem", color: "#666", margin: "0 0 1.2rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.7rem 2rem", backgroundColor: primary, color: "#fff", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} className="hover-card" style={{ padding: "2rem", backgroundColor: "#fff", border: `1px solid ${primary}10` }}>
                  <h4 style={{ margin: "0 0 0.8rem", fontSize: "1.1rem", fontWeight: 600, color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#666" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.8rem", fontSize: "0.8rem", color: accent, fontWeight: 600 }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1.5rem", border: `1px solid ${primary}`, color: primary, textDecoration: "none", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>Book</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div style={{ padding: "2rem", borderLeft: `3px solid ${accent}`, backgroundColor: `${accent}06` }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, fontWeight: 700 }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: "#555" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" className="anim-section" style={{ padding: "6rem 4rem", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem", fontWeight: 700, color: primary, margin: 0 }}>Registry</h2>
            <div style={{ flex: 1, height: "1px", backgroundColor: `${primary}15` }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} className="hover-card" style={{ padding: "2.5rem", textAlign: "center", borderTop: `3px solid ${accent}` }}>
                <h4 style={{ margin: "0 0 1.2rem", fontSize: "1rem", fontWeight: 600, color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.6rem 2rem", backgroundColor: primary, color: "#fff", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>Visit</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="anim-section" style={{ padding: "6rem 4rem", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem", fontWeight: 700, color: primary, margin: 0 }}>FAQ</h2>
            <div style={{ flex: 1, height: "1px", backgroundColor: `${primary}15` }} />
          </div>
          {faq.map((item: any, idx: number) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} style={{ borderBottom: `1px solid ${primary}10` }}>
                <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "1rem", fontWeight: 500, color: textColor, textAlign: "left" }}>
                  <span>{item.q}</span>
                  <span style={{ fontSize: "1.2rem", color: accent, marginLeft: "1rem", transition: "transform 0.3s", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                </button>
                <div style={{ maxHeight: isOpen ? "300px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                  <p style={{ padding: "0 0 1.5rem", margin: 0, fontSize: "0.95rem", color: "#666", lineHeight: 1.7 }}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* RSVP */}
        <section id="rsvp" className="anim-section" style={{ padding: "6rem 4rem", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem", fontWeight: 700, color: primary, margin: 0 }}>RSVP</h2>
            <div style={{ flex: 1, height: "1px", backgroundColor: `${primary}15` }} />
          </div>
          <p style={{ fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "2.5rem", fontWeight: 600 }}>Respond by the date above</p>
          {submitSuccess ? (
            <div className="rsvp-success" style={{ textAlign: "center", padding: "4rem 2rem", borderTop: `3px solid ${accent}` }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem", color: accent }}>✓</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: primary, fontSize: "1.5rem", margin: "0 0 0.5rem" }}>Thank You!</h3>
              <p style={{ color: "#666", fontSize: "0.95rem" }}>Your response has been recorded.</p>
            </div>
          ) : (
            <div>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 700 }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.9rem 1rem", fontSize: "1rem", fontFamily: "'Inter', sans-serif", border: `1px solid ${primary}15`, backgroundColor: "#FAFAFA", color: textColor, outline: "none", boxSizing: "border-box" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && !selectedGuest && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: `1px solid ${primary}15`, borderTop: "none", marginTop: "-1px", maxHeight: "200px", overflowY: "auto", zIndex: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                    {filteredGuests.map((guest: any) => (
                      <button key={guest.id} onClick={() => { onGuestSelect(guest); setSearchOpen(false); }} style={{ width: "100%", padding: "0.8rem 1rem", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${primary}08`, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", color: textColor, transition: "background-color 0.2s" }}>{guest.name}</button>
                    ))}
                  </div>
                )}
                {searchOpen && guestSearch && filteredGuests.length === 0 && !selectedGuest && guestSearch.length >= 2 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: `1px solid ${primary}15`, borderTop: "none", marginTop: "-1px", zIndex: 10, padding: "1rem", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#999", fontFamily: "'Inter', sans-serif" }}>No guests found. Check the spelling or try a different name.</p>
                  </div>
                )}
              </div>
              {selectedGuest && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", fontWeight: 700 }}>Will you attend?</label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[{ val: "yes", label: "Yes, attending" }, { val: "no", label: "Can't make it" }, { val: "maybe", label: "Maybe" }].map((opt) => (
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{ padding: "0.7rem 1.6rem", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "1px", border: `2px solid ${rsvpStatus === opt.val ? accent : `${primary}15`}`, backgroundColor: rsvpStatus === opt.val ? accent : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor, cursor: "pointer", textTransform: "uppercase" }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 700 }}>Dietary</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.9rem 1rem", fontSize: "0.95rem", fontFamily: "'Inter', sans-serif", border: `1px solid ${primary}15`, backgroundColor: "#FAFAFA", color: textColor, outline: "none", boxSizing: "border-box" }}>
                      <option value="">Select...</option>
                      <option value="veg">Vegetarian</option>
                      <option value="nonveg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="jain">Jain</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 700 }}>Notes</label>
                    <textarea placeholder="Any special requests..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.9rem 1rem", fontSize: "0.95rem", fontFamily: "'Inter', sans-serif", border: `1px solid ${primary}15`, backgroundColor: "#FAFAFA", color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} style={{ width: "100%", padding: "1rem", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", backgroundColor: !rsvpStatus || submitting ? `${primary}33` : accent, color: "#fff", border: "none", cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer", animation: !rsvpStatus || submitting ? "none" : "glow-pulse 2s ease-in-out infinite" }}>
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "4rem", textAlign: "center", borderTop: `1px solid ${primary}10`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80px", height: "2px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#999", fontStyle: "italic" }}>Made with love</p>
          <p style={{ margin: 0, fontSize: "0.65rem", color: "#ccc", letterSpacing: "3px", fontWeight: 600 }}>SHAADISHEET</p>
        </footer>
      </body>
    </html>
  );
}
