"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const RotatingText = forwardRef(function RotatingText(
  {
    texts,
    transition = { type: "spring", damping: 25, stiffness: 300 },
    initial = { y: "100%", opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: "-120%", opacity: 0 },
    rotationInterval = 2000,
    loop = true,
    auto = true,
    className = "",
    currentIndex: controlledIndex,
  }: {
    texts: string[];
    transition?: Record<string, unknown>;
    initial?: Record<string, string | number>;
    animate?: Record<string, string | number>;
    exit?: Record<string, string | number>;
    rotationInterval?: number;
    loop?: boolean;
    auto?: boolean;
    className?: string;
    currentIndex?: number;
  },
  ref: React.ForwardedRef<unknown>
) {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentTextIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const next = useCallback(() => {
    if (controlledIndex !== undefined) return;
    setInternalIndex((prev) => (prev === texts.length - 1 ? (loop ? 0 : prev) : prev + 1));
  }, [texts.length, loop, controlledIndex]);

  useEffect(() => {
    if (!auto || controlledIndex !== undefined) return;
    const intervalId = setInterval(next, rotationInterval);
    return () => clearInterval(intervalId);
  }, [next, rotationInterval, auto, controlledIndex]);

  useImperativeHandle(ref, () => ({ next }), [next]);

  const currentText = texts[currentTextIndex];

  return (
    <span className={`inline-flex ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentTextIndex}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
          className="inline-block"
        >
          {currentText}
        </motion.span>
      </AnimatePresence>
    </span>
  );
});

export default RotatingText;
