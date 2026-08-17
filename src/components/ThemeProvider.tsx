"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: "light" as Theme, setTheme: () => {}, resolvedTheme: "light" as "light" | "dark" };
  }
  return context;
}

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(isDark: boolean) {
  const root = document.documentElement;
  const body = document.body;
  if (isDark) {
    root.classList.add("dark");
    body.style.background = "#111111";
    body.style.color = "#e5e5e5";
  } else {
    root.classList.remove("dark");
    body.style.background = "#FFF8F0";
    body.style.color = "#1f2937";
  }
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme | null;
    const initial = saved && ["light", "dark", "system"].includes(saved) ? saved : "light";
    setThemeState(initial);

    const isDark = initial === "system" ? getSystemDark() : initial === "dark";
    apply(isDark);
    setResolvedTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isDark = theme === "system" ? getSystemDark() : theme === "dark";
    apply(isDark);
    setResolvedTheme(isDark ? "dark" : "light");

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        apply(e.matches);
        setResolvedTheme(e.matches ? "dark" : "light");
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
