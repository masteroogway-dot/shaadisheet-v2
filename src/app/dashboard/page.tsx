"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getWedding, updateWedding, bulkCreateBudgetItems, bulkCreateVendors, bulkCreateGuests, bulkCreateTasks, updateTask } from "@/lib/actions";
import Onboarding from "@/components/Onboarding";
import Sidebar from "@/components/Sidebar";
import OverviewView from "@/components/views/OverviewView";
import BudgetView from "@/components/views/BudgetView";
import VendorsView from "@/components/views/VendorsView";
import GuestsView from "@/components/views/GuestsView";
import EventsView from "@/components/views/EventsView";
import TasksView from "@/components/views/TasksView";
import SeatingView from "@/components/views/SeatingView";
import TimelineView from "@/components/views/TimelineView";
import AiPanel from "@/components/AiPanel";

// ═══════════════════════════════════════════════════════════════
// DATA DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const REGIONS: Record<string, string[]> = {
  hindu: ["North Indian", "South Indian", "Bengali", "Gujarati", "Maharashtrian", "Rajput", "Punjabi"],
  muslim: ["Sunni", "Shia", "Bohra", "Sufi"],
  sikh: ["Jat Sikh", "Khatri Sikh", "Other"],
  christian: ["Kerala (Nasrani)", "Goan", "Northeast", "North Indian"],
  jain: ["Digambar", "Shwetambar"],
};

const EVENTS_BY_RELIGION: Record<string, Array<{ name: string; desc: string; time: string; ritual: boolean }>> = {
  hindu: [
    { name: "Roka", desc: "Official engagement — family exchanges gifts and sweets", time: "11:00 AM", ritual: true },
    { name: "Engagement", desc: "Ring exchange ceremony with close family and friends", time: "7:00 PM", ritual: true },
    { name: "Mehendi", desc: "Henna application ceremony for the bride and female guests", time: "4:00 PM", ritual: false },
    { name: "Sangeet", desc: "Music and dance night — the biggest pre-wedding party", time: "7:00 PM", ritual: false },
    { name: "Haldi", desc: "Turmeric ceremony — purification ritual for bride and groom", time: "9:00 AM", ritual: true },
    { name: "Wedding Day", desc: "Baraat, Jaimala, Kanyadaan, Mangal Pheras, Sindoor, Vidaai", time: "10:00 AM", ritual: true },
    { name: "Reception", desc: "Grand evening celebration with dinner, cake, and entertainment", time: "7:00 PM", ritual: false },
  ],
  muslim: [
    { name: "Mangni", desc: "Engagement ceremony with family blessings", time: "7:00 PM", ritual: true },
    { name: "Mehendi", desc: "Henna night for the bride and female guests", time: "4:00 PM", ritual: false },
    { name: "Nikah", desc: "The Islamic wedding ceremony — signing of the Nikahnama", time: "10:00 AM", ritual: true },
    { name: "Walima", desc: "Post-wedding reception hosted by the groom's family", time: "7:00 PM", ritual: true },
  ],
  sikh: [
    { name: "Kurmai", desc: "Sikh engagement ceremony — exchange of gifts and sweets", time: "11:00 AM", ritual: true },
    { name: "Mehendi", desc: "Henna application ceremony", time: "4:00 PM", ritual: false },
    { name: "Sangeet", desc: "Music and dance night", time: "7:00 PM", ritual: false },
    { name: "Anand Karaj", desc: "The Sikh wedding ceremony at the Gurdwara", time: "10:00 AM", ritual: true },
    { name: "Langar", desc: "Community meal at the Gurdwara", time: "1:00 PM", ritual: true },
    { name: "Reception", desc: "Evening celebration with dinner and entertainment", time: "7:00 PM", ritual: false },
  ],
  christian: [
    { name: "Engagement", desc: "Formal engagement with family blessings", time: "7:00 PM", ritual: true },
    { name: "Roce Ceremony", desc: "Turmeric and oil ceremony (Goan/Kerala tradition)", time: "5:00 PM", ritual: true },
    { name: "Church Wedding", desc: "Christian wedding ceremony — exchange of vows and rings", time: "10:00 AM", ritual: true },
    { name: "Reception", desc: "Celebration with dinner, cake cutting, and toasts", time: "7:00 PM", ritual: false },
  ],
  jain: [
    { name: "Roka", desc: "Official engagement ceremony", time: "11:00 AM", ritual: true },
    { name: "Engagement", desc: "Ring exchange ceremony", time: "7:00 PM", ritual: true },
    { name: "Mehendi", desc: "Henna application ceremony", time: "4:00 PM", ritual: false },
    { name: "Sangeet", desc: "Music and dance night", time: "7:00 PM", ritual: false },
    { name: "Wedding Ceremony", desc: "Jain wedding rituals", time: "10:00 AM", ritual: true },
    { name: "Reception", desc: "Grand evening celebration", time: "7:00 PM", ritual: false },
  ],
};

