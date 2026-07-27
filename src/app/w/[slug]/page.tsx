"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface WeddingData {
  id: string;
  slug: string;
  name: string;
  websiteTagline: string;
  weddingDate: string;
  weddingCity: string;
  events: {
    id: string;
    name: string;
    date: string;
    startTime: string;
    location: string;
    isRitual: boolean;
  }[];
  guests: {
    id: string;
    name: string;
    rsvp?: string;
    dietary?: string;
    notes?: string;
  }[];
  rsvpToken?: string;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function WeddingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<"Yes" | "No" | "Maybe" | null>(null);
  const [dietary, setDietary] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchWedding = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/website?slug=${slug}`);
        if (!res.ok) throw new Error("Wedding not found");
        const data = await res.json();
        setWedding(data.wedding);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load wedding");
      } finally {
        setLoading(false);
      }
    };

    fetchWedding();
  }, [slug]);

  useEffect(() => {
    if (!wedding?.weddingDate) return;

    const target = new Date(wedding.weddingDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [wedding?.weddingDate]);

  const filteredGuests =
    wedding?.guests?.filter((g) =>
      g.name.toLowerCase().includes(guestSearch.toLowerCase())
    ) ?? [];

  const handleRsvp = async () => {
    if (!selectedGuest || !rsvpStatus || !wedding?.rsvpToken) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: wedding.rsvpToken,
          guestId: selectedGuest,
          rsvp: rsvpStatus,
          dietary,
          notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit RSVP");
      setSubmitSuccess(true);
      setGuestSearch("");
      setSelectedGuest(null);
      setRsvpStatus(null);
      setDietary("");
      setNotes("");
    } catch {
      alert("Failed to submit RSVP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "#722F37", marginTop: 16 }}>Loading wedding details...</p>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div style={styles.center}>
        <h2 style={{ color: "#722F37", fontFamily: "Georgia, serif" }}>Oops!</h2>
        <p style={{ color: "#555" }}>{error || "Wedding not found"}</p>
      </div>
    );
  }

  const weddingDate = new Date(wedding.weddingDate);
  const pastWedding = weddingDate.getTime() < Date.now();

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.ornament}>✦ ✦ ✦</div>
        <h1 style={styles.coupleName}>{wedding.name}</h1>
        {wedding.websiteTagline && <p style={styles.tagline}>{wedding.websiteTagline}</p>}
        <p style={styles.weddingDate}>{formatDate(wedding.weddingDate)}</p>

        {!pastWedding && (
          <div style={styles.countdownRow}>
            {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
              <div key={unit} style={styles.countdownBox}>
                <span style={styles.countdownNumber}>{countdown[unit]}</span>
                <span style={styles.countdownLabel}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={styles.divider}>
        <span style={styles.dividerLine} />
        <span style={styles.dividerIcon}>♥</span>
        <span style={styles.dividerLine} />
      </div>

      {/* Events Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Events</h2>
        <div style={styles.eventsGrid}>
          {wedding.events.map((event) => (
            <div key={event.id} style={styles.eventCard}>
              {event.isRitual && <span style={styles.ritualBadge}>Ritual</span>}
              <h3 style={styles.eventName}>{event.name}</h3>
              <p style={styles.eventDetail}>📅 {formatDate(event.date)}</p>
              <p style={styles.eventDetail}>🕐 {formatTime(event.startTime)}</p>
              <p style={styles.eventDetail}>📍 {event.location || "Venue TBD"}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={styles.divider}>
        <span style={styles.dividerLine} />
        <span style={styles.dividerIcon}>✦</span>
        <span style={styles.dividerLine} />
      </div>

      {/* RSVP Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>RSVP</h2>

        {submitSuccess && (
          <div style={styles.successBanner}>
            Thank you! Your RSVP has been submitted successfully.
          </div>
        )}

        {!submitSuccess && (
          <div style={styles.rsvpForm}>
            {/* Search */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Find your name</label>
              <input
                type="text"
                placeholder="Type your name..."
                value={guestSearch}
                onChange={(e) => {
                  setGuestSearch(e.target.value);
                  setSelectedGuest(null);
                  setSubmitSuccess(false);
                }}
                style={styles.input}
              />
              {guestSearch && !selectedGuest && filteredGuests.length > 0 && (
                <div style={styles.suggestions}>
                  {filteredGuests.slice(0, 5).map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setSelectedGuest(g.id);
                        setGuestSearch(g.name);
                        setRsvpStatus(
                          g.rsvp === "Yes" || g.rsvp === "No" || g.rsvp === "Maybe"
                            ? g.rsvp
                            : null
                        );
                        setDietary(g.dietary || "");
                        setNotes(g.notes || "");
                      }}
                      style={styles.suggestionItem}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              )}
              {guestSearch && !selectedGuest && filteredGuests.length === 0 && (
                <p style={{ color: "#888", fontSize: 14, marginTop: 8 }}>
                  No guest found. Please check the spelling.
                </p>
              )}
            </div>

            {selectedGuest && (
              <>
                {/* Status */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Will you attend?</label>
                  <div style={styles.statusRow}>
                    {(["Yes", "No", "Maybe"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setRsvpStatus(s)}
                        style={{
                          ...styles.statusBtn,
                          ...(rsvpStatus === s ? styles.statusBtnActive : {}),
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Dietary restrictions (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetarian, Vegan, Gluten-free"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    style={styles.input}
                  />
                </div>

                {/* Notes */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Notes (optional)</label>
                  <textarea
                    placeholder="Any message for the couple..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ ...styles.input, minHeight: 80, resize: "vertical" }}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleRsvp}
                  disabled={!rsvpStatus || submitting}
                  style={{
                    ...styles.submitBtn,
                    opacity: !rsvpStatus || submitting ? 0.5 : 1,
                  }}
                >
                  {submitting ? "Submitting..." : "Submit RSVP"}
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerIcon}>♥</span>
          <span style={styles.dividerLine} />
        </div>
        <p style={{ color: "#722F37", fontFamily: "Georgia, serif", fontSize: 18 }}>
          Made with love
        </p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#FDF6EC",
    color: "#333",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF6EC",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #FDF6EC",
    borderTop: "4px solid #722F37",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  hero: {
    textAlign: "center",
    padding: "80px 24px 60px",
    background: "linear-gradient(180deg, #722F37 0%, #8B3A42 100%)",
    color: "#FDF6EC",
  },
  ornament: {
    fontSize: 24,
    color: "#D4AF37",
    letterSpacing: 8,
    marginBottom: 24,
  },
  coupleName: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "clamp(32px, 6vw, 56px)",
    fontWeight: 400,
    margin: 0,
    lineHeight: 1.2,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "clamp(16px, 3vw, 22px)",
    fontStyle: "italic",
    color: "#D4AF37",
    margin: "16px 0 0",
    fontWeight: 300,
  },
  weddingDate: {
    fontSize: 18,
    marginTop: 20,
    color: "#F5E6D0",
    letterSpacing: 1,
  },
  countdownRow: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginTop: 36,
    flexWrap: "wrap",
  },
  countdownBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 70,
  },
  countdownNumber: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 40,
    fontWeight: 700,
    color: "#D4AF37",
    lineHeight: 1,
  },
  countdownLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#F5E6D0",
    marginTop: 6,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "32px 24px",
  },
  dividerLine: {
    display: "inline-block",
    width: 60,
    height: 1,
    backgroundColor: "#D4AF37",
  },
  dividerIcon: {
    color: "#D4AF37",
    fontSize: 20,
  },
  section: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "0 24px 48px",
  },
  sectionTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 32,
    color: "#722F37",
    textAlign: "center",
    marginBottom: 32,
    fontWeight: 400,
  },
  eventsGrid: {
    display: "grid",
    gap: 20,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 28,
    boxShadow: "0 2px 12px rgba(114,47,55,0.08)",
    border: "1px solid rgba(212,175,55,0.2)",
    position: "relative",
  },
  ritualBadge: {
    display: "inline-block",
    backgroundColor: "#D4AF37",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1,
    padding: "4px 12px",
    borderRadius: 20,
    marginBottom: 12,
  },
  eventName: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 22,
    color: "#722F37",
    margin: "0 0 12px",
    fontWeight: 400,
  },
  eventDetail: {
    fontSize: 15,
    color: "#555",
    margin: "6px 0",
  },
  rsvpForm: {
    maxWidth: 480,
    margin: "0 auto",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#722F37",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 15,
    borderRadius: 8,
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  suggestions: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    marginTop: 4,
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  suggestionItem: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    textAlign: "left" as const,
    border: "none",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: 15,
    fontFamily: "inherit",
    color: "#333",
  },
  statusRow: {
    display: "flex",
    gap: 12,
  },
  statusBtn: {
    flex: 1,
    padding: "12px 0",
    border: "2px solid #D4AF37",
    borderRadius: 8,
    backgroundColor: "transparent",
    color: "#D4AF37",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  statusBtnActive: {
    backgroundColor: "#722F37",
    borderColor: "#722F37",
    color: "#FDF6EC",
  },
  submitBtn: {
    width: "100%",
    padding: "14px 0",
    backgroundColor: "#722F37",
    color: "#FDF6EC",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 8,
  },
  successBanner: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "16px 24px",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    border: "1px solid #c3e6cb",
  },
  footer: {
    textAlign: "center",
    padding: "0 24px 48px",
  },
};
