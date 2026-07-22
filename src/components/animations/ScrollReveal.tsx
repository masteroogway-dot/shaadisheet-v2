"use client";

import { motion, useInView } from "motion/react";
import { useRef, ReactNode } from "react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up" as "up" | "down" | "left" | "right",
  distance = 40,
  blur = true,
  blurAmount = 8,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  blur?: boolean;
  blurAmount?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px" });

  const axes: Record<string, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  const initial = {
    opacity: 0,
    ...axes[direction],
    filter: blur ? `blur(${blurAmount}px)` : "blur(0px)",
  };

  const animate = {
    opacity: isInView ? 1 : 0,
    x: isInView ? 0 : axes[direction].x ?? 0,
    y: isInView ? 0 : axes[direction].y ?? 0,
    filter: isInView ? "blur(0px)" : `blur(${blurAmount}px)`,
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={animate}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
