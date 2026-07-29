"use client";

import { useMemo } from "react";

export default function DietaryMatrix({ guests }: { guests: any[] }) {
  const matrix = useMemo(() => {
    if (!guests.length) return null;
    const total = guests.length;
    const counts: Record<string, number> = {};
    guests.forEach((g) => {
      const d = g.dietary || "Veg";
      counts[d] = (counts[d] || 0) + 1;
    });
    const yesGuests = guests.filter((g) => g.rsvp === "Yes");
    const yesCounts: Record<string, number> = {};
    yesGuests.forEach((g) => {
      const d = g.dietary || "Veg";
      yesCounts[d] = (yesCounts[d] || 0) + 1;
    });
    const sides: Record<string, number> = {};
    guests.forEach((g) => { sides[g.side || "Bride"] = (sides[g.side || "Bride"] || 0) + 1; });

    return { total, counts, yesGuests: yesGuests.length, yesCounts, sides };
  }, [guests]);

  if (!matrix) return null;

  const colors: Record<string, { bg: string; text: string; bar: string }> = {
    "Veg": { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
    "Non-Veg": { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
    "Jain": { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
    "Vegan": { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <i className="fas fa-utensils text-maroon" /> Dietary Matrix
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {Object.entries(matrix.counts).sort((a, b) => b[1] - a[1]).map(([diet, count]) => {
          const c = colors[diet] || { bg: "bg-gray-50", text: "text-gray-700", bar: "bg-gray-400" };
          const yesCount = matrix.yesCounts[diet] || 0;
          return (
            <div key={diet} className={`${c.bg} rounded-lg p-3`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${c.text}`}>{count}</span>
                {yesCount > 0 && <span className="text-[0.6rem] text-gray-500">{yesCount} confirmed</span>}
              </div>
              <div className="text-xs font-medium text-gray-600 mb-1.5">{diet}</div>
              <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${(count / matrix.total) * 100}%` }} />
              </div>
              <span className="text-[0.6rem] text-gray-400">{Math.round((count / matrix.total) * 100)}% of guests</span>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
        <i className="fas fa-info-circle mr-1" />
        <strong>Catering order:</strong> Order {matrix.yesCounts["Veg"] || 0} veg + {matrix.yesCounts["Non-Veg"] || 0} non-veg + {matrix.yesCounts["Jain"] || 0} jain + {matrix.yesCounts["Vegan"] || 0} vegan plates (based on {matrix.yesGuests} confirmed guests)
      </div>
    </div>
  );
}
