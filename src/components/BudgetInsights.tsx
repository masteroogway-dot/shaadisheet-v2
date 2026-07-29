"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/format";

const CATEGORY_BENCHMARKS: Record<string, number> = {
  "venue": 0.35, "catering": 0.25, "photography": 0.10, "decorator": 0.08,
  "decoration": 0.08, "makeup": 0.04, "music": 0.05, "dj": 0.05,
  "clothing": 0.08, "outfit": 0.08, "lehenga": 0.08, "transport": 0.03,
  "invitation": 0.02, "misc": 0.05,
};

export default function BudgetInsights({ items, totalBudget, wedding }: { items: any[]; totalBudget: number; wedding: { currency: string } }) {
  const insights = useMemo(() => {
    if (!items.length || !totalBudget) return [];
    const result: { type: "warning" | "tip" | "info"; icon: string; text: string; color: string }[] = [];
    const totalEstimated = items.reduce((s: number, i: any) => s + (i.estimated || 0), 0);
    const totalPaid = items.reduce((s: number, i: any) => s + (i.paid || 0), 0);
    const overBudget = totalEstimated > totalBudget;
    const percentUsed = Math.round((totalEstimated / totalBudget) * 100);

    if (overBudget) {
      result.push({ type: "warning", icon: "fa-exclamation-triangle", text: `Over budget by ${formatCurrency(totalEstimated - totalBudget, wedding.currency)} (${percentUsed}% of ${formatCurrency(totalBudget, wedding.currency)} used)`, color: "text-red-700 bg-red-50 border-red-200" });
    } else if (percentUsed < 70) {
      result.push({ type: "tip", icon: "fa-lightbulb", text: `${formatCurrency(totalBudget - totalEstimated, wedding.currency)} remaining — ${100 - percentUsed}% buffer left for unexpected costs`, color: "text-green-700 bg-green-50 border-green-200" });
    }

    const unpaidItems = items.filter((i) => i.status === "Partial" || (i.paid > 0 && i.paid < i.estimated));
    if (unpaidItems.length > 0) {
      const totalPending = unpaidItems.reduce((s: number, i: any) => s + ((i.estimated || 0) - (i.paid || 0)), 0);
      result.push({ type: "info", icon: "fa-clock", text: `${unpaidItems.length} partial payment${unpaidItems.length > 1 ? "s" : ""} pending — ${formatCurrency(totalPending, wedding.currency)} balance remaining`, color: "text-blue-700 bg-blue-50 border-blue-200" });
    }

    const categoryTotals: Record<string, number> = {};
    items.forEach((i) => {
      const cat = (i.category || "Other").toLowerCase();
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (i.estimated || 0);
    });
    for (const [cat, spent] of Object.entries(categoryTotals)) {
      const benchmark = CATEGORY_BENCHMARKS[cat];
      if (benchmark) {
        const expected = Math.round(totalBudget * benchmark);
        if (spent > expected * 1.2) {
          result.push({ type: "warning", icon: "fa-chart-line", text: `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${formatCurrency(spent, wedding.currency)} — ${Math.round((spent / totalEstimated) * 100)}% of budget (recommended: ${Math.round(benchmark * 100)}%)`, color: "text-orange-700 bg-orange-50 border-orange-200" });
        } else if (spent < expected * 0.5 && totalEstimated > totalBudget * 0.5) {
          result.push({ type: "tip", icon: "fa-tag", text: `${cat.charAt(0).toUpperCase() + cat.slice(1)}: Only ${formatCurrency(spent, wedding.currency)} allocated — may need more for quality`, color: "text-blue-700 bg-blue-50 border-blue-200" });
        }
      }
    }

    const overdueItems = items.filter((i) => i.dueDate && i.dueDate < new Date().toISOString().split("T")[0] && i.status !== "Paid");
    if (overdueItems.length > 0) {
      result.push({ type: "warning", icon: "fa-calendar-times", text: `${overdueItems.length} overdue payment${overdueItems.length > 1 ? "s" : ""}: ${overdueItems.map((i) => i.item).join(", ")}`, color: "text-red-700 bg-red-50 border-red-200" });
    }

    if (totalPaid > 0 && totalEstimated > 0) {
      const paidPct = Math.round((totalPaid / totalEstimated) * 100);
      if (paidPct > 80) {
        result.push({ type: "tip", icon: "fa-hand-holding-dollar", text: `${paidPct}% paid — consider negotiating final payments for early settlement discounts`, color: "text-green-700 bg-green-50 border-green-200" });
      }
    }

    return result;
  }, [items, totalBudget]);

  if (!insights.length) return null;

  return (
    <div className="space-y-2 mb-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        <i className="fas fa-wand-magic-sparkles text-maroon" /> Smart Insights
      </p>
      {insights.map((insight, idx) => (
        <div key={idx} className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border text-sm ${insight.color}`}>
          <i className={`fas ${insight.icon} mt-0.5 shrink-0`} />
          <span>{insight.text}</span>
        </div>
      ))}
    </div>
  );
}
