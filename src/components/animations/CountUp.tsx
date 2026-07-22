"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

function defaultFormat(n: number): string {
  return n.toLocaleString("en-IN");
}

export default function CountUp({
  target,
  duration = 2,
  prefix = "",
  suffix = "",
  formatValue,
  className = "",
  once = true,
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatValue?: (n: number) => string;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: "-40px" });
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const format = formatValue || defaultFormat;
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(format(Math.round(eased * target)));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration, formatValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