const BUDGET_RANGES: Record<string, { label: string; total: number }> = {
  under10: { label: "Under ₹10L", total: 800000 },
  "10to30": { label: "₹10-30L", total: 2000000 },
  "30to50": { label: "₹30-50L", total: 4000000 },
  "50to1cr": { label: "₹50L-1Cr", total: 7500000 },
  above1cr: { label: "Above ₹1Cr", total: 15000000 },
};

const BUDGET_CATEGORIES: Record<string, Array<{ cat: string; pct: number; items: string[] }>> = {
  hindu: [
    { cat: "Venue & Decor", pct: 0.30, items: ["Venue Rental", "Stage Decoration", "Floral Arrangements", "Lighting & Effects", "Mandap Setup"] },
    { cat: "Catering", pct: 0.25, items: ["Wedding Menu", "Welcome Drinks", "Snacks & Starters", "Wedding Cake"] },
    { cat: "Photography & Video", pct: 0.08, items: ["Photographer", "Videographer", "Drone Coverage", "Same Day Edit"] },
    { cat: "Attire & Jewelry", pct: 0.15, items: ["Bride Lehenga", "Groom Sherwani", "Bridal Jewelry", "Accessories"] },
    { cat: "Pandit & Rituals", pct: 0.04, items: ["Pandit Ji", "Puja Samagri", "Hawan Material", "Ritual Items"] },
    { cat: "Music & Entertainment", pct: 0.06, items: ["DJ + Sound", "Band/Dhol", "Choreographer", "LED Floor"] },
    { cat: "Transport", pct: 0.04, items: ["Baraat Vehicle", "Bride Entry", "Guest Transport", "Parking"] },
    { cat: "Gifts & Favors", pct: 0.04, items: ["Return Gifts", "Sagan Envelopes", "Welcome Kits", "Family Gifts"] },
    { cat: "Miscellaneous", pct: 0.04, items: ["Invitations", "Stamp Paper", "Tips", "Buffer"] },
  ],
  muslim: [
    { cat: "Venue & Decor", pct: 0.30, items: ["Venue Rental", "Stage Decoration", "Floral Arrangements", "Lighting & Effects", "Mandap/Nikah Stage"] },
    { cat: "Catering", pct: 0.25, items: ["Wedding Menu", "Welcome Drinks", "Snacks & Starters", "Wedding Cake"] },
    { cat: "Photography & Video", pct: 0.08, items: ["Photographer", "Videographer", "Drone Coverage", "Same Day Edit"] },
    { cat: "Attire & Jewelry", pct: 0.15, items: ["Bride Outfit", "Groom Sherwani/Suit", "Bridal Jewelry", "Accessories"] },
    { cat: "Mehr & Rituals", pct: 0.04, items: ["Mehr", "Quran", "Ritual Items", "Maulvi Sahib"] },
    { cat: "Music & Entertainment", pct: 0.06, items: ["DJ + Sound", "Qawwali Group", "Choreographer", "LED Floor"] },
    { cat: "Transport", pct: 0.04, items: ["Baraat Vehicle", "Bride Entry", "Guest Transport", "Parking"] },
    { cat: "Gifts & Favors", pct: 0.04, items: ["Return Gifts", "Eidi Envelopes", "Welcome Kits", "Family Gifts"] },
    { cat: "Miscellaneous", pct: 0.04, items: ["Invitations", "Tips", "Buffer", "Misc"] },
  ],
  sikh: [
    { cat: "Venue & Decor", pct: 0.30, items: ["Venue/Gurdwara", "Stage Decoration", "Floral Arrangements", "Lighting & Effects", "Decor"] },
    { cat: "Catering", pct: 0.25, items: ["Langar Menu", "Welcome Drinks", "Snacks & Starters", "Wedding Cake"] },
    { cat: "Photography & Video", pct: 0.08, items: ["Photographer", "Videographer", "Drone Coverage", "Same Day Edit"] },
    { cat: "Attire & Jewelry", pct: 0.15, items: ["Bride Outfit", "Groom Sherwani", "Bridal Jewelry", "Accessories"] },
    { cat: "Rituals", pct: 0.04, items: ["Granthi Sahib", "Ritual Items", "Rumala Sahib", "Parshad"] },
    { cat: "Music & Entertainment", pct: 0.06, items: ["DJ + Sound", "Dhol Players", "Choreographer", "LED Floor"] },
    { cat: "Transport", pct: 0.04, items: ["Baraat Vehicle", "Bride Entry", "Guest Transport", "Parking"] },
    { cat: "Gifts & Favors", pct: 0.04, items: ["Return Gifts", "Mata Di Jura", "Welcome Kits", "Family Gifts"] },
    { cat: "Miscellaneous", pct: 0.04, items: ["Invitations", "Tips", "Buffer", "Misc"] },
  ],
  christian: [
    { cat: "Venue & Decor", pct: 0.30, items: ["Church/Reception Venue", "Stage Decoration", "Floral Arrangements", "Lighting & Effects", "Decor"] },
    { cat: "Catering", pct: 0.25, items: ["Reception Menu", "Welcome Drinks", "Snacks & Starters", "Wedding Cake"] },
    { cat: "Photography & Video", pct: 0.08, items: ["Photographer", "Videographer", "Drone Coverage", "Same Day Edit"] },
    { cat: "Attire & Jewelry", pct: 0.15, items: ["Bride Gown", "Groom Suit", "Bridal Jewelry", "Accessories"] },
    { cat: "Church & Rituals", pct: 0.04, items: ["Pastor/Father", "Flowers", "Candles", "Ritual Items"] },
    { cat: "Music & Entertainment", pct: 0.06, items: ["DJ + Sound", "Choir", "Choreographer", "LED Floor"] },
    { cat: "Transport", pct: 0.04, items: ["Bride Car", "Guest Transport", "Parking", "Misc"] },
    { cat: "Gifts & Favors", pct: 0.04, items: ["Return Gifts", "Welcome Kits", "Family Gifts", "Misc"] },
    { cat: "Miscellaneous", pct: 0.04, items: ["Invitations", "Tips", "Buffer", "Misc"] },
  ],
  jain: [
    { cat: "Venue & Decor", pct: 0.30, items: ["Venue Rental", "Stage Decoration", "Floral Arrangements", "Lighting & Effects", "Decor"] },
    { cat: "Catering", pct: 0.25, items: ["Veg Menu", "Welcome Drinks", "Snacks & Starters", "Wedding Cake"] },
    { cat: "Photography & Video", pct: 0.08, items: ["Photographer", "Videographer", "Drone Coverage", "Same Day Edit"] },
    { cat: "Attire & Jewelry", pct: 0.15, items: ["Bride Outfit", "Groom Outfit", "Bridal Jewelry", "Accessories"] },
    { cat: "Rituals", pct: 0.04, items: ["Pandit Ji", "Puja Samagri", "Ritual Items", "Misc"] },
    { cat: "Music & Entertainment", pct: 0.06, items: ["DJ + Sound", "Band", "Choreographer", "LED Floor"] },
    { cat: "Transport", pct: 0.04, items: ["Bride Entry", "Guest Transport", "Parking", "Misc"] },
    { cat: "Gifts & Favors", pct: 0.04, items: ["Return Gifts", "Welcome Kits", "Family Gifts", "Misc"] },
    { cat: "Miscellaneous", pct: 0.04, items: ["Invitations", "Tips", "Buffer", "Misc"] },
  ],
};

