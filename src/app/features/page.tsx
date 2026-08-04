"use client";

import Link from "next/link";
import { useState } from "react";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerChildren";

type FeatureCategory = {
  id: string;
  title: string;
  icon: string;
  color: string;
  desc: string;
  features: {
    name: string;
    description: string;
    highlights: string[];
  }[];
};

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: "planning",
    title: "Wedding Planning",
    icon: "fa-clipboard-list",
    color: "from-blue-500 to-blue-600",
    desc: "Everything you need to plan every detail of your wedding.",
    features: [
      { name: "Budget Tracker", description: "Track every rupee, taka, or dollar with pre-filled categories designed for South Asian weddings.", highlights: ["Multi-currency support (INR, BDT, PKR, USD)", "Pre-filled wedding categories", "Track estimated vs actual costs", "Payment tracking and balance reminders"] },
      { name: "Vendor Manager", description: "Keep all your vendors organized in one place with contact details, quotes, and payment status.", highlights: ["Contact information storage", "Quote and payment tracking", "Contract status management", "Deadline reminders"] },
      { name: "Guest Management", description: "Manage your complete guest list with RSVP tracking, dietary preferences, and seating assignments.", highlights: ["RSVP status tracking", "Dietary preferences (Veg, Non-Veg, Jain, Vegan)", "Side tracking (Bride, Groom, Family)", "Accommodation management"] },
      { name: "Task Manager", description: "Never miss a wedding task with our intelligent task manager organized by timeline.", highlights: ["Tasks by timeline (12+ months to Last month)", "Priority levels (High, Medium, Low)", "Category-based organization", "Progress tracking"] },
    ],
  },
  {
    id: "logistics",
    title: "Logistics & Events",
    icon: "fa-hotel",
    color: "from-purple-500 to-purple-600",
    desc: "Manage every logistical detail from seating to hotel rooms.",
    features: [
      { name: "Event Timeline", description: "Plan and track all your wedding events from Haldi to Reception with detailed schedules.", highlights: ["Multiple event support", "Time and location tracking", "Event descriptions and notes", "Visual timeline view"] },
      { name: "Seating Arrangements", description: "Create and manage seating charts for your reception with ease.", highlights: ["Table creation and management", "Guest assignment to tables", "Capacity tracking", "Conflict detection"] },
      { name: "Room Allocations", description: "Manage hotel room allocations for out-of-town guests with check-in/check-out dates.", highlights: ["Hotel and room number tracking", "Check-in/check-out dates", "Room type management", "Guest assignment"] },
      { name: "Invite Details", description: "Track all your invitation details from design to delivery across multiple formats.", highlights: ["Multiple invite types (Main, Digital, Save the Date)", "Quantity and cost tracking", "Send date and RSVP deadline", "Status management"] },
    ],
  },
  {
    id: "culture",
    title: "Cultural Traditions",
    icon: "fa-book-open",
    color: "from-amber-500 to-amber-600",
    desc: "Built with deep understanding of South Asian wedding traditions.",
    features: [
      { name: "47 Wedding Templates", description: "Pre-built templates for every South Asian religion and region with customized rituals.", highlights: ["Hindu (13 regions)", "Muslim (3 regions)", "Sikh, Christian, Jain", "Sri Lankan, Nepali, Pakistani, Afghan, Maldivian, Bangladeshi"] },
      { name: "Ritual Checklists", description: "Every ritual in order, customized by your religion and region.", highlights: ["Religion-specific rituals", "Region-specific customs", "Step-by-step guides", "Cultural significance notes"] },
      { name: "Dietary Management", description: "Track dietary preferences with South Asian dietary requirements built-in.", highlights: ["Veg, Non-Veg, Vegan", "Jain dietary requirements", "Halal options", "Custom dietary needs"] },
      { name: "Currency Support", description: "Plan your budget in your local currency with South Asian support.", highlights: ["Indian Rupee (INR)", "Bangladeshi Taka (BDT)", "Pakistani Rupee (PKR)", "US Dollar (USD)"] },
    ],
  },
  {
    id: "fun",
    title: "Fun & Celebrations",
    icon: "fa-music",
    color: "from-pink-500 to-pink-600",
    desc: "Make your celebrations unforgettable with fun planning tools.",
    features: [
      { name: "Sangeet Planner", description: "Plan your sangeet performances with song management and practice schedules.", highlights: ["Song library management", "Performer assignments", "Confirmation tracking", "Practice session scheduler"] },
      { name: "Color Coordinator", description: "Coordinate outfit colors across all events with theme matching.", highlights: ["Event color themes", "Outfit color matching", "Match score calculation", "Visual color journey timeline"] },
      { name: "Hashtag Generator", description: "Generate beautiful wedding hashtags with 9 different styles.", highlights: ["9 hashtag styles (Romantic, Funny, Pun, etc.)", "AI-powered generation", "Favorites system", "Copy all functionality"] },
      { name: "Outfit Planner", description: "Plan and track all your wedding outfits with designer details.", highlights: ["Outfit tracking by event", "Designer and cost tracking", "Jewelry pairing suggestions", "Status management"] },
    ],
  },
  {
    id: "collaboration",
    title: "Collaboration & Family",
    icon: "fa-users",
    color: "from-green-500 to-green-600",
    desc: "Plan together with family and navigate family dynamics.",
    features: [
      { name: "Real-time Collaboration", description: "Share your wedding plan with family members and planners with role-based permissions.", highlights: ["Real-time updates", "Role-based access (Owner, Editor, Viewer)", "Family sharing", "Planner collaboration"] },
      { name: "Family Politics Mapper", description: "Navigate family dynamics with relationship tracking and seating conflict management.", highlights: ["Family member tracking", "Relationship status mapping", "Seating conflict detection", "Resolution tracking"] },
      { name: "Gift Tracker", description: "Track all wedding gifts with amounts, types, and thank-you card management.", highlights: ["Gift amount tracking", "Gift type categorization", "Side tracking (Paternal, Maternal, etc.)", "Thank-you card status"] },
      { name: "Wedding Website", description: "Create a beautiful wedding website with 9 premium templates.", highlights: ["9 premium templates", "RSVP collection", "Event details", "Travel information"] },
    ],
  },
  {
    id: "ai",
    title: "AI Assistant",
    icon: "fa-wand-magic-sparkles",
    color: "from-indigo-500 to-indigo-600",
    desc: "Get intelligent AI-powered help throughout your planning journey.",
    features: [
      { name: "AI Wedding Assistant", description: "Get intelligent recommendations for budget, vendors, and planning advice.", highlights: ["Budget allocation suggestions", "Vendor recommendations", "Timeline planning help", "Cultural guidance"] },
      { name: "Smart Suggestions", description: "Receive context-aware suggestions based on your wedding details.", highlights: ["Personalized recommendations", "Progress-based suggestions", "Cultural context awareness", "Multi-language support"] },
    ],
  },
];

