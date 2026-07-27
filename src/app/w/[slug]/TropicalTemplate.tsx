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

function TropicalLeaf({ color = "#006B5E", size = 40, rotation = 0 }: { color?: string; size?: number; rotation?: number }) {
  return (
    <svg width={size} height={size * 1.8} viewBox="0 0 40 72" fill="none" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M20,2 Q8,18 4,36 Q2,50 20,70 Q38,50 36,36 Q32,18 20,2Z" fill={color} opacity="0.15" />
      <path d="M20,8 L20,64" stroke={color} strokeWidth="0.8" opacity="0.25" />
      <path d="M20,18 Q12,22 8,30" stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />
      <path d="M20,28 Q28,32 32,40" stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />
      <path d="M20,38 Q14,42 10,48" stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />
      <path d="M20,48 Q26,52 30,56" stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />
    </svg>
  );
}

function WaveDivider({ color = "#4ECDC4", flip = false }: { color?: string; flip?: boolean }) {
  return (
    <div style={{ width: "100%", lineHeight: 0, marginTop: flip ? 0 : "-2px", marginBottom: flip ? "-2px" : 0, transform: flip ? "rotate(180deg)" : "none" }}>
      <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ width: "100%", height: "50px", display: "block" }}>
        <path d="M0,50 C180,80 360,10 540,40 C720,70 900,5 1080,35 C1260,65 1380,20 1440,30 L1440,80 L0,80 Z" fill={color} opacity="0.06" />
        <path d="M0,55 C200,85 400,15 600,45 C800,75 1000,10 1200,40 C1350,60 1400,25 1440,35" stroke={color} strokeWidth="0.8" fill="none" opacity="0.15" />
        <path d="M0,62 C150,80 350,25 550,50 C750,75 950,15 1150,45 C1300,65 1400,30 1440,42" stroke={color} strokeWidth="0.5" fill="none" opacity="0.1" />
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
  const primary = theme.primary || "#006B5E";
  const accent = theme.accent || "#F4A261";
  const background = "#FEFCF4";
  const textColor = "#2D3436";
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

  const filteredGuests = rsvpGuests.filter((g: any) => g.name?.toLowerCase().includes(guestSearch.toLowerCase()));

  const cardBg = "#FFFFFF";

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
      document.querySelectorAll(".tr-anim").forEach((el) => observer.observe(el));
    }, 200);

    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(height > 0 ? (winScroll / height) * 100 : 0);
      setShowNav(window.scrollY > window.innerHeight * 0.75);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => { clearInterval(timer); clearTimeout(timer2); observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [countdown]);

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes tr-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
          @keyframes tr-float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-16px) rotate(2deg)} }
          @keyframes tr-float-alt { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(-2deg)} }
          @keyframes tr-kb { from{transform:scale(1)} to{transform:scale(1.18)} }
          @keyframes tr-fade-up { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
          @keyframes tr-scale-in { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
          @keyframes tr-glow { 0%,100%{box-shadow:0 0 20px rgba(0,107,94,0.06)} 50%{box-shadow:0 0 40px rgba(0,107,94,0.18)} }
          @keyframes tr-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
          @keyframes tr-particle { 0%{opacity:0;transform:translateY(0) rotate(0deg) scale(0)} 15%{opacity:0.7;transform:scale(1)} 85%{opacity:0.7;transform:scale(1)} 100%{opacity:0;transform:translateY(-100vh) rotate(180deg) scale(0)} }
          @keyframes tr-pulse { 0%,100%{opacity:0.1;transform:scale(1)} 50%{opacity:0.25;transform:scale(1.06)} }
          @keyframes tr-success { 0%{transform:scale(0.3) rotate(-10deg);opacity:0} 50%{transform:scale(1.08) rotate(2deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
          @keyframes tr-line-grow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
          @keyframes tr-dot-pop { from{transform:scale(0)} 50%{transform:scale(1.4)} to{transform:scale(1)} }
          @keyframes tr-hero-text { from{opacity:0;transform:translateY(30px) filter:blur(8px)} to{opacity:1;transform:translateY(0) filter:blur(0)} }
          @keyframes tr-wave-drift { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

          .tr-anim { opacity:0; transform:translateY(50px); transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1); }
          .tr-anim.vis { opacity:1; transform:translateY(0); }
          .tr-anim-d1 { transition-delay:0.1s !important; }
          .tr-anim-d2 { transition-delay:0.2s !important; }
          .tr-anim-d3 { transition-delay:0.3s !important; }

          .tr-card { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease, border-color 0.3s ease; }
          .tr-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,107,94,0.1), 0 0 20px rgba(244,162,97,0.06); border-color: rgba(244,162,97,0.3) !important; }

          .tr-btn { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); position:relative; overflow:hidden; }
          .tr-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow: 0 8px 25px rgba(244,162,97,0.25); }
          .tr-btn:active:not(:disabled) { transform:translateY(0); }

          .tr-success-anim { animation: tr-success 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

          .tr-timeline-node { animation: tr-dot-pop 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

          html { scroll-behavior: smooth; }
          * { scrollbar-width: thin; scrollbar-color: ${accent}44 transparent; }
          *::-webkit-scrollbar { width: 6px; }
          *::-webkit-scrollbar-track { background: transparent; }
          *::-webkit-scrollbar-thumb { background: ${accent}44; border-radius: 3px; }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Quicksand', sans-serif", color: textColor, backgroundColor: background, lineHeight: 1.7, overflowX: "hidden" }}>

        {/* SCROLL PROGRESS BAR */}
        <div style={{ position: "fixed", top: 0, left: 0, height: "3px", background: `linear-gradient(90deg, ${primary}, ${accent}, ${primary})`, backgroundSize: "200% 100%", zIndex: 99999, width: `${scrollProgress}%`, transition: "width 0.15s ease-out", animation: "tr-shimmer 3s linear infinite" }} />

        {/* FLOATING NAVIGATION */}
        <nav style={{ position: "fixed", top: "16px", left: "50%", transform: `translateX(-50%) translateY(${showNav ? "0" : "-100px"})`, zIndex: 9999, backgroundColor: "rgba(254,252,244,0.92)", backdropFilter: "blur(20px) saturate(1.5)", border: `1px solid ${primary}22`, borderRadius: "60px", padding: "0.6rem 1.5rem", display: "flex", gap: "0.3rem", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 8px 32px rgba(0,107,94,0.1), 0 0 0 1px ${primary}11` }}>
          {[{ href: "#hero", label: "Home" }, { href: "#events", label: "Events" }, { href: "#story", label: "Story" }, { href: "#travel", label: "Travel" }, { href: "#registry", label: "Registry" }, { href: "#faq", label: "FAQ" }, { href: "#rsvp", label: "RSVP" }].map((item) => (
            <a key={item.href} href={item.href} style={{ color: `${textColor}99`, textDecoration: "none", fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", padding: "0.4rem 0.8rem", borderRadius: "40px", transition: "all 0.3s", fontWeight: 500 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = primary; e.currentTarget.style.backgroundColor = `${primary}12`; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = `${textColor}99`; e.currentTarget.style.backgroundColor = "transparent"; }}
            >{item.label}</a>
          ))}
        </nav>

        {/* HERO */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          {/* Ken Burns Background */}
          <div id="hero-bg" style={{ position: "absolute", inset: "-15%", backgroundImage: config.photo ? `url(${config.photo})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.35) saturate(1.2)", animation: "tr-kb 25s ease-in-out infinite alternate", willChange: "transform" }} />

          {/* Dramatic Sunset Gradient */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #1a6b5a22 0%, #006B5E55 20%, #F4A26133 50%, #FF6B6B44 70%, #C850C033 85%, #006B5E44 100%)` }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,107,94,0.3) 0%, transparent 40%, rgba(244,162,97,0.2) 70%, transparent 100%)" }} />

          {/* Geometric Pattern */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `repeating-conic-gradient(${primary} 0% 25%, transparent 0% 50%)`, backgroundSize: "28px 28px" }} />

          {/* Floating Particles — Palm Leaves */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={`p-${i}`} style={{
              position: "absolute",
              left: `${(i * 37 + 5) % 100}%`,
              bottom: "-8%",
              opacity: 0,
              animation: `tr-particle ${10 + (i % 5) * 4}s linear infinite`,
              animationDelay: `${(i * 1.2) % 15}s`,
              pointerEvents: "none",
            }}>
              <TropicalLeaf color={i % 3 === 0 ? accent : primary} size={14 + (i % 4) * 6} rotation={i * 25} />
            </div>
          ))}

          {/* Glow Orbs */}
          <div style={{ position: "absolute", width: "450px", height: "450px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}12, transparent 70%)`, top: "5%", left: "-10%", animation: "tr-pulse 8s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "380px", height: "380px", borderRadius: "50%", background: `radial-gradient(circle, ${primary}15, transparent 70%)`, bottom: "10%", right: "-8%", animation: "tr-pulse 10s ease-in-out infinite 3s", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, #FF6B6B0a, transparent 70%)`, top: "30%", right: "15%", animation: "tr-pulse 12s ease-in-out infinite 6s", pointerEvents: "none" }} />

          {/* Palm Trees */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "180px", height: "100%" }}>
            <svg width="100%" height="100%" viewBox="0 0 180 400" preserveAspectRatio="xMinYMin slice">
              <PalmTree color="rgba(0,107,94,0.12)" x={30} />
            </svg>
          </div>
          <div style={{ position: "absolute", top: 0, right: 0, width: "180px", height: "100%" }}>
            <svg width="100%" height="100%" viewBox="0 0 180 400" preserveAspectRatio="xMaxYMin slice">
              <PalmTree color="rgba(0,107,94,0.08)" x={80} />
            </svg>
          </div>

          {/* Hero Content — Staggered Entrance */}
          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            {/* Tagline */}
            <p style={{
              fontSize: "0.75rem", letterSpacing: "8px", textTransform: "uppercase", color: accent, margin: "0 0 0.5rem", fontWeight: 400,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.2s",
            }}>
              {config.tagline || "Together Forever"}
            </p>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(2.8rem, 8vw, 5.5rem)", fontWeight: 700, margin: "0.5rem 0", color: "#fff", lineHeight: 1.15,
              textShadow: "0 4px 40px rgba(0,107,94,0.4), 0 0 80px rgba(0,107,94,0.2)",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s",
            }}>
              {wedding.name || "Our Wedding"}
            </h1>

            {/* Decorative Line */}
            <div style={{
              width: "120px", height: "3px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "1.5rem auto", borderRadius: "2px",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "scaleX(1)" : "scaleX(0)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.6s",
            }} />

            {/* Date */}
            <p style={{
              fontSize: "0.9rem", color: "rgba(255,255,255,0.85)", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "3rem", fontWeight: 300, textShadow: "0 1px 3px rgba(0,0,0,0.2)",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.8s",
            }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>

            {/* Countdown */}
            <div style={{
              display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1s",
            }}>
              {[
                { val: animCountdown.days, label: "Days" },
                { val: animCountdown.hours, label: "Hours" },
                { val: animCountdown.minutes, label: "Minutes" },
                { val: animCountdown.seconds, label: "Seconds" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  padding: "1.2rem 1.8rem", minWidth: "90px", backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.25)",
                  animation: `tr-glow 4s ease-in-out infinite ${i * 0.6}s`,
                }}>
                  <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "#fff", lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>{item.val}</div>
                  <div style={{ fontSize: "0.55rem", letterSpacing: "3px", textTransform: "uppercase", marginTop: "0.4rem", color: "rgba(255,255,255,0.7)" }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Scroll Arrow */}
            <a href="#events" style={{
              color: "#fff", display: "inline-block",
              opacity: heroLoaded ? 1 : 0,
              transition: "opacity 1s ease 1.4s",
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: "tr-bounce 2.5s ease-in-out infinite" }}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>

          {/* Bottom Wave */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px" }}>
            <svg width="100%" height="120" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,80 Q200,20 400,60 Q600,100 800,50 Q1000,10 1200,70 L1200,120 L0,120 Z" fill={background} opacity="0.9" />
              <path d="M0,90 Q150,40 350,70 Q550,100 750,55 Q950,15 1200,80 L1200,120 L0,120 Z" fill={background} opacity="0.5" />
            </svg>
          </div>
        </section>

        {/* EVENTS — Interactive Timeline */}
        <section id="events" className="tr-anim" style={{ padding: "6rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <WaveDivider color={primary} />
            <h2 style={{ fontSize: "2.4rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>Wedding Events</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 400 }}>Our Island Celebrations</p>
            <div style={{ width: "60px", height: "3px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "0 auto", borderRadius: "2px" }} />
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
            {/* Vertical Line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "2px", background: `linear-gradient(180deg, transparent, ${accent}44, ${accent}44, transparent)`, transform: "translateX(-50%)" }} />

            {events.map((event: any, idx: number) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={event.id || idx} className={`tr-anim ${isLeft ? "" : "tr-anim-d1"}`} style={{
                  display: "flex", justifyContent: isLeft ? "flex-end" : "flex-start",
                  paddingLeft: isLeft ? 0 : "calc(50% + 40px)", paddingRight: isLeft ? "calc(50% + 40px)" : 0,
                  marginBottom: "3rem", position: "relative",
                }}>
                  {/* Timeline Node */}
                  <div className="tr-timeline-node" style={{
                    position: "absolute", left: "50%", top: "24px", width: "16px", height: "16px",
                    backgroundColor: accent, border: `3px solid ${background}`, borderRadius: "50%",
                    transform: "translateX(-50%)", zIndex: 2,
                    boxShadow: `0 0 0 5px ${accent}20, 0 0 20px ${accent}30`,
                  }} />

                  {/* Event Card */}
                  <div className="tr-card" style={{
                    backgroundColor: cardBg, border: `1px solid ${primary}12`, borderRadius: "20px", padding: "2rem",
                    maxWidth: "380px", width: "100%", position: "relative",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  }}>
                    {/* Date Badge */}
                    <div style={{
                      position: "absolute", top: "-14px", left: isLeft ? "auto" : "20px", right: isLeft ? "20px" : "auto",
                      background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", padding: "5px 16px", borderRadius: "20px",
                      fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600,
                    }}>
                      {formatDate(event.date)}
                    </div>

                    <h3 style={{ margin: "0.5rem 0 0.5rem", fontSize: "1.25rem", fontWeight: 700, color: primary }}>{event.name}</h3>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "#999" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                    {event.location && <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#aaa" }}>{event.location}</p>}
                    {event.dressCode && (
                      <span style={{
                        display: "inline-block", fontSize: "0.6rem", letterSpacing: "1.5px", textTransform: "uppercase",
                        padding: "4px 12px", border: `1px solid ${accent}33`, color: accent, borderRadius: "20px", marginTop: "0.3rem", fontWeight: 600,
                      }}>{event.dressCode}</span>
                    )}
                    {event.description && <p style={{ margin: "0.8rem 0 0", fontSize: "0.85rem", color: "#aaa", lineHeight: 1.6 }}>{event.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STORY */}
        <section id="story" className="tr-anim" style={{ padding: "6rem 2rem", maxWidth: "750px", margin: "0 auto", textAlign: "center" }}>
          <WaveDivider color={primary} />
          <div style={{ padding: "2rem 0" }}>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 700, color: primary, marginBottom: "2rem" }}>Our Story</h2>
            {story.quote && (
              <blockquote style={{
                fontSize: "1.35rem", fontStyle: "italic", color: accent, margin: "0 0 2.5rem", padding: "1.5rem 2rem",
                lineHeight: 1.8, borderLeft: `3px solid ${accent}55`, backgroundColor: `${accent}08`, borderRadius: "0 16px 16px 0",
              }}>
                &ldquo;{story.quote}&rdquo;
              </blockquote>
            )}
            {story.howWeMet && (
              <div className="tr-anim tr-anim-d1" style={{ marginBottom: "2.5rem", textAlign: "left" }}>
                <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 600 }}>How We Met</h3>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "#666" }}>{story.howWeMet}</p>
              </div>
            )}
            {story.proposal && (
              <div className="tr-anim tr-anim-d2" style={{ textAlign: "left" }}>
                <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 600 }}>The Proposal</h3>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "#666" }}>{story.proposal}</p>
              </div>
            )}
          </div>
          <WaveDivider color={primary} flip />
        </section>

        {/* TRAVEL */}
        <section id="travel" className="tr-anim" style={{ padding: "6rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <WaveDivider color={primary} />
            <h2 style={{ fontSize: "2.4rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>Getting There</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 400 }}>Travel & Accommodations</p>
          </div>
          {travel.venueName && (
            <div className="tr-anim tr-card" style={{ backgroundColor: cardBg, border: `1px solid ${primary}12`, borderRadius: "20px", padding: "2.5rem", marginBottom: "2rem", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.95rem", color: "#888", margin: "0 0 1.5rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" className="tr-btn" style={{ display: "inline-block", padding: "0.7rem 2rem", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, borderRadius: "28px" }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} className="tr-anim tr-card" style={{ backgroundColor: cardBg, border: `1px solid ${primary}12`, borderRadius: "20px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#888" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.8rem", fontSize: "0.8rem", color: accent, fontWeight: 600 }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" className="tr-btn" style={{ display: "inline-block", padding: "0.5rem 1.4rem", border: `1.5px solid ${primary}`, color: primary, textDecoration: "none", fontSize: "0.75rem", letterSpacing: "1.5px", borderRadius: "24px", fontWeight: 600 }}>Book Now</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div className="tr-anim" style={{ backgroundColor: `${accent}08`, border: `1px solid ${accent}22`, borderRadius: "20px", padding: "1.5rem 2rem", borderLeft: `4px solid ${accent}` }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, fontWeight: 600 }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.8, color: "#777" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" className="tr-anim" style={{ padding: "6rem 2rem", maxWidth: "750px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <WaveDivider color={primary} />
            <h2 style={{ fontSize: "2.4rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>Registry</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 400 }}>Gift Suggestions</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} className="tr-anim tr-card" style={{ backgroundColor: cardBg, border: `1px solid ${primary}12`, borderRadius: "20px", padding: "2.5rem", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>🎁</div>
                <h4 style={{ margin: "0 0 1.2rem", fontSize: "1.1rem", fontWeight: 700, color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" className="tr-btn" style={{ display: "inline-block", padding: "0.6rem 1.8rem", background: `linear-gradient(135deg, ${primary}, ${accent})`, color: "#fff", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", borderRadius: "28px", fontWeight: 600 }}>Visit Registry</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="tr-anim" style={{ padding: "6rem 2rem", maxWidth: "750px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <WaveDivider color={primary} />
            <h2 style={{ fontSize: "2.4rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>FAQ</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 400 }}>Common Questions</p>
          </div>
          <div style={{ borderTop: `1px solid ${primary}15` }}>
            {faq.map((item: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "1.3rem 0", backgroundColor: "transparent", border: "none",
                    borderBottom: `1px solid ${primary}15`, cursor: "pointer", fontFamily: "'Quicksand', sans-serif",
                    fontSize: "0.95rem", color: textColor, textAlign: "left", transition: "color 0.3s", fontWeight: 500,
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
                    <p style={{ padding: "0 0 1.3rem", margin: 0, fontSize: "0.9rem", color: "#888", lineHeight: 1.8 }}>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RSVP */}
        <section id="rsvp" className="tr-anim" style={{ padding: "6rem 2rem", maxWidth: "620px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <WaveDivider color={primary} />
            <h2 style={{ fontSize: "2.4rem", fontWeight: 700, color: primary, marginBottom: "0.5rem" }}>RSVP</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 400 }}>Join the Celebration</p>
          </div>
          {submitSuccess ? (
            <div className="tr-success-anim" style={{ textAlign: "center", padding: "3.5rem 2rem", backgroundColor: cardBg, border: `1px solid ${primary}15`, borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🌴</div>
              <h3 style={{ color: primary, fontSize: "1.5rem", margin: "0.8rem 0 0.5rem", fontWeight: 700 }}>Thank You!</h3>
              <p style={{ color: "#888", fontSize: "0.95rem" }}>Your response has been recorded. See you in paradise!</p>
            </div>
          ) : (
            <div style={{ backgroundColor: cardBg, border: `1px solid ${primary}12`, borderRadius: "20px", padding: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 600 }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.9rem 1.2rem", fontSize: "0.95rem", fontFamily: "'Quicksand', sans-serif", border: `1.5px solid ${accent}33`, backgroundColor: "#FAFAF8", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "14px", transition: "border-color 0.3s" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && !selectedGuest && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: `1px solid ${accent}33`, borderTop: "none", marginTop: "-1px", maxHeight: "220px", overflowY: "auto", zIndex: 10, boxShadow: "0 12px 40px rgba(0,0,0,0.1)", borderRadius: "0 0 14px 14px" }}>
                    {filteredGuests.map((guest: any) => (
                      <button key={guest.id} onClick={() => { onGuestSelect(guest); setSearchOpen(false); }} style={{ width: "100%", padding: "0.8rem 1.2rem", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}12`, cursor: "pointer", fontFamily: "'Quicksand', sans-serif", fontSize: "0.9rem", color: textColor, transition: "background-color 0.2s" }}>{guest.name}</button>
                    ))}
                  </div>
                )}
                {searchOpen && guestSearch && filteredGuests.length === 0 && !selectedGuest && guestSearch.length >= 2 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: `1px solid ${accent}33`, borderTop: "none", marginTop: "-1px", zIndex: 10, padding: "1.2rem", textAlign: "center", borderRadius: "0 0 14px 14px" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#999", fontFamily: "'Quicksand', sans-serif" }}>No guests found. Check the spelling or try a different name.</p>
                  </div>
                )}
              </div>
              {selectedGuest && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 600 }}>Will you attend?</label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[{ val: "yes", label: "Count me in!" }, { val: "no", label: "Can't make it" }, { val: "maybe", label: "Maybe" }].map((opt) => (
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{
                          padding: "0.6rem 1.5rem", fontSize: "0.8rem", fontFamily: "'Quicksand', sans-serif", letterSpacing: "1px",
                          borderRadius: "24px", border: `1.5px solid ${rsvpStatus === opt.val ? accent : `${accent}33`}`,
                          backgroundColor: rsvpStatus === opt.val ? accent : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor,
                          cursor: "pointer", transition: "all 0.3s", fontWeight: 600,
                        }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 600 }}>Dietary Preference</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.9rem 1.2rem", fontSize: "0.95rem", fontFamily: "'Quicksand', sans-serif", border: `1.5px solid ${accent}33`, backgroundColor: "#FAFAF8", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "14px" }}>
                      <option value="">Select...</option>
                      <option value="veg">Vegetarian</option>
                      <option value="nonveg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="jain">Jain</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 600 }}>Notes</label>
                    <textarea placeholder="Any special requests or messages..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.9rem 1.2rem", fontSize: "0.95rem", fontFamily: "'Quicksand', sans-serif", border: `1.5px solid ${accent}33`, backgroundColor: "#FAFAF8", color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box", borderRadius: "14px" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} className="tr-btn" style={{
                    width: "100%", padding: "1rem", fontSize: "0.85rem", fontFamily: "'Quicksand', sans-serif", letterSpacing: "3px",
                    textTransform: "uppercase", fontWeight: 700, borderRadius: "28px",
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

        {/* FOOTER */}
        <footer style={{ padding: "5rem 2rem 3rem", textAlign: "center", borderTop: `1px solid ${primary}15`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.02, backgroundImage: `repeating-conic-gradient(${primary} 0% 25%, transparent 0% 50%)`, backgroundSize: "24px 24px" }} />

          <WaveDivider color={primary} />

          {/* Floating Leaves in Footer */}
          <div style={{ position: "absolute", top: "20%", left: "10%", opacity: 0.06, animation: "tr-float 8s ease-in-out infinite" }}>
            <TropicalLeaf color={primary} size={30} rotation={-20} />
          </div>
          <div style={{ position: "absolute", top: "30%", right: "12%", opacity: 0.05, animation: "tr-float-alt 10s ease-in-out infinite 2s" }}>
            <TropicalLeaf color={accent} size={25} rotation={15} />
          </div>

          <div style={{ position: "relative" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, color: primary }}>
              {wedding.name || "Our Wedding"}
            </p>
            <p style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", color: "#aaa", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 300 }}>
              {formatDate(wedding.weddingDate)}
            </p>
            <div style={{ width: "60px", height: "2px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "0 auto 1.5rem", borderRadius: "1px" }} />
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#bbb" }}>Made with love</p>
            <p style={{ margin: 0, fontSize: "0.55rem", color: "#ddd", letterSpacing: "5px", fontWeight: 300 }}>SHAADISHEET</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