const VENDOR_NAMES: Record<string, string[]> = {
  Venue: ["Grand Palace Banquets", "Royal Orchid Hall"],
  Caterer: ["Annapurna Caterers", "Royal Feast"],
  Photographer: ["SnapShot Studios", "Frame Perfect"],
  Videographer: ["CineLens Productions", "Wedding Films Co."],
  Decorator: ["Royal Decor", "Sakshi Decorators"],
  "DJ/Sound": ["BeatBox DJ", "Sound Wavez"],
  "Band/Dhol": ["Royal Dhol", "Punjab Dhol"],
  "Mehendi Artist": ["Henna by Priya", "Mehendi Magic"],
  "Makeup Artist": ["Glam by Neha", "Bridal Glow"],
  Pandit: ["Pandit Ramesh Shastri", "Pt. Krishna Sharma"],
};

const VENDOR_CATS_BY_RELIGION: Record<string, string[]> = {
  hindu: ["Venue", "Caterer", "Photographer", "Videographer", "Decorator", "DJ/Sound", "Mehendi Artist", "Makeup Artist", "Pandit", "Band/Dhol"],
  muslim: ["Venue", "Caterer", "Photographer", "Videographer", "Decorator", "DJ/Sound", "Mehendi Artist", "Makeup Artist", "Qawwali Group"],
  sikh: ["Venue/Gurdwara", "Caterer (Langar)", "Photographer", "Videographer", "Decorator", "DJ/Sound", "Mehendi Artist", "Makeup Artist", "Dhol Players"],
  christian: ["Church", "Reception Venue", "Caterer", "Photographer", "Videographer", "Decorator", "DJ/Band", "Makeup Artist", "Choir"],
};

