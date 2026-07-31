"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface TutorialStep {
  target?: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  sidebarOpen?: boolean;
  onSidebarOpen?: (open: boolean) => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to ShaadiSheet!",
    description: "Your complete wedding planning companion. Let us show you around in 60 seconds.",
    position: "bottom",
  },
  {
    target: ".sidebar",
    title: "Your Navigation",
    description: "Access all your planning tools from this sidebar. It collapses on mobile.",
    position: "right",
  },
  {
    target: "[data-tutorial='overview']",
    title: "Wedding Dashboard",
    description: "Your home base — see budget, guests, vendors, tasks, and progress at a glance.",
    position: "bottom",
  },
  {
    target: "[data-tutorial='budget']",
    title: "Budget Tracker",
    description: "Track every rupee. Set your total budget and log vendor payments to see where your money goes.",
    position: "right",
  },
  {
    target: "[data-tutorial='guests']",
    title: "Guest Manager",
    description: "Manage your full guest list, track RSVPs, dietary needs, and table assignments.",
    position: "right",
  },
  {
    target: "[data-tutorial='vendors']",
    title: "Vendor Manager",
    description: "Keep all vendor contacts, contracts, and payments organized in one place.",
    position: "right",
  },
  {
    target: "[data-tutorial='events']",
    title: "Event Planner",
    description: "Plan your Mehendi, Sangeet, Wedding, and Reception with detailed timelines.",
    position: "right",
  },
  {
    target: "[data-tutorial='ai']",
    title: "AI Assistant",
    description: "Stuck on something? Our AI helps with budgeting, seating, vendor recommendations, and more.",
    position: "bottom",
  },
  {
    target: "[data-tutorial='website']",
    title: "Wedding Website",
    description: "Create a beautiful wedding website to share with your guests. 9 premium templates included!",
    position: "bottom",
  },
  {
    target: "[data-tutorial='checklists']",
    title: "Cultural Checklists",
    description: "Never forget anything — checklists for Priest Kit, Emergency Kit, and Vidaai essentials.",
    position: "right",
  },
  {
    title: "You're All Set!",
    description: "Start by adding your budget and guest list. We're here to make your wedding planning stress-free.",
    position: "bottom",
  },
];

