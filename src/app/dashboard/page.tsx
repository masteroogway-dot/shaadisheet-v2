"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getWedding, updateWedding, updateTask } from "@/lib/actions";
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
    await loadWedding();
  };

  const handleToggleTask = async (id: string, done: boolean) => {
    setWedding((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => t.id === id ? { ...t, done } : t),
    }));
    try {
      await updateTask(id, { done });
    } catch {
      setWedding((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((t: any) => t.id === id ? { ...t, done: !done } : t),
      }));
    }
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden md:block">{session?.user?.email}</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-maroon to-gold text-white text-sm font-bold flex items-center justify-center cursor-pointer">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} onReset={loadWedding} />
        <main className="flex-1 overflow-y-auto p-8">
          {renderView()}
        </main>
      </div>

      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} wedding={wedding} onUpdate={loadWedding} />
    </div>
  );
}
