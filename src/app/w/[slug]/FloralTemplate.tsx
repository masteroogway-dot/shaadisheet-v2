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
  const background = "#FFF5F7";
  const textColor = theme.text || "#4A3B3B";
  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [animCountdown, setAnimCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const filteredGuests = rsvpGuests.filter((g: any) =>
    g.name?.toLowerCase().includes(guestSearch.toLowerCase())
  );

  useEffect(() => {
    setHeroLoaded(true);

    const duration = 2200;
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
            e.target.classList.add("vis");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    const timer2 = setTimeout(() => {
      document.querySelectorAll(".fl-anim").forEach((el) => observer.observe(el));
    }, 200);

    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(height > 0 ? (winScroll / height) * 100 : 0);
      setShowNav(window.scrollY > window.innerHeight * 0.75);

      const parallaxEl = document.getElementById("hero-bg");
      if (parallaxEl) {
        const y = window.scrollY * 0.25;
        parallaxEl.style.transform = `translateY(${y}px) scale(1.08)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => { clearInterval(timer); clearTimeout(timer2); observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [countdown]);

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@400;600&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes fl-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
          @keyframes fl-float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(3deg)} }
          @keyframes fl-kb { from{transform:scale(1)} to{transform:scale(1.18)} }
          @keyframes fl-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
          @keyframes fl-petal { 0%{opacity:0;transform:translateY(0) scale(0) rotate(45deg)} 15%{opacity:0.8;transform:scale(1) rotate(45deg)} 85%{opacity:0.8;transform:scale(1) rotate(45deg)} 100%{opacity:0;transform:translateY(-100vh) scale(0) rotate(45deg)} }
          @keyframes fl-pulse { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.35;transform:scale(1.08)} }
          @keyframes fl-glow { 0%,100%{box-shadow:0 0 20px rgba(199,91,122,0.1)} 50%{box-shadow:0 0 45px rgba(199,91,122,0.25)} }
          @keyframes fl-success { 0%{transform:scale(0.3) rotate(-10deg);opacity:0} 50%{transform:scale(1.08) rotate(2deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
          @keyframes fl-dot-pop { from{transform:scale(0)} 50%{transform:scale(1.4)} to{transform:scale(1)} }
          @keyframes fl-line-grow { from{transform:scaleY(0)} to{transform:scaleY(1)} }

          .fl-anim { opacity:0; transform:translateY(50px); transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1); }
          .fl-anim.vis { opacity:1; transform:translateY(0); }
          .fl-anim-d1 { transition-delay:0.1s !important; }
          .fl-anim-d2 { transition-delay:0.2s !important; }
          .fl-anim-d3 { transition-delay:0.3s !important; }

          .fl-card { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease, border-color 0.3s ease; }
          .fl-card:hover { transform: translateY(-6px); box-shadow: 0 16px 50px rgba(199,91,122,0.15), 0 0 25px rgba(186,148,209,0.1); border-color: rgba(186,148,209,0.4) !important; }

          .fl-btn { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); position:relative; overflow:hidden; }
          .fl-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow: 0 8px 25px rgba(199,91,122,0.25); }
          .fl-btn:active:not(:disabled) { transform:translateY(0); }

          .fl-success-anim { animation: fl-success 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

          .fl-timeline-node { animation: fl-dot-pop 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

          html { scroll-behavior: smooth; }
          * { scrollbar-width: thin; scrollbar-color: ${accent}44 transparent; }
          *::-webkit-scrollbar { width: 6px; }
          *::-webkit-scrollbar-track { background: transparent; }
          *::-webkit-scrollbar-thumb { background: ${accent}44; border-radius: 3px; }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Playfair Display', Georgia, serif", color: textColor, backgroundColor: background, lineHeight: 1.7, overflowX: "hidden" }}>

        {/* SCROLL PROGRESS BAR */}
        <div style={{ position: "fixed", top: 0, left: 0, height: "3px", background: `linear-gradient(90deg, ${primary}, ${accent}, ${primary})`, backgroundSize: "200% 100%", zIndex: 99999, width: `${scrollProgress}%`, transition: "width 0.15s ease-out", animation: "fl-shimmer 3s linear infinite" }} />

        {/* FLOATING NAVIGATION */}
        <nav style={{ position: "fixed", top: "16px", left: "50%", transform: `translateX(-50%) translateY(${showNav ? "0" : "-100px"})`, zIndex: 9999, backgroundColor: "rgba(255,245,247,0.92)", backdropFilter: "blur(20px) saturate(1.5)", border: `1px solid ${accent}33`, borderRadius: "60px", padding: "0.6rem 1.5rem", display: "flex", gap: "0.3rem", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 8px 32px rgba(199,91,122,0.12), 0 0 0 1px ${accent}11` }}>
          {[{ href: "#hero", label: "Home" }, { href: "#events", label: "Events" }, { href: "#story", label: "Story" }, { href: "#travel", label: "Travel" }, { href: "#registry", label: "Registry" }, { href: "#faq", label: "FAQ" }, { href: "#rsvp", label: "RSVP" }].map((item) => (
            <a key={item.href} href={item.href} style={{ color: textColor, textDecoration: "none", fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", padding: "0.4rem 0.8rem", borderRadius: "40px", transition: "all 0.3s", fontWeight: 400, fontFamily: "'Playfair Display', Georgia, serif" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = primary; e.currentTarget.style.backgroundColor = `${primary}12`; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = "transparent"; }}
            >{item.label}</a>
          ))}
        </nav>

        {/* HERO */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          {/* Ken Burns Background */}
          <div id="hero-bg" style={{ position: "absolute", inset: "-15%", backgroundImage: config.photo ? `url(${config.photo})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.3) saturate(1.2)", animation: "fl-kb 25s ease-in-out infinite alternate", willChange: "transform" }} />

          {/* Gradient Overlays */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${primary}55 0%, transparent 30%, transparent 70%, ${primary}77 100%)` }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${background}88 100%)` }} />

          {/* Floating Particles — Petal shapes */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`p-${i}`} style={{
              position: "absolute",
              width: `${4 + (i % 5) * 2}px`,
              height: `${4 + (i % 5) * 2}px`,
              backgroundColor: i % 3 === 0 ? accent : i % 3 === 1 ? primary : "rgba(255,255,255,0.6)",
              borderRadius: "50% 0 50% 0",
              left: `${(i * 31 + 7) % 100}%`,
              bottom: "-5%",
              opacity: 0,
              animation: `fl-petal ${8 + (i % 6) * 3}s linear infinite`,
              animationDelay: `${(i * 0.8) % 12}s`,
              pointerEvents: "none",
              transform: "rotate(45deg)",
            }} />
          ))}

          {/* Glow Orbs */}
          <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}15, transparent 70%)`, top: "5%", left: "-10%", animation: "fl-pulse 8s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "350px", height: "350px", borderRadius: "50%", background: `radial-gradient(circle, ${primary}12, transparent 70%)`, bottom: "10%", right: "-8%", animation: "fl-pulse 10s ease-in-out infinite 3s", pointerEvents: "none" }} />

          {/* Hero Content — Staggered Entrance */}
          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            {/* FlowerCrown */}
            <div style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "scale(1)" : "scale(0.5)",
              transition: "all 1.2s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <FlowerCrown color={accent} accent={primary} />
            </div>

            {/* Tagline */}
            <p style={{
              fontSize: "1.1rem", fontFamily: "'Dancing Script', cursive", color: accent, marginBottom: "0.5rem", letterSpacing: "1px",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.3s",
            }}>
              {config.tagline || "Together Forever"}
            </p>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 400, margin: "0.5rem 0", color: "#fff", lineHeight: 1.2, letterSpacing: "2px",
              textShadow: `0 4px 40px ${primary}66, 0 0 80px ${primary}33`,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s",
            }}>
              {wedding.name || "Our Wedding"}
            </h1>

            {/* Decorative Line */}
            <div style={{
              width: "120px", height: "1px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "1.5rem auto",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "scaleX(1)" : "scaleX(0)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.7s",
            }} />

            {/* Date */}
            <p style={{
              fontSize: "1rem", color: "rgba(255,255,255,0.85)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "3rem",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.9s",
            }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>

            {/* Countdown */}
            <div style={{
              display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1.1s",
            }}>
              {[
                { val: animCountdown.days, label: "Days" },
                { val: animCountdown.hours, label: "Hours" },
                { val: animCountdown.minutes, label: "Minutes" },
                { val: animCountdown.seconds, label: "Seconds" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  border: `1px solid ${accent}55`, borderRadius: "16px", padding: "1.2rem 1.8rem", minWidth: "90px",
                  backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)",
                  animation: `fl-glow 4s ease-in-out infinite ${i * 0.6}s`,
                }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 600, color: "#fff", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>{item.val}</div>
                  <div style={{ fontSize: "0.55rem", letterSpacing: "4px", textTransform: "uppercase", marginTop: "0.4rem", color: accent }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Scroll Arrow */}
            <a href="#events" style={{
              color: accent, display: "inline-block",
              opacity: heroLoaded ? 1 : 0,
              transition: "opacity 1s ease 1.5s",
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: "fl-bounce 2.5s ease-in-out infinite" }}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
        </section>

        {/* EVENTS — Interactive Timeline */}
        <section id="events" className="fl-anim" style={{ padding: "6rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <FloralDivider color={accent} />
            <h2 style={{ fontSize: "2.5rem", fontWeight: 400, color: primary, marginBottom: "0.5rem" }}>Wedding Events</h2>
            <p style={{ fontFamily: "'Dancing Script', cursive", color: accent, marginBottom: "1rem", fontSize: "1.1rem" }}>Schedule of Celebrations</p>
            <div style={{ width: "60px", height: "1px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "0 auto" }} />
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
            {/* Vertical Line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: `linear-gradient(180deg, transparent, ${accent}55, ${accent}55, transparent)`, transform: "translateX(-50%)" }} />

            {events.map((event: any, idx: number) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={event.id || idx} className={`fl-anim ${isLeft ? "" : "fl-anim-d1"}`} style={{
                  display: "flex", justifyContent: isLeft ? "flex-end" : "flex-start",
                  paddingLeft: isLeft ? 0 : "calc(50% + 40px)", paddingRight: isLeft ? "calc(50% + 40px)" : 0,
                  marginBottom: "3rem", position: "relative",
                }}>
                  {/* Timeline Node */}
                  <div className="fl-timeline-node" style={{
                    position: "absolute", left: "50%", top: "24px", width: "14px", height: "14px",
                    background: `radial-gradient(circle, ${accent}, ${primary})`,
                    border: `3px solid ${background}`, borderRadius: "50%",
                    transform: "translateX(-50%)", zIndex: 2,
                    boxShadow: `0 0 0 4px ${accent}22, 0 0 20px ${accent}33`,
                  }} />

                  {/* Event Card */}
                  <div className="fl-card" style={{
                    backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
                    border: `1px solid ${accent}33`, borderRadius: "16px", padding: "2rem",
                    maxWidth: "380px", width: "100%", position: "relative",
                    boxShadow: `0 4px 24px ${primary}11`,
                  }}>
                    {/* Date Badge */}
                    <div style={{
                      position: "absolute", top: "-12px", left: isLeft ? "auto" : "20px", right: isLeft ? "20px" : "auto",
                      background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", padding: "4px 14px", borderRadius: "20px",
                      fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 500,
                    }}>
                      {formatDate(event.date)}
                    </div>

                    <h3 style={{ margin: "0.5rem 0 0.5rem", fontSize: "1.3rem", fontFamily: "'Playfair Display', serif", color: primary }}>{event.name}</h3>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "#777" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                    {event.location && <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#888" }}>📍 {event.location}</p>}
                    {event.dressCode && (
                      <span style={{
                        display: "inline-block", fontSize: "0.6rem", letterSpacing: "1.5px", textTransform: "uppercase",
                        padding: "4px 12px", border: `1px solid ${accent}33`, color: accent, borderRadius: "20px", marginTop: "0.3rem",
                      }}>{event.dressCode}</span>
                    )}
                    {event.description && <p style={{ margin: "0.8rem 0 0", fontSize: "0.85rem", color: "#999", fontStyle: "italic", lineHeight: 1.6 }}>{event.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STORY — with Wave Dividers */}
        <section id="story" className="fl-anim" style={{ padding: "6rem 2rem", maxWidth: "750px", margin: "0 auto", textAlign: "center" }}>
          {/* Wave Divider Top */}
          <div style={{ width: "100%", lineHeight: 0, marginBottom: "2rem" }}>
            <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ width: "100%", height: "50px", display: "block" }}>
              <path d="M0,30 C180,60 360,10 540,35 C720,60 900,10 1080,35 C1260,60 1350,20 1440,30 L1440,80 L0,80 Z" fill={`${primary}08`} />
              <path d="M0,35 C180,65 360,15 540,40 C720,65 900,15 1080,40 C1260,65 1350,25 1440,35" stroke={accent} strokeWidth="0.8" fill="none" opacity="0.3" />
            </svg>
          </div>

          <div style={{ padding: "2rem 0" }}>
            <FloralDivider color={accent} />
            <h2 style={{ fontSize: "2.5rem", fontWeight: 400, color: primary, marginBottom: "2rem" }}>Our Story</h2>
            {story.quote && (
              <blockquote style={{
                fontFamily: "'Dancing Script', cursive", fontSize: "1.5rem", color: primary, margin: "0 0 2.5rem", padding: "1.5rem 2rem",
                lineHeight: 1.8, borderLeft: `2px solid ${accent}44`, backgroundColor: `${accent}08`, borderRadius: "0 16px 16px 0",
              }}>
                &ldquo;{story.quote}&rdquo;
              </blockquote>
            )}
            {story.howWeMet && (
              <div className="fl-anim fl-anim-d1" style={{ marginBottom: "2.5rem", textAlign: "left" }}>
                <h3 style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem" }}>How We Met</h3>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "#666" }}>{story.howWeMet}</p>
              </div>
            )}
            {story.proposal && (
              <div className="fl-anim fl-anim-d2" style={{ textAlign: "left" }}>
                <h3 style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem" }}>The Proposal</h3>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "#666" }}>{story.proposal}</p>
              </div>
            )}
          </div>

          {/* Wave Divider Bottom */}
          <div style={{ width: "100%", lineHeight: 0, marginTop: "2rem" }}>
            <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ width: "100%", height: "50px", display: "block", transform: "rotate(180deg)" }}>
              <path d="M0,30 C180,60 360,10 540,35 C720,60 900,10 1080,35 C1260,60 1350,20 1440,30 L1440,80 L0,80 Z" fill={`${primary}08`} />
              <path d="M0,35 C180,65 360,15 540,40 C720,65 900,15 1080,40 C1260,65 1350,25 1440,35" stroke={accent} strokeWidth="0.8" fill="none" opacity="0.3" />
            </svg>
          </div>
        </section>

        {/* TRAVEL */}
        <section id="travel" className="fl-anim" style={{ padding: "6rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <FloralDivider color={accent} />
            <h2 style={{ fontSize: "2.5rem", fontWeight: 400, color: primary, marginBottom: "0.5rem" }}>Travel & Stay</h2>
            <p style={{ fontFamily: "'Dancing Script', cursive", color: accent, fontSize: "1.1rem" }}>Accommodations</p>
          </div>
          {travel.venueName && (
            <div className="fl-anim fl-card" style={{ backgroundColor: "rgba(255,255,255,0.85)", border: `1px solid ${accent}33`, borderRadius: "16px", padding: "2.5rem", marginBottom: "2rem", textAlign: "center", backdropFilter: "blur(8px)" }}>
              <h3 style={{ fontSize: "1.5rem", color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.95rem", color: "#777", margin: "0 0 1.5rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" className="fl-btn" style={{ display: "inline-block", padding: "0.7rem 2rem", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500, borderRadius: "24px" }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} className="fl-anim fl-card" style={{ backgroundColor: "rgba(255,255,255,0.85)", border: `1px solid ${accent}33`, borderRadius: "16px", padding: "2rem", backdropFilter: "blur(8px)" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#777" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.8rem", fontSize: "0.8rem", color: accent }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" className="fl-btn" style={{ display: "inline-block", padding: "0.5rem 1.4rem", border: `1px solid ${accent}44`, color: primary, textDecoration: "none", fontSize: "0.75rem", letterSpacing: "1.5px", borderRadius: "20px" }}>Book Now</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div className="fl-anim" style={{ backgroundColor: `${accent}0A`, border: `1px solid ${accent}22`, borderRadius: "16px", padding: "1.5rem 2rem" }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "1rem", color: primary }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.8, color: "#666" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" className="fl-anim" style={{ padding: "6rem 2rem", maxWidth: "750px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <FloralDivider color={accent} />
            <h2 style={{ fontSize: "2.5rem", fontWeight: 400, color: primary, marginBottom: "0.5rem" }}>Registry</h2>
            <p style={{ fontFamily: "'Dancing Script', cursive", color: accent, fontSize: "1.1rem" }}>Gift Suggestions</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} className="fl-anim fl-card" style={{ backgroundColor: "rgba(255,255,255,0.85)", border: `1px solid ${accent}33`, borderRadius: "16px", padding: "2.5rem", textAlign: "center", backdropFilter: "blur(8px)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>🎁</div>
                <h4 style={{ margin: "0 0 1.2rem", fontSize: "1.05rem", color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" className="fl-btn" style={{ display: "inline-block", padding: "0.6rem 1.8rem", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", borderRadius: "24px" }}>Visit Registry</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="fl-anim" style={{ padding: "6rem 2rem", maxWidth: "750px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <FloralDivider color={accent} />
            <h2 style={{ fontSize: "2.5rem", fontWeight: 400, color: primary, marginBottom: "0.5rem" }}>FAQ</h2>
            <p style={{ fontFamily: "'Dancing Script', cursive", color: accent, fontSize: "1.1rem" }}>Common Questions</p>
          </div>
          <div style={{ borderTop: `1px solid ${accent}33` }}>
            {faq.map((item: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "1.3rem 0", backgroundColor: "transparent", border: "none",
                    borderBottom: `1px solid ${accent}33`, cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1rem", color: textColor, textAlign: "left", transition: "color 0.3s",
                  }}>
                    <span>{item.q}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)", flexShrink: 0, marginLeft: "1rem",
                    }}><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? "400px" : "0", overflow: "hidden",
                    transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1)",
                  }}>
                    <p style={{ padding: "0 0 1.3rem", margin: 0, fontSize: "0.9rem", color: "#777", lineHeight: 1.8 }}>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RSVP */}
        <section id="rsvp" className="fl-anim" style={{ padding: "6rem 2rem", maxWidth: "620px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <FloralDivider color={accent} />
            <h2 style={{ fontSize: "2.5rem", fontWeight: 400, color: primary, marginBottom: "0.5rem" }}>RSVP</h2>
            <p style={{ fontFamily: "'Dancing Script', cursive", color: accent, fontSize: "1.1rem" }}>Kindly Respond</p>
          </div>
          {submitSuccess ? (
            <div className="fl-success-anim" style={{ textAlign: "center", padding: "3.5rem 2rem", backgroundColor: "rgba(255,255,255,0.85)", border: `1px solid ${accent}33`, borderRadius: "16px", backdropFilter: "blur(8px)" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: `linear-gradient(135deg, ${primary}, ${accent})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <h3 style={{ color: primary, fontSize: "1.5rem", margin: "0 0 0.5rem" }}>Thank You!</h3>
              <p style={{ color: "#777", fontSize: "0.95rem" }}>Your response has been recorded. We look forward to celebrating with you!</p>
            </div>
          ) : (
            <div style={{ backgroundColor: "rgba(255,255,255,0.85)", border: `1px solid ${accent}33`, borderRadius: "16px", padding: "2.5rem", backdropFilter: "blur(8px)" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.9rem 1.2rem", fontSize: "0.95rem", fontFamily: "'Playfair Display', Georgia, serif", border: `1px solid ${accent}44`, borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.6)", color: textColor, outline: "none", boxSizing: "border-box", transition: "border-color 0.3s" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && !selectedGuest && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: `1px solid ${accent}44`, borderTop: "none", marginTop: "-1px", maxHeight: "220px", overflowY: "auto", zIndex: 10, boxShadow: `0 12px 40px ${primary}18`, borderRadius: "0 0 12px 12px" }}>
                    {filteredGuests.map((guest: any) => (
                      <button key={guest.id} onClick={() => { onGuestSelect(guest); setSearchOpen(false); }} style={{ width: "100%", padding: "0.8rem 1.2rem", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}15`, cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.9rem", color: textColor, transition: "background-color 0.2s" }}>{guest.name}</button>
                    ))}
                  </div>
                )}
                {searchOpen && guestSearch && filteredGuests.length === 0 && !selectedGuest && guestSearch.length >= 2 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: `1px solid ${accent}44`, borderTop: "none", marginTop: "-1px", zIndex: 10, padding: "1.2rem", textAlign: "center", borderRadius: "0 0 12px 12px" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#999", fontFamily: "'Playfair Display', Georgia, serif" }}>No guests found. Check the spelling or try a different name.</p>
                  </div>
                )}
              </div>
              {selectedGuest && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Will you attend?</label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[{ val: "yes", label: "Joyfully Accept" }, { val: "no", label: "Regretfully Decline" }, { val: "maybe", label: "Maybe" }].map((opt) => (
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} className="fl-btn" style={{
                          padding: "0.6rem 1.5rem", fontSize: "0.85rem", fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "1px",
                          borderRadius: "24px", border: `1.5px solid ${rsvpStatus === opt.val ? primary : `${accent}33`}`,
                          backgroundColor: rsvpStatus === opt.val ? primary : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor,
                          cursor: "pointer", textTransform: "uppercase", transition: "all 0.3s",
                        }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Dietary Preference</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.9rem 1.2rem", fontSize: "0.95rem", fontFamily: "'Playfair Display', Georgia, serif", border: `1px solid ${accent}33`, borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.6)", color: textColor, outline: "none", boxSizing: "border-box" }}>
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
                    <textarea placeholder="Any special requests or messages..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.9rem 1.2rem", fontSize: "0.95rem", fontFamily: "'Playfair Display', Georgia, serif", border: `1px solid ${accent}33`, borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.6)", color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} className="fl-btn" style={{
                    width: "100%", padding: "1rem", fontSize: "0.85rem", fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "3px",
                    textTransform: "uppercase", fontWeight: 500, borderRadius: "24px",
                    background: !rsvpStatus || submitting ? `${accent}44` : `linear-gradient(135deg, ${primary}, ${accent})`,
                    color: "#fff", border: "none", cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer",
                  }}>
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER — Enhanced with animated elements */}
        <footer style={{ padding: "5rem 2rem 3rem", textAlign: "center", borderTop: `1px solid ${accent}22`, position: "relative", overflow: "hidden" }}>
          {/* Subtle floral pattern background */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `repeating-conic-gradient(${accent} 0% 25%, transparent 0% 50%)`, backgroundSize: "24px 24px" }} />

          {/* Floating petals in footer */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`fp-${i}`} style={{
              position: "absolute",
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
              backgroundColor: i % 2 === 0 ? accent : primary,
              borderRadius: "50% 0 50% 0",
              left: `${(i * 29 + 5) % 100}%`,
              bottom: "-5%",
              opacity: 0,
              animation: `fl-petal ${10 + (i % 3) * 4}s linear infinite`,
              animationDelay: `${i * 1.5}s`,
              pointerEvents: "none",
              transform: "rotate(45deg)",
            }} />
          ))}

          <div style={{ position: "relative" }}>
            <FloralDivider color={accent} />
            <p style={{ margin: "1.5rem 0 0.5rem", fontSize: "1rem", fontFamily: "'Dancing Script', cursive", color: primary }}>
              Made with love
            </p>
            <p style={{ margin: 0, fontSize: "0.55rem", color: "#ccc", letterSpacing: "5px" }}>SHAADISHEET</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
