"use client";

import { useState, useRef, useEffect } from "react";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

function formatDisplay(val: string): string {
  if (!val) return "";
  const [h, m] = val.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "";
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function to24Hour(h12: number, period: string, min: string): string {
  let h24 = h12;
  if (period === "AM" && h12 === 12) h24 = 0;
  else if (period === "PM" && h12 !== 12) h24 = h12 + 12;
  return `${String(h24).padStart(2, "0")}:${min}`;
}

function parseTime(val: string): { hour: number; minute: string; period: string } {
  if (!val) return { hour: 10, minute: "00", period: "AM" };
  const [h, m] = val.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return { hour: 10, minute: "00", period: "AM" };
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const clamped = Math.max(0, Math.min(59, m));
  return { hour: h12, minute: String(clamped).padStart(2, "0"), period };
}

export default function TimePicker({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parsed = parseTime(value);
  const [selHour, setSelHour] = useState(parsed.hour);
  const [selMin, setSelMin] = useState(parsed.minute);
  const [selPeriod, setSelPeriod] = useState(parsed.period);

  useEffect(() => {
    if (open) {
      const p = parseTime(value);
      setSelHour(p.hour);
      setSelMin(p.minute);
      setSelPeriod(p.period);
    }
  }, [open, value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const apply = (h: number, m: string, p: string) => {
    onChange(to24Hour(h, p, m));
    setOpen(false);
  };

  const displayText = value ? formatDisplay(value) : "Select time";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-3 py-2.5 border-[1.5px] rounded-[10px] text-left text-sm transition-colors cursor-pointer flex items-center justify-between ${
          open ? "border-maroon bg-white" : "border-gray-200 bg-[#fafafa] hover:border-gray-300"
        }`}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{displayText}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-[150] mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-[240px]">
          {/* Hour */}
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Hour</div>
            <div className="grid grid-cols-6 gap-1">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setSelHour(h)}
                  className={`h-8 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    selHour === h ? "bg-maroon text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Minute */}
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Minutes</div>
            <div className="flex items-center gap-2 mb-1.5">
              <input
                type="number"
                min={0}
                max={59}
                value={selMin}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v >= 0 && v <= 59) setSelMin(String(v).padStart(2, "0"));
                }}
                className="w-14 h-8 text-center text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-maroon bg-[#fafafa]"
              />
              <div className="flex gap-1 flex-1">
                {[0, 5, 10, 15, 30, 45].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelMin(String(m).padStart(2, "0"))}
                    className={`h-8 flex-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${
                      selMin === String(m).padStart(2, "0") ? "bg-maroon text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AM/PM */}
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-1">
              {["AM", "PM"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelPeriod(p)}
                  className={`h-8 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                    selPeriod === p ? "bg-maroon text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer px-2 py-1"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => apply(selHour, selMin, selPeriod)}
              className="text-xs font-semibold text-white bg-maroon hover:bg-maroon-dark rounded-lg px-3 py-1.5 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
