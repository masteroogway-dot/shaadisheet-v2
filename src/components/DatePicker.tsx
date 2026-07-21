"use client";

import { useState, useRef, useEffect } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

function parseDate(val: string): Date | null {
  if (!val) return null;
  const d = new Date(val + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDay(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday=0
}

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = parseDate(value);
  const minDate = parseDate(min || "");
  const maxDate = parseDate(max || "");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear());

  useEffect(() => {
    if (open && selected) {
      setViewMonth(selected.getMonth());
      setViewYear(selected.getFullYear());
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayText = selected
    ? `${selected.getDate()} ${MONTHS[selected.getMonth()]} ${selected.getFullYear()}`
    : placeholder;

  const isDisabled = (y: number, m: number, d: number) => {
    const date = new Date(y, m, d);
    date.setHours(0, 0, 0, 0);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const startDay = getStartDay(viewYear, viewMonth);
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDay = (d: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onChange(dateStr);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-3 py-2.5 border-[1.5px] rounded-[10px] text-left text-sm transition-colors cursor-pointer flex items-center justify-between ${
          open ? "border-maroon bg-white" : "border-gray-200 bg-[#fafafa] hover:border-gray-300"
        }`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>{displayText}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-[150] mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-[280px]">
          {/* Month/Year nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-800">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className={`text-center text-[11px] font-semibold py-1 ${d === "Sat" || d === "Sun" ? "text-maroon" : "text-gray-400"}`}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              if (d === null) return <div key={`e${i}`} />;
              const disabled = isDisabled(viewYear, viewMonth, d);
              const isSelected = selected && selected.getDate() === d && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;
              const isToday = today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
              return (
                <button
                  key={d}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(d)}
                  className={`h-8 text-xs rounded-lg font-medium transition-colors cursor-pointer
                    ${disabled ? "text-gray-300 cursor-not-allowed" : isSelected ? "bg-maroon text-white" : isToday ? "bg-maroon/10 text-maroon font-bold" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer px-2 py-1"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => { const t = new Date(); onChange(toDateString(t)); setOpen(false); }}
              className="text-xs text-maroon font-semibold hover:text-maroon-dark cursor-pointer px-2 py-1"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
