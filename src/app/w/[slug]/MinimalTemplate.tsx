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

function formatTime(val: number): string {
  return String(val).padStart(2, "0");
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

export default function MinimalTemplate({
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
  const primary = theme.primary || "#2c2c2c";
  const accent = theme.accent || "#b8860b";
  const background = theme.background || "#ffffff";
  const textColor = theme.text || "#2c2c2c";

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const events = config.events || [];
  const story = config.story || {};
  const travel = config.travel || {};
  const registry = config.registry || [];
  const faq = config.faq || [];

  const sharedFont = "'Cormorant Garamond', 'Georgia', serif";

  const thinLine: React.CSSProperties = {
    width: "100%",
    height: "1px",
    backgroundColor: primary,
    opacity: 0.15,
    border: "none",
  };

  const thinLineAccent: React.CSSProperties = {
    width: "60px",
    height: "1px",
    backgroundColor: accent,
    border: "none",
  };

  return (
    <div
      style={{
        fontFamily: sharedFont,
        backgroundColor: background,
        color: textColor,
        minHeight: "100vh",
        lineHeight: 1.8,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* ===== HERO ===== */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundImage: config.heroImage
            ? `url(${config.heroImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: accent,
              fontWeight: 300,
              marginBottom: 32,
              fontFamily: sharedFont,
            }}
          >
            Together with their families
          </p>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 200,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              lineHeight: 1.3,
              color: "#ffffff",
              marginBottom: 16,
              fontFamily: sharedFont,
            }}
          >
            {wedding.name || "Our Wedding"}
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              fontStyle: "italic",
              fontWeight: 300,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 48,
              fontFamily: sharedFont,
            }}
          >
            A celebration of love
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#ffffff",
              fontWeight: 300,
              marginBottom: 60,
              fontFamily: sharedFont,
            }}
          >
            {formatDate(wedding.weddingDate)}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 0,
            }}
          >
            {[
              { label: "Days", value: countdown.days },
              { label: "Hours", value: countdown.hours },
              { label: "Min", value: countdown.minutes },
              { label: "Sec", value: countdown.seconds },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                <div
                  style={{
                    padding: "0 28px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "clamp(2rem, 4vw, 3.5rem)",
                      fontWeight: 200,
                      color: "#ffffff",
                      lineHeight: 1,
                      fontFamily: sharedFont,
                    }}
                  >
                    {formatTime(item.value)}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 300,
                      fontFamily: sharedFont,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    style={{
                      width: "1px",
                      height: 60,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      alignSelf: "center",
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EVENTS ===== */}
      {events.length > 0 && (
        <section
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "120px 24px",
          }}
        >
          <h2
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 300,
              textAlign: "center",
              marginBottom: 64,
              color: primary,
              fontFamily: sharedFont,
            }}
          >
            Events
          </h2>
          {events.map((event: any, idx: number) => (
            <div key={idx}>
              <div style={{ ...thinLine, marginBottom: 0 }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  padding: "28px 0",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 300,
                    color: primary,
                    opacity: 0.6,
                    minWidth: 140,
                    fontFamily: sharedFont,
                  }}
                >
                  {event.date
                    ? new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </span>
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 300,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: primary,
                    textAlign: "center",
                    flex: 1,
                    fontFamily: sharedFont,
                  }}
                >
                  {event.name || event.title}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 300,
                    color: primary,
                    opacity: 0.6,
                    textAlign: "right",
                    minWidth: 140,
                    fontFamily: sharedFont,
                  }}
                >
                  {event.location || ""}
                </span>
              </div>
              {event.dressCode && (
                <p
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 300,
                    color: accent,
                    marginTop: -16,
                    marginBottom: 24,
                    textAlign: "center",
                    fontFamily: sharedFont,
                  }}
                >
                  {event.dressCode}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ===== OUR STORY ===== */}
      {(story.quote || story.howWeMet || story.theProposal) && (
        <section
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "120px 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 300,
              marginBottom: 48,
              color: primary,
              fontFamily: sharedFont,
            }}
          >
            Our Story
          </h2>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
            <div style={thinLineAccent} />
          </div>
          {story.quote && (
            <p
              style={{
                fontSize: "1.5rem",
                fontStyle: "italic",
                fontWeight: 300,
                lineHeight: 1.8,
                color: primary,
                marginBottom: 56,
                fontFamily: sharedFont,
              }}
            >
              &ldquo;{story.quote}&rdquo;
            </p>
          )}
          {story.howWeMet && (
            <div style={{ marginBottom: 48 }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  fontWeight: 300,
                  color: accent,
                  marginBottom: 20,
                  fontFamily: sharedFont,
                }}
              >
                How We Met
              </p>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 300,
                  lineHeight: 2,
                  color: primary,
                  opacity: 0.8,
                  fontFamily: sharedFont,
                }}
              >
                {story.howWeMet}
              </p>
            </div>
          )}
          {story.theProposal && (
            <div>
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  fontWeight: 300,
                  color: accent,
                  marginBottom: 20,
                  fontFamily: sharedFont,
                }}
              >
                The Proposal
              </p>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 300,
                  lineHeight: 2,
                  color: primary,
                  opacity: 0.8,
                  fontFamily: sharedFont,
                }}
              >
                {story.theProposal}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ===== TRAVEL ===== */}
      {((travel.venues && travel.venues.length > 0) ||
        (travel.hotels && travel.hotels.length > 0)) && (
        <section
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "120px 24px",
          }}
        >
          <h2
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 300,
              textAlign: "center",
              marginBottom: 64,
              color: primary,
              fontFamily: sharedFont,
            }}
          >
            Travel
          </h2>
          {travel.venues && travel.venues.length > 0 && (
            <div style={{ marginBottom: 56 }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  fontWeight: 300,
                  color: accent,
                  marginBottom: 28,
                  textAlign: "center",
                  fontFamily: sharedFont,
                }}
              >
                Venues
              </p>
              {travel.venues.map((venue: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${primary}`,
                    borderWidth: "1px 0 0 0",
                    borderColor: `${primary}11`,
                    padding: "28px 0",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: 300,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                      color: primary,
                      fontFamily: sharedFont,
                    }}
                  >
                    {venue.name}
                  </p>
                  {venue.address && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 300,
                        color: primary,
                        opacity: 0.6,
                        marginBottom: 12,
                        fontFamily: sharedFont,
                      }}
                    >
                      {venue.address}
                    </p>
                  )}
                  {venue.mapUrl && (
                    <a
                      href={venue.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: accent,
                        textDecoration: "none",
                        fontWeight: 300,
                        fontFamily: sharedFont,
                      }}
                    >
                      View Map &rarr;
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          {travel.hotels && travel.hotels.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  fontWeight: 300,
                  color: accent,
                  marginBottom: 28,
                  textAlign: "center",
                  fontFamily: sharedFont,
                }}
              >
                Accommodations
              </p>
              {travel.hotels.map((hotel: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    borderBottom: `1px solid ${primary}11`,
                    padding: "20px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 300,
                      color: primary,
                      fontFamily: sharedFont,
                    }}
                  >
                    {hotel.name}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    {hotel.price && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 300,
                          color: primary,
                          opacity: 0.5,
                          fontFamily: sharedFont,
                        }}
                      >
                        {hotel.price}
                      </span>
                    )}
                    {hotel.bookUrl && (
                      <a
                        href={hotel.bookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.7rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: accent,
                          textDecoration: "none",
                          fontWeight: 300,
                          fontFamily: sharedFont,
                        }}
                      >
                        Book &rarr;
                      </a>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== REGISTRY ===== */}
      {registry.length > 0 && (
        <section
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "120px 24px",
          }}
        >
          <h2
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 300,
              textAlign: "center",
              marginBottom: 64,
              color: primary,
              fontFamily: sharedFont,
            }}
          >
            Registry
          </h2>
          {registry.map((item: any, idx: number) => (
            <div
              key={idx}
              style={{
                borderBottom: `1px solid ${primary}11`,
                padding: "20px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 300,
                  color: primary,
                  fontFamily: sharedFont,
                }}
              >
                {item.name}
              </span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: accent,
                    textDecoration: "none",
                    fontWeight: 300,
                    fontFamily: sharedFont,
                  }}
                >
                  Visit &rarr;
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ===== FAQ ===== */}
      {faq.length > 0 && (
        <section
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "120px 24px",
          }}
        >
          <h2
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 300,
              textAlign: "center",
              marginBottom: 64,
              color: primary,
              fontFamily: sharedFont,
            }}
          >
            Frequently Asked Questions
          </h2>
          {faq.map((item: any, idx: number) => (
            <div key={idx} style={{ borderBottom: `1px solid ${primary}11` }}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "24px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 300,
                    letterSpacing: "0.05em",
                    color: primary,
                    fontFamily: sharedFont,
                  }}
                >
                  {item.question}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 200,
                    color: primary,
                    opacity: 0.4,
                    marginLeft: 16,
                    transition: "transform 0.3s",
                    transform: openFaq === idx ? "rotate(45deg)" : "rotate(0deg)",
                    fontFamily: sharedFont,
                  }}
                >
                  +
                </span>
              </button>
              {openFaq === idx && (
                <div
                  style={{
                    paddingBottom: 24,
                    maxWidth: 500,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 300,
                      lineHeight: 1.9,
                      color: primary,
                      opacity: 0.7,
                      fontFamily: sharedFont,
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ===== RSVP ===== */}
      <section
        style={{
          maxWidth: 520,
          margin: "0 auto",
          padding: "120px 24px",
        }}
      >
        <h2
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontWeight: 300,
            textAlign: "center",
            marginBottom: 64,
            color: primary,
            fontFamily: sharedFont,
          }}
        >
          RSVP
        </h2>
        {submitSuccess ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 300,
                letterSpacing: "0.1em",
                color: accent,
                fontFamily: sharedFont,
              }}
            >
              Thank you for your response.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 32 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 300,
                  color: primary,
                  opacity: 0.5,
                  marginBottom: 10,
                  fontFamily: sharedFont,
                }}
              >
                Search Your Name
              </label>
              <input
                type="text"
                value={guestSearch}
                onChange={(e) => onRsvpSearch(e.target.value)}
                placeholder="Type your name..."
                style={{
                  width: "100%",
                  padding: "14px 0",
                  border: "none",
                  borderBottom: `1px solid ${primary}22`,
                  backgroundColor: "transparent",
                  fontSize: "0.95rem",
                  fontWeight: 300,
                  color: primary,
                  outline: "none",
                  fontFamily: sharedFont,
                  letterSpacing: "0.05em",
                }}
              />
              {rsvpGuests.length > 0 && !selectedGuest && (
                <div
                  style={{
                    marginTop: 8,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {rsvpGuests.map((guest: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => onGuestSelect(guest)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px 0",
                        background: "none",
                        border: "none",
                        borderBottom: `1px solid ${primary}08`,
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "0.85rem",
                        fontWeight: 300,
                        color: primary,
                        fontFamily: sharedFont,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {guest.name}
                    </button>
                  ))}
                </div>
              )}
              {selectedGuest && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 300,
                    color: accent,
                    marginTop: 12,
                    letterSpacing: "0.1em",
                    fontFamily: sharedFont,
                  }}
                >
                  {selectedGuest.name} &mdash;{" "}
                  <button
                    onClick={() => onGuestSelect(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: primary,
                      opacity: 0.4,
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 300,
                      fontFamily: sharedFont,
                      padding: 0,
                    }}
                  >
                    change
                  </button>
                </p>
              )}
            </div>

            {selectedGuest && (
              <>
                <div style={{ marginBottom: 32 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontWeight: 300,
                      color: primary,
                      opacity: 0.5,
                      marginBottom: 14,
                      fontFamily: sharedFont,
                    }}
                  >
                    Will You Attend?
                  </label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {["Yes", "No", "Maybe"].map((status) => (
                      <button
                        key={status}
                        onClick={() => onRsvpStatusChange(status.toLowerCase())}
                        style={{
                          padding: "10px 28px",
                          border: `1px solid ${rsvpStatus === status.toLowerCase() ? accent : primary + "22"}`,
                          backgroundColor: "transparent",
                          color: rsvpStatus === status.toLowerCase() ? accent : primary,
                          fontSize: "0.7rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          fontWeight: 300,
                          cursor: "pointer",
                          borderRadius: 2,
                          fontFamily: sharedFont,
                          transition: "all 0.2s",
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontWeight: 300,
                      color: primary,
                      opacity: 0.5,
                      marginBottom: 10,
                      fontFamily: sharedFont,
                    }}
                  >
                    Dietary Requirements
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => onDietaryChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 0",
                      border: "none",
                      borderBottom: `1px solid ${primary}22`,
                      backgroundColor: "transparent",
                      fontSize: "0.85rem",
                      fontWeight: 300,
                      color: primary,
                      outline: "none",
                      fontFamily: sharedFont,
                      letterSpacing: "0.05em",
                      cursor: "pointer",
                      appearance: "none",
                    }}
                  >
                    <option value="">None</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="halal">Halal</option>
                    <option value="kosher">Kosher</option>
                    <option value="gluten-free">Gluten Free</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: 48 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontWeight: 300,
                      color: primary,
                      opacity: 0.5,
                      marginBottom: 10,
                      fontFamily: sharedFont,
                    }}
                  >
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Any messages for the couple..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "14px 0",
                      border: "none",
                      borderBottom: `1px solid ${primary}22`,
                      backgroundColor: "transparent",
                      fontSize: "0.85rem",
                      fontWeight: 300,
                      color: primary,
                      outline: "none",
                      fontFamily: sharedFont,
                      letterSpacing: "0.05em",
                      resize: "vertical",
                      lineHeight: 1.8,
                    }}
                  />
                </div>

                <button
                  onClick={onRsvpSubmit}
                  disabled={submitting || !rsvpStatus}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: `1px solid ${primary}22`,
                    backgroundColor: "transparent",
                    color: primary,
                    fontSize: "0.7rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    fontWeight: 300,
                    cursor: submitting || !rsvpStatus ? "default" : "pointer",
                    opacity: submitting || !rsvpStatus ? 0.3 : 1,
                    fontFamily: sharedFont,
                    transition: "opacity 0.2s",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit RSVP"}
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ ...thinLine, maxWidth: 600, margin: "0 auto 32px" }} />
        <p
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontWeight: 300,
            color: primary,
            opacity: 0.3,
            fontFamily: sharedFont,
            fontVariant: "small-caps",
          }}
        >
          ShaadiSheet
        </p>
      </footer>
    </div>
  );
}
