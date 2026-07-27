"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import FloralTemplate from "./FloralTemplate";
import RoyalIndianTemplate from "./RoyalIndianTemplate";
import EditorialTemplate from "./EditorialTemplate";
import BohoTemplate from "./BohoTemplate";
import MonogramTemplate from "./MonogramTemplate";
import TropicalTemplate from "./TropicalTemplate";

export default function WeddingWebsitePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvpGuests, setRsvpGuests] = useState<any[]>([]);
  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [dietary, setDietary] = useState("Veg");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/website?slug=${slug}`)
      .then((res) => { if (!res.ok) throw new Error("Wedding not found"); return res.json(); })
      .then((data) => { setWedding(data.wedding); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!wedding?.weddingDate) return;
    const target = new Date(wedding.weddingDate).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
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

  const handleRsvpSearch = (val: string) => {
    setGuestSearch(val);
    setSelectedGuest(null);
    setRsvpStatus(null);
    if (val.length < 2) { setRsvpGuests([]); return; }
    fetch(`/api/rsvp?token=${wedding.rsvpToken || ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.wedding?.guests) {
          setRsvpGuests(data.wedding.guests.filter((g: any) =>
            g.name.toLowerCase().includes(val.toLowerCase())
          ));
        }
      });
  };

  const handleGuestSelect = (guest: any) => {
    setSelectedGuest(guest);
    setGuestSearch(guest.name);
    setRsvpStatus(
      guest.rsvp === "Yes" || guest.rsvp === "No" || guest.rsvp === "Maybe"
        ? guest.rsvp : null
    );
    setRsvpGuests([]);
  };

  const handleRsvpSubmit = async () => {
    if (!selectedGuest || !rsvpStatus) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: wedding.rsvpToken,
          guestId: selectedGuest.id,
          rsvp: rsvpStatus,
          dietary,
          notes,
        }),
      });
      if (res.ok) setSubmitSuccess(true);
    } catch {}
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FDF6EC" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #722F37", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: "#722F37", opacity: 0.6, fontFamily: "Georgia, serif" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FDF6EC" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#10084;</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 8, fontFamily: "Georgia, serif" }}>Wedding Not Found</h1>
          <p style={{ color: "#888" }}>{error || "This wedding link is invalid."}</p>
        </div>
      </div>
    );
  }

  const template = wedding.config?.template || "classic";

  const templateProps = {
    wedding,
    countdown,
    rsvpGuests,
    guestSearch,
    onRsvpSearch: handleRsvpSearch,
    onGuestSelect: handleGuestSelect,
    selectedGuest,
    rsvpStatus,
    onRsvpStatusChange: setRsvpStatus,
    dietary,
    onDietaryChange: setDietary,
    notes,
    onNotesChange: setNotes,
    onRsvpSubmit: handleRsvpSubmit,
    submitting,
    submitSuccess,
  };

  if (template === "modern") return <ModernTemplate {...templateProps} />;
  if (template === "minimal") return <MinimalTemplate {...templateProps} />;
  if (template === "floral") return <FloralTemplate {...templateProps} />;
  if (template === "royal") return <RoyalIndianTemplate {...templateProps} />;
  if (template === "editorial") return <EditorialTemplate {...templateProps} />;
  if (template === "boho") return <BohoTemplate {...templateProps} />;
  if (template === "monogram") return <MonogramTemplate {...templateProps} />;
  if (template === "tropical") return <TropicalTemplate {...templateProps} />;
  return <ClassicTemplate {...templateProps} />;
}
