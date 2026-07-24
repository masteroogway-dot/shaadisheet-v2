"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  addAiMessage,
  getAiMessages,
  clearAiMessages,
  correctInteraction,
} from "@/lib/actions";

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `₹${n}`;
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection: line starts with | and next line is separator |---|
    if (line.trim().startsWith("|") && i + 1 < lines.length && lines[i + 1].trim().match(/^\|[\s\-|]+\|$/)) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        if (!lines[i].trim().match(/^\|[\s\-|]+\|$/)) {
          rows.push(lines[i].split("|").slice(1, -1).map(c => c.trim()));
        }
        i++;
      }
      if (rows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>{rows[0].map((h, j) => <th key={j} className="border border-gray-300 px-2 py-1 bg-gray-200 text-left font-semibold">{h.replace(/\*\*/g, "")}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri}>{row.map((cell, ci) => <td key={ci} className="border border-gray-300 px-2 py-1">{cell.replace(/\*\*/g, "")}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Bullet points
    if (line.trim().startsWith("- ")) {
      elements.push(<div key={`b-${elements.length}`} className="ml-3 before:content-['•'] before:mr-1 before:text-maroon overflow-hidden break-words">{line.trim().slice(2).replace(/\*\*/g, "")}</div>);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular text with bold
    const text = line.replace(/\*\*(.*?)\*\*/g, "$1");
    elements.push(<div key={`t-${elements.length}`} className="overflow-hidden break-words">{text}</div>);
    i++;
  }

  return <>{elements}</>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  wedding: any;
  weddingId: string;
  onUpdate: () => void;
}

export default function AiPanel({ open, onClose, wedding, weddingId, onUpdate }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string; id?: string }>>([]);
  const [loaded, setLoaded] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [correctingId, setCorrectingId] = useState<number | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [dailyRemaining, setDailyRemaining] = useState<number | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && !loaded) {
      getAiMessages(weddingId).then((dbMessages) => {
        if (dbMessages && dbMessages.length > 0) {
          setMessages([
            { role: "bot", content: getWelcomeMessage() },
            ...dbMessages.map((m: any) => ({ role: m.role, content: m.content, id: m.id })),
          ]);
        }
        setLoaded(true);
      }).catch(() => setLoaded(true));
    }
  }, [open, loaded, weddingId]);

  const getWelcomeMessage = () => {
    return `Hi! I'm your ShaadiSheet AI assistant. I can help with anything — just ask naturally.\n\n**Examples:**\n- "Add Rahul Sharma as groom side veg guest"\n- "Mark all Sharma guests as RSVP Yes"\n- "Delete all declined guests"\n- "Create a vendor: Sharma Catering, Catering, quote 5 lakhs"\n- "Allocate 10 rooms at Hotel Express Inn"\n- "Analyze my budget and suggest savings"\n- "What rituals should I plan for a Hindu wedding?"\n\nI understand many ways of saying the same thing — just type naturally!`;
  };

  const handleCorrect = async (msgIndex: number) => {
    if (!correctionText.trim()) return;
    const msg = messages[msgIndex];
    if (msg.id) {
      await correctInteraction(msg.id, correctionText);
    }
    setMessages((prev) => [
      ...prev.slice(0, msgIndex + 1),
      { role: "bot", content: `Got it! I'll remember that. Updated: "${correctionText}"` },
    ]);
    setCorrectingId(null);
    setCorrectionText("");
  };

  const send = async () => {
    if (!input.trim() || executing) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      await addAiMessage(weddingId, "user", userMsg);

      setMessages((prev) => [...prev, { role: "bot", content: "Thinking..." }]);

      const conversationHistory = messages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId, question: userMsg, conversationHistory }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        if (res.status === 429) {
          setMessages((prev) => {
            const without = prev.slice(0, -1);
            return [...without, { role: "bot", content: data.error || "Daily limit reached. Please try again tomorrow." }];
          });
          if (data.dailyRemaining !== undefined) setDailyRemaining(data.dailyRemaining);
          return;
        }
        setMessages((prev) => {
          const without = prev.slice(0, -1);
          return [...without, { role: "bot", content: data.error || "Something went wrong. Please try again." }];
        });
        return;
      }

      const response = data.response || "No response.";

      if (data.usage?.dailyRemaining !== undefined) setDailyRemaining(data.usage.dailyRemaining);

      setMessages((prev) => {
        const without = prev.slice(0, -1);
        return [...without, { role: "bot", content: response }];
      });

      await addAiMessage(weddingId, "bot", response);
      onUpdate();
    } catch (e) {
      setMessages((prev) => {
        const without = prev.slice(0, -1);
        return [...without, { role: "bot", content: `Sorry, I couldn't process that. ${(e as Error).message}` }];
      });
    }
  };

  return (
    <div className={`fixed top-[60px] right-0 w-full sm:w-[420px] h-[calc(100vh-60px)] bg-white border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.1)] flex flex-col z-[90] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-br from-maroon to-maroon-light text-white shrink-0 min-h-[52px]">
        <div className="flex items-center gap-2 font-bold min-w-0">
          <i className="fas fa-wand-magic-sparkles shrink-0" />
          <span className="truncate text-sm sm:text-base">ShaadiSheet AI</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={async () => {
              await clearAiMessages(weddingId);
              setMessages([{ role: "bot", content: getWelcomeMessage() }]);
            }}
            className="text-[11px] bg-white/20 hover:bg-white/30 px-2 sm:px-2.5 py-1 rounded-lg transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Clear conversation and start fresh"
          >
            <i className="fas fa-plus sm:mr-1" /> <span className="hidden sm:inline">New Chat</span>
          </button>
          <button onClick={onClose} className="min-w-[40px] min-h-[40px] w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"><i className="fas fa-times text-base sm:text-lg w-5 h-5" /></button>
        </div>
      </div>

      <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 shrink-0">
        <p className="text-[11px] text-amber-700 flex items-center gap-1.5">
          <i className="fas fa-triangle-exclamation text-amber-500" />
          This AI tool is still under development. Please verify important actions before relying on it.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${msg.role === "bot" ? "bg-gradient-to-br from-maroon to-gold text-white" : "bg-gray-200 text-gray-700"}`}>
              {msg.role === "bot" ? <i className="fas fa-wand-magic-sparkles" /> : (wedding.name?.charAt(0) || "U")}
            </div>
            <div className="flex flex-col gap-1">
              <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed overflow-hidden break-words ${msg.role === "bot" ? "bg-gray-100 rounded-tl-sm" : "bg-gradient-to-br from-maroon to-maroon-light text-white rounded-tr-sm"}`}>
                {renderMarkdown(msg.content)}
              </div>
              {msg.role === "bot" && i > 0 && correctingId !== i && (
                <button
                  onClick={() => { setCorrectingId(i); setCorrectionText(""); }}
                  className="text-[10px] text-gray-400 hover:text-maroon transition-colors self-start cursor-pointer min-h-[36px] min-w-[36px] flex items-center truncate max-w-full"
                >
                  <i className="fas fa-pen mr-0.5" /> Correct this
                </button>
              )}
              {correctingId === i && (
                <div className="flex gap-1.5 items-center">
                  <input
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCorrect(i)}
                    placeholder="What should it say instead?"
                    className="flex-1 px-2.5 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-maroon"
                    autoFocus
                  />
                  <button onClick={() => handleCorrect(i)} className="text-xs text-maroon font-bold hover:text-maroon-light cursor-pointer">
                    <i className="fas fa-check" />
                  </button>
                  <button onClick={() => setCorrectingId(null)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
                    <i className="fas fa-times" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEnd} />
      </div>

      {/* Usage warning banner */}
      {dailyRemaining !== null && dailyRemaining <= 5 && dailyRemaining > 0 && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 shrink-0">
          <p className="text-xs text-amber-700">
            <i className="fas fa-exclamation-triangle mr-1.5" />
            You've used {50 - dailyRemaining} of 50 daily AI messages. {dailyRemaining} remaining today.
          </p>
        </div>
      )}

      {/* Limit reached card */}
      {dailyRemaining !== null && dailyRemaining <= 0 && (
        <div className="px-4 py-4 border-t border-gray-200 shrink-0">
          <div className="bg-gradient-to-br from-maroon/5 to-gold/5 border border-maroon/20 rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-maroon/10 flex items-center justify-center">
              <i className="fas fa-wand-magic-sparkles text-maroon text-lg" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Daily AI Limit Reached</h3>
            <p className="text-xs text-gray-500 mb-4">
              You've used all 50 AI messages for today. Limits reset at midnight.
            </p>
            <a
              href="/subscriptions"
              className="inline-block px-5 py-2.5 bg-gradient-to-br from-maroon to-maroon-light text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all"
            >
              <i className="fas fa-arrow-up mr-1.5" />
              Upgrade Now
            </a>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={dailyRemaining !== null && dailyRemaining <= 0 ? "Daily limit reached" : "Type a command..."}
            disabled={dailyRemaining !== null && dailyRemaining <= 0}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors min-h-[44px] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          />
          <button
            onClick={send}
            disabled={dailyRemaining !== null && dailyRemaining <= 0}
            className="w-11 h-11 rounded-lg bg-gradient-to-br from-maroon to-maroon-light text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <i className="fas fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  );
}
