"use client";

import { useState, useEffect } from "react";
import { getRsvpToken } from "@/lib/actions";

interface Props {
  guest: any;
  wedding: any;
  weddingId: string;
  onClose: () => void;
}

export default function WhatsAppInvite({ guest, wedding, weddingId, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [rsvpLink, setRsvpLink] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = await getRsvpToken(weddingId);
        setRsvpLink(`${window.location.origin}/rsvp/${token}`);
      } catch {}
    })();
  }, [weddingId]);

  const weddingDate = wedding.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "date TBD";

  const weddingCity = wedding.weddingCity || "venue TBD";
  const events = (wedding.events || []).map((e: any) => e.name).filter(Boolean);
  const eventList = events.length > 0 ? events.join(", ") : "multiple celebrations";
  const side = guest.side === "Bride" ? "bride's" : guest.side === "Groom" ? "groom's" : "";
  const name = guest.name || "there";
  const relation = guest.relation || "";

  // Build message - clean, WhatsApp-friendly, with RSVP link
  let greeting = "";
  let body = "";

  if (relation.toLowerCase().includes("parent") || relation.toLowerCase().includes("mother") || relation.toLowerCase().includes("father")) {
    greeting = `Dear ${name}`;
    body = `With hearts full of joy, we invite you to celebrate the wedding of your ${side} ${relation?.toLowerCase().includes("mother") ? "son/daughter" : "son/daughter"}.

The celebrations begin on ${weddingDate} in ${weddingCity}.

Your presence would mean the world to us.`;
  } else if (relation.toLowerCase().includes("friend")) {
    greeting = `Hey ${name}`;
    body = `You're officially invited to my wedding!

When: ${weddingDate}
Where: ${weddingCity}
Events: ${eventList}

Would love to have you there!`;
  } else if (relation.toLowerCase().includes("colleague") || relation.toLowerCase().includes("work")) {
    greeting = `Hi ${name}`;
    body = `I'm happy to invite you to my wedding celebrations on ${weddingDate} in ${weddingCity}.

Events: ${eventList}

It would be wonderful to have you join us.`;
  } else {
    greeting = `Dear ${name}`;
    body = `With great joy, we invite you to the wedding celebrations.

Date: ${weddingDate}
Location: ${weddingCity}
Events: ${eventList}

Your blessings and presence would make this occasion truly special.`;
  }

  // Full message with RSVP link at the end
  const fullMessage = `${greeting}

${body}

Please RSVP here:
${rsvpLink}

Looking forward to celebrating with you!`;

  // WhatsApp-safe message (newlines as \n, not encoded)
  const waMessage = fullMessage;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = fullMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const phone = guest.contact?.replace(/\D/g, "") || "";
    // WhatsApp wa.me API: use encodeURIComponent for the text, WhatsApp handles newlines
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <i className="fab fa-whatsapp text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">WhatsApp Invitation</h3>
              <p className="text-xs text-gray-500">For {guest.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Message preview */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-[#DCF8C6] rounded-xl p-4 mb-4 border border-green-200">
            <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">{fullMessage}</div>
          </div>

          {guest.contact && (
            <p className="text-xs text-gray-500 mb-2">
              <i className="fas fa-phone mr-1" />
              Sending to: {guest.contact}
            </p>
          )}
          {rsvpLink && (
            <p className="text-xs text-gray-400">
              <i className="fas fa-link mr-1" />
              RSVP link included in message
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <i className={`fas ${copied ? "fa-check text-green" : "fa-copy"}`} />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors cursor-pointer"
          >
            <i className="fab fa-whatsapp text-lg" />
            Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
