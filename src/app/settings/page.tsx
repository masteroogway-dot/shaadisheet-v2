"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import NoIndex from "@/components/NoIndex";
import { updateWedding } from "@/lib/actions";

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
  { code: "NPR", symbol: "₨", name: "Nepalese Rupee" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "QAR", symbol: "QR", name: "Qatari Riyal" },
  { code: "KWD", symbol: "KD", name: "Kuwaiti Dinar" },
  { code: "BHD", symbol: "BD", name: "Bahraini Dinar" },
  { code: "OMR", symbol: "OMR", name: "Omani Rial" },
  { code: "JOD", symbol: "JD", name: "Jordanian Dinar" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  { code: "RON", symbol: "lei", name: "Romanian Leu" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
  }, [status, router]);

  useEffect(() => {
    async function loadWedding() {
      try {
        const res = await fetch("/api/weddings");
        const data = await res.json();
        const weddings = data.owned || data.weddings || [];
        if (weddings.length > 0) {
          setWeddingId(weddings[0].id);
          setCurrency(weddings[0].currency || "INR");
        }
      } catch (e) {
        console.error("Failed to load wedding:", e);
      }
    }
    if (status === "authenticated") loadWedding();
  }, [status]);

  const handleSave = async () => {
    if (!weddingId) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateWedding({ weddingId, currency });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
    setSaving(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
    <NoIndex />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "45px", width: "auto" }} />
        </Link>
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-maroon transition-colors cursor-pointer">
          <i className="fas fa-arrow-left text-xs" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-8">Settings</h1>

        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-maroon to-gold text-white text-2xl font-bold flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.name || "User"}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-maroon/10 text-maroon text-xs font-semibold rounded-full">
                <i className="fas fa-check-circle text-[10px]" />
                Verified
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
                {user?.name || "Not set"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
                {user?.email || "Not set"}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Preferences</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive updates about your weddings</p>
              </div>
              <button
                onClick={() => { setNotifications(!notifications); setHasChanges(true); }}
                className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${notifications ? "bg-maroon" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifications ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Currency</p>
                <p className="text-xs text-gray-500 mt-0.5">Display currency across your wedding planner</p>
              </div>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => { setCurrency(e.target.value); setHasChanges(true); }}
                  disabled={saving}
                  className="appearance-none px-3 py-1.5 pr-8 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-maroon cursor-pointer disabled:opacity-50"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">Help</h2>
          <p className="text-sm text-gray-500 mb-4">Replay the feature walkthrough tutorial anytime.</p>
          <button
            onClick={() => {
              localStorage.removeItem("shaadisheet-tutorial-done");
              router.push("/dashboard");
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-maroon border border-maroon/30 rounded-xl hover:bg-maroon/5 transition-colors cursor-pointer"
          >
            <i className="fas fa-play-circle text-xs" />
            Replay Tutorial
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-red-200 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-base font-bold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-5">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
            <i className="fas fa-trash-can text-xs" />
            Delete Account
          </button>
        </div>

        {/* Save & Return */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !weddingId}
            className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
              saved
                ? "bg-green text-white"
                : "bg-gradient-to-br from-maroon to-maroon-light text-white shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <><i className="fas fa-spinner fa-spin text-xs" /> Saving...</>
            ) : saved ? (
              <><i className="fas fa-check text-xs" /> Saved!</>
            ) : (
              <><i className="fas fa-save text-xs" /> Save Changes</>
            )}
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <i className="fas fa-arrow-left text-xs" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
