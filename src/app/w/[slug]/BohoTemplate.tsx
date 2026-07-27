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

function WaveDivider({ color = "#FAF6F1", accent = "#C4A882", flip = false }: { color?: string; accent?: string; flip?: boolean }) {
  return (
    <div style={{ width: "100%", lineHeight: 0, marginTop: flip ? 0 : "-2px", marginBottom: flip ? "-2px" : 0, transform: flip ? "rotate(180deg)" : "none" }}>
      <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ width: "100%", height: "50px", display: "block" }}>
        <path d="M0,30 C360,70 720,0 1080,40 C1260,55 1380,20 1440,30 L1440,80 L0,80 Z" fill={color} />
        <path d="M0,32 C360,72 720,2 1080,42 C1260,57 1380,22 1440,32" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.25" />
      </svg>
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const filteredGuests = rsvpGuests.filter((g: any) => g.name?.toLowerCase().includes(guestSearch.toLowerCase()));

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
      document.querySelectorAll(".bo-anim").forEach((el) => observer.observe(el));
    }, 200);

    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(height > 0 ? (winScroll / height) * 100 : 0);
      setShowNav(window.scrollY > window.innerHeight * 0.75);

      const parallaxEl = document.getElementById("bo-hero-bg");
      if (parallaxEl) {
        const y = window.scrollY * 0.2;
        parallaxEl.style.transform = `translateY(${y}px) scale(1.08)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => { clearInterval(timer); clearTimeout(timer2); observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [countdown]);

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Josefin+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes bo-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
          @keyframes bo-kb { from{transform:scale(1)} to{transform:scale(1.12)} }
          @keyframes bo-leaf-particle {
            0%{opacity:0;transform:translateY(0) translateX(0) rotate(0deg) scale(0.5)}
            12%{opacity:0.6;transform:scale(1)}
            88%{opacity:0.6;transform:scale(1)}
            100%{opacity:0;transform:translateY(-100vh) translateX(30px) rotate(200deg) scale(0.5)}
          }
          @keyframes bo-pulse { 0%,100%{opacity:0.1;transform:scale(1)} 50%{opacity:0.25;transform:scale(1.06)} }
          @keyframes bo-fade-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
          @keyframes bo-hero-text { from{opacity:0;transform:translateY(25px) filter:blur(6px)} to{opacity:1;transform:translateY(0) filter:blur(0)} }
          @keyframes bo-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
          @keyframes bo-success { 0%{transform:scale(0.4) rotate(-8deg);opacity:0} 55%{transform:scale(1.06) rotate(1deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
          @keyframes bo-line-grow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
          @keyframes bo-dot-pop { from{transform:scale(0)} 50%{transform:scale(1.3)} to{transform:scale(1)} }

          .bo-anim { opacity:0; transform:translateY(40px); transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1); }
          .bo-anim.vis { opacity:1; transform:translateY(0); }
          .bo-anim-d1 { transition-delay:0.12s !important; }
          .bo-anim-d2 { transition-delay:0.24s !important; }
          .bo-anim-d3 { transition-delay:0.36s !important; }

          .bo-card { transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease; }
          .bo-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(139,111,71,0.1); }

          .bo-btn { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); position:relative; overflow:hidden; }
          .bo-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow: 0 8px 24px rgba(139,111,71,0.15); }
          .bo-btn:active:not(:disabled) { transform:translateY(0); }

          .bo-success-anim { animation: bo-success 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }

          .bo-timeline-node { animation: bo-dot-pop 0.45s cubic-bezier(0.16,1,0.3,1) forwards; }

          html { scroll-behavior: smooth; }
          * { scrollbar-width: thin; scrollbar-color: ${accent}44 transparent; }
          *::-webkit-scrollbar { width: 5px; }
          *::-webkit-scrollbar-track { background: transparent; }
          *::-webkit-scrollbar-thumb { background: ${accent}44; border-radius: 3px; }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Josefin Sans', sans-serif", color: textColor, backgroundColor: background, lineHeight: 1.8, overflowX: "hidden" }}>

        {/* SCROLL PROGRESS BAR */}
        <div style={{ position: "fixed", top: 0, left: 0, height: "2px", background: `linear-gradient(90deg, ${primary}, ${accent}, ${primary})`, backgroundSize: "200% 100%", zIndex: 99999, width: `${scrollProgress}%`, transition: "width 0.15s ease-out", animation: "bo-shimmer 3s linear infinite" }} />

        {/* FLOATING NAVIGATION */}
        <nav style={{ position: "fixed", top: "16px", left: "50%", transform: `translateX(-50%) translateY(${showNav ? "0" : "-100px"})`, zIndex: 9999, backgroundColor: `${background}f0`, backdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${accent}30`, padding: "0.55rem 1.4rem", display: "flex", gap: "0.25rem", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 8px 32px rgba(139,111,71,0.08), 0 0 0 1px ${accent}10` }}>
          {[{ href: "#hero", label: "Home" }, { href: "#events", label: "Events" }, { href: "#story", label: "Story" }, { href: "#travel", label: "Travel" }, { href: "#registry", label: "Registry" }, { href: "#faq", label: "FAQ" }, { href: "#rsvp", label: "RSVP" }].map((item) => (
            <a key={item.href} href={item.href} style={{ color: "#999", textDecoration: "none", fontSize: "0.7rem", letterSpacing: "1.5px", textTransform: "uppercase", padding: "0.35rem 0.7rem", transition: "all 0.3s", fontWeight: 400 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = primary; e.currentTarget.style.backgroundColor = `${accent}12`; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >{item.label}</a>
          ))}
        </nav>

        {/* HERO */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          {/* Ken Burns Background */}
          <div id="bo-hero-bg" style={{ position: "absolute", inset: "-12%", backgroundImage: config.photo ? `url(${config.photo})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.45) saturate(0.8) sepia(0.15)", animation: "bo-kb 25s ease-in-out infinite alternate", willChange: "transform" }} />

          {/* Gradient Overlays */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${background}88 0%, transparent 30%, transparent 70%, ${background}88 100%)` }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${background}66 100%)` }} />

          {/* Floating Dried Leaf Particles */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={`p-${i}`} style={{
              position: "absolute",
              left: `${(i * 37 + 5) % 100}%`,
              bottom: "-5%",
              opacity: 0,
              pointerEvents: "none",
              animation: `bo-leaf-particle ${10 + (i % 5) * 3}s linear infinite`,
              animationDelay: `${(i * 1.2) % 14}s`,
            }}>
              <svg width={10 + (i % 4) * 3} height={14 + (i % 4) * 4} viewBox="0 0 16 22" fill="none">
                <path d="M8 0 C8 0 0 8 4 16 C6 20 8 22 8 22 C8 22 10 20 12 16 C16 8 8 0 8 0Z" fill={i % 3 === 0 ? accent : primary} opacity="0.35" />
                <path d="M8 4 L8 18" stroke={accent} strokeWidth="0.4" opacity="0.3" />
              </svg>
            </div>
          ))}

          {/* Glow Orbs */}
          <div style={{ position: "absolute", width: "320px", height: "320px", borderRadius: "50%", background: `radial-gradient(circle, ${accent}10, transparent 70%)`, top: "8%", left: "-8%", animation: "bo-pulse 8s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: `radial-gradient(circle, ${primary}10, transparent 70%)`, bottom: "12%", right: "-6%", animation: "bo-pulse 10s ease-in-out infinite 3s", pointerEvents: "none" }} />

          {/* Hero Content */}
          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            {/* Dried Flower ornament */}
            <div style={{
              display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1rem",
              opacity: heroLoaded ? 0.5 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.1s",
            }}>
              <DriedFlower color={accent} />
              <DriedFlower color={accent} flip />
            </div>

            {/* Tagline */}
            <p style={{
              fontSize: "0.8rem", letterSpacing: "6px", textTransform: "uppercase", color: accent, marginBottom: "0.5rem", fontWeight: 300,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.3s",
            }}>
              {config.tagline || "Together Forever"}
            </p>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontFamily: "'Lora', serif", fontWeight: 400, fontStyle: "italic", margin: "0.5rem 0", color: primary, lineHeight: 1.2,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0) filter:blur(0)" : "translateY(25px) blur(6px)",
              transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s",
            }}>
              {wedding.name || "Our Wedding"}
            </h1>

            {/* Decorative Line */}
            <div style={{
              width: "50px", height: "1px", backgroundColor: accent, margin: "1.5rem auto",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "scaleX(1)" : "scaleX(0)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.7s",
            }} />

            {/* Date */}
            <p style={{
              fontSize: "0.9rem", color: textColor, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "2.5rem", fontWeight: 300,
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.9s",
            }}>
              {formatDate(wedding.weddingDate)}{wedding.weddingCity ? ` · ${wedding.weddingCity}` : ""}
            </p>

            {/* Countdown */}
            <div style={{
              display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3.5rem",
              opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(25px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1.1s",
            }}>
              {[
                { val: animCountdown.days, label: "Days" },
                { val: animCountdown.hours, label: "Hours" },
                { val: animCountdown.minutes, label: "Minutes" },
                { val: animCountdown.seconds, label: "Seconds" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  padding: "1rem 1.5rem", minWidth: "80px", border: `1px solid ${accent}44`,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  backgroundColor: `${background}88`, backdropFilter: "blur(4px)",
                  animation: `bo-pulse 3s ease-in-out infinite ${i * 0.5}s`,
                }}>
                  <div style={{ fontSize: "2rem", fontFamily: "'Lora', serif", fontWeight: 400, color: primary, lineHeight: 1 }}>{item.val}</div>
                  <div style={{ fontSize: "0.55rem", letterSpacing: "2px", textTransform: "uppercase", marginTop: "0.3rem", color: accent, fontWeight: 300 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Scroll Arrow */}
            <a href="#events" style={{
              color: accent, display: "inline-block",
              opacity: heroLoaded ? 1 : 0,
              transition: "opacity 1s ease 1.5s",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ animation: "bo-bounce 2.5s ease-in-out infinite" }}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
        </section>

        {/* EVENTS — Interactive Timeline */}
        <section id="events" className="bo-anim" style={{ padding: "5rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <BotanicalDivider color={accent} />
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "0.5rem" }}>Wedding Events</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "1rem", fontWeight: 300 }}>Our Celebrations</p>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", maxWidth: "750px", margin: "0 auto" }}>
            {/* Vertical Line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: `linear-gradient(180deg, transparent, ${accent}44, ${accent}44, transparent)`, transform: "translateX(-50%)" }} />

            {events.map((event: any, idx: number) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={event.id || idx} className={`bo-anim ${isLeft ? "" : "bo-anim-d1"}`} style={{
                  display: "flex", justifyContent: isLeft ? "flex-end" : "flex-start",
                  paddingLeft: isLeft ? 0 : "calc(50% + 36px)", paddingRight: isLeft ? "calc(50% + 36px)" : 0,
                  marginBottom: "2.5rem", position: "relative",
                }}>
                  {/* Timeline Node */}
                  <div className="bo-timeline-node" style={{
                    position: "absolute", left: "50%", top: "20px", width: "10px", height: "10px",
                    backgroundColor: accent, border: `2px solid ${background}`,
                    transform: "translateX(-50%)", zIndex: 2,
                    boxShadow: `0 0 0 3px ${accent}20, 0 0 12px ${accent}20`,
                  }} />

                  {/* Event Card */}
                  <div className="bo-card" style={{
                    backgroundColor: background, border: `1px solid ${accent}20`,
                    padding: "1.8rem", maxWidth: "340px", width: "100%", position: "relative",
                  }}>
                    {/* Date Badge */}
                    <div style={{
                      position: "absolute", top: "-10px", left: isLeft ? "auto" : "18px", right: isLeft ? "18px" : "auto",
                      backgroundColor: primary, color: "#fff", padding: "3px 12px",
                      fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 400,
                    }}>
                      {formatDate(event.date)}
                    </div>

                    <h3 style={{ margin: "0.4rem 0 0.4rem", fontSize: "1.2rem", fontFamily: "'Lora', serif", color: primary }}>{event.name}</h3>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.8rem", color: "#999" }}>{formatTime(event.startTime)}{event.duration ? ` · ${event.duration}` : ""}</p>
                    {event.location && <p style={{ margin: "0 0 0.4rem", fontSize: "0.8rem", color: "#aaa" }}>{event.location}</p>}
                    {event.dressCode && (
                      <span style={{
                        display: "inline-block", fontSize: "0.55rem", letterSpacing: "1.5px", textTransform: "uppercase",
                        padding: "3px 10px", border: `1px solid ${accent}33`, color: accent, marginTop: "0.3rem", fontWeight: 300,
                      }}>{event.dressCode}</span>
                    )}
                    {event.description && <p style={{ margin: "0.6rem 0 0", fontSize: "0.8rem", color: "#aaa", fontStyle: "italic", lineHeight: 1.6 }}>{event.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STORY */}
        <section id="story" className="bo-anim" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <WaveDivider color={background} accent={accent} />
          <div style={{ padding: "2rem 0" }}>
            <BotanicalDivider color={accent} />
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "2rem" }}>Our Story</h2>
            {story.quote && (
              <blockquote style={{
                fontFamily: "'Lora', serif", fontSize: "1.2rem", fontStyle: "italic", color: primary, margin: "0 0 2rem", padding: "1.5rem",
                lineHeight: 1.8, borderLeft: `2px solid ${accent}`, backgroundColor: `${accent}08`,
              }}>
                &ldquo;{story.quote}&rdquo;
              </blockquote>
            )}
            {story.howWeMet && (
              <div className="bo-anim bo-anim-d1" style={{ marginBottom: "2rem", textAlign: "left" }}>
                <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", fontWeight: 300 }}>How We Met</h3>
                <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#666" }}>{story.howWeMet}</p>
              </div>
            )}
            {story.proposal && (
              <div className="bo-anim bo-anim-d2" style={{ textAlign: "left" }}>
                <h3 style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", fontWeight: 300 }}>The Proposal</h3>
                <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#666" }}>{story.proposal}</p>
              </div>
            )}
          </div>
          <WaveDivider color={background} accent={accent} flip />
        </section>

        {/* TRAVEL */}
        <section id="travel" className="bo-anim" style={{ padding: "5rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <BotanicalDivider color={accent} />
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "0.5rem" }}>Travel & Stay</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, fontWeight: 300 }}>Accommodations</p>
          </div>
          {travel.venueName && (
            <div className="bo-anim bo-card" style={{ backgroundColor: background, border: `1px solid ${accent}20`, padding: "2rem", marginBottom: "2rem", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: "1.3rem", color: primary, margin: "0 0 0.5rem" }}>{travel.venueName}</h3>
              {travel.venueAddress && <p style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 1rem" }}>{travel.venueAddress}</p>}
              {travel.mapsUrl && <a href={travel.mapsUrl} target="_blank" rel="noopener noreferrer" className="bo-btn" style={{ display: "inline-block", padding: "0.5rem 1.5rem", border: `1px solid ${primary}`, color: primary, textDecoration: "none", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 300 }}>View on Map</a>}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div key={idx} className="bo-anim bo-card" style={{ backgroundColor: background, border: `1px solid ${accent}20`, padding: "1.5rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontFamily: "'Lora', serif", fontSize: "1rem", color: primary }}>{hotel.name}</h4>
                  {hotel.price && <p style={{ margin: "0 0 0.3rem", fontSize: "0.85rem", color: "#888" }}>{hotel.price}</p>}
                  {hotel.groupCode && <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: accent }}>Group Code: {hotel.groupCode}</p>}
                  {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" className="bo-btn" style={{ display: "inline-block", padding: "0.4rem 1rem", border: `1px solid ${accent}44`, color: accent, textDecoration: "none", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 300 }}>Book</a>}
                </div>
              ))}
            </div>
          )}
          {travel.tips && (
            <div className="bo-anim" style={{ backgroundColor: `${accent}06`, borderLeft: `2px solid ${accent}`, padding: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, fontWeight: 300 }}>Travel Tips</h4>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, color: "#777" }}>{travel.tips}</p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section id="registry" className="bo-anim" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <BotanicalDivider color={accent} />
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "0.5rem" }}>Registry</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {registry.map((reg: any, idx: number) => (
              <div key={idx} className="bo-anim bo-card" style={{ backgroundColor: background, border: `1px solid ${accent}20`, padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>🎁</div>
                <h4 style={{ margin: "0 0 1rem", fontFamily: "'Lora', serif", fontSize: "1rem", color: primary }}>{reg.name}</h4>
                {reg.url && <a href={reg.url} target="_blank" rel="noopener noreferrer" className="bo-btn" style={{ display: "inline-block", padding: "0.5rem 1.5rem", border: `1px solid ${primary}`, color: primary, textDecoration: "none", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 300 }}>Visit</a>}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bo-anim" style={{ padding: "5rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <BotanicalDivider color={accent} />
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "0.5rem" }}>FAQ</h2>
          </div>
          <div style={{ borderTop: `1px solid ${accent}20` }}>
            {faq.map((item: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "1.2rem 0", backgroundColor: "transparent", border: "none",
                    borderBottom: `1px solid ${accent}20`, cursor: "pointer", fontFamily: "'Lora', serif",
                    fontSize: "0.95rem", color: textColor, textAlign: "left", transition: "color 0.3s",
                  }}>
                    <span>{item.q}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)", flexShrink: 0, marginLeft: "1rem",
                    }}><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? "400px" : "0", overflow: "hidden",
                    transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1)",
                  }}>
                    <p style={{ padding: "0 0 1.2rem", margin: 0, fontSize: "0.9rem", color: "#888", lineHeight: 1.7 }}>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RSVP */}
        <section id="rsvp" className="bo-anim" style={{ padding: "5rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <BotanicalDivider color={accent} />
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: primary, marginBottom: "0.5rem" }}>RSVP</h2>
            <p style={{ fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase", color: accent, fontWeight: 300 }}>Kindly Respond</p>
          </div>
          {submitSuccess ? (
            <div className="bo-success-anim" style={{ textAlign: "center", padding: "3rem", backgroundColor: background, border: `1px solid ${accent}20` }}>
              <DriedFlower color={accent} />
              <h3 style={{ fontFamily: "'Lora', serif", color: primary, fontSize: "1.3rem", margin: "1rem 0 0.5rem", fontStyle: "italic" }}>Thank You!</h3>
              <p style={{ color: "#888", fontSize: "0.9rem" }}>Your response has been recorded.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: background, border: `1px solid ${accent}20`, padding: "2rem" }}>
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
                        <button key={opt.val} onClick={() => onRsvpStatusChange(opt.val)} style={{
                          padding: "0.5rem 1.2rem", fontSize: "0.78rem", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, letterSpacing: "1px",
                          border: `1px solid ${rsvpStatus === opt.val ? primary : `${accent}33`}`,
                          backgroundColor: rsvpStatus === opt.val ? primary : "transparent", color: rsvpStatus === opt.val ? "#fff" : textColor,
                          cursor: "pointer", transition: "all 0.3s", borderRadius: "0",
                        }}>{opt.label}</button>
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
                  <button onClick={onRsvpSubmit} disabled={!rsvpStatus || submitting} className="bo-btn" style={{
                    width: "100%", padding: "0.8rem", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 500, letterSpacing: "3px",
                    textTransform: "uppercase", border: `1px solid ${primary}`,
                    backgroundColor: !rsvpStatus || submitting ? "transparent" : primary,
                    color: !rsvpStatus || submitting ? primary : "#fff",
                    cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer", borderRadius: "0",
                  }}>
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "5rem 2rem 3rem", textAlign: "center", borderTop: `1px solid ${accent}20`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "200px", height: "1px", background: `linear-gradient(90deg, transparent, ${accent}44, transparent)` }} />
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1.5rem", opacity: 0.35 }}>
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
