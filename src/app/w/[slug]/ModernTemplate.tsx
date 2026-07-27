"use client";

import { useState } from "react";

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

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function ModernTemplate({
  wedding,
  countdown,
  rsvpGuests,
  guestSearch,
  onRsvpSearch,
  onGuestSelect,
  selectedGuest,
  rsvpStatus,
  onRsvpStatusChange,
  dietary,
  onDietaryChange,
  notes,
  onNotesChange,
  onRsvpSubmit,
  submitting,
  submitSuccess,
}: TemplateProps) {
  const config = wedding.config || {};
  const theme = config.theme || {};
  const primary = theme.primary || "#1a1a2e";
  const accent = theme.accent || "#e94560";
  const background = theme.background || "#ffffff";
  const textColor = theme.text || "#1a1a2e";

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];

  const couplePhoto = config.couplePhoto || "";

  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", background, color: textColor, lineHeight: 1.6, margin: 0, padding: 0 }}>
      {/* HERO SECTION */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 60px",
          gap: "80px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 400px",
            maxWidth: "500px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {couplePhoto ? (
            <img
              src={couplePhoto}
              alt="Couple"
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "cover",
                borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "400px",
                borderRadius: "16px",
                background: `linear-gradient(135deg, ${primary}22, ${accent}22)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
              }}
            >
              💑
            </div>
          )}
        </div>
        <div style={{ flex: "1 1 400px", maxWidth: "600px" }}>
          <h1
            style={{
              fontSize: "clamp(3rem, 6vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              margin: "0 0 16px 0",
              letterSpacing: "-2px",
              color: primary,
            }}
          >
            {wedding.name || "Our Wedding"}
          </h1>
          <p
            style={{
              fontSize: "1.3rem",
              color: accent,
              fontWeight: 500,
              margin: "0 0 12px 0",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {wedding.weddingCity || "Celebration of Love"}
          </p>
          <p style={{ fontSize: "1.1rem", color: "#666", margin: "0 0 40px 0" }}>
            {wedding.weddingDate ? formatDate(wedding.weddingDate) : ""}
          </p>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {[
              { val: countdown.days, label: "Days" },
              { val: countdown.hours, label: "Hours" },
              { val: countdown.minutes, label: "Min" },
              { val: countdown.seconds, label: "Sec" },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "3.5rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: primary,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {String(item.val).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    color: "#999",
                    marginTop: "8px",
                  }}
                >
                  {item.label}
                </div>
                {i < 3 && (
                  <span
                    style={{
                      position: "absolute",
                      fontSize: "2.5rem",
                      fontWeight: 300,
                      color: "#ccc",
                    }}
                  >
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section style={{ padding: "100px 40px" }}>
        <h2
          style={{
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: accent,
            fontWeight: 600,
            margin: "0 0 12px 0",
            textAlign: "center",
          }}
        >
          Schedule
        </h2>
        <h3
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            margin: "0 0 60px 0",
            textAlign: "center",
            color: primary,
            letterSpacing: "-1px",
          }}
        >
          Wedding Events
        </h3>
        <div
          style={{
            display: "flex",
            gap: "28px",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            padding: "20px 0 40px 0",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {events.length > 0
            ? events.map((evt: any, i: number) => {
                const evtDate = evt.date ? new Date(evt.date) : new Date();
                return (
                  <div
                    key={i}
                    style={{
                      flex: "0 0 340px",
                      scrollSnapAlign: "start",
                      background: "#fafafa",
                      borderRadius: "16px",
                      padding: "40px 32px",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)";
                    }}
                  >
                    <div style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, color: primary }}>
                      {evtDate.getDate()}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                        color: accent,
                        fontWeight: 600,
                        marginBottom: "16px",
                      }}
                    >
                      {evtDate.toLocaleDateString("en-US", { month: "short" })}
                    </div>
                    <h4
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        margin: "0 0 12px 0",
                        color: primary,
                      }}
                    >
                      {evt.name || "Event"}
                    </h4>
                    <p style={{ fontSize: "0.95rem", color: "#666", margin: "0 0 8px 0" }}>
                      {evt.time || ""}
                    </p>
                    <p style={{ fontSize: "0.95rem", color: "#666", margin: "0 0 16px 0" }}>
                      {evt.location || ""}
                    </p>
                    {evt.dressCode && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 16px",
                          borderRadius: "100px",
                          background: `${accent}15`,
                          color: accent,
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                        }}
                      >
                        {evt.dressCode}
                      </span>
                    )}
                  </div>
                );
              })
            : [
                { name: "Mehendi", time: "10:00 AM", location: "Lawn Area", dressCode: "Casual" },
                { name: "Sangeet", time: "6:00 PM", location: "Grand Ballroom", dressCode: "Festive" },
                { name: "Wedding Ceremony", time: "7:00 PM", location: "Main Hall", dressCode: "Traditional" },
                { name: "Reception", time: "8:30 PM", location: "Banquet Hall", dressCode: "Formal" },
              ].map((evt, i) => (
                <div
                  key={i}
                  style={{
                    flex: "0 0 340px",
                    scrollSnapAlign: "start",
                    background: "#fafafa",
                    borderRadius: "16px",
                    padding: "40px 32px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)";
                  }}
                >
                  <div style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, color: primary }}>
                    {String(i + 14).padStart(2, "0")}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      color: accent,
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    {["Jan", "Feb", "Mar", "Apr"][i] || "TBD"}
                  </div>
                  <h4
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      margin: "0 0 12px 0",
                      color: primary,
                    }}
                  >
                    {evt.name}
                  </h4>
                  <p style={{ fontSize: "0.95rem", color: "#666", margin: "0 0 8px 0" }}>{evt.time}</p>
                  <p style={{ fontSize: "0.95rem", color: "#666", margin: "0 0 16px 0" }}>{evt.location}</p>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 16px",
                      borderRadius: "100px",
                      background: `${accent}15`,
                      color: accent,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {evt.dressCode}
                  </span>
                </div>
              ))}
        </div>
      </section>

      {/* OUR STORY SECTION */}
      <section
        style={{
          padding: "100px 60px",
          background: primary,
          color: "#ffffff",
        }}
      >
        <h2
          style={{
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: accent,
            fontWeight: 600,
            margin: "0 0 12px 0",
            textAlign: "center",
          }}
        >
          Our Journey
        </h2>
        <h3
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            margin: "0 0 60px 0",
            textAlign: "center",
            letterSpacing: "-1px",
          }}
        >
          Our Story
        </h3>

        {story.quote && (
          <blockquote
            style={{
              fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
              fontStyle: "italic",
              textAlign: "center",
              maxWidth: "800px",
              margin: "0 auto 60px auto",
              lineHeight: 1.6,
              fontWeight: 300,
              color: "rgba(255,255,255,0.9)",
              borderLeft: `3px solid ${accent}`,
              paddingLeft: "32px",
            }}
          >
            &ldquo;{story.quote}&rdquo;
          </blockquote>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "48px",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                margin: "0 0 16px 0",
                color: accent,
              }}
            >
              How We Met
            </h4>
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.8)",
                margin: 0,
              }}
            >
              {story.howWeMet || "Every great love story has a beautiful beginning. Ours started with a chance encounter that changed our lives forever."}
            </p>
          </div>
          <div>
            <h4
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                margin: "0 0 16px 0",
                color: accent,
              }}
            >
              The Proposal
            </h4>
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.8)",
                margin: 0,
              }}
            >
              {story.theProposal || "When you know, you know. The moment was perfect, and we said yes to a lifetime together."}
            </p>
          </div>
        </div>
      </section>

      {/* TRAVEL SECTION */}
      <section style={{ padding: "100px 60px" }}>
        <h2
          style={{
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: accent,
            fontWeight: 600,
            margin: "0 0 12px 0",
            textAlign: "center",
          }}
        >
          Getting There
        </h2>
        <h3
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            margin: "0 0 60px 0",
            textAlign: "center",
            color: primary,
            letterSpacing: "-1px",
          }}
        >
          Travel & Stay
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "32px",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {/* Venue */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: "16px",
              padding: "48px 40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <h4
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                margin: "0 0 20px 0",
                color: primary,
              }}
            >
              {travel.venue?.name || "Wedding Venue"}
            </h4>
            <p style={{ fontSize: "1rem", color: "#666", margin: "0 0 8px 0", lineHeight: 1.7 }}>
              {travel.venue?.address || "123 Celebration Avenue, Wedding City"}
            </p>
            {travel.venue?.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(travel.venue.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "24px",
                  padding: "12px 28px",
                  background: primary,
                  color: "#ffffff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = primary;
                }}
              >
                Get Directions →
              </a>
            )}
          </div>

          {/* Hotels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {(travel.hotels || [
              { name: "Hotel Grand Palace", price: "$150/night", link: "#" },
              { name: "Royal Inn", price: "$90/night", link: "#" },
              { name: "Comfort Suites", price: "$120/night", link: "#" },
            ]).map((hotel: any, i: number) => (
              <div
                key={i}
                style={{
                  background: "#fafafa",
                  borderRadius: "12px",
                  padding: "24px 28px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                }}
              >
                <div>
                  <h5 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0", color: primary }}>
                    {hotel.name}
                  </h5>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "100px",
                      background: `${accent}15`,
                      color: accent,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    {hotel.price}
                  </span>
                </div>
                {hotel.link && (
                  <a
                    href={hotel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: primary,
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = accent;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = primary;
                    }}
                  >
                    Book →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRY SECTION */}
      <section style={{ padding: "100px 60px", background: "#fafafa" }}>
        <h2
          style={{
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: accent,
            fontWeight: 600,
            margin: "0 0 12px 0",
            textAlign: "center",
          }}
        >
          Gift Registry
        </h2>
        <h3
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            margin: "0 0 60px 0",
            textAlign: "center",
            color: primary,
            letterSpacing: "-1px",
          }}
        >
          Registry
        </h3>
        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {(registry.length > 0
            ? registry
            : [
                { name: "Amazon", icon: "📦", link: "#" },
                { name: "Crate & Barrel", icon: "🏠", link: "#" },
                { name: "Honeymoon Fund", icon: "✈️", link: "#" },
              ]
          ).map((item: any, i: number) => (
            <a
              key={i}
              href={item.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "#ffffff",
                borderRadius: "12px",
                padding: "24px 32px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                textDecoration: "none",
                color: textColor,
                flex: "1 1 220px",
                maxWidth: "280px",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
              }}
            >
              <span style={{ fontSize: "2rem" }}>{item.icon || "🎁"}</span>
              <span style={{ fontSize: "1rem", fontWeight: 600, flex: 1 }}>{item.name}</span>
              <span
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: `${accent}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: accent,
                  fontSize: "0.9rem",
                  flexShrink: 0,
                }}
              >
                →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={{ padding: "100px 60px" }}>
        <h2
          style={{
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: accent,
            fontWeight: 600,
            margin: "0 0 12px 0",
            textAlign: "center",
          }}
        >
          Need to Know
        </h2>
        <h3
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            margin: "0 0 60px 0",
            textAlign: "center",
            color: primary,
            letterSpacing: "-1px",
          }}
        >
          Frequently Asked Questions
        </h3>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          {(faq.length > 0
            ? faq
            : [
                { question: "What is the dress code?", answer: "Traditional Indian attire is encouraged. For the ceremony, please wear modest clothing. The reception is semi-formal." },
                { question: "Are children welcome?", answer: "Yes, children are welcome at all events. We will have activities and care available." },
                { question: "How do I get to the venue?", answer: "Detailed directions and parking information will be provided closer to the date. Shuttle services are available from partner hotels." },
                { question: "Can I bring a plus-one?", answer: "Please check your invitation for details on additional guests. Contact us if you have any questions." },
              ]
          ).map((item: any, i: number) => (
            <div
              key={i}
              style={{
                borderBottom: "1px solid #eee",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "24px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: textColor,
                  fontFamily: "inherit",
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = textColor;
                }}
              >
                <span>{item.question}</span>
                <span
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 300,
                    color: "#999",
                    transition: "transform 0.3s",
                    transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                    display: "inline-block",
                  }}
                >
                  +
                </span>
              </button>
              <div
                style={{
                  maxHeight: openFaq === i ? "300px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease, padding 0.4s ease",
                  padding: openFaq === i ? "0 0 24px 0" : "0",
                }}
              >
                <p
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    color: "#666",
                    margin: 0,
                  }}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RSVP SECTION */}
      <section style={{ padding: "100px 60px", background: "#fafafa" }}>
        <h2
          style={{
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: accent,
            fontWeight: 600,
            margin: "0 0 12px 0",
            textAlign: "center",
          }}
        >
          Respond
        </h2>
        <h3
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            margin: "0 0 60px 0",
            textAlign: "center",
            color: primary,
            letterSpacing: "-1px",
          }}
        >
          RSVP
        </h3>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          {/* Search */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search your name..."
              value={guestSearch}
              onChange={(e) => onRsvpSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "16px 20px",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "1rem",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
                background: "#ffffff",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = accent;
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = "#e0e0e0";
              }}
            />
          </div>

          {/* Guest results */}
          {guestSearch && rsvpGuests.length > 0 && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                marginBottom: "20px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {rsvpGuests.map((guest: any, i: number) => (
                <button
                  key={i}
                  onClick={() => onGuestSelect(guest)}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    border: "none",
                    borderBottom: i < rsvpGuests.length - 1 ? "1px solid #f0f0f0" : "none",
                    background: selectedGuest?.id === guest.id ? `${accent}10` : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "0.95rem",
                    fontFamily: "inherit",
                    color: textColor,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = `${accent}10`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      selectedGuest?.id === guest.id ? `${accent}10` : "transparent";
                  }}
                >
                  {guest.name}
                </button>
              ))}
            </div>
          )}

          {/* Selected guest name */}
          {selectedGuest && (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px 20px",
                background: "#ffffff",
                borderRadius: "12px",
                border: `2px solid ${accent}`,
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "#999", display: "block", marginBottom: "4px" }}>
                Selected Guest
              </span>
              <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>{selectedGuest.name}</span>
            </div>
          )}

          {/* RSVP Status */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#999",
                marginBottom: "12px",
              }}
            >
              Will you attend?
            </label>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["attending", "maybe", "declined"].map((status) => (
                <button
                  key={status}
                  onClick={() => onRsvpStatusChange(status)}
                  style={{
                    padding: "14px 28px",
                    borderRadius: "100px",
                    border: `2px solid ${rsvpStatus === status ? accent : "#e0e0e0"}`,
                    background: rsvpStatus === status ? accent : "transparent",
                    color: rsvpStatus === status ? "#ffffff" : textColor,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.3s",
                    textTransform: "capitalize",
                    flex: "1 1 100px",
                  }}
                >
                  {status === "attending" ? "Yes, I'll be there" : status === "maybe" ? "Maybe" : "Can't make it"}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#999",
                marginBottom: "12px",
              }}
            >
              Dietary Requirements
            </label>
            <input
              type="text"
              placeholder="e.g. Vegetarian, Vegan, Nut allergy..."
              value={dietary}
              onChange={(e) => onDietaryChange(e.target.value)}
              style={{
                width: "100%",
                padding: "16px 20px",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "1rem",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
                background: "#ffffff",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = accent;
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = "#e0e0e0";
              }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#999",
                marginBottom: "12px",
              }}
            >
              Additional Notes
            </label>
            <textarea
              placeholder="Any messages for the couple..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "16px 20px",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "1rem",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
                transition: "border-color 0.3s",
                background: "#ffffff",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLTextAreaElement).style.borderColor = accent;
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLTextAreaElement).style.borderColor = "#e0e0e0";
              }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={onRsvpSubmit}
            disabled={submitting || submitSuccess}
            style={{
              width: "100%",
              padding: "18px",
              background: submitSuccess ? "#28a745" : accent,
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.05rem",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.5px",
              transition: "all 0.3s",
              opacity: submitting ? 0.7 : 1,
              transform: submitting ? "none" : undefined,
            }}
            onMouseEnter={(e) => {
              if (!submitting && !submitSuccess) {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${accent}66`;
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting && !submitSuccess) {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }
            }}
          >
            {submitSuccess ? "✓ Response Recorded!" : submitting ? "Submitting..." : "Submit RSVP"}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "60px 40px",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
          background: primary,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        <p
          style={{
            fontSize: "0.9rem",
            margin: 0,
            fontWeight: 400,
          }}
        >
          Made with ♥ using{" "}
          <span style={{ fontWeight: 700, color: accent }}>ShaadiSheet</span>
        </p>
      </footer>
    </div>
  );
}
