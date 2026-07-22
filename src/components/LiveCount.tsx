"use client";

import { useEffect, useState } from "react";

export default function LiveCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setCount(d.count || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex">
        {["#E8B4B8", "#B4D4E8", "#D4E8B4", "#E8D4B4", "#D4B4E8"].map((c, i) => (
          <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[0.65rem] font-bold text-white -ml-2 border-2 border-white/30 first:ml-0" style={{ background: c }}>
            {["RK", "AP", "SM", "PJ", "NM"][i]}
          </div>
        ))}
      </div>
      <span className="text-sm text-white/70">
        {count > 0
          ? `${count} famil${count === 1 ? "y" : "ies"} already planning`
          : "Be the first to plan your wedding"}
      </span>
    </div>
  );
}
