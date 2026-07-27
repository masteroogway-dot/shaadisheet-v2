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

function DriedFlower({ color = "#C4A882", flip = false }: { color?: string; flip?: boolean }) {
  return (
    <svg width="60" height="80" viewBox="0 0 60 80" fill="none" style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <path d="M30 75 Q30 50 25 35 Q20 20 30 10" stroke={color} strokeWidth="1" fill="none" />
      <ellipse cx="22" cy="28" rx="8" ry="4" fill={color} opacity="0.2" transform="rotate(-30 22 28)" />
      <ellipse cx="38" cy="24" rx="7" ry="3.5" fill={color} opacity="0.2" transform="rotate(25 38 24)" />
      <ellipse cx="25" cy="18" rx="6" ry="3" fill={color} opacity="0.25" transform="rotate(-20 25 18)" />
      <ellipse cx="35" cy="14" rx="5" ry="2.5" fill={color} opacity="0.2" transform="rotate(15 35 14)" />
      <circle cx="30" cy="8" r="3" fill={color} opacity="0.3" />
    </svg>
  );
}

function BotanicalDivider({ color = "#C4A882" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "2.5rem 0", gap: "1rem" }}>
      <DriedFlower color={color} flip />
      <div style={{ width: "60px", height: "1px", backgroundColor: color, opacity: 0.3 }} />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" fill={color} opacity="0.3" />
        <circle cx="10" cy="10" r="1.5" fill={color} opacity="0.5" />
      </svg>
      <div style={{ width: "60px", height: "1px", backgroundColor: color, opacity: 0.3 }} />
      <DriedFlower color={color} />
    </div>
  );
}

