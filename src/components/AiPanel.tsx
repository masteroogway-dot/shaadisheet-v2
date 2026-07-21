"use client";

import { useState, useRef, useEffect } from "react";
import { addAiMessage, getAiMessages } from "@/lib/actions";

const BUDGET_RANGES: Record<string, number> = {
  under10: 800000, "10to30": 2000000, "30to50": 4000000, "50to1cr": 7500000, above1cr: 15000000,
};

function formatINR(n: number) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + " L";
  if (n >= 1000) return (n / 1000).toFixed(1) + " K";
  return n.toString();
}

function generateResponse(query: string, wedding: any): string {
  const q = query.toLowerCase();
  const totalBudget = BUDGET_RANGES[wedding.budget] || 4000000;
  const totalGuests = wedding.guestCount === "small" ? 80 : wedding.guestCount === "medium" ? 200 : wedding.guestCount === "large" ? 400 : 600;

  if (q.includes("budget") || q.includes("cost") || q.includes("spend") || q.includes("money")) {
    const spent = wedding.budgetItems?.reduce((s: number, i: any) => s + (i.paid || 0), 0) || 0;
    return `Your total budget is ₹${formatINR(totalBudget)}. You've spent ₹${formatINR(spent)} so far, with ₹${formatINR(totalBudget - spent)} remaining.\n\nYour biggest expense is Venue & Decor at 30% (₹${formatINR(Math.round(totalBudget * 0.3))}).`;
  }

  if (q.includes("guest") || q.includes("rsvp") || q.includes("invite")) {
    const rsvpYes = wedding.guests?.filter((g: any) => g.rsvp === "Yes").length || 0;
    return `You have ${totalGuests} total guests. ${rsvpYes} have confirmed so far. For ${totalGuests} guests, you'll need approximately ${Math.ceil(totalGuests / 8)} tables.`;
  }

  if (q.includes("vendor") || q.includes("book")) {
    const booked = wedding.vendors?.filter((v: any) => v.contract === "Signed").length || 0;
    const total = wedding.vendors?.length || 0;
    return `You've booked ${booked} out of ${total} vendors. Priority: Book venue & caterer 9-12 months ahead, photographer 6-9 months, decorator 3-6 months.`;
  }

  if (q.includes("ritual") || q.includes("ceremony")) {
    const religion = wedding.religion || "hindu";
    const rituals: Record<string, string> = {
      hindu: "Roka → Engagement → Mehendi → Sangeet → Haldi → Wedding (Baraat, Jaimala, Kanyadaan, Pheras) → Reception",
      muslim: "Mangni → Mehendi → Nikah (signing Nikahnama) → Walima",
      sikh: "Kurmai → Mehendi → Sangeet → Chooda → Anand Karaj (4 Lavaan) → Langar → Reception",
      christian: "Engagement → Roce → Church Wedding (vows, rings) → Reception",
    };
    return `For a ${religion} wedding, the key rituals are:\n\n${rituals[religion] || rituals.hindu}`;
  }

  if (q.includes("food") || q.includes("menu")) {
    const perPlate = Math.round((totalBudget * 0.25) / totalGuests);
    return `With a catering budget of ₹${formatINR(Math.round(totalBudget * 0.25))} for ${totalGuests} guests:\n\nPer plate: ~₹${perPlate.toLocaleString("en-IN")}\nRecommended: Mix of veg + non-veg options.`;
  }

  return `I can help with your ${wedding.religion || "Hindu"} wedding! Try asking about:\n• Budget breakdown\n• Guest RSVP status\n• Vendor bookings\n• Ritual explanations\n• Day-of timeline`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  wedding: any;
  onUpdate: () => void;
}

export default function AiPanel({ open, onClose, wedding, onUpdate }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "bot", content: "Hi! I'm your wedding planning assistant. Ask me about budget, guests, vendors, rituals, or timeline." },
  ]);
  const [loaded, setLoaded] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && !loaded) {
      getAiMessages().then((dbMessages) => {
        if (dbMessages && dbMessages.length > 0) {
          setMessages([
            { role: "bot", content: "Hi! I'm your wedding planning assistant. Ask me about budget, guests, vendors, rituals, or timeline." },
            ...dbMessages.map((m: any) => ({ role: m.role, content: m.content })),
          ]);
        }
        setLoaded(true);
      }).catch(() => setLoaded(true));
    }
  }, [open, loaded]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    // Generate response
    const response = generateResponse(userMsg, wedding);
    setMessages((prev) => [...prev, { role: "bot", content: response }]);

    // Save to DB
    try {
      await addAiMessage("user", userMsg);
      await addAiMessage("bot", response);
      onUpdate();
    } catch {}
  };

  return (
    <div className={`fixed top-[60px] right-0 w-[400px] h-[calc(100vh-60px)] bg-white border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.1)] flex flex-col z-[90] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-br from-maroon to-maroon-light text-white">
        <div className="flex items-center gap-2.5 font-bold">
          <i className="fas fa-robot" /> ShaadiSheet AI
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white cursor-pointer"><i className="fas fa-times text-lg" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${msg.role === "bot" ? "bg-gradient-to-br from-maroon to-gold text-white" : "bg-gray-200 text-gray-700"}`}>
              {msg.role === "bot" ? <i className="fas fa-robot" /> : (wedding.name?.charAt(0) || "U")}
            </div>
            <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-line ${msg.role === "bot" ? "bg-gray-100 rounded-tl-sm" : "bg-gradient-to-br from-maroon to-maroon-light text-white rounded-tr-sm"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      <div className="flex gap-2 p-4 border-t border-gray-200">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about your wedding..."
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors"
        />
        <button onClick={send} className="w-11 h-11 rounded-lg bg-gradient-to-br from-maroon to-maroon-light text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
          <i className="fas fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}
