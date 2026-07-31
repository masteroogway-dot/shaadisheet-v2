"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface TourStep {
  target?: string;
  title: string;
  description: string;
  icon?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export interface TourDef {
  id: string;
  steps: TourStep[];
}

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
  tour: TourDef;
  sidebarOpen?: boolean;
  onSidebarOpen?: (open: boolean) => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const WELCOME_TOUR: TourDef = {
  id: "welcome",
  steps: [
    {
      title: "Welcome to ShaadiSheet!",
      description: "Your complete wedding planning companion. Let us show you the basics.",
      icon: "fa-sparkles",
    },
    {
      target: ".sidebar",
      title: "Navigation Sidebar",
      description: "Access all your planning tools here. Budget, guests, vendors, events, and more.",
      icon: "fa-bars",
      position: "right",
    },
    {
      target: "[data-tutorial='overview']",
      title: "Your Dashboard",
      description: "See your budget, guests, vendors, tasks, and progress at a glance. Tap any card to explore.",
      icon: "fa-home",
      position: "bottom",
    },
  ],
};

export const BUDGET_TOUR: TourDef = {
  id: "budget",
  steps: [
    {
      target: "[data-tutorial='budget']",
      title: "Budget Tracker",
      description: "Set your total budget and log vendor payments. Tap to get started.",
      icon: "fa-coins",
    },
  ],
};

export const GUESTS_TOUR: TourDef = {
  id: "guests",
  steps: [
    {
      target: "[data-tutorial='guests']",
      title: "Guest Manager",
      description: "Add guests, track RSVPs, dietary needs, and table assignments.",
      icon: "fa-users",
    },
  ],
};

export const VENDORS_TOUR: TourDef = {
  id: "vendors",
  steps: [
    {
      target: "[data-tutorial='vendors']",
      title: "Vendor Manager",
      description: "Keep all vendor contacts, contracts, and payments in one place.",
      icon: "fa-store",
    },
  ],
};

export const EVENTS_TOUR: TourDef = {
  id: "events",
  steps: [
    {
      target: "[data-tutorial='events']",
      title: "Event Planner",
      description: "Plan your Mehendi, Sangeet, Wedding, and Reception with timelines.",
      icon: "fa-calendar-alt",
    },
  ],
};

export const AI_TOUR: TourDef = {
  id: "ai",
  steps: [
    {
      target: "[data-tutorial='ai']",
      title: "AI Assistant",
      description: "Stuck on something? Ask our AI for help with budgeting, seating, or vendor ideas.",
      icon: "fa-wand-magic-sparkles",
    },
  ],
};

export const WEBSITE_TOUR: TourDef = {
  id: "website",
  steps: [
    {
      target: "[data-tutorial='website']",
      title: "Wedding Website",
      description: "Create a beautiful website to share with your guests. 9 premium templates included.",
      icon: "fa-globe",
    },
  ],
};

export const ALL_TOURS: TourDef[] = [WELCOME_TOUR, BUDGET_TOUR, GUESTS_TOUR, VENDORS_TOUR, EVENTS_TOUR, AI_TOUR, WEBSITE_TOUR];

const STORAGE_KEY = "shaadisheet-tours-seen";

