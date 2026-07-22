"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getWedding, updateWedding, updateTask, seedWeddingEvents } from "@/lib/actions";
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
import RoomAllocationView from "@/components/views/RoomAllocationView";
import AiPanel from "@/components/AiPanel";
import ProfileMenu from "@/components/ProfileMenu";
import ToastContainer, { Toast } from "@/components/Toast";

let toastId = 0;

export default function WeddingDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const weddingId = params.weddingId as string;
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState<any>(null);
  const [activeView, setActiveView] = useState("overview");
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadWedding = useCallback(async () => {
    try {
      const w = await getWedding(weddingId);
      setWedding(w);
      if (w.weddingDate) {
        await seedWeddingEvents(weddingId);
        const updated = await getWedding(weddingId);
        setWedding(updated);
      }
    } catch (e) {
      console.error(e);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [weddingId, router]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (status === "authenticated") loadWedding();
  }, [status, router, loadWedding]);

  const handleOnboardingComplete = async (data: any) => {
    try {
      await updateWedding({
        weddingId,
        religion: data.religion,
        region: data.region,
        budget: data.budget,
        guestCount: data.guestCount,
        weddingDays: data.weddingDays,
        selectedEvents: data.selectedEvents,
        weddingDate: data.weddingDate ? new Date(data.weddingDate) : undefined,
        weddingCity: data.weddingCity,
      });
      await loadWedding();
    } catch (e) {
      console.error("Failed to save wedding:", e);
    }
  };

  const handleToggleTask = async (id: string, done: boolean) => {
    setWedding((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => t.id === id ? { ...t, done } : t),
    }));
    try {
      await updateTask(weddingId, id, { done });
    } catch {
      setWedding((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((t: any) => t.id === id ? { ...t, done: !done } : t),
      }));
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "overview": return <OverviewView wedding={wedding} onUpdate={loadWedding} />;
      case "budget": return <BudgetView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} />;
      case "vendors": return <VendorsView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} />;
      case "guests": return <GuestsView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} />;
      case "events": return <EventsView wedding={wedding} weddingId={weddingId} />;
      case "tasks": return <TasksView wedding={wedding} weddingId={weddingId} onToggle={handleToggleTask} />;
      case "seating": return <SeatingView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} />;
      case "rooms": return <RoomAllocationView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} />;
      case "timeline": return <TimelineView wedding={wedding} weddingId={weddingId} />;
      default: return <OverviewView wedding={wedding} onUpdate={loadWedding} />;
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 lg:hidden cursor-pointer"
          >
            <i className="fas fa-bars text-lg" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ShaadiSheet" style={{ height: "55px", width: "auto" }} />
          </Link>
        </div>
        <div className="text-center">
          <div className="font-bold text-sm">{wedding.name || "My Wedding"}</div>
          <div className="text-xs text-gray-500">
            {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"} {'\u2022'} {wedding.weddingCity || "City TBD"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAiOpen(!aiOpen)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-maroon transition-all cursor-pointer" title="AI Assistant">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 .125a2.25 2.25 0 01-2.25 2.25L.105 21.03a2.25 2.25 0 01-.16-.52L3 15.75l-.125-1a2.25 2.25 0 012.25-2.25l.04-.04M9.75 17A2.25 2.25 0 0112 14.25a2.25 2.25 0 012.25 2.25m-2.25-2.25l.975-.975a9 9 0 017.802-2.442 2.25 2.25 0 011.654 1.654l.75.75a9 9 0 01-2.442 7.802 2.25 2.25 0 01-1.654 1.654l-.75.75a9 9 0 01-7.802 2.442 2.25 2.25 0 01-1.654-1.654l-.75-.75z" />
            </svg>
          </button>
          <ProfileMenu user={session?.user} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderView()}
        </main>
      </div>

      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} />
    </div>
  );
}
