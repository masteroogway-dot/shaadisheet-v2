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

function MonogramCrest({ initials = "A&B", color = "#D4A574" }: { initials?: string; color?: string }) {
  const parts = initials.split("&").map(s => s.trim());
  const left = parts[0] || "A";
  const right = parts[1] || "B";
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" style={{ display: "block", margin: "0 auto" }}>
      <circle cx="100" cy="100" r="90" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <circle cx="100" cy="100" r="85" stroke={color} strokeWidth="1" opacity="0.4" />
      <circle cx="100" cy="100" r="80" stroke={color} strokeWidth="0.3" opacity="0.2" />
      {[0, 90, 180, 270].map((angle) => {
        const rad = angle * Math.PI / 180;
        const x = 100 + Math.cos(rad) * 82;
        const y = 100 + Math.sin(rad) * 82;
        return <circle key={angle} cx={x} cy={y} r="3" fill={color} opacity="0.3" />;
      })}
      <path d="M40,100 Q100,30 160,100" stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />
      <path d="M40,100 Q100,170 160,100" stroke={color} strokeWidth="0.5" fill="none" opacity="0.2" />
      <circle cx="100" cy="100" r="55" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      <text x={parts.length > 1 ? "72" : "100"} y="112" textAnchor="middle" fill={color} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="48" fontWeight="300" opacity="0.8">{left}</text>
      {parts.length > 1 && (
        <>
          <text x="100" y="98" textAnchor="middle" fill={color} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="20" fontWeight="300" fontStyle="italic" opacity="0.5">&amp;</text>
          <text x="128" y="112" textAnchor="middle" fill={color} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="48" fontWeight="300" opacity="0.8">{right}</text>
        </>
      )}
      <path d="M70,145 L100,155 L130,145" stroke={color} strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function OrnamentalFrame({ color = "#D4A574" }: { color?: string }) {
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

function WaveDivider({ color = "#FEFCF9", accent = "#D4A574", flip = false }: { color?: string; accent?: string; flip?: boolean }) {
  return (
    <div style={{ width: "100%", lineHeight: 0, marginTop: flip ? 0 : "-2px", marginBottom: flip ? "-2px" : 0, transform: flip ? "rotate(180deg)" : "none" }}>
      <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" style={{ width: "100%", height: "60px", display: "block" }}>
        <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,100 L0,100 Z" fill={color} />
        <path d="M0,45 C240,85 480,5 720,45 C960,85 1200,5 1440,45" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.3" />
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
  const primary = theme.primary || "#2C3E50";
  const accent = theme.accent || "#D4A574";
  const background = "#FEFCF9";
  const textColor = theme.primary || "#2C3E50";
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
  const initials = wedding.name ? wedding.name.split(/\s+&\s+|\s+and\s+/i).map((w: string) => w[0]).join("&").toUpperCase() : "A&B";
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
      document.querySelectorAll(".mo-anim").forEach((el) => observer.observe(el));
    }, 200);

    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(height > 0 ? (winScroll / height) * 100 : 0);
      setShowNav(window.scrollY > window.innerHeight * 0.75);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => { clearInterval(timer); clearTimeout(timer2); observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [introDone]);

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes mo-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
          @keyframes mo-kb { from{transform:scale(1)} to{transform:scale(1.15)} }
          @keyframes mo-crest-reveal { from{opacity:0;transform:scale(0.7) rotate(-8deg);filter:blur(8px)} to{opacity:1;transform:scale(1) rotate(0deg);filter:blur(0)} }
          @keyframes mo-fade-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
          @keyframes mo-scale-in { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
          @keyframes mo-glow { 0%,100%{box-shadow:0 0 15px rgba(212,165,116,0.06)} 50%{box-shadow:0 0 40px rgba(212,165,116,0.18)} }
          @keyframes mo-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
          @keyframes mo-particle { 0%{opacity:0;transform:translateY(0) scale(0)} 15%{opacity:1;transform:scale(1)} 85%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:translateY(-100vh) scale(0)} }
          @keyframes mo-pulse { 0%,100%{opacity:0.1;transform:scale(1)} 50%{opacity:0.25;transform:scale(1.06)} }
          @keyframes mo-hero-text { from{opacity:0;transform:translateY(30px) filter:blur(6px)} to{opacity:1;transform:translateY(0) filter:blur(0)} }
          @keyframes mo-line-grow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
          @keyframes mo-dot-pop { from{transform:scale(0)} 50%{transform:scale(1.3)} to{transform:scale(1)} }
          @keyframes mo-success { 0%{transform:scale(0.3) rotate(-10deg);opacity:0} 50%{transform:scale(1.08) rotate(2deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
          @keyframes mo-diamond-float { 0%,100%{transform:translateY(0) rotate(45deg)} 50%{transform:translateY(-14px) rotate(45deg)} }

          .mo-anim { opacity:0; transform:translateY(50px); transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1); }
          .mo-anim.vis { opacity:1; transform:translateY(0); }
          .mo-anim-d1 { transition-delay:0.1s !important; }
          .mo-anim-d2 { transition-delay:0.2s !important; }
          .mo-anim-d3 { transition-delay:0.3s !important; }

          .mo-card { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease, border-color 0.3s ease; }
          .mo-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(44,62,80,0.1), 0 0 20px rgba(212,165,116,0.06); border-color: rgba(212,165,116,0.35) !important; }

          .mo-btn { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); position:relative; overflow:hidden; }
          .mo-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow: 0 8px 25px rgba(212,165,116,0.25); }
          .mo-btn:active:not(:disabled) { transform:translateY(0); }

          .mo-success-anim { animation: mo-success 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

          .mo-timeline-node { animation: mo-dot-pop 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

          html { scroll-behavior: smooth; }
          * { scrollbar-width: thin; scrollbar-color: ${accent}44 transparent; }
          *::-webkit-scrollbar { width: 6px; }
          *::-webkit-scrollbar-track { background: transparent; }
          *::-webkit-scrollbar-thumb { background: ${accent}44; border-radius: 3px; }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", color: textColor, backgroundColor: background, lineHeight: 1.7, overflowX: "hidden" }}>

        {/* SCROLL PROGRESS BAR */}
        <div style={{ position: "fixed", top: 0, left: 0, height: "3px", background: `linear-gradient(90deg, ${primary}, ${accent}, ${primary})`, backgroundSize: "200% 100%", zIndex: 99999, width: `${scrollProgress}%`, transition: "width 0.15s ease-out", animation: "mo-shimmer 3s linear infinite" }} />

        {/* FLOATING NAVIGATION */}
        <nav style={{ position: "fixed", top: "16px", left: "50%", transform: `translateX(-50%) translateY(${showNav ? "0" : "-100px"})`, zIndex: 9999, backgroundColor: "rgba(254,252,249,0.92)", backdropFilter: "blur(20px) saturate(1.5)", border: `1px solid ${accent}33`, borderRadius: "60px", padding: "0.6rem 1.5rem", display: "flex", gap: "0.3rem", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 8px 32px rgba(44,62,80,0.08), 0 0 0 1px ${accent}11` }}>
          {[{ href: "#hero", label: "Home" }, { href: "#events", label: "Events" }, { href: "#story", label: "Story" }, { href: "#travel", label: "Travel" }, { href: "#registry", label: "Registry" }, { href: "#faq", label: "FAQ" }, { href: "#rsvp", label: "RSVP" }].map((item) => (
            <a key={item.href} href={item.href} style={{ color: `${textColor}88`, textDecoration: "none", fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", padding: "0.4rem 0.8rem", borderRadius: "40px", transition: "all 0.3s", fontWeight: 400 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = accent; e.currentTarget.style.backgroundColor = `${accent}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = `${textColor}88`; e.currentTarget.style.backgroundColor = "transparent"; }}
            >{item.label}</a>
          ))}
        </nav>

        {/* HERO */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          {/* Ken Burns Background */}
          <div style={{ position: "absolute", inset: "-15%", backgroundImage: config.photo ? `url(${config.photo})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.15) grayscale(0.3)", animation: "mo-kb 25s ease-in-out infinite alternate", willChange: "transform" }} />

          {/* Gradient Overlays */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${primary}CC 0%, transparent 30%, transparent 70%, ${primary}CC 100%)` }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${background}88 100%)` }} />

          {/* Floating Particles — diamond/circle shapes */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`p-${i}`} style={{
              position: "absolute",
              width: `${1.5 + (i % 4) * 1}px`,
              height: `${1.5 + (i % 4) * 1}px`,
              backgroundColor: i % 3 === 0 ? accent : "rgba(255,255,255,0.5)",
              borderRadius: i % 2 === 0 ? "50%" : "0",
              left: `${(i * 31 + 7) % 100}%`,
              bottom: "-5%",
              opacity: 0,
              animation: `mo-particle ${8 + (i % 6) * 3}s linear infinite`,
              animationDelay: `${(i * 0.8) % 12}s`,
              pointerEvents: "none",
              transform: i % 2 === 0 ? "none" : "rotate(45deg)",
            }} />
          ))}

          {/* Glow Orbs */}
          <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}10, transparent 70%)`, top: "5%", left: "-10%", animation: "mo-pulse 8s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "350px", height: "350px", borderRadius: "50%", background: `radial-gradient(circle, ${primary}15, transparent 70%)`, bottom: "10%", right: "-8%", animation: "mo-pulse 10s ease-in-out infinite 3s", pointerEvents: "none" }} />

          {/* Hero Content */}
          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            {/* Animated Monogram Crest */}
            <div style={{
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "scale(1) rotate(0deg)" : "scale(0.7) rotate(-8deg)",
              filter: heroLoaded ? "blur(0)" : "blur(8px)",
              transition: "all 1.4s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <MonogramCrest initials={initials} color={accent} />
            </div>

            {/* Tagline */}
            <p style={{
              fontSize: "0.75rem", letterSpacing: "8px", textTransform: "uppercase", color: accent, margin: "1.5rem 0 0.5rem", fontWeight: 300,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.3s",
            }}>
              {config.tagline || "Together Forever"}
            </p>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, margin: "0.5rem 0", color: "#fff", letterSpacing: "6px", textTransform: "uppercase",
              textShadow: `0 4px 40px ${primary}88, 0 0 80px ${primary}44`,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0) filter:blur(0)" : "translateY(30px) blur(6px)",
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
              fontSize: "0.95rem", color: "rgba(255,255,255,0.65)", letterSpacing: "5px", textTransform: "uppercase", marginBottom: "3rem", fontWeight: 300,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.9s",
            }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>

            {/* Animated Countdown */}
            <div style={{
              display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1.1s",
            }}>
              {[
                { val: displayCountdown.days, label: "Days" },
                { val: displayCountdown.hours, label: "Hours" },
                { val: displayCountdown.minutes, label: "Minutes" },
                { val: displayCountdown.seconds, label: "Seconds" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  border: `1px solid ${accent}33`, borderRadius: "4px", padding: "1.2rem 1.8rem", minWidth: "90px",
                  backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)",
                  animation: `mo-glow 4s ease-in-out infinite ${i * 0.6}s`,
                }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 300, color: accent, lineHeight: 1 }}>{item.val}</div>
                  <div style={{ fontSize: "0.55rem", letterSpacing: "4px", textTransform: "uppercase", marginTop: "0.4rem", color: "rgba(255,255,255,0.4)" }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Scroll Arrow */}
            <a href="#events" style={{
              color: accent, display: "inline-block",
              opacity: heroLoaded ? 1 : 0,
              transition: "opacity 1s ease 1.5s",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ animation: "mo-bounce 2.5s ease-in-out infinite" }}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
        </section>

        {/* EVENTS — Interactive Timeline */}
        <section id="events" className="mo-anim" style={{ padding: "6rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <OrnamentalFrame color={accent} />
            <h2 style={{ fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "0.5rem" }}>Wedding Events</h2>
            <p style={{ fontSize: "0.8rem", color: accent, marginBottom: "1rem", fontStyle: "italic" }}>Schedule of Celebrations</p>
            <div style={{ width: "60px", height: "1px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "0 auto" }} />
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", maxWidth: "750px", margin: "0 auto" }}>
            {/* Vertical Line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: `linear-gradient(180deg, transparent, ${accent}44, ${accent}44, transparent)`, transform: "translateX(-50%)" }} />

            {events.map((event: any, idx: number) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={event.id || idx} className={`mo-anim ${isLeft ? "" : "mo-anim-d1"}`} style={{
                  display: "flex", justifyContent: isLeft ? "flex-end" : "flex-start",
                  paddingLeft: isLeft ? 0 : "calc(50% + 40px)", paddingRight: isLeft ? "calc(50% + 40px)" : 0,
                  marginBottom: "3rem", position: "relative",
                }}>
                  {/* Timeline Node — ornamental */}
                  <div className="mo-timeline-node" style={{
                    position: "absolute", left: "50%", top: "24px", width: "14px", height: "14px",
                    backgroundColor: accent, border: `3px solid ${background}`, borderRadius: "50%",
                    transform: "translateX(-50%)", zIndex: 2,
                    boxShadow: `0 0 0 4px ${accent}22, 0 0 16px ${accent}33`,
                  }} />

                  {/* Event Card */}
                  <div className="mo-card" style={{
                    backgroundColor: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)",
                    border: `1px solid ${accent}22`, borderRadius: "6px", padding: "2rem",
                    maxWidth: "360px", width: "100%", position: "relative",
                    boxShadow: "0 4px 24px rgba(44,62,80,0.06)",
                  }}>
                    {/* Date Badge */}
                    <div style={{
                      position: "absolute", top: "-12px", left: isLeft ? "auto" : "20px", right: isLeft ? "20px" : "auto",
                      backgroundColor: primary, color: "#fff", padding: "4px 14px", borderRadius: "20px",
                      fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 500,
                    }}>
                      {formatDate(event.date)}
                    </div>

                    <h3 style={{ margin: "0.5rem 0 0.5rem", fontSize: "1.3rem", fontWeight: 400, letterSpacing: "2px", color: primary }}>{event.name}</h3>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "#888" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                    {event.location && <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#999" }}>{event.location}</p>}
                    {event.dressCode && (
                      <span style={{
                        display: "inline-block", fontSize: "0.6rem", letterSpacing: "1.5px", textTransform: "uppercase",
                        padding: "4px 12px", border: `1px solid ${accent}33`, color: accent, borderRadius: "20px", marginTop: "0.3rem",
                      }}>{event.dressCode}</span>
                    )}
                    {event.description && <p style={{ margin: "0.8rem 0 0", fontSize: "0.85rem", color: "#aaa", fontStyle: "italic", lineHeight: 1.6 }}>{event.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STORY with Wave Dividers */}
        <section id="story" className="mo-anim" style={{ padding: "6rem 2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <WaveDivider color={background} accent={accent} />
          <div style={{ padding: "2rem 0" }}>
            <OrnamentalFrame color={accent} />
            <h2 style={{ fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "2rem" }}>Our Story</h2>
            {story.quote && (
              <blockquote style={{
                fontSize: "1.4rem", fontStyle: "italic", color: accent, margin: "0 0 2.5rem", padding: "1.5rem 2rem",
                lineHeight: 1.8, borderLeft: `2px solid ${accent}44`, backgroundColor: `${accent}06`, borderRadius: "0 6px 6px 0",
              }}>
                &ldquo;{story.quote}&rdquo;
              </blockquote>
            )}
            {story.howWeMet && (
              <div className="mo-anim mo-anim-d1" style={{ marginBottom: "2.5rem", textAlign: "left" }}>
                <h3 style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 400 }}>How We Met</h3>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "#666" }}>{story.howWeMet}</p>
              </div>
            )}
            {story.proposal && (
              <div className="mo-anim mo-anim-d2" style={{ textAlign: "left" }}>
                <h3 style={{ fontSize: "0.75rem", letterSpacing: "5px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 400 }}>The Proposal</h3>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "#666" }}>{story.proposal}</p>
              </div>
            )}
          </div>
          <WaveDivider color={background} accent={accent} flip />
        </section>

        {/* TRAVEL */}
        <section id="travel" className="mo-anim" style={{ padding: "6rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <OrnamentalFrame color={accent} />
            <h2 style={{ fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "0.5rem" }}>Travel & Stay</h2>
            <p style={{ fontSize: "0.8rem", color: accent, fontStyle: "italic" }}>Accommodations</p>
          </div>
          {travel.venueName && (
            <div className="mo-anim mo-card" style={{ backgroundColor: "rgba(255,255,255,0.7)", border: `1px solid ${accent}22`, borderRadius: "6px", padding: "2.5rem", marginBottom: "2rem", textAlign: "center", boxShadow: "0 4px 24px rgba(44,62,80,0.06)" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 400, letterSpacing: "3px", color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.95rem", color: "#888", margin: "0 0 1.5rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" className="mo-btn" style={{ display: "inline-block", padding: "0.7rem 2rem", backgroundColor: primary, color: "#fff", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase" }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} className="mo-anim mo-card" style={{ backgroundColor: "rgba(255,255,255,0.7)", border: `1px solid ${accent}22`, borderRadius: "6px", padding: "2rem", boxShadow: "0 4px 24px rgba(44,62,80,0.06)" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 400, color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#888" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.8rem", fontSize: "0.8rem", color: accent }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" className="mo-btn" style={{ display: "inline-block", padding: "0.5rem 1.4rem", border: `1px solid ${primary}`, color: primary, textDecoration: "none", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>Book Now</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div className="mo-anim" style={{ backgroundColor: `${accent}05`, border: `1px solid ${accent}22`, borderRadius: "6px", padding: "1.5rem 2rem" }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.8, color: "#777" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" className="mo-anim" style={{ padding: "6rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <OrnamentalFrame color={accent} />
            <h2 style={{ fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "0.5rem" }}>Registry</h2>
            <p style={{ fontSize: "0.8rem", color: accent, fontStyle: "italic" }}>Gift Suggestions</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} className="mo-anim mo-card" style={{ backgroundColor: "rgba(255,255,255,0.7)", border: `1px solid ${accent}22`, borderRadius: "6px", padding: "2.5rem", textAlign: "center", boxShadow: "0 4px 24px rgba(44,62,80,0.06)" }}>
                <h4 style={{ margin: "0 0 1.2rem", fontSize: "1rem", fontWeight: 400, letterSpacing: "2px", color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" className="mo-btn" style={{ display: "inline-block", padding: "0.6rem 1.8rem", backgroundColor: primary, color: "#fff", textDecoration: "none", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>Visit Registry</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mo-anim" style={{ padding: "6rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <OrnamentalFrame color={accent} />
            <h2 style={{ fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "0.5rem" }}>FAQ</h2>
            <p style={{ fontSize: "0.8rem", color: accent, fontStyle: "italic" }}>Common Questions</p>
          </div>
          <div style={{ borderTop: `1px solid ${accent}22` }}>
            {faq.map((item: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "1.3rem 0", backgroundColor: "transparent", border: "none",
                    borderBottom: `1px solid ${accent}22`, cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.05rem", color: textColor, textAlign: "left", transition: "color 0.3s",
                  }}>
                    <span>{item.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)", flexShrink: 0, marginLeft: "1rem",
                    }}><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? "400px" : "0", overflow: "hidden",
                    transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1)",
                  }}>
                    <p style={{ padding: "0 0 1.3rem", margin: 0, fontSize: "0.95rem", color: "#888", lineHeight: 1.8 }}>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RSVP */}
        <section id="rsvp" className="mo-anim" style={{ padding: "6rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <OrnamentalFrame color={accent} />
            <h2 style={{ fontSize: "2rem", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: primary, marginBottom: "0.5rem" }}>RSVP</h2>
            <p style={{ fontSize: "0.8rem", color: accent, fontStyle: "italic" }}>Kindly Respond</p>
          </div>
          {submitSuccess ? (
            <div className="mo-success-anim" style={{ textAlign: "center", padding: "3.5rem 2rem", backgroundColor: "rgba(255,255,255,0.7)", border: `1px solid ${accent}22`, borderRadius: "6px", boxShadow: "0 4px 24px rgba(44,62,80,0.06)" }}>
              <MonogramCrest initials={initials} color={accent} />
              <h3 style={{ fontSize: "1.3rem", fontWeight: 300, letterSpacing: "3px", color: primary, margin: "1.2rem 0 0.5rem" }}>Thank You!</h3>
              <p style={{ color: "#888", fontSize: "0.95rem" }}>Your response has been recorded. We look forward to celebrating with you!</p>
            </div>
          ) : (
            <div style={{ backgroundColor: "rgba(255,255,255,0.7)", border: `1px solid ${accent}22`, borderRadius: "6px", padding: "2.5rem", boxShadow: "0 4px 24px rgba(44,62,80,0.06)" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Find Your Name</label>
                <input type="text" placeholder="Search for your name..." value={guestSearch} onChange={(e) => { onRsvpSearch(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} style={{ width: "100%", padding: "0.9rem 1.2rem", fontSize: "1rem", fontFamily: "'Cormorant Garamond', Georgia, serif", border: `1px solid ${accent}33`, backgroundColor: "transparent", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "4px", transition: "border-color 0.3s" }} />
                {searchOpen && guestSearch && filteredGuests.length > 0 && !selectedGuest && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: background, border: `1px solid ${accent}44`, borderTop: "none", marginTop: "-1px", maxHeight: "220px", overflowY: "auto", zIndex: 10, boxShadow: `0 12px 40px rgba(44,62,80,0.1)`, borderRadius: "0 0 4px 4px" }}>
                    {filteredGuests.map((guest: any) => (
                      <button key={guest.id} onClick={() => { onGuestSelect(guest); setSearchOpen(false); }} style={{ width: "100%", padding: "0.8rem 1.2rem", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${accent}15`, cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem", color: textColor, transition: "background-color 0.2s" }}>{guest.name}</button>
                    ))}
                  </div>
                )}
                {searchOpen && guestSearch && filteredGuests.length === 0 && !selectedGuest && guestSearch.length >= 2 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: background, border: `1px solid ${accent}44`, borderTop: "none", marginTop: "-1px", zIndex: 10, padding: "1.2rem", textAlign: "center", borderRadius: "0 0 4px 4px" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#999", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>No guests found. Check the spelling or try a different name.</p>
                  </div>
                )}
              </div>
              {selectedGuest && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Will you attend?</label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[{ val: "yes", label: "Joyfully Accept" }, { val: "no", label: "Regretfully Decline" }, { val: "maybe", label: "Maybe" }].map((opt) => (
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{
                          padding: "0.6rem 1.5rem", fontSize: "0.85rem", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "1px",
                          borderRadius: "4px", border: `1px solid ${rsvpStatus === opt.val ? primary : `${accent}33`}`,
                          backgroundColor: rsvpStatus === opt.val ? primary : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor,
                          cursor: "pointer", transition: "all 0.3s",
                        }}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem" }}>Dietary Preference</label>
                    <select value={dietary} onChange={(e) => onDietaryChange(e.target.value)} style={{ width: "100%", padding: "0.9rem 1.2rem", fontSize: "1rem", fontFamily: "'Cormorant Garamond', Georgia, serif", border: `1px solid ${accent}33`, backgroundColor: "transparent", color: textColor, outline: "none", boxSizing: "border-box", borderRadius: "4px" }}>
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
                    <textarea placeholder="Any special requests or messages..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={3} style={{ width: "100%", padding: "0.9rem 1.2rem", fontSize: "1rem", fontFamily: "'Cormorant Garamond', Georgia, serif", border: `1px solid ${accent}33`, backgroundColor: "transparent", color: textColor, outline: "none", resize: "vertical", boxSizing: "border-box", borderRadius: "4px" }} />
                  </div>
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} className="mo-btn" style={{
                    width: "100%", padding: "1rem", fontSize: "0.8rem", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "4px",
                    textTransform: "uppercase", borderRadius: "4px",
                    backgroundColor: !rsvpStatus || submitting ? `${accent}44` : primary,
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
        <footer style={{ padding: "5rem 2rem 3rem", textAlign: "center", borderTop: `1px solid ${accent}22`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.015, backgroundImage: `repeating-conic-gradient(${accent} 0% 25%, transparent 0% 50%)`, backgroundSize: "24px 24px" }} />
          <div style={{ position: "relative" }}>
            <OrnamentalFrame color={accent} />
            <MonogramCrest initials={initials} color={`${accent}88`} />
            <p style={{ margin: "1.5rem 0 0.5rem", fontSize: "1rem", color: accent, fontStyle: "italic" }}>
              Made with love
            </p>
            <p style={{ margin: 0, fontSize: "0.55rem", color: "#ccc", letterSpacing: "5px", fontWeight: 300 }}>SHAADISHEET</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
