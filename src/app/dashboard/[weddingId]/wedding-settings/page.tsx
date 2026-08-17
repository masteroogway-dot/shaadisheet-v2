"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { getWedding, updateWedding } from "@/lib/actions";
import { formatCurrency, getCurrencySymbol, getBudgetRange } from "@/lib/format";
import CurrencyInput from "@/components/CurrencyInput";

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

export default function WeddingSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const weddingId = params.weddingId as string;

  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [budget, setBudget] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingName, setWeddingName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
  }, [status, router]);

  useEffect(() => {
    async function load() {
      try {
        const w = await getWedding(weddingId);
        setWedding(w);
        setPartner1Name(w.partner1Name || "");
        setPartner2Name(w.partner2Name || "");
        setCurrency(w.currency || "INR");
        setBudget(w.budget ? String(w.budget) : "");
        setGuestCount(w.guestCount ? String(w.guestCount) : "");
        setWeddingDate(w.weddingDate ? new Date(w.weddingDate).toISOString().split("T")[0] : "");
        setWeddingName(w.name || "");
      } catch (e) {
        console.error(e);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated" && weddingId) load();
  }, [status, weddingId, router]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updates: any = { weddingId };
      if (partner1Name !== (wedding.partner1Name || "")) updates.partner1Name = partner1Name;
      if (partner2Name !== (wedding.partner2Name || "")) updates.partner2Name = partner2Name;
      if (currency !== (wedding.currency || "INR")) updates.currency = currency;
      if (weddingName !== (wedding.name || "")) updates.name = weddingName;

      const parsedBudget = parseInt(budget) || 0;
      if (parsedBudget !== (wedding.budget || 0)) updates.budget = parsedBudget;

      const parsedGuests = parseInt(guestCount) || 0;
      if (parsedGuests !== (wedding.guestCount || 0)) updates.guestCount = parsedGuests;

      if (weddingDate) {
        const newDate = new Date(weddingDate);
        if (!wedding.weddingDate || newDate.getTime() !== new Date(wedding.weddingDate).getTime()) {
          updates.weddingDate = newDate;
        }
      }

      if (Object.keys(updates).length > 1) {
        await updateWedding(updates);
        localStorage.setItem("shaadisheet-currency", currency);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save:", e);
    }
    setSaving(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111111] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wedding) return null;

  const budgetRange = getBudgetRange(currency);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111]">
      <div className="h-[60px] bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2a2a2a] flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <Link href={`/dashboard/${weddingId}`} className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "45px", width: "auto" }} />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href={`/dashboard/${weddingId}`} className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-maroon transition-colors cursor-pointer">
            <i className="fas fa-arrow-left text-xs" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Wedding Settings</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your wedding details and preferences.</p>

        {/* Partner Names */}
        <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-[#334155] rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5">
            <i className="fas fa-heart text-maroon mr-2" />
            Couple Names
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Partner 1</label>
              <input
                type="text"
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Partner 2</label>
              <input
                type="text"
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Wedding Details */}
        <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-[#334155] rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5">
            <i className="fas fa-ring text-maroon mr-2" />
            Wedding Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Wedding Name</label>
              <input
                type="text"
                value={weddingName}
                onChange={(e) => setWeddingName(e.target.value)}
                placeholder="e.g. Sharma & Patel Wedding"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Wedding Date</label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expected Guests</label>
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="e.g. 200"
                  min={50}
                  max={5000}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent"
                />
                <p className="text-[0.65rem] text-gray-400 mt-1">Min: 50, Max: 5,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget & Currency */}
        <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-[#334155] rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5">
            <i className="fas fa-wallet text-maroon mr-2" />
            Budget & Currency
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-maroon cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Total Budget</label>
              <CurrencyInput
                value={parseInt(budget) || 0}
                onChange={(val) => setBudget(String(val))}
                placeholder={String(wedding.budget || "")}
                currency={currency}
              />
              <p className="text-[0.65rem] text-gray-400 mt-1">
                Min: {formatCurrency(budgetRange.min, currency)}, Max: {formatCurrency(budgetRange.max, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
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
            href={`/dashboard/${weddingId}`}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <i className="fas fa-arrow-left text-xs" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
