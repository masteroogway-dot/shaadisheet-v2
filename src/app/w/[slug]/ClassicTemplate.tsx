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
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function OrnamentalDivider({ color = "#D4AF37" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "2rem 0" }}>
      <svg width="200" height="30" viewBox="0 0 200 30" fill="none">
        <path d="M0 15 H70" stroke={color} strokeWidth="1" />
        <path d="M130 15 H200" stroke={color} strokeWidth="1" />
        <circle cx="80" cy="15" r="3" fill={color} />
        <circle cx="100" cy="15" r="5" fill={color} />
        <circle cx="120" cy="15" r="3" fill={color} />
        <path d="M85 8 L100 2 L115 8" stroke={color} strokeWidth="1" fill="none" />
        <path d="M85 22 L100 28 L115 22" stroke={color} strokeWidth="1" fill="none" />
        <path d="M88 5 Q100 -2 112 5" stroke={color} strokeWidth="0.8" fill="none" />
        <path d="M88 25 Q100 32 112 25" stroke={color} strokeWidth="0.8" fill="none" />
      </svg>
    </div>
  );
}

export default function ClassicTemplate({
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
  const primary = theme.primary || "#722F37";
  const accent = theme.accent || "#D4AF37";
  const background = theme.background || "#FDF6EC";
  const textColor = theme.text || "#333333";
  const story = config.story || {};
  const events = config.events || [];
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredGuests = rsvpGuests.filter((g: any) =>
    g.name?.toLowerCase().includes(guestSearch.toLowerCase())
  );

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: textColor,
          backgroundColor: background,
          lineHeight: 1.7,
        }}
      >
        {/* HERO SECTION */}
        <section
          id="hero"
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: config.photo ? `url(${config.photo})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: config.photo ? "transparent" : primary,
              filter: "brightness(0.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: config.photo
                ? "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)"
                : "linear-gradient(135deg, rgba(114,47,55,0.85) 0%, rgba(114,47,55,0.95) 100%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
            <p
              style={{
                fontSize: "0.9rem",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: accent,
                marginBottom: "0.5rem",
              }}
            >
              {config.tagline || "Together Forever"}
            </p>
            <h1
              style={{
                fontSize: "clamp(2.5rem, 7vw, 5rem)",
                fontWeight: 400,
                margin: "0.5rem 0",
                letterSpacing: "3px",
                lineHeight: 1.2,
              }}
            >
              {wedding.name || "Our Wedding"}
            </h1>
            <div
              style={{
                width: "60px",
                height: "2px",
                backgroundColor: accent,
                margin: "1.5rem auto",
              }}
            />
            <p
              style={{
                fontSize: "1.15rem",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: "2rem",
              }}
            >
              {formatDate(wedding.weddingDate)}
              {wedding.weddingCity ? ` • ${wedding.weddingCity}` : ""}
            </p>
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: "3rem",
              }}
            >
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hours, label: "Hours" },
                { val: countdown.minutes, label: "Minutes" },
                { val: countdown.seconds, label: "Seconds" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    backgroundColor: "rgba(212,175,55,0.15)",
                    border: `1px solid ${accent}`,
                    borderRadius: "8px",
                    padding: "1rem 1.5rem",
                    minWidth: "80px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: accent,
                      lineHeight: 1,
                    }}
                  >
                    {item.val}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      marginTop: "0.3rem",
                      opacity: 0.8,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            <a
              href="#events"
              style={{ color: accent, textDecoration: "none" }}
              aria-label="Scroll down"
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ animation: "bounce 2s infinite" }}
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
        </section>

        {/* EVENTS TIMELINE */}
        <section
          id="events"
          style={{
            padding: "5rem 2rem",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <OrnamentalDivider color={accent} />
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.2rem",
              fontWeight: 400,
              color: primary,
              marginBottom: "0.5rem",
            }}
          >
            Wedding Events
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: accent,
              marginBottom: "3rem",
            }}
          >
            Schedule of Celebrations
          </p>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: accent,
                transform: "translateX(-50%)",
              }}
            />
            {events.map((event: any, idx: number) => {
              const isLeft = idx % 2 === 0;
              return (
                <div
                  key={event.id || idx}
                  style={{
                    display: "flex",
                    justifyContent: isLeft ? "flex-end" : "flex-start",
                    paddingLeft: isLeft ? 0 : "calc(50% + 30px)",
                    paddingRight: isLeft ? "calc(50% + 30px)" : 0,
                    marginBottom: "3rem",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "20px",
                      width: "14px",
                      height: "14px",
                      backgroundColor: event.isRitual ? primary : accent,
                      border: `3px solid ${background}`,
                      borderRadius: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 1,
                    }}
                  />
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: `1px solid ${event.isRitual ? primary : "rgba(212,175,55,0.3)"}`,
                      borderLeft: event.isRitual ? `4px solid ${primary}` : undefined,
                      borderRight: !isLeft && event.isRitual ? `4px solid ${primary}` : undefined,
                      borderRadius: "8px",
                      padding: "1.5rem",
                      maxWidth: "350px",
                      width: "100%",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: accent,
                        marginBottom: "0.3rem",
                      }}
                    >
                      {formatDate(event.date)}
                    </div>
                    <h3
                      style={{
                        margin: "0 0 0.5rem",
                        fontSize: "1.3rem",
                        color: event.isRitual ? primary : textColor,
                      }}
                    >
                      {event.name}
                    </h3>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#666" }}>
                      {formatTime(event.startTime)}
                      {event.duration ? ` • ${event.duration}` : ""}
                    </p>
                    {event.location && (
                      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#666" }}>
                        📍 {event.location}
                      </p>
                    )}
                    {event.dressCode && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "0.7rem",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          backgroundColor: "rgba(212,175,55,0.12)",
                          color: accent,
                          marginBottom: "0.5rem",
                        }}
                      >
                        {event.dressCode}
                      </span>
                    )}
                    {event.description && (
                      <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#888" }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* OUR STORY */}
        <section
          id="story"
          style={{
            padding: "5rem 2rem",
            maxWidth: "700px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <OrnamentalDivider color={accent} />
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: 400,
              color: primary,
              marginBottom: "2rem",
            }}
          >
            Our Story
          </h2>
          {story.quote && (
            <blockquote
              style={{
                fontSize: "1.3rem",
                fontStyle: "italic",
                color: primary,
                margin: "0 0 2rem",
                padding: "0 1rem",
                lineHeight: 1.8,
              }}
            >
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          )}
          {story.howWeMet && (
            <div style={{ marginBottom: "2rem", textAlign: "left" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: accent,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "0.8rem",
                }}
              >
                How We Met
              </h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#555" }}>
                {story.howWeMet}
              </p>
            </div>
          )}
          {story.proposal && (
            <div style={{ textAlign: "left" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: accent,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "0.8rem",
                }}
              >
                The Proposal
              </h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#555" }}>
                {story.proposal}
              </p>
            </div>
          )}
        </section>

        {/* TRAVEL & STAY */}
        <section
          id="travel"
          style={{
            padding: "5rem 2rem",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <OrnamentalDivider color={accent} />
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.2rem",
              fontWeight: 400,
              color: primary,
              marginBottom: "0.5rem",
            }}
          >
            Travel & Stay
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: accent,
              marginBottom: "3rem",
            }}
          >
            Accommodations
          </p>

          {travel.venueName && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid rgba(212,175,55,0.3)`,
                borderRadius: "8px",
                padding: "2rem",
                marginBottom: "2rem",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "1.4rem",
                  color: primary,
                  margin: "0 0 0.5rem",
                }}
              >
                {travel.venueName}
              </h3>
              {travel.venueAddress && (
                <p style={{ fontSize: "0.95rem", color: "#666", margin: "0 0 1rem" }}>
                  {travel.venueAddress}
                </p>
              )}
              {travel.mapsUrl && (
                <a
                  href={travel.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "0.6rem 1.8rem",
                    backgroundColor: primary,
                    color: "#FFFFFF",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    letterSpacing: "1px",
                    transition: "opacity 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  View on Map
                </a>
              )}
            </div>
          )}

          {travel.hotels && travel.hotels.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              {travel.hotels.map((hotel: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: "8px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", color: primary }}>
                    {hotel.name}
                  </h4>
                  {hotel.price && (
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#666" }}>
                      {hotel.price}
                    </p>
                  )}
                  {hotel.groupCode && (
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: accent }}>
                      Group Code: {hotel.groupCode}
                    </p>
                  )}
                  {hotel.link && (
                    <a
                      href={hotel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "0.5rem 1.2rem",
                        backgroundColor: "rgba(212,175,55,0.12)",
                        color: primary,
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        letterSpacing: "1px",
                        transition: "background-color 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.25)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.12)")
                      }
                    >
                      Book Now
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {travel.tips && (
            <div
              style={{
                backgroundColor: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: "8px",
                padding: "1.5rem",
              }}
            >
              <h4
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1rem",
                  color: primary,
                }}
              >
                Travel Tips
              </h4>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, color: "#555" }}>
                {travel.tips}
              </p>
            </div>
          )}
        </section>

        {/* REGISTRY */}
        <section
          id="registry"
          style={{
            padding: "5rem 2rem",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <OrnamentalDivider color={accent} />
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.2rem",
              fontWeight: 400,
              color: primary,
              marginBottom: "3rem",
            }}
          >
            Registry
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {registry.map((reg: any, idx: number) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: "8px",
                  padding: "2rem",
                  textAlign: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎁</div>
                <h4
                  style={{
                    margin: "0 0 1rem",
                    fontSize: "1rem",
                    color: primary,
                  }}
                >
                  {reg.name}
                </h4>
                {reg.url && (
                  <a
                    href={reg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "0.5rem 1.5rem",
                      backgroundColor: primary,
                      color: "#FFFFFF",
                      textDecoration: "none",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      letterSpacing: "1px",
                      transition: "opacity 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Visit Registry
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          style={{
            padding: "5rem 2rem",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <OrnamentalDivider color={accent} />
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.2rem",
              fontWeight: 400,
              color: primary,
              marginBottom: "3rem",
            }}
          >
            Frequently Asked Questions
          </h2>
          <div
            style={{
              borderTop: `1px solid rgba(212,175,55,0.3)`,
            }}
          >
            {faq.map((item: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1.2rem 0",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: `1px solid rgba(212,175,55,0.3)`,
                      cursor: "pointer",
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: "1rem",
                      color: textColor,
                      textAlign: "left",
                    }}
                  >
                    <span>{item.q}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={accent}
                      strokeWidth="2"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s",
                        flexShrink: 0,
                        marginLeft: "1rem",
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div
                    style={{
                      maxHeight: isOpen ? "300px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.4s ease",
                    }}
                  >
                    <p
                      style={{
                        padding: "0 0 1.2rem",
                        margin: 0,
                        fontSize: "0.95rem",
                        color: "#666",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RSVP */}
        <section
          id="rsvp"
          style={{
            padding: "5rem 2rem",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <OrnamentalDivider color={accent} />
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.2rem",
              fontWeight: 400,
              color: primary,
              marginBottom: "0.5rem",
            }}
          >
            RSVP
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: accent,
              marginBottom: "2.5rem",
            }}
          >
            Kindly Respond
          </p>

          {submitSuccess ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                backgroundColor: "#FFFFFF",
                border: `1px solid ${accent}`,
                borderRadius: "8px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
              <h3 style={{ color: primary, fontSize: "1.3rem", margin: "0 0 0.5rem" }}>
                Thank You!
              </h3>
              <p style={{ color: "#666", fontSize: "0.95rem" }}>
                Your response has been recorded. We look forward to celebrating with you!
              </p>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: "8px",
                padding: "2rem",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              {/* Guest Search */}
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: accent,
                    marginBottom: "0.5rem",
                  }}
                >
                  Find Your Name
                </label>
                <input
                  type="text"
                  placeholder="Search for your name..."
                  value={guestSearch}
                  onChange={(e) => {
                    onRsvpSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem",
                    fontSize: "1rem",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: "6px",
                    backgroundColor: "#FAFAF5",
                    color: textColor,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {searchOpen && guestSearch && filteredGuests.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "#FFFFFF",
                      border: "1px solid rgba(212,175,55,0.3)",
                      borderRadius: "6px",
                      marginTop: "4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    {filteredGuests.map((guest: any) => (
                      <button
                        key={guest.id}
                        onClick={() => {
                          onGuestSelect(guest);
                          onRsvpSearch(guest.name);
                          setSearchOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "0.7rem 1rem",
                          textAlign: "left",
                          backgroundColor: "transparent",
                          border: "none",
                          borderBottom: "1px solid rgba(212,175,55,0.1)",
                          cursor: "pointer",
                          fontFamily: "Georgia, 'Times New Roman', serif",
                          fontSize: "0.95rem",
                          color: textColor,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        {guest.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedGuest && (
                <>
                  {/* RSVP Status */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: accent,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Will you attend?
                    </label>
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                      {[
                        { val: "yes", label: "Joyfully Accept" },
                        { val: "no", label: "Regretfully Decline" },
                        { val: "maybe", label: "Maybe" },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => onRsvpStatusChange(opt.val)}
                          style={{
                            padding: "0.6rem 1.4rem",
                            fontSize: "0.85rem",
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            borderRadius: "24px",
                            border: `1.5px solid ${rsvpStatus === opt.val ? primary : "rgba(212,175,55,0.3)"}`,
                            backgroundColor:
                              rsvpStatus === opt.val ? primary : "transparent",
                            color: rsvpStatus === opt.val ? "#FFFFFF" : textColor,
                            cursor: "pointer",
                            transition: "all 0.3s",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: accent,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Dietary Preference
                    </label>
                    <select
                      value={dietary}
                      onChange={(e) => onDietaryChange(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.8rem 1rem",
                        fontSize: "1rem",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        border: "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "6px",
                        backgroundColor: "#FAFAF5",
                        color: textColor,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="veg">Vegetarian</option>
                      <option value="nonveg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="jain">Jain</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: accent,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Notes
                    </label>
                    <textarea
                      placeholder="Any special requests or messages..."
                      value={notes}
                      onChange={(e) => onNotesChange(e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "0.8rem 1rem",
                        fontSize: "1rem",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        border: "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "6px",
                        backgroundColor: "#FAFAF5",
                        color: textColor,
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={onRsvpSubmit}
                    disabled={!rsvpStatus || submitting}
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      fontSize: "1rem",
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      backgroundColor:
                        !rsvpStatus || submitting ? "rgba(212,175,55,0.4)" : primary,
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      cursor: !rsvpStatus || submitting ? "not-allowed" : "pointer",
                      transition: "opacity 0.3s",
                    }}
                  >
                    {submitting ? "Submitting..." : "Send RSVP"}
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            borderTop: `1px solid rgba(212,175,55,0.2)`,
          }}
        >
          <OrnamentalDivider color={accent} />
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#999" }}>
            Made with love
          </p>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "#CCC", letterSpacing: "2px" }}>
            SHAADISHEET
          </p>
        </footer>
      </body>
    </html>
  );
}