function getSeenTours(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markTourSeen(id: string) {
  try {
    const seen = getSeenTours();
    seen.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  } catch {}
}

export function shouldShowTour(id: string): boolean {
  if (id === "welcome") {
    return !localStorage.getItem("shaadisheet-tutorial-done");
  }
  return !getSeenTours().has(id);
}

export function markTourComplete(id: string) {
  if (id === "welcome") {
    localStorage.setItem("shaadisheet-tutorial-done", "true");
  }
  markTourSeen(id);
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 640;
}

function isSidebarTarget(target?: string): boolean {
  if (!target) return false;
  return target.includes("tutorial=") && !target.includes("overview") && !target.includes("website") && !target.includes("ai");
}

export default function TutorialOverlay({ open, onClose, tour, sidebarOpen, onSidebarOpen }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [mobile, setMobile] = useState(false);

  const step = tour.steps[currentStep];
  const totalSteps = tour.steps.length;
  const hasTarget = !!step?.target;

  useEffect(() => {
    setMobile(isMobile());
    const onResize = () => setMobile(isMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const findTarget = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect({
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          });
        });
      });
    } else {
      setTargetRect(null);
    }
  }, [step?.target]);

  useEffect(() => {
    setTargetRect(null);
  }, [currentStep]);

  useEffect(() => {
    if (!open) return;
    const delay = mobile && step?.target ? 450 : 60;
    const timer = setTimeout(() => findTarget(), delay);
    const onScroll = () => findTarget();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, findTarget, mobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentStep < totalSteps - 1) setCurrentStep((p) => p + 1);
        else onClose();
      }
      if (e.key === "ArrowLeft" && currentStep > 0) setCurrentStep((p) => p - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, currentStep, totalSteps, onClose]);

  useEffect(() => {
    if (open) setCurrentStep(0);
  }, [open]);

  // Sidebar management on mobile
  useEffect(() => {
    if (!open || !mobile || !onSidebarOpen) return;
    if (isSidebarTarget(step?.target)) {
      onSidebarOpen(true);
    } else {
      onSidebarOpen(false);
    }
  }, [open, step?.target, mobile, onSidebarOpen]);

  useEffect(() => {
    if (!open && onSidebarOpen && mobile) onSidebarOpen(false);
  }, [open, onSidebarOpen, mobile]);

  // Swipe handlers for mobile
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  }, [touchStart]);

  const onTouchEnd = useCallback(() => {
    if (Math.abs(touchDelta) > 50) {
      if (touchDelta < 0 && currentStep < totalSteps - 1) {
        setCurrentStep((p) => p + 1);
      } else if (touchDelta > 0 && currentStep > 0) {
        setCurrentStep((p) => p - 1);
      }
    }
    setTouchStart(null);
    setTouchDelta(0);
  }, [touchDelta, currentStep, totalSteps]);

  const goNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep((p) => p + 1);
    else onClose();
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  if (!open) return null;

  // ━━━ MOBILE: Bottom-sheet layout ━━━
  if (mobile) {
    return (
      <div className="fixed inset-0 z-[99999]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Spotlight */}
        {hasTarget && targetRect && (
          <motion.div
            key={`spot-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              boxShadow: "0 0 0 4000px rgba(0,0,0,0.55)",
              zIndex: 1,
            }}
          />
        )}

        {/* Glow ring */}
        {hasTarget && targetRect && (
          <motion.div
            key={`glow-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute rounded-xl pointer-events-none border-[3px] border-[#D4AF37]"
            style={{
              top: targetRect.top - 3,
              left: targetRect.left - 3,
              width: targetRect.width + 6,
              height: targetRect.height + 6,
              zIndex: 2,
              boxShadow: "0 0 16px 2px rgba(212,175,55,0.4)",
            }}
          />
        )}

        {/* Bottom sheet */}
        <motion.div
          key={currentStep}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 z-10"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="bg-white rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col">
            {/* Grab handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Icon + Content */}
            <div className="px-6 pt-2 pb-4 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 mb-3">
                {step.icon && (
                  <div className="w-10 h-10 rounded-xl bg-maroon/10 flex items-center justify-center shrink-0">
                    <i className={`fas ${step.icon} text-maroon text-sm`} />
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 pb-3">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? "w-6 bg-maroon" : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Navigation — thumb zone */}
            <div className="px-4 pb-8 pt-1 flex items-center gap-3">
              <button
                onClick={onClose}
                className="h-12 px-4 rounded-xl text-sm font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Skip
              </button>
              {currentStep > 0 && (
                <button
                  onClick={goPrev}
                  className="h-12 px-4 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={goNext}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#722F37] to-[#8B3A44] text-white text-sm font-semibold shadow-md active:scale-[0.98] transition-transform cursor-pointer"
              >
                {currentStep < totalSteps - 1 ? "Next" : "Get Started"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Swipe hint */}
        {totalSteps > 1 && (
          <div className="absolute bottom-[220px] left-0 right-0 flex justify-center z-10 pointer-events-none">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.5 }}
              className="text-white text-xs"
            >
              Swipe to navigate
            </motion.p>
          </div>
        )}
      </div>
    );
  }

  // ━━━ DESKTOP: Floating card layout ━━━
  const getDesktopPosition = () => {
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const gap = 14;
    const cardW = 340;
    const cardH = 180;

    if (!targetRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const pos = step?.position || "bottom";
    let top: number;
    let left: number;
    let transform = "";

    switch (pos) {
      case "bottom":
        top = targetRect.top + targetRect.height + gap;
        left = targetRect.left + targetRect.width / 2;
        transform = "translateX(-50%)";
        if (left + cardW / 2 > viewW - 16) { left = viewW - cardW - 16; transform = ""; }
        if (left - cardW / 2 < 16) { left = 16; transform = ""; }
        if (top + cardH > viewH - 16) { top = targetRect.top - gap - cardH; }
        break;
      case "top":
        top = targetRect.top - gap - cardH;
        left = targetRect.left + targetRect.width / 2;
        transform = "translateX(-50%)";
        if (left + cardW / 2 > viewW - 16) { left = viewW - cardW - 16; transform = ""; }
        if (left - cardW / 2 < 16) { left = 16; transform = ""; }
        if (top < 16) { top = targetRect.top + targetRect.height + gap; }
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - cardH / 2;
        left = targetRect.left + targetRect.width + gap;
        if (left + cardW > viewW - 16) { left = targetRect.left - gap - cardW; }
        if (left < 16) left = 16;
        if (top < 16) top = 16;
        if (top + cardH > viewH - 16) top = viewH - cardH - 16;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - cardH / 2;
        left = targetRect.left - gap - cardW;
        if (left < 16) { left = targetRect.left + targetRect.width + gap; }
        if (left + cardW > viewW - 16) left = viewW - cardW - 16;
        if (top < 16) top = 16;
        if (top + cardH > viewH - 16) top = viewH - cardH - 16;
        break;
      default:
        top = viewH / 2 - cardH / 2;
        left = viewW / 2 - cardW / 2;
    }

    return { top: `${top}px`, left: `${left}px`, transform };
  };

  return (
    <div className="fixed inset-0 z-[99999]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Spotlight */}
      {hasTarget && targetRect && (
        <motion.div
          key={`spot-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute rounded-xl pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: "0 0 0 4000px rgba(0,0,0,0.55), 0 0 20px 4px rgba(212,175,55,0.3)",
            zIndex: 1,
          }}
        />
      )}

      {/* Glow ring */}
      {hasTarget && targetRect && (
        <motion.div
          key={`glow-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute rounded-xl pointer-events-none border-2 border-[#D4AF37]"
          style={{
            top: targetRect.top - 2,
            left: targetRect.left - 2,
            width: targetRect.width + 4,
            height: targetRect.height + 4,
            zIndex: 2,
          }}
        />
      )}

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#722F37] to-[#D4AF37]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Floating card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="absolute z-10 w-[340px]"
          style={getDesktopPosition()}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step.icon && (
                  <div className="w-7 h-7 rounded-lg bg-maroon/10 flex items-center justify-center">
                    <i className={`fas ${step.icon} text-maroon text-xs`} />
                  </div>
                )}
                <span className="text-[0.65rem] font-semibold text-gray-400 uppercase tracking-widest">
                  Step {currentStep + 1} of {totalSteps}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <i className="fas fa-times text-sm" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>

            {/* Navigation */}
            <div className="px-5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentStep ? "w-5 bg-maroon" : "w-1.5 bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
                >
                  Skip
                </button>
                {currentStep > 0 && (
                  <button
                    onClick={goPrev}
                    className="px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={goNext}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#722F37] to-[#8B3A44] rounded-lg hover:from-[#5C2530] hover:to-[#722F37] transition-all shadow-md hover:shadow-lg cursor-pointer min-h-[44px]"
                >
                  {currentStep < totalSteps - 1 ? (
                    <>Next <i className="fas fa-arrow-right ml-1" /></>
                  ) : (
                    <>Get Started <i className="fas fa-check ml-1" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Keyboard hints */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 text-white/40 text-[0.65rem]">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[0.6rem]">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[0.6rem]">→</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[0.6rem]">Esc</kbd>
          skip
        </span>
      </div>
    </div>
  );
}
