"use client";

import { useMemo } from "react";

interface DurationPickerProps {
  value: number; // total seconds
  onChange: (seconds: number) => void;
  compact?: boolean;
}

const PRESETS = [
  { label: "1:00", seconds: 60 },
  { label: "2:00", seconds: 120 },
  { label: "3:00", seconds: 180 },
  { label: "3:30", seconds: 210 },
  { label: "4:00", seconds: 240 },
  { label: "4:30", seconds: 270 },
  { label: "5:00", seconds: 300 },
  { label: "6:00", seconds: 360 },
];

export default function DurationPicker({ value, onChange, compact = false }: DurationPickerProps) {
  const minutes = useMemo(() => Math.floor(value / 60), [value]);
  const seconds = useMemo(() => value % 60, [value]);

  const updateTotal = (m: number, s: number) => {
    onChange(Math.max(0, m * 60 + s));
  };

  const handleMinutesChange = (delta: number) => {
    const newMin = Math.max(0, Math.min(99, minutes + delta));
    updateTotal(newMin, seconds);
  };

  const handleSecondsChange = (delta: number) => {
    let newSec = seconds + delta;
    let newMin = minutes;
    if (newSec >= 60) { newSec = 0; newMin = Math.min(99, minutes + 1); }
    if (newSec < 0) { newSec = 59; newMin = Math.max(0, minutes - 1); }
    updateTotal(newMin, newSec);
  };

  const handleMinutesInput = (val: string) => {
    const m = parseInt(val) || 0;
    const clamped = Math.max(0, Math.min(99, m));
    updateTotal(clamped, seconds);
  };

  const handleSecondsInput = (val: string) => {
    const s = parseInt(val) || 0;
    const clamped = Math.max(0, Math.min(59, s));
    updateTotal(minutes, clamped);
  };

  const isPreset = (preset: { seconds: number }) => value === preset.seconds;

  if (compact) {
    return (
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Performance duration</label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button onClick={() => handleMinutesChange(-1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-500 transition-colors" title="-1 min">
              <i className="fas fa-minus text-[10px]" />
            </button>
            <input
              type="number"
              min={0}
              max={99}
              value={minutes}
              onChange={(e) => handleMinutesInput(e.target.value)}
              className="w-10 h-7 text-center text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={() => handleMinutesChange(1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-500 transition-colors" title="+1 min">
              <i className="fas fa-plus text-[10px]" />
            </button>
          </div>
          <span className="text-sm font-bold text-gray-400">:</span>
          <div className="flex items-center gap-1">
            <button onClick={() => handleSecondsChange(-5)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-500 transition-colors" title="-5s">
              <i className="fas fa-minus text-[10px]" />
            </button>
            <input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) => handleSecondsInput(e.target.value)}
              className="w-10 h-7 text-center text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={() => handleSecondsChange(5)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-500 transition-colors" title="+5s">
              <i className="fas fa-plus text-[10px]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Time Inputs */}
      <div className="flex items-center justify-center gap-1">
        {/* Minutes */}
        <div className="flex flex-col items-center gap-1">
          <button onClick={() => handleMinutesChange(1)} className="w-10 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-600 transition-colors">
            <i className="fas fa-chevron-up text-xs" />
          </button>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={99}
              value={minutes}
              onChange={(e) => handleMinutesInput(e.target.value)}
              className="w-14 h-12 text-center text-xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">min</span>
        </div>

        {/* Separator */}
        <span className="text-2xl font-bold text-gray-300 mb-5">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center gap-1">
          <button onClick={() => handleSecondsChange(1)} className="w-10 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-600 transition-colors">
            <i className="fas fa-chevron-up text-xs" />
          </button>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) => handleSecondsInput(e.target.value)}
              className="w-14 h-12 text-center text-xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">sec</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {PRESETS.map((preset) => (
          <button
            key={preset.seconds}
            onClick={() => onChange(preset.seconds)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isPreset(preset)
                ? "bg-maroon text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
