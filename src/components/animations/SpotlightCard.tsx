"use client";

import { useRef, useState, ReactNode } from "react";

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(212, 175, 55, 0.15)",
  innerClassName = "",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  innerClassName?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          opacity,
          background: `radial-gradient(circle 250px at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className={`relative z-10 ${innerClassName}`}>{children}</div>
    </div>
  );
}