export default function TutorialOverlay({ open, onClose, steps, sidebarOpen, onSidebarOpen }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const hasTarget = !!step?.target;

  const findTarget = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    } else {
      setTargetRect(null);
    }
  }, [step?.target]);

  useEffect(() => {
    if (!open) return;
    const isMobile = window.innerWidth < 640;
    // On mobile, delay target finding to let sidebar animation finish
    const delay = isMobile && step?.target ? 300 : 0;
    const timer = setTimeout(() => findTarget(), delay);
    const onResize = () => findTarget();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, findTarget]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentStep < totalSteps - 1) setCurrentStep((p) => p + 1);
        else onClose();
      }
      if (e.key === "ArrowLeft" && currentStep > 0) {
        setCurrentStep((p) => p - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, currentStep, totalSteps, onClose]);

  useEffect(() => {
    if (open) setCurrentStep(0);
  }, [open]);

  // Auto-open sidebar on mobile when a step has a target
  useEffect(() => {
    if (!open) return;
    const isMobile = window.innerWidth < 640;
    if (isMobile && step?.target && onSidebarOpen) {
      onSidebarOpen(true);
    }
  }, [open, step?.target, onSidebarOpen]);

  // Close sidebar when tutorial closes
  useEffect(() => {
    if (!open && onSidebarOpen) {
      const isMobile = window.innerWidth < 640;
      if (isMobile) onSidebarOpen(false);
    }
  }, [open, onSidebarOpen]);

  const getTooltipPosition = () => {
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const isMobile = viewW < 640;
    const gap = 12;

    if (!targetRect) {
      // No target: center on screen
      if (isMobile) {
        return { top: `${Math.max(20, viewH * 0.15)}px`, left: "16px", right: "16px", transform: "" };
      }
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    if (isMobile) {
      // Mobile with target: scroll target into view, position tooltip below it
      const targetEl = step?.target ? document.querySelector(step.target) : null;
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      // Position tooltip at bottom of viewport
      return { top: "auto", bottom: "16px", left: "16px", right: "16px", transform: "" };
    }

    // Desktop: position relative to target
    const pos = step?.position || "bottom";
    const tooltipW = 340;
    const tooltipH = 200;

    let top: number;
    let left: number;
    let transform = "";

    switch (pos) {
      case "bottom":
        top = targetRect.top + targetRect.height + gap;
        left = targetRect.left + targetRect.width / 2;
        transform = "translateX(-50%)";
        if (left + tooltipW / 2 > viewW - 16) { left = viewW - tooltipW - 16; transform = ""; }
        if (left - tooltipW / 2 < 16) { left = 16; transform = ""; }
        if (top + tooltipH > viewH - 16) { top = targetRect.top - gap - tooltipH; }
        break;
      case "top":
        top = targetRect.top - gap - tooltipH;
        left = targetRect.left + targetRect.width / 2;
        transform = "translateX(-50%)";
        if (left + tooltipW / 2 > viewW - 16) { left = viewW - tooltipW - 16; transform = ""; }
        if (left - tooltipW / 2 < 16) { left = 16; transform = ""; }
        if (top < 16) { top = targetRect.top + targetRect.height + gap; }
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
        left = targetRect.left + targetRect.width + gap;
        transform = "";
        if (left + tooltipW > viewW - 16) { left = targetRect.left - gap - tooltipW; }
        if (left < 16) { left = 16; }
        if (top < 16) top = 16;
        if (top + tooltipH > viewH - 16) top = viewH - tooltipH - 16;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
        left = targetRect.left - gap - tooltipW;
        transform = "";
        if (left < 16) { left = targetRect.left + targetRect.width + gap; }
        if (left + tooltipW > viewW - 16) { left = viewW - tooltipW - 16; }
        if (top < 16) top = 16;
        if (top + tooltipH > viewH - 16) top = viewH - tooltipH - 16;
        break;
      default:
        top = viewH / 2 - tooltipH / 2;
        left = viewW / 2 - tooltipW / 2;
        transform = "";
    }

    return { top: `${top}px`, left: `${left}px`, transform };
  };

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[99999]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Spotlight hole */}
      {hasTarget && targetRect && (
        <motion.div
          key={`spotlight-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute rounded-xl pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: "0 0 0 4000px rgba(0,0,0,0.6), 0 0 20px 4px rgba(212,175,55,0.3)",
            zIndex: 1,
          }}
        />
      )}

      {/* Pulsing glow ring on target */}
      {hasTarget && targetRect && (
        <motion.div
          key={`glow-${currentStep}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.98, 1.01, 0.98] }}
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

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute z-10 sm:w-[340px]"
          style={getTooltipPosition()}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Step indicator */}
            <div className="px-5 pt-4 pb-0 flex items-center justify-between">
              <span className="text-[0.65rem] font-semibold text-gray-400 uppercase tracking-widest">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
              <div>
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((p) => p - 1)}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                  >
                    <i className="fas fa-arrow-left mr-1.5" />
                    Back
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                >
                  Skip
                </button>
                <button
                  onClick={() => {
                    if (currentStep < totalSteps - 1) setCurrentStep((p) => p + 1);
                    else onClose();
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#722F37] to-[#8B3A44] rounded-lg hover:from-[#5C2530] hover:to-[#722F37] transition-all shadow-md hover:shadow-lg cursor-pointer min-h-[44px]"
                >
                  {currentStep < totalSteps - 1 ? (
                    <>
                      Next
                      <i className="fas fa-arrow-right ml-1.5" />
                    </>
                  ) : (
                    <>
                      Get Started
                      <i className="fas fa-check ml-1.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Keyboard hint — hidden on mobile */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-3 text-white/40 text-[0.65rem]">
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
