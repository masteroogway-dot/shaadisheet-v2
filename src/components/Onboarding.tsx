"use client";

import { useState } from "react";

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

interface Props {
  onComplete: (data: any) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    religion: "",
    region: "",
    budget: "",
    guests: "",
    selectedEvents: [] as string[],
    weddingDate: "",
    weddingCity: "",
    userName: "",
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

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

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-2.5 text-xl font-extrabold">
          <span className="text-maroon text-2xl tracking-tight">|||</span>
          <span>ShaadiSheet</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-maroon to-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Step {step} of {totalSteps}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[720px]">
          {/* Step 1: Religion */}
          {step === 1 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-3xl font-bold mb-2">What type of wedding are you planning?</h2>
              <p className="text-gray-500 mb-8">This helps us load the right rituals, templates, and budget categories.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: "hindu", icon: "🕉️", label: "Hindu Wedding" },
                  { id: "muslim", icon: "☪️", label: "Muslim Wedding" },
                  { id: "sikh", icon: "🙏", label: "Sikh Wedding" },
                  { id: "christian", icon: "✝️", label: "Christian Wedding" },
                  { id: "jain", icon: "🙏", label: "Jain Wedding" },
                ].map((r) => (
                  <button key={r.id} onClick={() => selectReligion(r.id)}
                    className={`flex flex-col items-center gap-3 p-7 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.religion === r.id ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)] bg-gradient-to-br from-maroon/5 to-gold/5" : "border-gray-200"}`}>
                    <span className="text-3xl w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full">{r.icon}</span>
                    <span className="font-semibold text-sm">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Region */}
          {step === 2 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-3xl font-bold mb-2">Which region/community?</h2>
              <p className="text-gray-500 mb-8">This customizes the specific rituals and traditions.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(REGIONS[data.religion] || REGIONS.hindu).map((r) => (
                  <button key={r} onClick={() => setData({ ...data, region: r })}
                    className={`flex flex-col items-center gap-3 p-7 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.region === r ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)]" : "border-gray-200"}`}>
                    <span className="text-3xl w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full">📍</span>
                    <span className="font-semibold text-sm">{r}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-3xl font-bold mb-2">What&apos;s your wedding budget?</h2>
              <p className="text-gray-500 mb-8">This helps us suggest realistic allocations.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "under10", icon: "💰", label: "Under ₹10 Lakhs" },
                  { id: "10to30", icon: "💰💰", label: "₹10 - 30 Lakhs" },
                  { id: "30to50", icon: "💰💰💰", label: "₹30 - 50 Lakhs" },
                  { id: "50to1cr", icon: "💎", label: "₹50 Lakhs - 1 Crore" },
                  { id: "above1cr", icon: "👑", label: "Above ₹1 Crore" },
                ].map((b) => (
                  <button key={b.id} onClick={() => setData({ ...data, budget: b.id })}
                    className={`flex items-center gap-4 p-5 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.budget === b.id ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)]" : "border-gray-200"}`}>
                    <span className="text-2xl">{b.icon}</span>
                    <span className="font-semibold">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Guests */}
          {step === 4 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-3xl font-bold mb-2">How many guests are you expecting?</h2>
              <p className="text-gray-500 mb-8">This affects your catering budget and venue selection.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "small", icon: "👥", label: "Under 100 (Intimate)" },
                  { id: "medium", icon: "👥👥", label: "100 - 300 (Medium)" },
                  { id: "large", icon: "👥👥👥", label: "300 - 500 (Large)" },
                  { id: "grand", icon: "🏟️", label: "500+ (Grand)" },
                ].map((g) => (
                  <button key={g.id} onClick={() => setData({ ...data, guests: g.id })}
                    className={`flex items-center gap-4 p-5 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.guests === g.id ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)]" : "border-gray-200"}`}>
                    <span className="text-2xl">{g.icon}</span>
                    <span className="font-semibold">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Events */}
          {step === 5 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-3xl font-bold mb-2">Which events are you planning?</h2>
              <p className="text-gray-500 mb-8">Select all that apply. We&apos;ll create a timeline for each.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(EVENTS[data.religion] || EVENTS.hindu).map((e) => (
                  <button key={e} onClick={() => toggleEvent(e)}
                    className={`flex items-center gap-3 p-4 bg-white border-2 rounded-lg cursor-pointer transition-all ${data.selectedEvents.includes(e) ? "border-maroon bg-maroon/5" : "border-gray-200"}`}>
                    <input type="checkbox" checked={data.selectedEvents.includes(e)} readOnly className="w-4 h-4 accent-maroon" />
                    <span className="font-medium text-sm">{e}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Date & City */}
          {step === 6 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-3xl font-bold mb-2">Almost done! When and where?</h2>
              <p className="text-gray-500 mb-8">We&apos;ll set up reminders based on your wedding date.</p>
              <div className="max-w-[400px] space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Wedding Date</label>
                  <input type="date" value={data.weddingDate} onChange={(e) => setData({ ...data, weddingDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-maroon transition-colors" />
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

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-600 hover:text-maroon font-medium transition-colors">
                <i className="fas fa-arrow-left" /> Back
              </button>
            ) : <div />}
            {step < totalSteps ? (
              <button onClick={() => {
                if (step === 1 && !data.religion) return;
                if (step === 2 && !data.region) return;
                if (step === 3 && !data.budget) return;
                if (step === 4 && !data.guests) return;
                if (step === 5 && data.selectedEvents.length === 0) return;
                setStep(step + 1);
              }}
                className={`flex items-center gap-2 px-8 py-4 text-lg font-bold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)] transition-all`}>
                Continue <i className="fas fa-arrow-right" />
              </button>
            ) : (
              <button onClick={() => onComplete(data)}
                className="flex items-center gap-2 px-8 py-4 text-lg font-bold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)] transition-all">
                Create My Wedding Plan <i className="fas fa-check" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
