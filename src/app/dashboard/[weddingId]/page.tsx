"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getWedding, getWeddingWithRole, updateWedding, updateTask, seedWeddingEvents } from "@/lib/actions";
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
import GiftTrackerView from "@/components/views/GiftTrackerView";
import OutfitPlannerView from "@/components/views/OutfitPlannerView";
import InviteDetailsView from "@/components/views/InviteDetailsView";
import CulturalChecklistsView from "@/components/views/CulturalChecklistsView";
import HashtagGeneratorView from "@/components/views/HashtagGeneratorView";
import SangeetView from "@/components/views/SangeetView";
import ColorCoordinatorView from "@/components/views/ColorCoordinatorView";
import FamilyPoliticsView from "@/components/views/FamilyPoliticsView";
import AiPanel from "@/components/AiPanel";
import ProfileMenu from "@/components/ProfileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import ToastContainer, { Toast } from "@/components/Toast";
import TutorialOverlay, {
  WELCOME_TOUR, BUDGET_TOUR, GUESTS_TOUR, VENDORS_TOUR, EVENTS_TOUR, AI_TOUR, WEBSITE_TOUR,
  shouldShowTour, markTourComplete, TourDef,
} from "@/components/TutorialOverlay";

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
  const [userRole, setUserRole] = useState<string>("owner");
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTour, setActiveTour] = useState<TourDef | null>(null);
  const addToast = useCallback((message: string, type: "success" | "error" = "success", options?: { undoAction?: () => void }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, undoAction: options?.undoAction }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadWedding = useCallback(async () => {
    try {
      const w = await getWeddingWithRole(weddingId);
      setWedding(w);
      setUserRole(w.userRole || "owner");
    } catch (e) {
      console.error(e);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [weddingId, router]);

  const refreshWedding = useCallback(async () => {
    try {
      const w = await getWedding(weddingId);
      setWedding(w);
    } catch (e) {
      console.error(e);
    }
  }, [weddingId]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (status === "authenticated") {
      loadWedding();
    }
  }, [status, router, loadWedding]);

  // Seed wedding events in background after initial load (non-blocking)
  useEffect(() => {
    if (!wedding?.weddingDate) return;
    let cancelled = false;
    (async () => {
      try {
        await seedWeddingEvents(weddingId);
        if (!cancelled) {
          const updated = await getWeddingWithRole(weddingId);
          if (!cancelled) {
            setWedding(updated);
            setUserRole(updated.userRole || "owner");
          }
        }
      } catch {
        // seeding failed, data is already set from initial load
      }
    })();
    return () => { cancelled = true; };
  }, [weddingId, wedding?.weddingDate]);

  const handleOnboardingComplete = async (data: any) => {
    try {
      await updateWedding({
        weddingId,
        country: data.country,
        currency: data.currency,
        religion: data.religion,
        region: data.region,
        budget: data.budget,
        guestCount: data.guestCount,
        weddingDays: data.weddingDays,
        selectedEvents: data.selectedEvents,
        weddingDate: data.weddingDate ? new Date(data.weddingDate) : undefined,
        weddingCity: data.weddingCity === "Other" && data.customCity ? data.customCity : data.weddingCity,
      });
      await loadWedding();
    } catch (e) {
      console.error("Failed to save wedding:", e);
    }
  };

  useEffect(() => {
    if (!wedding) return;
    const onboardingComplete = wedding.religion && wedding.religion !== "";
    if (!onboardingComplete) return;
    if (shouldShowTour("welcome")) {
      const timer = setTimeout(() => {
        setActiveTour(WELCOME_TOUR);
        setShowTutorial(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [wedding]);

  const handleTutorialClose = () => {
    if (activeTour) markTourComplete(activeTour.id);
    setShowTutorial(false);
    setActiveTour(null);
  };

  const VIEW_TOURS: Record<string, TourDef> = {
    budget: BUDGET_TOUR,
    guests: GUESTS_TOUR,
    vendors: VENDORS_TOUR,
    events: EVENTS_TOUR,
    website: WEBSITE_TOUR,
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    // Trigger contextual tour if user hasn't seen it
    const tour = VIEW_TOURS[view];
    if (tour && shouldShowTour(tour.id) && !showTutorial) {
      setActiveTour(tour);
      setShowTutorial(true);
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

  const CHECKLIST_VIEW_MAP: Record<string, string> = {
    "emergency-kit": "Emergency Kit",
    "priest-req": "Priest Requirements",
    "vidaai": "Vidaai Essentials",
    "kanyadaanam": "Kanyadaanam Essentials",
    "gaye-holud": "Gaye Holud Essentials",
    "shubho-drishti": "Shubho Drishti",
    "jaimala": "Jaimala Essentials",
    "sakhar-puda": "Sakhar Puda",
    "pithi": "Pithi Ceremony",
    "baraat": "Baraat Planning",
    "chunni": "Chunni Ceremony",
    "jaggo": "Jaggo Night",
    "lagan": "Lagan Ceremony",
    "jur-phool": "Jur Phool",
    "chhurakan": "Chhurakan",
    "sakora": "Sakora",
    "thaali": "Thaali Ceremony",
    "lada": "Lada Ceremony",
    "khabzod": "Khabzod Ceremony",
    "buddhist-req": "Buddhist Priest Requirements",
    "ihi-prep": "Ihi Prep",
    "wazwan-plan": "Wazwan Planning",
    "nikah-prep": "Nikah Preparation",
    "walima-essentials": "Walima Essentials",
    "gurdwara-req": "Gurdwara Requirements",
    "anand-karaj": "Anand Karaj Essentials",
    "langar-plan": "Langar Planning",
    "jain-catering": "Jain Catering Rules",
    "ceremony-essentials": "Ceremony Essentials",
    "church-req": "Church Requirements",
    "roce-ceremony": "Roce Ceremony",
    "soropotel": "Soro-potel Prep",
    "minnukettu": "Minnukettu Prep",
    "traditional-feast": "Traditional Feast",
    "poruwa-prep": "Poruwa Preparation",
    "nekath-plan": "Nekath Planning",
    "dholki-essentials": "Dholki Essentials",
    "janti-plan": "Janti Planning",
    "dubo-mala": "Dubo Ko Mala",
    "henna-night": "Henna Night",
    "resort-coord": "Resort Coordination",
    "khwara-essentials": "Khwara Essentials",
    "attan-dance": "Attan Dance Planning",
    "mahr-docs": "Mahr Documentation",
    "fire-ceremony": "Fire Ceremony",
  };

  const renderView = () => {
    const canEdit = userRole === "owner" || userRole === "co-owner" || userRole === "editor";
    switch (activeView) {
      case "overview": return <OverviewView wedding={wedding} onUpdate={refreshWedding} userRole={userRole} onToast={addToast} />;
      case "budget": return <BudgetView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "vendors": return <VendorsView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "guests": return <GuestsView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "events": return <EventsView wedding={wedding} weddingId={weddingId} canEdit={canEdit} />;
      case "tasks": return <TasksView wedding={wedding} weddingId={weddingId} onToggle={handleToggleTask} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "seating": return <SeatingView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "rooms": return <RoomAllocationView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "timeline": return <TimelineView wedding={wedding} weddingId={weddingId} canEdit={canEdit} />;
      case "gifts": return <GiftTrackerView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "outfits": return <OutfitPlannerView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "invites": return <InviteDetailsView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "hashtags": return <HashtagGeneratorView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "sangeet": return <SangeetView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "colors": return <ColorCoordinatorView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;
      case "family": return <FamilyPoliticsView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} />;

      default:
        // Handle dynamic checklist views
        const checklistTab = CHECKLIST_VIEW_MAP[activeView];
        if (checklistTab) {
          return <CulturalChecklistsView wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} onToast={addToast} canEdit={canEdit} initialTab={checklistTab} />;
        }
        return <OverviewView wedding={wedding} onUpdate={refreshWedding} userRole={userRole} onToast={addToast} />;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#111111] flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] flex flex-col">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="h-auto md:h-[60px] bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2a2a2a] flex items-center justify-between px-3 md:px-6 py-2 md:py-0 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-11 h-11 md:w-10 md:h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 lg:hidden cursor-pointer"
          >
            <i className="fas fa-bars text-base md:text-lg" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="ShaadiSheet" className="h-[38px] md:h-[55px] w-auto" />
          </Link>
        </div>
        <div className="text-right">
          <div className="font-bold text-xs md:text-sm leading-tight">{wedding.name || "My Wedding"}</div>
          <div className="text-[10px] md:text-xs text-gray-500 leading-tight">
            {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"} {'\u2022'} {wedding.weddingCity || "City TBD"}
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <ThemeToggle />
          <button onClick={() => setAiOpen(!aiOpen)} data-tutorial="ai" className="w-11 h-11 md:w-10 md:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-maroon transition-all cursor-pointer" title="AI Assistant">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5z" fill="currentColor" />
              <path d="M19 15l-1.5 4-3.5-3 4-1z" fill="currentColor" opacity="0.6" />
              <path d="M5 15l1.5 4 3.5-3-4-1z" fill="currentColor" opacity="0.6" />
            </svg>
          </button>
          <ProfileMenu user={session?.user} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} wedding={wedding} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8" key={activeView}>
          <div className="animate-[fadeIn_0.2s_ease-out]">
            {renderView()}
          </div>
        </main>
      </div>

      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} wedding={wedding} weddingId={weddingId} onUpdate={loadWedding} />
      <TutorialOverlay open={showTutorial} onClose={handleTutorialClose} tour={activeTour || WELCOME_TOUR} sidebarOpen={sidebarOpen} onSidebarOpen={setSidebarOpen} />
    </div>
  );
}
