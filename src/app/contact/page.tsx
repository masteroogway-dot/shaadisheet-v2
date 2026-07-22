"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "45px", width: "auto" }} />
        </Link>
        <Link href="/" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-maroon transition-colors cursor-pointer">
          Back to Home
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-8 text-sm md:text-base">Have a question, suggestion, or want to partner? We&apos;d love to hear from you.</p>

        {status === "sent" ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-500 text-sm mb-6">We&apos;ll get back to you within 24 hours. Check your email for a response.</p>
            <button onClick={() => setStatus("idle")} className="px-6 py-2.5 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark transition-colors cursor-pointer">
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors"
                placeholder="What's this about?"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors resize-none"
                placeholder="Tell us what you need help with..."
              />
            </div>
            {status === "error" && (
              <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full px-6 py-3 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark transition-colors disabled:opacity-50 cursor-pointer"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
