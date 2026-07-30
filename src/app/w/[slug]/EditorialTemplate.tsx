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

function EditorialDivider({ accent = "#E94560" }: { accent?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "2rem 0" }}>
      <svg width="300" height="20" viewBox="0 0 300 20" fill="none">
        <path d="M0 10 H110" stroke={accent} strokeWidth="0.5" opacity="0.3" />
        <path d="M190 10 H300" stroke={accent} strokeWidth="0.5" opacity="0.3" />
        <rect x="140" y="2" width="8" height="8" fill="none" stroke={accent} strokeWidth="1" opacity="0.5" transform="rotate(45 144 6)" />
        <rect x="152" y="2" width="5" height="5" fill={accent} opacity="0.25" transform="rotate(45 154.5 4.5)" />
        <circle cx="144" cy="10" r="2" fill={accent} opacity="0.4" />
        {[120, 128, 164, 172].map((x, i) => (
          <line key={i} x1={x} y1={10 - 1.5 + Math.abs(i - 1.5) * 0.5} x2={x} y2={10 + 1.5 - Math.abs(i - 1.5) * 0.5} stroke={accent} strokeWidth="0.8" opacity="0.3" />
        ))}
      </svg>
    </div>
  );
}

function WaveDivider({ color = "#FAFAFA", accent = "#E94560", flip = false }: { color?: string; accent?: string; flip?: boolean }) {
  return (
    <div style={{ width: "100%", lineHeight: 0, marginTop: flip ? 0 : "-2px", marginBottom: flip ? "-2px" : 0, transform: flip ? "rotate(180deg)" : "none" }}>
      <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ width: "100%", height: "50px", display: "block" }}>
        <path d="M0,30 C360,70 720,0 1080,40 C1260,55 1380,20 1440,30 L1440,80 L0,80 Z" fill={color} />
        <path d="M0,35 C360,75 720,5 1080,45 C1260,60 1380,25 1440,35" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.25" />
      </svg>
    </div>
  );
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
  const background = "#FAFAFA";
  const textColor = theme.primary || "#1A1A2E";
  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [animCountdown, setAnimCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [introDone, setIntroDone] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const filteredGuests = rsvpGuests.filter((g: any) => g.name?.toLowerCase().includes(guestSearch.toLowerCase()));
  const displayCountdown = introDone ? countdown : animCountdown;

  useEffect(() => {
    if (introDone) return;
    if (!countdown.days && !countdown.hours && !countdown.minutes && !countdown.seconds) return;
    setHeroLoaded(true);

    const target = { ...countdown };
    const duration = 2200;
    const fps = 60;
    const steps = duration / (1000 / fps);
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const p = Math.min(frame / steps, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimCountdown({
        days: Math.round(target.days * ease),
        hours: Math.round(target.hours * ease),
        minutes: Math.round(target.minutes * ease),
        seconds: Math.round(target.seconds * ease),
      });
      if (p >= 1) { clearInterval(timer); setIntroDone(true); }
    }, 1000 / fps);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("vis");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    const timer2 = setTimeout(() => {
      document.querySelectorAll(".ed-anim").forEach((el) => observer.observe(el));
    }, 200);

    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(height > 0 ? (winScroll / height) * 100 : 0);
      setShowNav(window.scrollY > window.innerHeight * 0.75);

      const parallaxEl = document.getElementById("hero-bg");
      if (parallaxEl) {
        const y = window.scrollY * 0.25;
        parallaxEl.style.transform = `translateY(${y}px) scale(1.12)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => { clearInterval(timer); clearTimeout(timer2); observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [introDone]);

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes ed-kb { from{transform:scale(1)} to{transform:scale(1.15)} }
          @keyframes ed-fade-up { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
          @keyframes ed-scale-in { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
          @keyframes ed-glow { 0%,100%{box-shadow:0 0 20px rgba(233,69,96,0.15)} 50%{box-shadow:0 0 50px rgba(233,69,96,0.4)} }
          @keyframes ed-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
          @keyframes ed-particle { 0%{opacity:0;transform:translateY(0) scale(0)} 15%{opacity:1;transform:scale(1)} 85%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:translateY(-100vh) scale(0)} }
          @keyframes ed-pulse { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.35;transform:scale(1.08)} }
          @keyframes ed-success { 0%{transform:scale(0.3) rotate(-10deg);opacity:0} 50%{transform:scale(1.08) rotate(2deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
          @keyframes ed-line-grow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
          @keyframes ed-dot-pop { from{transform:scale(0)} 50%{transform:scale(1.5)} to{transform:scale(1)} }
          @keyframes ed-hero-text { from{opacity:0;transform:translateY(30px) filter:blur(8px)} to{opacity:1;transform:translateY(0) filter:blur(0)} }
          @keyframes ed-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
          @keyframes ed-geo-rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes ed-geo-counter { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }

          .ed-anim { opacity:0; transform:translateY(50px); transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1); }
          .ed-anim.vis { opacity:1; transform:translateY(0); }
          .ed-anim-d1 { transition-delay:0.15s !important; }
          .ed-anim-d2 { transition-delay:0.3s !important; }
          .ed-anim-d3 { transition-delay:0.45s !important; }

          .ed-card { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease; }
          .ed-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.12); }

          .ed-btn { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); position:relative; overflow:hidden; }
          .ed-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(233,69,96,0.3); }
          .ed-btn:active:not(:disabled) { transform: translateY(0); }

          .ed-success-anim { animation: ed-success 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

          .ed-timeline-node { animation: ed-dot-pop 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

          html { scroll-behavior: smooth; }
          * { scrollbar-width: thin; scrollbar-color: ${accent}44 transparent; }
          *::-webkit-scrollbar { width: 6px; }
          *::-webkit-scrollbar-track { background: transparent; }
          *::-webkit-scrollbar-thumb { background: ${accent}44; border-radius: 3px; }
        ` }} />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', sans-serif", color: textColor, backgroundColor: background, lineHeight: 1.7, overflowX: "hidden", WebkitFontSmoothing: "antialiased" }}>

        {/* SCROLL PROGRESS BAR */}
        <div style={{ position: "fixed", top: 0, left: 0, height: "3px", background: `linear-gradient(90deg, ${accent}, ${primary}, ${accent})`, backgroundSize: "200% 100%", zIndex: 99999, width: `${scrollProgress}%`, transition: "width 0.15s ease-out", animation: "ed-shimmer 3s linear infinite" }} />

        {/* FLOATING NAVIGATION */}
        <nav style={{ position: "fixed", top: "16px", left: "50%", transform: `translateX(-50%) translateY(${showNav ? "0" : "-100px"})`, zIndex: 9999, backgroundColor: "rgba(250,250,250,0.92)", backdropFilter: "blur(20px) saturate(1.5)", border: `1px solid ${primary}15`, borderRadius: "0", padding: "0.6rem 1.5rem", display: "flex", gap: "0.3rem", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 8px 32px rgba(0,0,0,0.08)` }}>
          {[{ href: "#hero", label: "Home" }, { href: "#events", label: "Events" }, { href: "#story", label: "Story" }, { href: "#travel", label: "Travel" }, { href: "#registry", label: "Registry" }, { href: "#faq", label: "FAQ" }, { href: "#rsvp", label: "RSVP" }].map((item) => (
            <a key={item.href} href={item.href} style={{ color: `${textColor}99`, textDecoration: "none", fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", padding: "0.4rem 0.8rem", transition: "all 0.3s", fontWeight: 500 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = accent; e.currentTarget.style.backgroundColor = `${accent}10`; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = `${textColor}99`; e.currentTarget.style.backgroundColor = "transparent"; }}
            >{item.label}</a>
          ))}
        </nav>

        {/* HERO — Split layout with Ken Burns */}
        <section id="hero" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative", overflow: "hidden" }}>
          {/* Left Panel */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem 5rem", backgroundColor: primary, color: "#fff", overflow: "hidden" }}>
            {/* Floating geometric particles */}
            {Array.from({ length: 18 }).map((_, i) => {
              const shapes = ["square", "line", "circle"];
              const shape = shapes[i % 3];
              const size = 8 + (i % 7) * 6;
              const dur = 18 + (i % 5) * 5;
              return (
                <div key={`geo-${i}`} style={{
                  position: "absolute",
                  width: `${size}px`,
                  height: shape === "line" ? "2px" : `${size}px`,
                  border: shape !== "line" ? `1.5px solid rgba(255,255,255,0.12)` : "none",
                  backgroundColor: shape === "line" ? `rgba(233,69,96,0.2)` : shape === "circle" ? "transparent" : "transparent",
                  borderRadius: shape === "circle" ? "50%" : "0",
                  left: `${(i * 17 + 5) % 90}%`,
                  top: `${(i * 23 + 10) % 85}%`,
                  animation: `${i % 2 === 0 ? "ed-geo-rotate" : "ed-geo-counter"} ${dur}s linear infinite`,
                  opacity: heroLoaded ? 0.15 : 0,
                  transition: `opacity 1.5s ease ${0.3 + i * 0.08}s`,
                  pointerEvents: "none",
                }} />
              );
            })}

            {/* Glow orbs */}
            <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}18, transparent 70%)`, top: "-10%", right: "-5%", animation: "ed-pulse 7s ease-in-out infinite", pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}12, transparent 70%)`, bottom: "-8%", left: "-3%", animation: "ed-pulse 9s ease-in-out infinite 3s", pointerEvents: "none" }} />

            {/* Content */}
            <p style={{
              fontSize: "0.7rem", letterSpacing: "6px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 600, position: "relative", zIndex: 1,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.2s",
            }}>
              {config.tagline || "Together Forever"}
            </p>
            <h1 style={{
              fontSize: "clamp(3rem, 6vw, 5.5rem)", fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: "0 0 1rem", lineHeight: 1.05, position: "relative", zIndex: 1,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0) filter:blur(0)" : "translateY(30px) blur(8px)",
              transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s",
            }}>
              {wedding.name || "Our Wedding"}
            </h1>
            <div style={{
              width: "60px", height: "3px", backgroundColor: accent, marginBottom: "1.5rem", position: "relative", zIndex: 1,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.6s",
            }} />
            <p style={{
              fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 300, color: "rgba(255,255,255,0.65)", marginBottom: "3rem", position: "relative", zIndex: 1,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.8s",
            }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>
            <div style={{
              display: "flex", gap: "2rem", position: "relative", zIndex: 1,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1s",
            }}>
              {[
                { val: displayCountdown.days, label: "Days" },
                { val: displayCountdown.hours, label: "Hours" },
                { val: displayCountdown.minutes, label: "Min" },
                { val: displayCountdown.seconds, label: "Sec" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  border: `1px solid rgba(255,255,255,0.15)`, padding: "1.2rem 1.5rem", minWidth: "80px", textAlign: "center",
                  backgroundColor: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)",
                  animation: `ed-glow 4s ease-in-out infinite ${i * 0.6}s`,
                }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, color: accent, lineHeight: 1 }}>{item.val}</div>
                  <div style={{ fontSize: "0.55rem", letterSpacing: "3px", textTransform: "uppercase", marginTop: "0.4rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel — Ken Burns Hero */}
          <div style={{ position: "relative", minHeight: "100vh" }}>
            <div id="hero-bg" style={{ position: "absolute", inset: "-10%", width: "120%", height: "120%", willChange: "transform", animation: "ed-kb 25s ease-in-out infinite alternate" }}>
              {config.photo ? (
                <img src={config.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${accent}22, ${primary}22)` }} />
              )}
            </div>
            {/* Gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${primary}33 0%, transparent 30%, transparent 70%, ${primary}33 100%)` }} />
            <div style={{ position: "absolute", bottom: "2rem", left: "2rem", right: "2rem", zIndex: 2 }}>
              <a href="#events" style={{ color: "#fff", textDecoration: "none", fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Scroll
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "ed-bounce 2.5s ease-in-out infinite" }}><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </a>
            </div>
          </div>
        </section>

        {/* EVENTS — Interactive Timeline */}
        <section id="events" className="ed-anim" style={{ padding: "6rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <EditorialDivider accent={accent} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>Events</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 600 }}>Schedule of Celebrations</p>
            <div style={{ width: "60px", height: "2px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "0 auto" }} />
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
            {/* Bold Vertical Line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "2px", background: `linear-gradient(180deg, transparent, ${accent}55, ${accent}55, transparent)`, transform: "translateX(-50%)" }} />

            {events.map((event: any, idx: number) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={event.id || idx} className={`ed-anim ${isLeft ? "" : "ed-anim-d1"}`} style={{
                  display: "flex", justifyContent: isLeft ? "flex-end" : "flex-start",
                  paddingLeft: isLeft ? 0 : "calc(50% + 40px)", paddingRight: isLeft ? "calc(50% + 40px)" : 0,
                  marginBottom: "3rem", position: "relative",
                }}>
                  {/* Timeline Node */}
                  <div className="ed-timeline-node" style={{
                    position: "absolute", left: "50%", top: "24px", width: "16px", height: "16px",
                    backgroundColor: accent, border: `3px solid ${background}`, borderRadius: "50%",
                    transform: "translateX(-50%)", zIndex: 2,
                    boxShadow: `0 0 0 4px ${accent}22, 0 0 20px ${accent}33`,
                  }} />

                  {/* Event Card */}
                  <div className="ed-card" style={{
                    backgroundColor: "#fff", border: `2px solid ${primary}10`, borderLeft: isLeft ? `4px solid ${accent}` : `2px solid ${primary}10`,
                    borderRight: !isLeft ? `4px solid ${accent}` : `2px solid ${primary}10`, padding: "2rem", maxWidth: "380px", width: "100%", position: "relative",
                  }}>
                    {/* Date Badge */}
                    <div style={{
                      position: "absolute", top: "-12px", left: isLeft ? "auto" : "20px", right: isLeft ? "20px" : "auto",
                      backgroundColor: primary, color: "#fff", padding: "4px 14px", fontSize: "0.65rem", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700,
                    }}>
                      {formatDateShort(event.date)}
                    </div>

                    {event.isRitual && <span style={{ position: "absolute", top: "-12px", left: isLeft ? "20px" : "auto", right: isLeft ? "auto" : "20px", fontSize: "0.55rem", letterSpacing: "2px", textTransform: "uppercase", padding: "4px 10px", backgroundColor: accent, color: "#fff", fontWeight: 700 }}>Ritual</span>}
                    <h3 style={{ margin: "0.5rem 0 0.5rem", fontSize: "1.3rem", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: primary }}>{event.name}</h3>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "#666" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                    {event.location && <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#888" }}>{event.location}</p>}
                    {event.dressCode && (
                      <span style={{
                        display: "inline-block", fontSize: "0.6rem", letterSpacing: "2px", textTransform: "uppercase",
                        padding: "4px 12px", border: `1px solid ${accent}44`, color: accent, fontWeight: 600, marginTop: "0.3rem",
                      }}>{event.dressCode}</span>
                    )}
                    {event.description && <p style={{ margin: "0.8rem 0 0", fontSize: "0.85rem", color: "#999", fontStyle: "italic", lineHeight: 1.6 }}>{event.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STORY — Editorial layout with wave dividers */}
        <section id="story" style={{ position: "relative" }}>
          <WaveDivider color={background} accent={accent} />
          <div className="ed-anim" style={{ padding: "4rem 2rem 6rem", maxWidth: "750px", margin: "0 auto", textAlign: "center", backgroundColor: `${primary}03` }}>
            <EditorialDivider accent={accent} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: primary, marginBottom: "2rem" }}>Our Story</h2>
            {story.quote && (
              <blockquote style={{
                fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontStyle: "italic", color: accent, margin: "0 0 2.5rem", padding: "1.5rem 2rem",
                lineHeight: 1.8, borderLeft: `4px solid ${accent}`, backgroundColor: `${accent}06`,
              }}>
                &ldquo;{story.quote}&rdquo;
              </blockquote>
            )}
            {story.howWeMet && (
              <div className="ed-anim ed-anim-d1" style={{ marginBottom: "2.5rem", textAlign: "left" }}>
                <h3 style={{ fontSize: "0.7rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 700 }}>How We Met</h3>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "#555" }}>{story.howWeMet}</p>
              </div>
            )}
            {story.proposal && (
              <div className="ed-anim ed-anim-d2" style={{ textAlign: "left" }}>
                <h3 style={{ fontSize: "0.7rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 700 }}>The Proposal</h3>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "#555" }}>{story.proposal}</p>
              </div>
            )}
          </div>
          <WaveDivider color={background} accent={accent} flip />
        </section>

        {/* TRAVEL */}
        <section id="travel" className="ed-anim" style={{ padding: "6rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <EditorialDivider accent={accent} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>Travel</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, fontWeight: 600 }}>Getting There</p>
          </div>
          {travel.venueName && (
            <div className="ed-anim ed-card" style={{ backgroundColor: "#fff", border: `2px solid ${primary}10`, padding: "2.5rem", marginBottom: "2rem", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.95rem", color: "#666", margin: "0 0 1.5rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" className="ed-btn" style={{ display: "inline-block", padding: "0.7rem 2rem", backgroundColor: primary, color: "#fff", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} className="ed-anim ed-card" style={{ backgroundColor: "#fff", border: `2px solid ${primary}10`, padding: "2rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#666" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.8rem", fontSize: "0.8rem", color: accent, fontWeight: 700 }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" className="ed-btn" style={{ display: "inline-block", padding: "0.5rem 1.4rem", border: `1px solid ${primary}`, color: primary, textDecoration: "none", fontSize: "0.75rem", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>Book</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div className="ed-anim" style={{ backgroundColor: `${accent}06`, borderLeft: `4px solid ${accent}`, padding: "1.5rem 2rem" }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, fontWeight: 700 }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.8, color: "#555" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" className="ed-anim" style={{ padding: "6rem 2rem", maxWidth: "750px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <EditorialDivider accent={accent} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>Registry</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, fontWeight: 600 }}>Gift Suggestions</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} className="ed-anim ed-card" style={{ backgroundColor: "#fff", border: `2px solid ${primary}10`, borderTop: `4px solid ${accent}`, padding: "2.5rem", textAlign: "center" }}>
                <h4 style={{ margin: "0 0 1.2rem", fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 700, color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" className="ed-btn" style={{ display: "inline-block", padding: "0.6rem 1.8rem", backgroundColor: primary, color: "#fff", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>Visit</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="ed-anim" style={{ padding: "6rem 2rem", maxWidth: "750px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <EditorialDivider accent={accent} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>FAQ</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, fontWeight: 600 }}>Common Questions</p>
          </div>
          <div style={{ borderTop: `2px solid ${primary}10` }}>
            {faq.map((item: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "1.3rem 0", backgroundColor: "transparent", border: "none",
                    borderBottom: `1px solid ${primary}10`, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    fontSize: "0.95rem", color: textColor, textAlign: "left", transition: "color 0.3s",
                  }}>
                    <span style={{ fontWeight: 500 }}>{item.q}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)", flexShrink: 0, marginLeft: "1rem",
                    }}><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? "400px" : "0", overflow: "hidden",
                    transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1)",
                  }}>
                    <p style={{ padding: "0 0 1.3rem", margin: 0, fontSize: "0.9rem", color: "#666", lineHeight: 1.8 }}>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RSVP */}
        <section id="rsvp" className="ed-anim" style={{ padding: "6rem 2rem", maxWidth: "620px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <EditorialDivider accent={accent} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>RSVP</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, fontWeight: 600 }}>Respond by the date above</p>
          </div>
          {submitSuccess ? (
            <div className="ed-success-anim" style={{ textAlign: "center", padding: "3.5rem 2rem", backgroundColor: "#fff", border: `2px solid ${primary}10` }}>
              <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: primary, fontSize: "1.5rem", margin: "0 0 0.5rem" }}>Thank You!</h3>
              <p style={{ color: "#666", fontSize: "0.95rem" }}>Your response has been recorded. We look forward to celebrating with you!</p>
            </div>
          ) : (
            <div style={{ backgroundColor: "#fff", border: `2px solid ${primary}10`, padding: "2.5rem" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 700 }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.9rem 1rem", fontSize: "1rem", fontFamily: "'Inter', sans-serif", border: `1px solid ${primary}15`, backgroundColor: background, color: textColor, outline: "none", boxSizing: "border-box", transition: "border-color 0.3s" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && !selectedGuest && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: `1px solid ${primary}15`, borderTop: "none", marginTop: "-1px", maxHeight: "220px", overflowY: "auto", zIndex: 10, boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}>
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
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{
                          padding: "0.7rem 1.6rem", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "1px",
                          border: `2px solid ${rsvpStatus === opt.val ? accent : `${primary}15`}`,
                          backgroundColor: rsvpStatus === opt.val ? accent : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor,
                          cursor: "pointer", textTransform: "uppercase", transition: "all 0.3s",
                        }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 700 }}>Dietary</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.9rem 1rem", fontSize: "0.95rem", fontFamily: "'Inter', sans-serif", border: `1px solid ${primary}15`, backgroundColor: background, color: textColor, outline: "none", boxSizing: "border-box" }}>
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
                    <textarea placeholder="Any special requests..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.9rem 1rem", fontSize: "0.95rem", fontFamily: "'Inter', sans-serif", border: `1px solid ${primary}15`, backgroundColor: background, color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} className="ed-btn" style={{
                    width: "100%", padding: "1rem", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: "3px",
                    textTransform: "uppercase",
                    backgroundColor: !rsvpStatus || submitting ? `${primary}33` : accent,
                    color: "#fff", border: "none", cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer",
                  }}>
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "5rem 2rem 3rem", textAlign: "center", borderTop: `1px solid ${primary}10`, position: "relative", overflow: "hidden" }}>
          {/* Subtle geometric background */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `repeating-linear-gradient(45deg, ${primary} 0px, ${primary} 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, ${primary} 0px, ${primary} 1px, transparent 1px, transparent 20px)`, backgroundSize: "28px 28px" }} />
          <div style={{ position: "relative" }}>
            <div style={{ width: "60px", height: "2px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "0 auto 2rem" }} />
            <p style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontFamily: "'Playfair Display', serif", color: primary, fontStyle: "italic" }}>
              Made with love
            </p>
            <p style={{ margin: "0 0 1.5rem", fontSize: "0.75rem", color: "#999", letterSpacing: "3px", fontWeight: 500 }}>
              {wedding.name || "Our Wedding"}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "2rem" }}>
              {[{ href: "#hero", label: "Home" }, { href: "#events", label: "Events" }, { href: "#story", label: "Story" }, { href: "#rsvp", label: "RSVP" }].map((item) => (
                <a key={item.href} href={item.href} style={{ color: "#999", textDecoration: "none", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500, transition: "color 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; }}
                >{item.label}</a>
              ))}
            </div>
            <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg, transparent, ${primary}20, transparent)`, margin: "0 auto 1rem" }} />
            <p style={{ margin: 0, fontSize: "0.55rem", color: "#ccc", letterSpacing: "4px", fontWeight: 700 }}>SHAADISHEET</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
