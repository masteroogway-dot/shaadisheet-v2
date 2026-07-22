"use client";

import { useState, useRef, useEffect } from "react";
import DatePicker from "@/components/DatePicker";

const REGIONS: Record<string, string[]> = {
  hindu: ["North Indian", "South Indian", "Bengali", "Gujarati", "Maharashtrian", "Rajput", "Punjabi"],
  muslim: ["Sunni", "Shia", "Bohra", "Sufi"],
  sikh: ["Jat Sikh", "Khatri Sikh", "Other"],
  christian: ["Kerala (Nasrani)", "Goan", "Northeast", "North Indian"],
  jain: ["Digambar", "Shwetambar"],
};

const EVENTS: Record<string, string[]> = {
  hindu: ["Roka", "Engagement", "Mehendi", "Sangeet", "Haldi", "Wedding Day", "Reception"],
  muslim: ["Mangni", "Mehendi", "Nikah", "Walima"],
  sikh: ["Kurmai", "Mehendi", "Sangeet", "Anand Karaj", "Langar", "Reception"],
  christian: ["Engagement", "Roce Ceremony", "Church Wedding", "Reception"],
  jain: ["Roka", "Engagement", "Mehendi", "Sangeet", "Wedding Ceremony", "Reception"],
};

function formatBudgetDisplay(value: number): string {
  if (value >= 10000000) {
    const c = value / 10000000;
    return c % 1 === 0 ? `\u20B9${c} Crore` : `\u20B9${c.toFixed(1)} Crore`;
  }
  const l = value / 100000;
  return l % 1 === 0 ? `\u20B9${l} Lakh` : `\u20B9${l.toFixed(1)} Lakh`;
}

interface Props {
  onComplete: (data: any) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState({
    religion: "",
    region: "",
    budget: 1000000,
    guestCount: 200,
    weddingDays: 1,
    selectedEvents: [] as string[],
    weddingDate: "",
    weddingCity: "",
    userName: "",
  });
  const [budgetInput, setBudgetInput] = useState("1000000");
  const [guestInput, setGuestInput] = useState("200");
  const [daysInput, setDaysInput] = useState("1");

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

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
      case 1: return !!data.religion;
      case 2: return !!data.region;
      case 3: return data.budget >= 1000000;
      case 4: return data.guestCount >= 50;
      case 5: return data.weddingDays >= 1;
      case 6: return data.selectedEvents.length > 0;
      case 7: return true;
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

  const selectReligion = (r: string) => {
    setData({ ...data, religion: r, region: "", selectedEvents: EVENTS[r] || [] });
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
    const clamped = Math.max(1000000, Math.min(100000000, value));
    setData({ ...data, budget: clamped });
    setBudgetInput(clamped.toString());
  };

