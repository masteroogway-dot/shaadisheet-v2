"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";

const VENDOR_BOOKING_WINDOWS: Record<string, number> = {
  "venue": 365, "photographer": 180, "videographer": 180,
  "caterer": 180, "catering": 180, "makeup": 120, "makeup artist": 120,
  "mehndi": 120, "dj": 90, "entertainment": 90, "decorator": 90,
  "decoration": 90, "florist": 90, "clothing": 150, "outfit": 150,
};

export default function VendorAlerts({ vendors, weddingDate, wedding }: { vendors: any[]; weddingDate?: string; wedding?: any }) {
  const [showComparison, setShowComparison] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const alerts = useMemo(() => {
    if (!vendors.length) return [];
    const result: { type: "overdue" | "urgent" | "soon" | "tip"; icon: string; text: string; color: string }[] = [];
    const now = new Date();
    const wd = weddingDate ? new Date(weddingDate) : null;

    const pending = vendors.filter((v) => v.contract === "Pending");
    if (pending.length > 0) {
      result.push({ type: "tip", icon: "fa-hourglass-half", text: `${pending.length} vendor${pending.length > 1 ? "s" : ""} pending confirmation: ${pending.slice(0, 3).map((v) => v.name || v.category).join(", ")}${pending.length > 3 ? "..." : ""}`, color: "text-amber-700 bg-amber-50 border-amber-200" });
    }

    if (wd) {
      for (const v of vendors) {
        if (v.contract === "Signed") continue;
        const cat = (v.category || "").toLowerCase();
        let bookingWindow = 90;
        for (const [key, days] of Object.entries(VENDOR_BOOKING_WINDOWS)) {
          if (cat.includes(key)) { bookingWindow = days; break; }
        }
        const daysUntilWedding = Math.ceil((wd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilBookBy = daysUntilWedding - bookingWindow;

        if (daysUntilBookBy < 0) {
          const overdueBy = Math.abs(daysUntilBookBy);
          if (overdueBy > 30) {
            result.push({ type: "overdue", icon: "fa-exclamation-circle", text: `${v.name || v.category}: Should have been booked ${overdueBy} days ago!`, color: "text-red-700 bg-red-50 border-red-200" });
          } else {
            result.push({ type: "urgent", icon: "fa-fire", text: `${v.name || v.category}: Book now — only ${bookingWindow - overdueBy} days until you should have this locked`, color: "text-orange-700 bg-orange-50 border-orange-200" });
          }
        } else if (daysUntilBookBy <= 30) {
          result.push({ type: "soon", icon: "fa-clock", text: `${v.name || v.category}: Book within ${daysUntilBookBy} days`, color: "text-blue-700 bg-blue-50 border-blue-200" });
        }
      }
    }

    const totalQuote = vendors.reduce((s: number, v: any) => s + (v.quote || 0), 0);
    const totalPaid = vendors.reduce((s: number, v: any) => s + (v.paid || 0), 0);
    if (totalQuote > 0 && totalPaid < totalQuote * 0.3) {
      result.push({ type: "tip", icon: "fa-receipt", text: `Only ${formatCurrency(totalPaid, wedding?.currency)} of ${formatCurrency(totalQuote, wedding?.currency)} total quoted (${Math.round((totalPaid / totalQuote) * 100)}%) paid`, color: "text-gray-700 bg-gray-50 border-gray-200" });
    }

    return result;
  }, [vendors, weddingDate]);

  const comparisonVendors = vendors.filter((v) => compareIds.includes(v.id));

  if (!alerts.length && vendors.length === 0) return null;

  return (
    <div className="mb-5">
      {alerts.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fas fa-bell text-maroon" /> Vendor Alerts
          </p>
          {alerts.map((alert, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border text-sm ${alert.color}`}>
              <i className={`fas ${alert.icon} mt-0.5 shrink-0`} />
              <span>{alert.text}</span>
            </div>
          ))}
        </div>
      )}

      {vendors.length >= 2 && (
        <>
          <button onClick={() => setShowComparison(!showComparison)} className="text-xs font-semibold text-maroon hover:underline mb-3 flex items-center gap-1">
            <i className="fas fa-table-columns" /> {showComparison ? "Hide" : "Show"} Vendor Comparison
          </button>
          {showComparison && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Compare vendors:</span>
                {vendors.filter((v) => v.name).slice(0, 6).map((v) => (
                  <button key={v.id} onClick={() => setCompareIds((prev) => prev.includes(v.id) ? prev.filter((i) => i !== v.id) : [...prev, v.id].slice(-3))} className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${compareIds.includes(v.id) ? "bg-maroon text-white border-maroon" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                    {v.name || v.category}
                  </button>
                ))}
              </div>
              {comparisonVendors.length >= 2 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Feature</th>
                      {comparisonVendors.map((v) => <th key={v.id} className="text-left px-4 py-2 text-xs font-semibold text-gray-700">{v.name}</th>)}
                    </tr></thead>
                    <tbody>
                      <tr className="border-b border-gray-50"><td className="px-4 py-2 text-xs font-medium text-gray-500">Category</td>{comparisonVendors.map((v) => <td key={v.id} className="px-4 py-2 text-xs">{v.category}</td>)}</tr>
                      <tr className="border-b border-gray-50"><td className="px-4 py-2 text-xs font-medium text-gray-500">Quote</td>{comparisonVendors.map((v) => <td key={v.id} className="px-4 py-2 text-xs font-bold">{formatCurrency(v.quote, wedding?.currency)}</td>)}</tr>
                      <tr className="border-b border-gray-50"><td className="px-4 py-2 text-xs font-medium text-gray-500">Paid</td>{comparisonVendors.map((v) => <td key={v.id} className="px-4 py-2 text-xs text-green">{formatCurrency(v.paid, wedding?.currency)}</td>)}</tr>
                      <tr className="border-b border-gray-50"><td className="px-4 py-2 text-xs font-medium text-gray-500">Rating</td>{comparisonVendors.map((v) => <td key={v.id} className="px-4 py-2 text-xs">{v.rating || "Not rated"}</td>)}</tr>
                      <tr className="border-b border-gray-50"><td className="px-4 py-2 text-xs font-medium text-gray-500">Contract</td>{comparisonVendors.map((v) => <td key={v.id} className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${v.contract === "Signed" ? "bg-green-100 text-green-700" : v.contract === "Completed" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{v.contract}</span></td>)}</tr>
                      <tr><td className="px-4 py-2 text-xs font-medium text-gray-500">Notes</td>{comparisonVendors.map((v) => <td key={v.id} className="px-4 py-2 text-xs text-gray-500 max-w-[150px] truncate">{v.notes || "—"}</td>)}</tr>
                    </tbody>
                  </table>
                </div>
              )}
              {comparisonVendors.length < 2 && <p className="px-4 py-3 text-xs text-gray-400 text-center">Select 2+ vendors above to compare</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
