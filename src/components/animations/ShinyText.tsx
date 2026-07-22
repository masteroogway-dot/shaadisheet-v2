"use client";

import { motion, useMotionValue, useAnimationFrame, useTransform } from "motion/react";
import { useRef, useEffect } from "react";

export default function ShinyText({
  text,
  className = "",
  speed = 2,
  color = "rgba(255,255,255,0.4)",
  shineColor = "#FFD54F",
  spread = 120,
}: {
  text: string;
  className?: string;
  speed?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
}) {
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const animationDuration = speed * 1000;

  useAnimationFrame((time) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    const cycleTime = elapsedRef.current % animationDuration;
    const p = (cycleTime / animationDuration) * 100;
    progress.set(p);
  });

  useEffect(() => {
    elapsedRef.current = 0;
    progress.set(0);
  }, [progress]);

  const backgroundPosition = useTransform(progress, (p) => `${150 - p * 2}% center`);

  const gradientStyle = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{ ...gradientStyle, backgroundPosition }}
    >
      {text}
    </motion.span>
  );
}