  const handleBudgetInputChange = (val: string) => {
    setBudgetInput(val);
    const num = parseInt(val.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num)) {
      const clamped = Math.max(1000000, Math.min(100000000, num));
      setData({ ...data, budget: clamped });
    }
  };

  const handleGuestChange = (value: number) => {
    const clamped = Math.max(50, Math.min(5000, value));
    setData({ ...data, guestCount: clamped });
    setGuestInput(clamped.toString());
  };

  const handleGuestInputChange = (val: string) => {
    setGuestInput(val);
    const num = parseInt(val.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num)) {
      const clamped = Math.max(50, Math.min(5000, num));
      setData({ ...data, guestCount: clamped });
    }
  };

  const handleDaysChange = (value: number) => {
    const clamped = Math.max(1, Math.min(15, value));
    setData({ ...data, weddingDays: clamped });
    setDaysInput(clamped.toString());
  };

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
          {step === 1 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">What type of wedding are you planning?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">This helps us load the right rituals, templates, and budget categories.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[
                  { id: "hindu", label: "Hindu Wedding", icon: <DiyaIcon /> },
                  { id: "muslim", label: "Muslim Wedding", icon: <CrescentIcon /> },
                  { id: "sikh", label: "Sikh Wedding", icon: <KhandaIcon /> },
                  { id: "christian", label: "Christian Wedding", icon: <CrossIcon /> },
                  { id: "jain", label: "Jain Wedding", icon: <AhimsaIcon /> },
                ].map((r) => (
                  <button key={r.id} onClick={() => selectReligion(r.id)}
                    className={`flex flex-col items-center gap-2 md:gap-3 p-4 md:p-7 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.religion === r.id ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)] bg-gradient-to-br from-maroon/5 to-gold/5" : "border-gray-200"}`}>
                    <div className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-colors ${data.religion === r.id ? "bg-maroon text-white" : "bg-gradient-to-br from-maroon/10 to-gold/10 text-maroon"}`}>
                      {r.icon}
                    </div>
                    <span className="font-semibold text-xs md:text-sm">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Which region/community?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">This customizes the specific rituals and traditions.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {(REGIONS[data.religion] || REGIONS.hindu).map((r) => (
                  <button key={r} onClick={() => setData({ ...data, region: r })}
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

          {step === 3 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">What&apos;s your wedding budget?</h2>
              <p className="text-gray-500 mb-1 text-sm md:text-base">This helps us suggest realistic allocations.</p>
              <p className="text-xs md:text-sm text-gray-400 mb-6 md:mb-8 italic">Can always be changed later</p>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <span className="text-3xl md:text-5xl font-extrabold text-maroon">{formatBudgetDisplay(data.budget)}</span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={100000000}
                  step={50000}
                  value={data.budget}
                  onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium mb-6">
                  <span>{"\u20B9"}10 Lakh</span>
                  <span>{"\u20B9"}10 Crore</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-600">Or type amount:</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">{"\u20B9"}</span>
                    <input
                      type="text"
                      value={budgetInput}
                      onChange={(e) => handleBudgetInputChange(e.target.value)}
                      onBlur={() => {
                        const num = parseInt(budgetInput.replace(/[^\d]/g, ""), 10);
                        handleBudgetChange(isNaN(num) ? 1000000 : Math.max(1000000, Math.min(100000000, num)));
                      }}
                      className="w-48 pl-8 pr-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors text-right font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
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
                  min={50}
                  max={5000}
                  step={10}
                  value={data.guestCount}
                  onChange={(e) => handleGuestChange(parseInt(e.target.value))}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium mb-6">
                  <span>50</span>
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
                      handleGuestChange(isNaN(num) ? 50 : Math.max(50, Math.min(5000, num)));
                    }}
                    className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors text-right font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">How many days will the main wedding span?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Indian weddings often span multiple days. This helps us plan the timeline.</p>
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

          {step === 6 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Which events are you planning?</h2>
              <p className="text-gray-500 mb-1 text-sm md:text-base">Select all that apply. We&apos;ll create a timeline for each.</p>
              <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6 italic">You can add more events later</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {(EVENTS[data.religion] || EVENTS.hindu).map((e) => (
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
            </div>
          )}

          {step === 7 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Almost done! When and where?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">We&apos;ll set up reminders based on your wedding date.</p>
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
                    {["Mumbai", "Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Nashik", "Jaipur", "Ahmedabad", "Kolkata", "Chennai", "Other"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
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
              <button onClick={() => onComplete(data)}
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

function DiyaIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Temple dome */}
      <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
      <path d="M4 18h16" />
      <path d="M5 18v-4h14v4" />
      <path d="M7 14v-3h10v3" />
      <path d="M8 11V8h8v3" />
      {/* Dome */}
      <path d="M9 8c0-3 1.5-5 3-5s3 2 3 5" />
      {/* Kalash on top */}
      <circle cx="12" cy="2.5" r="1" fill="currentColor" opacity="0.3" />
      <path d="M11.5 3.5v1" />
      {/* Pillars */}
      <line x1="7" y1="14" x2="7" y2="18" />
      <line x1="17" y1="14" x2="17" y2="18" />
    </svg>
  );
}

function CrescentIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Mosque dome */}
      <path d="M3 18h18v2H3z" fill="currentColor" opacity="0.15" />
      <path d="M3 18h18" />
      <path d="M5 18v-5h14v5" />
      <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
      {/* Minarets */}
      <line x1="4" y1="8" x2="4" y2="18" />
      <line x1="20" y1="8" x2="20" y2="18" />
      <circle cx="4" cy="7.5" r="0.8" fill="currentColor" opacity="0.3" />
      <circle cx="20" cy="7.5" r="0.8" fill="currentColor" opacity="0.3" />
      {/* Crescent on top */}
      <path d="M11 4.5a1.5 1.5 0 1 0 2 0 1.5 1.5 0 0 0-2 0" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function KhandaIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Gurdwara dome structure */}
      <path d="M3 18h18v2H3z" fill="currentColor" opacity="0.15" />
      <path d="M3 18h18" />
      <path d="M6 18v-4h12v4" />
      {/* Main dome */}
      <path d="M8 14c0-4 2-7 4-7s4 3 4 7" />
      {/* Small dome on top */}
      <path d="M10.5 7c0-1.5.7-3 1.5-3s1.5 1.5 1.5 3" />
      {/* Khanda symbol on dome */}
      <line x1="12" y1="5" x2="12" y2="3" />
      <circle cx="12" cy="2.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Church building */}
      <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
      <path d="M4 18h16" />
      <path d="M6 18v-6h12v6" />
      {/* Steeple */}
      <path d="M10 12V7l2-4 2 4v5" />
      {/* Cross on top */}
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="11" y1="2" x2="13" y2="2" />
      {/* Door */}
      <path d="M10.5 18v-3h3v3" />
      {/* Window */}
      <circle cx="12" cy="14.5" r="1" />
    </svg>
  );
}

function AhimsaIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Jain temple / Ahimsa hand */}
      <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
      <path d="M4 18h16" />
      <path d="M6 18v-5h12v5" />
      {/* Dome */}
      <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
      {/* Ahimsa hand (palm with wheel) */}
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3" />
      {/* Small spire on top */}
      <line x1="12" y1="6" x2="12" y2="4" />
      <circle cx="12" cy="3.5" r="0.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
