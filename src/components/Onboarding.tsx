"use client";

import { useState, useRef, useEffect } from "react";
import DatePicker from "@/components/DatePicker";
import { COUNTRIES, CITIES_BY_COUNTRY, RELIGIONS_BY_COUNTRY, WEDDING_TEMPLATES } from "@/lib/weddingTemplates";

function formatBudgetDisplay(value: number, currency?: string): string {
  const cfg = (COUNTRIES as any).find((c: any) => c.currency === currency) || { symbol: "\u20B9", currency: "INR" };
  const symbol = getSymbol(currency);

  if (["INR", "PKR", "NPR", "BDT"].includes(currency || "INR")) {
    if (value >= 10000000) {
      const c = value / 10000000;
      return c % 1 === 0 ? `${symbol}${c} Crore` : `${symbol}${c.toFixed(1)} Crore`;
    }
    const l = value / 100000;
    return l % 1 === 0 ? `${symbol}${l} Lakh` : `${symbol}${l.toFixed(1)} Lakh`;
  }

  if (value >= 1000000) {
    const m = value / 1000000;
    return m % 1 === 0 ? `${symbol}${m}M` : `${symbol}${m.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return k % 1 === 0 ? `${symbol}${k}K` : `${symbol}${k.toFixed(1)}K`;
  }
  return `${symbol}${value}`;
}

function getSymbol(currency?: string): string {
  switch (currency) {
    case "PKR": return "\u20A8";
    case "BDT": return "\u09F3";
    case "LKR": return "Rs ";
    case "NPR": return "\u20A8";
    case "MVR": return "Rf ";
    case "AFN": return "\u060B";
    default: return "\u20B9";
  }
}

function getBudgetRange(currency?: string): { min: number; max: number; step: number } {
  switch (currency) {
    case "INR": return { min: 100000, max: 50000000, step: 50000 };
    case "PKR": return { min: 1500000, max: 50000000, step: 500000 };
    case "BDT": return { min: 300000, max: 20000000, step: 100000 };
    case "LKR": return { min: 500000, max: 20000000, step: 100000 };
    case "NPR": return { min: 500000, max: 10000000, step: 100000 };
    case "MVR": return { min: 50000, max: 10000000, step: 10000 };
    case "AFN": return { min: 300000, max: 50000000, step: 100000 };
    default: return { min: 100000, max: 50000000, step: 50000 };
  }
}

interface Props {
  onComplete: (data: any) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState({
    country: "",
    religion: "",
    region: "",
    budget: 1000000,
    guestCount: 200,
    weddingDays: 1,
    selectedEvents: [] as string[],
    weddingDate: "",
    weddingCity: "",
    customCity: "",
    userName: "",
  });
  const [budgetInput, setBudgetInput] = useState("1000000");
  const [guestInput, setGuestInput] = useState("200");
  const [daysInput, setDaysInput] = useState("1");

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const currency = COUNTRIES.find((c) => c.id === data.country)?.currency || "INR";
  const budgetRange = getBudgetRange(currency);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 1: return !!data.country;
      case 2: return !!data.religion;
      case 3: return !!data.region;
      case 4: return data.budget >= budgetRange.min;
      case 5: return data.guestCount >= 10;
      case 6: return data.weddingDays >= 1;
      case 7: return data.selectedEvents.length > 0;
      case 8: return true;
      default: return false;
    }
  };

  const handleContinue = () => {
    if (!canContinue()) {
      showToast("Please pick an option to move to the next section");
      return;
    }
    setStep(step + 1);
  };

  const selectCountry = (countryId: string) => {
    const country = COUNTRIES.find((c) => c.id === countryId);
    const newCurrency = country?.currency || "INR";
    const range = getBudgetRange(newCurrency);
    setData({
      ...data,
      country: countryId,
      religion: "",
      region: "",
      selectedEvents: [],
      budget: range.min,
      weddingCity: "",
    });
    setBudgetInput(range.min.toString());
  };

  const selectReligion = (r: string) => {
    const religions = RELIGIONS_BY_COUNTRY[data.country] || [];
    const religionData = religions.find((rel) => rel.id === r);

    // Auto-populate events from template
    const templates = WEDDING_TEMPLATES.filter(
      (t) => t.country === data.country && t.religion === r
    );
    const defaultTemplate = templates[0];
    const events = defaultTemplate ? defaultTemplate.events.map((e) => e.name) : [];

    setData({ ...data, religion: r, region: "", selectedEvents: events });
  };

  const selectRegion = (r: string) => {
    // Find the template for this combination and update events
    const template = WEDDING_TEMPLATES.find(
      (t) => t.country === data.country && t.religion === data.religion && t.region === r
    );
    const events = template ? template.events.map((e) => e.name) : data.selectedEvents;

    setData({ ...data, region: r, selectedEvents: events });
  };

  const toggleEvent = (e: string) => {
    setData({
      ...data,
      selectedEvents: data.selectedEvents.includes(e)
        ? data.selectedEvents.filter((x) => x !== e)
        : [...data.selectedEvents, e],
    });
  };

  const handleBudgetChange = (value: number) => {
    const clamped = Math.max(budgetRange.min, Math.min(budgetRange.max, value));
    setData({ ...data, budget: clamped });
    setBudgetInput(clamped.toString());
  };

  const handleBudgetInputChange = (val: string) => {
    setBudgetInput(val);
    const num = parseInt(val.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num)) {
      const clamped = Math.max(budgetRange.min, Math.min(budgetRange.max, num));
      setData({ ...data, budget: clamped });
    }
  };

  const handleGuestChange = (value: number) => {
    const clamped = Math.max(10, Math.min(5000, value));
    setData({ ...data, guestCount: clamped });
    setGuestInput(clamped.toString());
  };

  const handleGuestInputChange = (val: string) => {
    setGuestInput(val);
    const num = parseInt(val.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num)) {
      const clamped = Math.max(10, Math.min(5000, num));
      setData({ ...data, guestCount: clamped });
    }
  };

  const handleDaysChange = (value: number) => {
    const clamped = Math.max(1, Math.min(15, value));
    setData({ ...data, weddingDays: clamped });
    setDaysInput(clamped.toString());
  };

  const religions = RELIGIONS_BY_COUNTRY[data.country] || [];
  const regions: Record<string, string[]> = {
    hindu: data.country === "india"
      ? ["North Indian", "South Indian", "Bengali", "Gujarati", "Maharashtrian", "Rajput", "Punjabi"]
      : data.country === "bangladesh"
        ? ["Bengali"]
        : data.country === "nepal"
          ? ["Nepali", "Newari"]
          : data.country === "sri_lanka"
            ? ["Tamil"]
            : data.country === "pakistan"
              ? ["Pakistani"]
              : [],
    muslim: data.country === "pakistan"
      ? ["Sunni"]
      : data.country === "bangladesh"
        ? ["Bengali"]
        : data.country === "maldives"
          ? ["Maldivian"]
          : data.country === "afghanistan"
            ? ["Pashtun"]
            : data.country === "nepal"
              ? ["Nepali"]
              : data.country === "sri_lanka"
                ? ["Sri Lankan"]
                : ["Indian"],
    sikh: ["Punjabi"],
    buddhist: data.country === "sri_lanka"
      ? ["Sinhalese"]
      : data.country === "nepal"
        ? ["Nepali"]
        : ["Sinhalese"],
    christian: data.country === "pakistan"
      ? ["Pakistani"]
      : data.country === "sri_lanka"
        ? ["Sri Lankan"]
        : ["Indian"],
    jain: ["Indian"],
  };

  // Get events for current selection
  const template = WEDDING_TEMPLATES.find(
    (t) => t.country === data.country && t.religion === data.religion && t.region === data.region
  );
  const availableEvents = template ? template.events.map((e) => e.name) : [];

  // Get cities for selected country
  const cities = CITIES_BY_COUNTRY[data.country] || [];

  return (
    <div className="min-h-screen bg-cream flex flex-col relative">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg" style={{ animation: "toastSlideIn 0.3s ease" }}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between px-4 md:px-10 py-3 md:py-5">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "55px", width: "auto" }} />
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-[100px] md:w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-maroon to-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs md:text-sm text-gray-500 font-medium whitespace-nowrap">Step {step} of {totalSteps}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 md:px-6">
        <div className="w-full max-w-[720px]">

          {/* STEP 1: Country */}
          {step === 1 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Where is your wedding?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Select your country to get the right traditions, currency, and planning defaults.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {COUNTRIES.map((c) => (
                  <button key={c.id} onClick={() => selectCountry(c.id)}
                    className={`flex flex-col items-center gap-2 md:gap-3 p-4 md:p-7 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.country === c.id ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)] bg-gradient-to-br from-maroon/5 to-gold/5" : "border-gray-200"}`}>
                    <span className="text-3xl md:text-5xl">{c.flag}</span>
                    <span className="font-semibold text-xs md:text-sm">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Religion */}
          {step === 2 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">What type of wedding are you planning?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">This helps us load the right rituals, templates, and budget categories.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {religions.map((r) => (
                  <button key={r.id} onClick={() => selectReligion(r.id)}
                    className={`flex flex-col items-center gap-2 md:gap-3 p-4 md:p-7 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.religion === r.id ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)] bg-gradient-to-br from-maroon/5 to-gold/5" : "border-gray-200"}`}>
                    <div className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-colors ${data.religion === r.id ? "bg-maroon text-white" : "bg-gradient-to-br from-maroon/10 to-gold/10 text-maroon"}`}>
                      <ReligionIcon religion={r.id} />
                    </div>
                    <span className="font-semibold text-xs md:text-sm">{r.name} Wedding</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Region */}
          {step === 3 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Which region/community?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">This customizes the specific rituals and traditions.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {(regions[data.religion] || []).map((r) => (
                  <button key={r} onClick={() => selectRegion(r)}
                    className={`flex flex-col items-center gap-2 md:gap-3 p-4 md:p-7 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.region === r ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)] bg-gradient-to-br from-maroon/5 to-gold/5" : "border-gray-200"}`}>
                    <div className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-colors ${data.region === r ? "bg-maroon text-white" : "bg-gradient-to-br from-maroon/10 to-gold/10 text-maroon"}`}>
                      <MapPinIcon />
                    </div>
                    <span className="font-semibold text-sm">{r}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Budget */}
          {step === 4 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">What&apos;s your wedding budget?</h2>
              <p className="text-gray-500 mb-1 text-sm md:text-base">This helps us suggest realistic allocations.</p>
              <p className="text-xs md:text-sm text-gray-400 mb-6 md:mb-8 italic">Can always be changed later</p>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <span className="text-3xl md:text-5xl font-extrabold text-maroon">{formatBudgetDisplay(data.budget, currency)}</span>
                </div>
                <input
                  type="range"
                  min={budgetRange.min}
                  max={budgetRange.max}
                  step={budgetRange.step}
                  value={data.budget}
                  onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium mb-6">
                  <span>{getSymbol(currency)}{budgetRange.min >= 100000 ? (budgetRange.min / 100000).toFixed(0) + " L" : budgetRange.min.toLocaleString()}</span>
                  <span>{getSymbol(currency)}{budgetRange.max >= 10000000 ? (budgetRange.max / 10000000).toFixed(0) + " Cr" : budgetRange.max >= 100000 ? (budgetRange.max / 100000).toFixed(0) + " L" : budgetRange.max.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-600">Or type amount:</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">{getSymbol(currency)}</span>
                    <input
                      type="text"
                      value={budgetInput}
                      onChange={(e) => handleBudgetInputChange(e.target.value)}
                      onBlur={() => {
                        const num = parseInt(budgetInput.replace(/[^\d]/g, ""), 10);
                        handleBudgetChange(isNaN(num) ? budgetRange.min : Math.max(budgetRange.min, Math.min(budgetRange.max, num)));
                      }}
                      className="w-48 pl-8 pr-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors text-right font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Guest Count */}
          {step === 5 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">How many guests are you expecting?</h2>
              <p className="text-gray-500 mb-1 text-sm md:text-base">This affects your catering budget and venue selection.</p>
              <p className="text-xs md:text-sm text-gray-400 mb-6 md:mb-8 italic">Can always be changed later</p>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <span className="text-3xl md:text-5xl font-extrabold text-maroon">{data.guestCount.toLocaleString("en-IN")}</span>
                  <span className="text-base md:text-lg text-gray-500 ml-2">guests</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={5000}
                  step={10}
                  value={data.guestCount}
                  onChange={(e) => handleGuestChange(parseInt(e.target.value))}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium mb-6">
                  <span>10</span>
                  <span>5,000</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-600">Or type number:</label>
                  <input
                    type="text"
                    value={guestInput}
                    onChange={(e) => handleGuestInputChange(e.target.value)}
                    onBlur={() => {
                      const num = parseInt(guestInput.replace(/[^\d]/g, ""), 10);
                      handleGuestChange(isNaN(num) ? 10 : Math.max(10, Math.min(5000, num)));
                    }}
                    className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors text-right font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Wedding Days */}
          {step === 6 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">How many days will the main wedding span?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">This helps us plan the timeline. Many South Asian weddings span multiple days.</p>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <span className="text-3xl md:text-5xl font-extrabold text-maroon">{data.weddingDays}</span>
                  <span className="text-base md:text-lg text-gray-500 ml-2">{data.weddingDays === 1 ? "day" : "days"}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={data.weddingDays}
                  onChange={(e) => handleDaysChange(parseInt(e.target.value))}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium mb-6">
                  <span>1 day</span>
                  <span>15 days</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-600">Or type number:</label>
                  <input
                    type="text"
                    value={daysInput}
                    onChange={(e) => {
                      setDaysInput(e.target.value);
                      const num = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
                      if (!isNaN(num)) handleDaysChange(num);
                    }}
                    onBlur={() => {
                      const num = parseInt(daysInput.replace(/[^\d]/g, ""), 10);
                      handleDaysChange(isNaN(num) ? 1 : Math.max(1, Math.min(15, num)));
                    }}
                    className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors text-right font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Events */}
          {step === 7 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Which events are you planning?</h2>
              <p className="text-gray-500 mb-1 text-sm md:text-base">Select all that apply. We&apos;ll create a timeline for each.</p>
              <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6 italic">You can add more events later</p>
              {availableEvents.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {availableEvents.map((e) => (
                    <button key={e} onClick={() => toggleEvent(e)}
                      className={`flex items-center gap-3 p-4 bg-white border-2 rounded-lg cursor-pointer transition-all ${data.selectedEvents.includes(e) ? "border-maroon bg-maroon/5" : "border-gray-200"}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${data.selectedEvents.includes(e) ? "border-maroon bg-maroon" : "border-gray-300"}`}>
                        {data.selectedEvents.includes(e) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-sm">{e}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Loading events for your selection...</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Date, City, Name */}
          {step === 8 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Almost done! When and where?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">We&apos;ll set up reminders based on your wedding date. You can always change this later.</p>
              <div className="max-w-[400px] space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Wedding Date</label>
                  <DatePicker value={data.weddingDate} min={new Date().toISOString().split("T")[0]} onChange={(val) => setData({ ...data, weddingDate: val })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Wedding City</label>
                  <select value={data.weddingCity} onChange={(e) => setData({ ...data, weddingCity: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-maroon transition-colors bg-white">
                    <option value="">Select your city</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {data.weddingCity === "Other" && (
                    <input type="text" placeholder="Type your city" value={data.customCity || ""} onChange={(e) => setData({ ...data, customCity: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-maroon transition-colors mt-2" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                  <input type="text" placeholder="e.g., Priya Sharma" value={data.userName} onChange={(e) => setData({ ...data, userName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-maroon transition-colors" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-6 md:mt-10 pt-4 md:pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-600 hover:text-maroon font-medium transition-colors text-sm md:text-base">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : <div />}
            {step < totalSteps ? (
              <button onClick={handleContinue}
                className={`flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-4 text-sm md:text-lg font-bold rounded-lg transition-all ${
                  canContinue()
                    ? "text-white bg-gradient-to-br from-maroon to-maroon-light shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)] cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}>
                Continue
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button onClick={() => onComplete({ ...data, currency })}
                className="flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-4 text-sm md:text-lg font-bold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)] transition-all cursor-pointer">
                Create My Wedding Plan
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReligionIcon({ religion }: { religion: string }) {
  switch (religion) {
    case "hindu":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
          <path d="M4 18h16" />
          <path d="M5 18v-4h14v4" />
          <path d="M7 14v-3h10v3" />
          <path d="M8 11V8h8v3" />
          <path d="M9 8c0-3 1.5-5 3-5s3 2 3 5" />
          <circle cx="12" cy="2.5" r="1" fill="currentColor" opacity="0.3" />
          <line x1="7" y1="14" x2="7" y2="18" />
          <line x1="17" y1="14" x2="17" y2="18" />
        </svg>
      );
    case "muslim":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18h18v2H3z" fill="currentColor" opacity="0.15" />
          <path d="M3 18h18" />
          <path d="M5 18v-5h14v5" />
          <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
          <line x1="4" y1="8" x2="4" y2="18" />
          <line x1="20" y1="8" x2="20" y2="18" />
          <circle cx="4" cy="7.5" r="0.8" fill="currentColor" opacity="0.3" />
          <circle cx="20" cy="7.5" r="0.8" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case "sikh":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18h18v2H3z" fill="currentColor" opacity="0.15" />
          <path d="M3 18h18" />
          <path d="M6 18v-4h12v4" />
          <path d="M8 14c0-4 2-7 4-7s4 3 4 7" />
          <path d="M10.5 7c0-1.5.7-3 1.5-3s1.5 1.5 1.5 3" />
          <line x1="12" y1="5" x2="12" y2="3" />
          <circle cx="12" cy="2.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case "christian":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
          <path d="M4 18h16" />
          <path d="M6 18v-6h12v6" />
          <path d="M10 12V7l2-4 2 4v5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="11" y1="2" x2="13" y2="2" />
          <circle cx="12" cy="14.5" r="1" />
        </svg>
      );
    case "jain":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
          <path d="M4 18h16" />
          <path d="M6 18v-5h12v5" />
          <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3" />
          <line x1="12" y1="6" x2="12" y2="4" />
          <circle cx="12" cy="3.5" r="0.5" fill="currentColor" opacity="0.4" />
        </svg>
      );
    case "buddhist":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
          <path d="M4 18h16" />
          <path d="M6 18v-5h12v5" />
          <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="12" r="0.8" fill="currentColor" opacity="0.3" />
          <line x1="12" y1="6" x2="12" y2="4" />
          <circle cx="12" cy="3" r="0.5" fill="currentColor" />
        </svg>
      );
    default:
      return <MapPinIcon />;
  }
}

function MapPinIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