const TIMELINE_TASKS: Record<string, string[]> = {
  "12+ Months": ["Set total budget", "Decide wedding date", "Create guest list", "Book venue", "Book photographer", "Book caterer"],
  "9-12 Months": ["Book decorator", "Book DJ/band", "Send save-the-dates", "Book makeup artist", "Start shopping"],
  "6-9 Months": ["Book Mehendi artist", "Book pandit", "Plan Sangeet", "Order invitations", "Book transport"],
  "3-6 Months": ["Send invitations", "Finalize menu", "Plan seating", "Book florals", "Confirm vendors"],
  "1-3 Months": ["Final fittings", "Finalize guest count", "Day-of timeline", "Prepare gifts", "Plan favors"],
  "Last Month": ["Final walkthrough", "Confirm payments", "Rehearsal", "Pack honeymoon", "Emergency kit"],
};

const GUEST_FIRST = ["Priya", "Rahul", "Ankit", "Sneha", "Vikash", "Riya", "Arjun", "Kavya", "Deepak", "Nisha", "Rohit", "Pallavi", "Manish", "Shruti", "Ashish", "Meera", "Karan", "Divya", "Sahil", "Tanvi"];
const GUEST_LAST = ["Sharma", "Kapoor", "Gupta", "Verma", "Malhotra", "Patel", "Singh", "Reddy", "Joshi", "Agarwal"];

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState<any>(null);
  const [activeView, setActiveView] = useState("overview");
  const [aiOpen, setAiOpen] = useState(false);

  const loadWedding = useCallback(async () => {
    try {
      const w = await getWedding();
      setWedding(w);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (status === "authenticated") loadWedding();
  }, [status, router, loadWedding]);

  const handleOnboardingComplete = async (data: any) => {
    // Update wedding in DB
    await updateWedding({
      name: data.userName,
      religion: data.religion,
      region: data.region,
      budget: data.budget,
      guestCount: data.guests,
      weddingDate: data.weddingDate ? new Date(data.weddingDate) : undefined,
      weddingCity: data.weddingCity,
      selectedEvents: data.selectedEvents,
    });

    // Generate budget items
    const totalBudget = BUDGET_RANGES[data.budget]?.total || 4000000;
    const cats = BUDGET_CATEGORIES[data.religion] || BUDGET_CATEGORIES.hindu;
    const budgetItems: any[] = [];
    let order = 0;
    for (const cat of cats) {
      const catBudget = Math.round(totalBudget * cat.pct);
      const perItem = Math.round(catBudget / cat.items.length);
      for (let i = 0; i < cat.items.length; i++) {
        const estimated = i === cat.items.length - 1 ? catBudget - perItem * (cat.items.length - 1) : perItem;
        const paid = i === 0 ? Math.round(estimated * 0.5) : i === 1 ? estimated : 0;
        budgetItems.push({
          category: i === 0 ? cat.cat : "",
          item: cat.items[i],
          estimated,
          actual: paid > 0 ? estimated : 0,
          paid,
          balance: estimated - paid,
          status: paid === estimated ? "Paid" : paid > 0 ? "Partial" : "Pending",
          dueDate: "",
          notes: "",
          order: order++,
        });
      }
    }
    await bulkCreateBudgetItems(budgetItems);

    // Generate vendors
    const vendorCats = VENDOR_CATS_BY_RELIGION[data.religion] || VENDOR_CATS_BY_RELIGION.hindu;
    const vendors = vendorCats.map((cat, i) => ({
      category: cat,
      name: (VENDOR_NAMES[cat]?.[0]) || "Vendor " + cat,
      contact: "+91 98765 4321" + i,
      quote: Math.round(totalBudget * (0.03 + (i * 0.01))),
      paid: i < 3 ? Math.round(totalBudget * 0.015) : 0,
      balance: Math.round(totalBudget * (0.03 + (i * 0.01))) - (i < 3 ? Math.round(totalBudget * 0.015) : 0),
      rating: "★★★★★",
      contract: i < 3 ? "Signed" : "Pending",
      notes: "",
      order: i,
    }));
    await bulkCreateVendors(vendors);

    // Generate guests
    const guestCountMap: Record<string, number> = { small: 80, medium: 200, large: 400, grand: 600 };
    const totalGuests = guestCountMap[data.guests] || 200;
    const guestsToShow = Math.min(totalGuests, 100);
    const guests = [];
    for (let i = 0; i < guestsToShow; i++) {
      guests.push({
        name: GUEST_FIRST[i % GUEST_FIRST.length] + " " + GUEST_LAST[Math.floor(i / GUEST_FIRST.length) % GUEST_LAST.length],
        relation: "Friend",
        side: i % 3 === 0 ? "Bride" : "Groom",
        rsvp: i % 5 === 0 ? "Pending" : i % 7 === 0 ? "Declined" : "Yes",
        dietary: i % 3 === 0 ? "Veg" : "Non-Veg",
        tableNum: Math.floor(i / 8) + 1,
        giftGiven: "No",
        thankYou: "No",
        notes: "",
        order: i,
      });
    }
    await bulkCreateGuests(guests);

    // Generate tasks
    const tasks: any[] = [];
    let tOrder = 0;
    for (const [period, items] of Object.entries(TIMELINE_TASKS)) {
      for (const text of items) {
        tasks.push({ period, text, done: false, order: tOrder++ });
      }
    }
    await bulkCreateTasks(tasks);

    // Reload
    await loadWedding();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading ShaadiSheet...</p>
        </div>
      </div>
    );
  }

  if (!wedding) return null;

  const onboardingComplete = wedding.religion && wedding.religion !== "";

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const handleToggleTask = async (id: string, done: boolean) => {
    await updateTask(id, { done });
    await loadWedding();
  };

  const renderView = () => {
    switch (activeView) {
      case "overview": return <OverviewView wedding={wedding} />;
      case "budget": return <BudgetView wedding={wedding} onUpdate={loadWedding} />;
      case "vendors": return <VendorsView wedding={wedding} onUpdate={loadWedding} />;
      case "guests": return <GuestsView wedding={wedding} onUpdate={loadWedding} />;
      case "events": return <EventsView wedding={wedding} />;
      case "tasks": return <TasksView wedding={wedding} onToggle={handleToggleTask} />;
      case "seating": return <SeatingView wedding={wedding} onUpdate={loadWedding} />;
      case "timeline": return <TimelineView wedding={wedding} />;
      default: return <OverviewView wedding={wedding} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold">
            <span className="text-maroon text-xl">|||</span>
            <span>ShaadiSheet</span>
          </Link>
        </div>
        <div className="text-center">
          <div className="font-bold text-sm">{wedding.name || "My Wedding"}</div>
          <div className="text-xs text-gray-500">
            {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"} • {wedding.weddingCity || "City TBD"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAiOpen(!aiOpen)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-maroon transition-all" title="AI Assistant">
            <i className="fas fa-robot text-lg" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-maroon to-gold text-white text-sm font-bold flex items-center justify-center cursor-pointer">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-y-auto p-8">
          {renderView()}
        </main>
      </div>

      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} wedding={wedding} onUpdate={loadWedding} />
    </div>
  );
}
