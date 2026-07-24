"use client";

import { useEffect, useState } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
  undoAction?: () => void;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  const [remaining, setRemaining] = useState(5);
  const hasUndo = !!toast.undoAction;

  useEffect(() => {
    if (!hasUndo) {
      const timer = setTimeout(() => onDismiss(toast.id), 3000);
      return () => clearTimeout(timer);
    }
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          onDismiss(toast.id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [toast.id, onDismiss, hasUndo]);

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-toastSlideIn ${
        toast.type === "success"
          ? "bg-white border border-green-200 text-green-800"
          : "bg-white border border-red-200 text-red-800"
      }`}
    >
      {toast.type === "success" ? (
        <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )}
      <span className="flex-1">{toast.message}</span>
      {hasUndo && (
        <button
          onClick={() => { toast.undoAction?.(); onDismiss(toast.id); }}
          className="text-xs font-bold text-maroon hover:text-maroon-dark underline cursor-pointer shrink-0"
        >
          Undo ({remaining}s)
        </button>
      )}
      <button onClick={() => onDismiss(toast.id)} className="ml-1 text-gray-400 hover:text-gray-600 cursor-pointer">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
