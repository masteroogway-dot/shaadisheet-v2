"use client";

import { useMemo } from "react";
import { formatINR } from "@/lib/format";

export default function GiftAnalytics({ gifts }: { gifts: any[] }) {
  const analytics = useMemo(() => {
    if (!gifts.length) return null;
    const total = gifts.length;
    const totalAmount = gifts.reduce((s: number, g: any) => s + (g.amount || 0), 0);
    const cashGifts = gifts.filter((g) => g.giftType === "Cash");
    const totalCash = cashGifts.reduce((s: number, g: any) => s + (g.amount || 0), 0);
    const pendingThankYou = gifts.filter((g) => g.thankYou === "Pending" || g.thankYou === "No");
    const sentThankYou = gifts.filter((g) => g.thankYou === "Sent" || g.thankYou === "Yes");

    const sideStats: Record<string, { count: number; amount: number }> = {};
    gifts.forEach((g) => {
      const side = g.fromSide || "Both";
      if (!sideStats[side]) sideStats[side] = { count: 0, amount: 0 };
      sideStats[side].count++;
      sideStats[side].amount += g.amount || 0;
    });

    const amounts = gifts.filter((g) => g.amount > 0).map((g) => g.amount);
    const avgAmount = amounts.length > 0 ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length) : 0;
    const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
    const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;

    return { total, totalAmount, cashGifts: cashGifts.length, totalCash, pendingThankYou: pendingThankYou.length, sentThankYou: sentThankYou.length, sideStats, avgAmount, maxAmount, minAmount };
  }, [gifts]);

  if (!analytics) return null;

  return (
    <div className="space-y-4 mb-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        <i className="fas fa-chart-pie text-maroon" /> Gift Analytics
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <span className="text-xl font-extrabold block">{formatINR(analytics.totalAmount)}</span>
          <span className="text-[0.65rem] text-gray-500">Total Received</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <span className="text-xl font-extrabold text-green block">{formatINR(analytics.avgAmount)}</span>
          <span className="text-[0.65rem] text-gray-500">Average Gift</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <span className="text-xl font-extrabold text-blue block">{analytics.total}</span>
          <span className="text-[0.65rem] text-gray-500">Total Gifts</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <span className="text-xl font-extrabold text-amber block">{analytics.pendingThankYou}</span>
          <span className="text-[0.65rem] text-gray-500">Pending Thank-You</span>
        </div>
      </div>

      {Object.keys(analytics.sideStats).length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">By Family Side</p>
          <div className="space-y-2">
            {Object.entries(analytics.sideStats).sort((a, b) => b[1].amount - a[1].amount).map(([side, stats]) => (
              <div key={side} className="flex items-center gap-3">
                <span className="text-xs font-medium w-20 shrink-0">{side}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-maroon to-gold" style={{ width: `${(stats.amount / analytics.totalAmount) * 100}%` }} />
                </div>
                <span className="text-xs font-bold w-20 text-right">{formatINR(stats.amount)}</span>
                <span className="text-[0.6rem] text-gray-400 w-16 text-right">{stats.count} gifts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.pendingThankYou > 0 && (
        <div className="flex items-start gap-2.5 px-3 py-2 rounded-lg border text-sm text-amber-700 bg-amber-50 border-amber-200">
          <i className="fas fa-envelope-open mt-0.5 shrink-0" />
          <span>{analytics.pendingThankYou} thank-you{analytics.pendingThankYou > 1 ? "s" : ""} still pending — send them to show appreciation</span>
        </div>
      )}

      {analytics.maxAmount > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
          <i className="fas fa-info-circle mr-1" />
          Gift range: {formatINR(analytics.minAmount)} to {formatINR(analytics.maxAmount)}
          {analytics.cashGifts > 0 && ` • ${analytics.cashGifts} cash gifts totalling ${formatINR(analytics.totalCash)}`}
        </div>
      )}
    </div>
  );
}