const STATS = [
  { value: "47", label: "Wedding Templates" },
  { value: "7", label: "Countries" },
  { value: "10+", label: "Feature Modules" },
  { value: "9", label: "Website Templates" },
];

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState("planning");
  const activeCat = FEATURE_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-cream">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-[60px] md:h-[70px]">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ShaadiSheet" className="h-[45px] md:h-[65px] w-auto" />
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/#features" className="text-gray-600 hover:text-maroon transition-colors">Features</Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-maroon transition-colors">How It Works</Link>
            <Link href="/#religions" className="text-gray-600 hover:text-maroon transition-colors">Weddings</Link>
          </div>
          <div className="flex gap-2 md:gap-3 items-center">
            <Link href="/auth" className="px-3 md:px-5 py-1.5 md:py-2.5 text-[11px] md:text-sm font-semibold text-gray-700 hover:text-maroon transition-colors">Log In</Link>
            <Link href="/auth" className="px-2.5 md:px-5 py-1.5 md:py-2.5 text-[11px] md:text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-dark transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-[80px] md:pt-[100px] pb-12 md:py-20 wedding-cta text-white relative overflow-hidden">
        <div className="paisley-overlay" style={{ opacity: 0.03 }} />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative text-center">
          <ScrollReveal>
            <div className="gold-divider mb-4 md:mb-6" style={{ filter: "brightness(2)" }}>
              <svg className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z" /></svg>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Everything You Need to<br />
              <span className="text-[#FFD54F]">Plan the Perfect Wedding</span>
            </h1>
            <p className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto mb-8 md:mb-10">
              From budget tracking to AI-powered suggestions, ShaadiSheet has every tool you need to plan your South Asian wedding without the chaos.
            </p>
            <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
              <Link href="/auth" className="px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-bold text-maroon bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-2xl">
                Start Planning Free
              </Link>
              <Link href="/" className="px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-bold border-2 border-white/30 rounded-xl text-white hover:bg-white/10 transition-all">
                Back to Home
              </Link>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 md:mt-16">
            {STATS.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10">
                  <div className="text-2xl md:text-3xl font-bold text-[#FFD54F]">{s.value}</div>
                  <div className="text-xs md:text-sm text-white/70 mt-1">{s.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CATEGORIES TABS */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <ScrollReveal>
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>Explore All Features</h2>
              <p className="text-gray-500 text-sm md:text-base">Click a category to see what&apos;s included</p>
            </div>
          </ScrollReveal>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8 md:mb-12">
            {FEATURE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <i className={`fas ${cat.icon} text-sm`} />
                {cat.title}
              </button>
            ))}
          </div>

          {/* Active Category Content */}
          {activeCat && (
            <div>
              <div className="text-center mb-6 md:mb-10">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${activeCat.color} text-white mb-3`}>
                  <i className={`fas ${activeCat.icon} text-lg`} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{activeCat.title}</h3>
                <p className="text-gray-500 text-sm md:text-base">{activeCat.desc}</p>
              </div>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" staggerDelay={0.08}>
                {activeCat.features.map((feature, i) => (
                  <StaggerItem key={i}>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 hover:border-gray-300 hover:shadow-md transition-all h-full">
                      <h4 className="font-bold text-gray-900 text-base md:text-lg mb-2">{feature.name}</h4>
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed">{feature.description}</p>
                      <div className="space-y-2">
                        {feature.highlights.map((h, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <i className={`fas fa-check-circle text-sm mt-0.5 bg-gradient-to-r ${activeCat.color} bg-clip-text`} style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
                            <span className="text-gray-600 text-sm">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          )}
        </div>
      </section>

      {/* ALL FEATURES GRID */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <ScrollReveal>
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>Complete Feature List</h2>
              <p className="text-gray-500 text-sm md:text-base">Every feature included in your free account</p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5" staggerDelay={0.05}>
            {[
              { icon: "fa-coins", title: "Budget Tracker", desc: "Multi-currency support with pre-filled categories" },
              { icon: "fa-store", title: "Vendor Manager", desc: "Track contacts, quotes, and payments" },
              { icon: "fa-users", title: "Guest Management", desc: "RSVP, dietary preferences, seating" },
              { icon: "fa-tasks", title: "Task Manager", desc: "Timeline-based task organization" },
              { icon: "fa-calendar-alt", title: "Event Timeline", desc: "Plan all events from Haldi to Reception" },
              { icon: "fa-th-large", title: "Seating Charts", desc: "Table creation and guest assignments" },
              { icon: "fa-bed", title: "Room Allocations", desc: "Hotel room management for guests" },
              { icon: "fa-envelope-open-text", title: "Invite Tracker", desc: "Track invites from design to delivery" },
              { icon: "fa-book-open", title: "Ritual Checklists", desc: "47 templates for every religion/region" },
              { icon: "fa-globe", title: "7 Countries", desc: "India, Pakistan, Bangladesh, Nepal, Sri Lanka, Afghanistan, Maldives" },
              { icon: "fa-music", title: "Sangeet Planner", desc: "Song management and performer tracking" },
              { icon: "fa-palette", title: "Color Coordinator", desc: "Outfit matching and theme coordination" },
              { icon: "fa-hashtag", title: "Hashtag Generator", desc: "9 styles from romantic to funny" },
              { icon: "fa-shirt", title: "Outfit Planner", desc: "Track outfits, designers, and costs" },
              { icon: "fa-gift", title: "Gift Tracker", desc: "Track gifts and thank-you cards" },
              { icon: "fa-heart", title: "Family Mapper", desc: "Navigate family dynamics and conflicts" },
              { icon: "fa-globe", title: "Wedding Website", desc: "9 premium templates for your guests" },
              { icon: "fa-wand-magic-sparkles", title: "AI Assistant", desc: "Smart recommendations and guidance" },
              { icon: "fa-users-gear", title: "Real-time Collaboration", desc: "Share with family and planners" },
              { icon: "fa-utensils", title: "Dietary Management", desc: "Veg, Non-Veg, Jain, Halal tracking" },
            ].map((f, i) => (
              <StaggerItem key={i}>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-maroon/10 flex items-center justify-center shrink-0">
                      <i className={`fas ${f.icon} text-maroon text-sm`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{f.title}</h4>
                      <p className="text-gray-500 text-xs">{f.desc}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-28 text-center wedding-cta text-white relative">
        <div className="paisley-overlay" style={{ opacity: 0.03 }} />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <ScrollReveal direction="up" distance={60}>
            <div className="gold-divider mb-5 md:mb-8" style={{ filter: "brightness(2)" }}>
              <svg className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z" /></svg>
            </div>
            <h2 className="text-2xl md:text-[2.5rem] font-bold text-white mb-3 md:mb-4" style={{ fontFamily: "var(--font-display)" }}>Ready to Start Planning?</h2>
            <p className="text-sm md:text-lg text-white/80 mb-6 md:mb-10">Free to start. No credit card required.</p>
            <Link href="/auth" className="px-7 md:px-10 py-3 md:py-4 text-sm md:text-base font-bold text-maroon bg-white rounded-xl hover:bg-gray-100 transition-all inline-flex items-center gap-2 shadow-2xl hover:shadow-white/20 hover:scale-105">
              Start Planning Free
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 md:py-16 pb-6 md:pb-8 relative" style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 50%, #1a0a0a 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-6 md:mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <img src="/logo.png" alt="ShaadiSheet" className="h-[40px] md:h-[55px] w-auto" style={{ filter: "invert(1) brightness(2)" }} />
              </div>
              <p className="text-gray-400 text-sm">Har Shaadi Ka Plan.</p>
            </div>
            {[
              { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/subscriptions" }, { label: "Blog", href: "/blog" }] },
              { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
              { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Security", href: "/security" }] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider font-semibold text-[#D4AF37]">{col.title}</h4>
                {col.links.map((l, j) => (
                  <Link key={j} href={l.href} className="block py-0.5 md:py-1 text-gray-400 text-xs md:text-sm hover:text-white transition-colors">{l.label}</Link>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-6 md:pt-8" style={{ borderTop: "1px solid rgba(212, 175, 55, 0.15)" }}>
            <p className="text-gray-500 text-xs md:text-sm">&copy; 2026 ShaadiSheet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}