export default function BohoTemplate({
  wedding, countdown, rsvpGuests, guestSearch, onRsvpSearch, onGuestSelect,
  selectedGuest, rsvpStatus, onRsvpStatusChange, dietary, onDietaryChange,
  notes, onNotesChange, onRsvpSubmit, submitting, submitSuccess,
}: TemplateProps) {
  const config = wedding.config || {};
  const theme = config.theme || {};
  const primary = theme.primary || "#8B6F47";
  const accent = theme.accent || "#C4A882";
  const background = "#FAF6F1";
  const textColor = "#4A3F35";
  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [animCountdown, setAnimCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const filteredGuests = rsvpGuests.filter((g: any) => g.name?.toLowerCase().includes(guestSearch.toLowerCase()));

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

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Josefin+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
          @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
          @keyframes leaf-drift { 0%{transform:translateY(-20px) translateX(0) rotate(0deg);opacity:0} 10%{opacity:0.5} 90%{opacity:0.5} 100%{transform:translateY(100vh) translateX(40px) rotate(180deg);opacity:0} }
          @keyframes fade-in-up { from{opacity:0;transform:translateY(35px)} to{opacity:1;transform:translateY(0)} }
          @keyframes scale-in { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
          @keyframes glow-pulse { 0%,100%{box-shadow:0 0 12px rgba(196,168,130,0.08)} 50%{box-shadow:0 0 30px rgba(196,168,130,0.18)} }
          @keyframes success-pop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
          @keyframes slide-in-left { from{opacity:0;transform:translateX(-35px)} to{opacity:1;transform:translateX(0)} }
          @keyframes slide-in-right { from{opacity:0;transform:translateX(35px)} to{opacity:1;transform:translateX(0)} }
          .anim-section { opacity:0; transform:translateY(35px); transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1); }
          .anim-section.vis { opacity:1; transform:translateY(0); }
          .hover-card { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease; }
          .hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 35px rgba(139,111,71,0.1); }
          .rsvp-success { animation: success-pop 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
          html { scroll-behavior: smooth; }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Josefin Sans', sans-serif", color: textColor, backgroundColor: background, lineHeight: 1.8 }}>

        {/* HERO */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          <div data-parallax style={{ position: "absolute", inset: "-10%", backgroundImage: config.photo ? `url(${config.photo})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.4) saturate(0.8) sepia(0.2)", transition: "transform 0.1s linear" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${primary}44 0%, ${background}CC 50%, ${primary}44 100%)` }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "200px", background: `linear-gradient(180deg, ${background} 0%, transparent 100%)` }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "200px", background: `linear-gradient(0deg, ${background} 0%, transparent 100%)` }} />

          {/* Floating leaves */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ position: "absolute", left: `${15 + i * 16}%`, top: "-20px", animation: `leaf-drift ${8 + i * 2}s linear ${i * 1.5}s infinite`, opacity: 0, pointerEvents: "none" }}>
              <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
                <path d="M8 0 C8 0 0 8 4 16 C6 20 8 22 8 22 C8 22 10 20 12 16 C16 8 8 0 8 0Z" fill={accent} opacity="0.35" />
                <path d="M8 4 L8 18" stroke={accent} strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>
          ))}

          {/* Glow orbs */}
          <div style={{ position: "absolute", top: "20%", left: "10%", width: "120px", height: "120px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, animation: "float 6s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "25%", right: "12%", width: "90px", height: "90px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`, animation: "float 8s ease-in-out 2s infinite", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1rem", opacity: 0.5, animation: "fade-in-up 1s ease-out 0.2s both" }}>
              <DriedFlower color={accent} />
              <DriedFlower color={accent} flip />
            </div>
            <p style={{ fontSize: "0.8rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 300, animation: "fade-in-up 1s ease-out 0.4s both" }}>
              {config.tagline || "Together Forever"}
            </p>
            <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontFamily: "'Lora', serif", fontWeight: 400, fontStyle: "italic", margin: "0.5rem 0", color: primary, lineHeight: 1.2, animation: "fade-in-up 1s ease-out 0.6s both" }}>
              {wedding.name || "Our Wedding"}
            </h1>
            <div style={{ width: "40px", height: "1px", backgroundColor: accent, margin: "1.5rem auto", animation: "scale-in 0.8s ease-out 0.8s both" }} />
            <p style={{ fontSize: "0.9rem", color: textColor, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "2.5rem", fontWeight: 300, animation: "fade-in-up 1s ease-out 1s both" }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>
            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem", animation: "fade-in-up 1s ease-out 1.2s both" }}>
              {[
                { val: animCountdown.days, label: "Days" },
                { val: animCountdown.hours, label: "Hours" },
                { val: animCountdown.minutes, label: "Minutes" },
                { val: animCountdown.seconds, label: "Seconds" },
              ].map((item) => (
                <div key={item.label} style={{ padding: "1rem 1.5rem", minWidth: "80px", border: `1px solid ${accent}44`, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: `${background}88`, backdropFilter: "blur(4px)", animation: "glow-pulse 3s ease-in-out infinite" }}>
                  <div style={{ fontSize: "1.8rem", fontFamily: "'Lora', serif", fontWeight: 400, color: primary, lineHeight: 1 }}>{item.val}</div>
                  <div style={{ fontSize: "0.55rem", letterSpacing: "2px", textTransform: "uppercase", marginTop: "0.3rem", color: accent, fontWeight: 300 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <a href="#events" style={{ color: accent, animation: "fade-in-up 1s ease-out 1.4s both" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ animation: "bounce 2s infinite" }}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
        </section>

        {/* EVENTS */}
        <section id="events" data-animate style={{ opacity: 0, transform: "translateY(35px)", padding: "5rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <BotanicalDivider color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "0.5rem" }}>Wedding Events</h2>
          <p style={{ textAlign: "center", fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "3rem", fontWeight: 300 }}>Our Celebrations</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {events.map((event: any, idx: number) => (
              <div key={event.id || idx} className="hover-card" style={{ display: "flex", gap: "2rem", alignItems: "flex-start", padding: "2rem", backgroundColor: `${background}`, border: `1px solid ${accent}22`, borderRadius: "2px", position: "relative" }}>
                <div style={{ minWidth: "70px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "1.8rem", fontWeight: 400, color: primary, lineHeight: 1 }}>{new Date(event.date).getDate()}</div>
                  <div style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: accent, fontWeight: 300 }}>{new Date(event.date).toLocaleDateString("en-US", { month: "short" })}</div>
                </div>
                <div style={{ width: "1px", backgroundColor: `${accent}33`, alignSelf: "stretch" }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.5rem", fontFamily: "'Lora', serif", fontSize: "1.2rem", fontWeight: 500, color: primary }}>{event.name}</h3>
                  <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "#888" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                  {event.location && <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#999" }}>📍 {event.location}</p>}
                  {event.dressCode && <span style={{ display: "inline-block", fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", padding: "3px 10px", border: `1px solid ${accent}33`, color: accent, fontWeight: 300 }}>{event.dressCode}</span>}
                  {event.description && <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#aaa", fontStyle: "italic" }}>{event.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STORY */}
        <section id="story" data-animate style={{ opacity: 0, transform: "translateY(35px)", padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <BotanicalDivider color={accent} />
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "2rem" }}>Our Story</h2>
          {story.quote && (
            <blockquote style={{ fontFamily: "'Lora', serif", fontSize: "1.2rem", fontStyle: "italic", color: primary, margin: "0 0 2rem", padding: "1.5rem", borderLeft: `2px solid ${accent}`, backgroundColor: `${accent}08`, textAlign: "left" }}>
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          )}
          {story.howWeMet && (
            <div style={{ marginBottom: "2rem", textAlign: "left" }}>
              <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", fontWeight: 300 }}>How We Met</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#666" }}>{story.howWeMet}</p>
            </div>
          )}
          {story.proposal && (
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", fontWeight: 300 }}>The Proposal</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#666" }}>{story.proposal}</p>
            </div>
          )}
        </section>

        {/* TRAVEL */}
        <section id="travel" data-animate style={{ opacity: 0, transform: "translateY(35px)", padding: "5rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <BotanicalDivider color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "0.5rem" }}>Travel & Stay</h2>
          <p style={{ textAlign: "center", fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "3rem", fontWeight: 300 }}>Accommodations</p>
          {travel.venueName && (
            <div className="hover-card" style={{ padding: "2rem", border: `1px solid ${accent}22`, marginBottom: "2rem", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: "1.3rem", color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 1rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1.5rem", border: `1px solid ${primary}`, color: primary, textDecoration: "none", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 300 }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} className="hover-card" style={{ padding: "1.5rem", border: `1px solid ${accent}22` }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontFamily: "'Lora', serif", fontSize: "1rem", color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "#888" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: accent }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.4rem 1rem", border: `1px solid ${accent}44`, color: accent, textDecoration: "none", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 300 }}>Book</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div style={{ padding: "1.5rem", borderLeft: `2px solid ${accent}`, backgroundColor: `${accent}06` }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, fontWeight: 300 }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, color: "#777" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" data-animate style={{ opacity: 0, transform: "translateY(35px)", padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <BotanicalDivider color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "3rem" }}>Registry</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} className="hover-card" style={{ padding: "2rem", textAlign: "center", border: `1px solid ${accent}22` }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>🎁</div>
                <h4 style={{ margin: "0 0 1rem", fontFamily: "'Lora', serif", fontSize: "1rem", color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1.5rem", border: `1px solid ${primary}`, color: primary, textDecoration: "none", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 300 }}>Visit</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" data-animate style={{ opacity: 0, transform: "translateY(35px)", padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <BotanicalDivider color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "3rem" }}>FAQ</h2>
          {faq.map((item: any, idx: number) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} style={{ borderBottom: `1px solid ${accent}22` }}>
                <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 0", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "'Lora', serif", fontSize: "0.95rem", color: textColor, textAlign: "left" }}>
                  <span>{item.q}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0, marginLeft: "1rem" }}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div style={{ maxHeight: isOpen ? "300px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                  <p style={{ padding: "0 0 1.2rem", margin: 0, fontSize: "0.9rem", color: "#888", lineHeight: 1.7 }}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* RSVP */}
        <section id="rsvp" data-animate style={{ opacity: 0, transform: "translateY(35px)", padding: "5rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <BotanicalDivider color={accent} />
          <h2 style={{ textAlign: "center", fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "0.5rem" }}>RSVP</h2>
          <p style={{ textAlign: "center", fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "2.5rem", fontWeight: 300 }}>Kindly Respond</p>
          {submitSuccess ? (
            <div className="rsvp-success" style={{ textAlign: "center", padding: "3rem", border: `1px solid ${accent}22` }}>
              <DriedFlower color={accent} />
              <h3 style={{ fontFamily: "'Lora', serif", color: primary, fontSize: "1.3rem", margin: "1rem 0 0.5rem", fontStyle: "italic" }}>Thank You!</h3>
              <p style={{ color: "#888", fontSize: "0.9rem" }}>Your response has been recorded.</p>
            </div>
          ) : (
            <div style={{ border: `1px solid ${accent}22`, padding: "2rem" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 300 }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem", fontFamily: "'Josefin Sans', sans-serif", border: `1px solid ${accent}33`, backgroundColor: "transparent", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "0" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && !selectedGuest && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: background, border: `1px solid ${accent}33`, borderTop: "none", marginTop: "-1px", maxHeight: "200px", overflowY: "auto", zIndex: 10 }}>
                    {filteredGuests.map((guest: any) => (
                      <button key={guest.id} onClick={() => { onGuestSelect(guest); setSearchOpen(false); }} style={{ width: "100%", padding: "0.7rem 1rem", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}15`, cursor: "pointer", fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.9rem", color: textColor, transition: "background-color 0.2s" }}>{guest.name}</button>
                    ))}
                  </div>
                )}
                {searchOpen && guestSearch && filteredGuests.length === 0 && !selectedGuest && guestSearch.length >= 2 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: background, border: `1px solid ${accent}33`, borderTop: "none", marginTop: "-1px", zIndex: 10, padding: "1rem", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#999", fontFamily: "'Josefin Sans', sans-serif" }}>No guests found. Check the spelling or try a different name.</p>
                  </div>
                )}
              </div>
              {selectedGuest && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 300 }}>Will you attend?</label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[{ val: "yes", label: "Joyfully Accept" }, { val: "no", label: "Regretfully Decline" }, { val: "maybe", label: "Maybe" }].map((opt) => (
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{ padding: "0.5rem 1.2rem", fontSize: "0.8rem", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, letterSpacing: "1px", border: `1px solid ${rsvpStatus === opt.val ? primary : `${accent}33`}`, backgroundColor: rsvpStatus === opt.val ? primary : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor, cursor: "pointer" }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 300 }}>Dietary</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem", fontFamily: "'Josefin Sans', sans-serif", border: `1px solid ${accent}33`, backgroundColor: "transparent", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "0" }}>
                      <option value="">Select...</option>
                      <option value="veg">Vegetarian</option>
                      <option value="nonveg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="jain">Jain</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 300 }}>Notes</label>
                    <textarea placeholder="Any special requests..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem", fontFamily: "'Josefin Sans', sans-serif", border: `1px solid ${accent}33`, backgroundColor: "transparent", color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box", borderRadius: "0" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} style={{ width: "100%", padding: "0.8rem", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 500, letterSpacing: "3px", textTransform: "uppercase", border: `1px solid ${primary}`, backgroundColor: !rsvpStatus || submitting ? "transparent" : primary, color: !rsvpStatus || submitting ? primary : "#fff", cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer" }}>
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "4rem 2rem", textAlign: "center", borderTop: `1px solid ${accent}22`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "200px", height: "1px", background: `linear-gradient(90deg, transparent, ${accent}44, transparent)` }} />
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1.5rem", opacity: 0.4 }}>
            <DriedFlower color={accent} flip />
            <DriedFlower color={accent} />
          </div>
          <p style={{ margin: "0 0 0.5rem", fontFamily: "'Lora', serif", fontSize: "1rem", fontStyle: "italic", color: primary }}>Made with love</p>
          <div style={{ width: "30px", height: "1px", backgroundColor: accent, margin: "0.8rem auto", opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: "0.6rem", color: "#ccc", letterSpacing: "4px", fontWeight: 300, textTransform: "uppercase" }}>ShaadiSheet</p>
        </footer>
      </body>
    </html>
  );
}
