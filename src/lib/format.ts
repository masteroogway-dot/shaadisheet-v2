// ═══════════════════════════════════════════════════════════════
// CURRENCY CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export type CurrencyCode = "INR" | "PKR" | "BDT" | "LKR" | "NPR" | "MVR" | "AFN";

interface CurrencyConfig {
  symbol: string;
  code: string;
  locale: string;
  decimals: number;
}

const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  INR: { symbol: "\u20B9", code: "INR", locale: "en-IN", decimals: 0 },
  PKR: { symbol: "\u20A8", code: "PKR", locale: "en-PK", decimals: 0 },
  BDT: { symbol: "\u09F3", code: "BDT", locale: "bn-BD", decimals: 0 },
  LKR: { symbol: "Rs", code: "LKR", locale: "si-LK", decimals: 0 },
  NPR: { symbol: "\u20A8", code: "NPR", locale: "ne-NP", decimals: 0 },
  MVR: { symbol: "Rf", code: "MVR", locale: "dv-MV", decimals: 0 },
  AFN: { symbol: "\u060B", code: "AFN", locale: "fa-AF", decimals: 0 },
};

function getConfig(currency?: string): CurrencyConfig {
  const code = (currency?.toUpperCase() || "INR") as CurrencyCode;
  return CURRENCY_MAP[code] || CURRENCY_MAP.INR;
}

// ═══════════════════════════════════════════════════════════════
// FORMAT: Full currency display
// ═══════════════════════════════════════════════════════════════

export function formatCurrency(n: number, currency?: string): string {
  const cfg = getConfig(currency);
  const formatted = n.toLocaleString(cfg.locale, { maximumFractionDigits: cfg.decimals });
  return `${cfg.symbol}${formatted}`;
}

// Alias for backward compat
export const formatINR = (n: number) => formatCurrency(n, "INR");
export const formatPKR = (n: number) => formatCurrency(n, "PKR");
export const formatBDT = (n: number) => formatCurrency(n, "BDT");
export const formatLKR = (n: number) => formatCurrency(n, "LKR");
export const formatNPR = (n: number) => formatCurrency(n, "NPR");
export const formatMVR = (n: number) => formatCurrency(n, "MVR");
export const formatAFN = (n: number) => formatCurrency(n, "AFN");

// ═══════════════════════════════════════════════════════════════
// FORMAT: Abbreviated currency (no symbol)
// ═══════════════════════════════════════════════════════════════

export function formatCurrencyAbbrev(n: number, currency?: string): string {
  const cfg = getConfig(currency);

  if (currency === "INR" || currency === "PKR" || currency === "NPR") {
    // South Asian numbering: Lakh, Crore
    if (n === 0) return "0";
    if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
    if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
    return n.toLocaleString(cfg.locale);
  }

  if (currency === "BDT") {
    if (n === 0) return "0";
    if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
    if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
    return n.toLocaleString(cfg.locale);
  }

  // Western numbering: K, M, B
  if (n === 0) return "0";
  if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString(cfg.locale);
}

// ═══════════════════════════════════════════════════════════════
// FORMAT: Abbreviated currency with symbol
// ═══════════════════════════════════════════════════════════════

export function formatCurrencyAbbrevWithSymbol(n: number, currency?: string): string {
  const cfg = getConfig(currency);
  return `${cfg.symbol}${formatCurrencyAbbrev(n, currency)}`;
}

// Legacy aliases
export const formatINRAbbrev = (n: number) => formatCurrencyAbbrev(n, "INR");
export const formatINRAbbrevWithSymbol = (n: number) => formatCurrencyAbbrevWithSymbol(n, "INR");

// ═══════════════════════════════════════════════════════════════
// PARSE: Currency string to number
// ═══════════════════════════════════════════════════════════════

export function parseCurrency(s: string, currency?: string): number {
  if (!s) return 0;
  const cfg = getConfig(currency);
  let str = s.replace(new RegExp(`[${cfg.symbol}\\s]`, "g"), "").toLowerCase();

  if (str.endsWith("cr") || str.endsWith("crore")) {
    const num = parseFloat(str.replace(/crore|cr/g, ""));
    return isNaN(num) ? 0 : Math.round(num * 10000000);
  }
  if (str.endsWith("l") || str.endsWith("lakh")) {
    const num = parseFloat(str.replace(/lakh|l/g, ""));
    return isNaN(num) ? 0 : Math.round(num * 100000);
  }
  if (str.endsWith("k")) {
    const num = parseFloat(str.replace(/k/g, ""));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }
  if (str.endsWith("m") || str.endsWith("mn")) {
    const num = parseFloat(str.replace(/mn|m/g, ""));
    return isNaN(num) ? 0 : Math.round(num * 1000000);
  }
  if (str.endsWith("b") || str.endsWith("bn")) {
    const num = parseFloat(str.replace(/bn|b/g, ""));
    return isNaN(num) ? 0 : Math.round(num * 1000000000);
  }

  const num = parseFloat(str.replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}

// Legacy alias
export const parseINR = (s: string) => parseCurrency(s, "INR");

// ═══════════════════════════════════════════════════════════════
// HELPERS: Budget display for onboarding
// ═══════════════════════════════════════════════════════════════

export function formatBudgetDisplay(value: number, currency?: string): string {
  const cfg = getConfig(currency);

  if (currency === "INR" || currency === "PKR" || currency === "NPR" || currency === "BDT") {
    if (value >= 10000000) {
      const c = value / 10000000;
      return c % 1 === 0 ? `${cfg.symbol}${c} Crore` : `${cfg.symbol}${c.toFixed(1)} Crore`;
    }
    const l = value / 100000;
    return l % 1 === 0 ? `${cfg.symbol}${l} Lakh` : `${cfg.symbol}${l.toFixed(1)} Lakh`;
  }

  if (value >= 1000000) {
    const m = value / 1000000;
    return m % 1 === 0 ? `${cfg.symbol}${m}M` : `${cfg.symbol}${m.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return k % 1 === 0 ? `${cfg.symbol}${k}K` : `${cfg.symbol}${k.toFixed(1)}K`;
  }
  return `${cfg.symbol}${value.toLocaleString(cfg.locale)}`;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS: Get currency symbol
// ═══════════════════════════════════════════════════════════════

export function getCurrencySymbol(currency?: string): string {
  return getConfig(currency).symbol;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS: Get currency min/max for budget slider
// ═══════════════════════════════════════════════════════════════

export function getBudgetRange(currency?: string): { min: number; max: number; step: number } {
  switch (currency) {
    case "INR": return { min: 100000, max: 50000000, step: 50000 };      // 1L to 5Cr
    case "PKR": return { min: 1500000, max: 50000000, step: 500000 };   // 15L to 5Cr
    case "BDT": return { min: 300000, max: 20000000, step: 100000 };    // 3L to 2Cr
    case "LKR": return { min: 500000, max: 20000000, step: 100000 };    // 5L to 2Cr
    case "NPR": return { min: 500000, max: 10000000, step: 100000 };    // 5L to 1Cr
    case "MVR": return { min: 50000, max: 10000000, step: 10000 };      // 50K to 1Cr
    case "AFN": return { min: 300000, max: 50000000, step: 100000 };    // 3L to 5Cr
    default: return { min: 100000, max: 50000000, step: 50000 };
  }
}
