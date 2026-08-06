// ═══════════════════════════════════════════════════════════════
// CURRENCY CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export type CurrencyCode =
  // South Asia
  | "INR" | "PKR" | "BDT" | "LKR" | "NPR" | "MVR" | "AFN" | "BTN"
  // Middle East
  | "SAR" | "AED" | "OMR" | "YER" | "BHD" | "QAR" | "KWD" | "IQD" | "JOD" | "LBP" | "SYP" | "ILS" | "IRR" | "TRY"
  | "EGP" | "LYD" | "TND" | "DZD" | "MAD" | "SDG" | "MRO"
  // East/SE Asia
  | "CNY" | "JPY" | "KRW" | "MNT" | "TWD" | "PHP" | "VND" | "THB" | "MMK" | "KHR" | "LAK"
  | "MYR" | "SGD" | "IDR" | "BND"
  // Central Asia
  | "KZT" | "UZS" | "TMT" | "KGS" | "TJS"
  // Western
  | "USD" | "GBP" | "CAD" | "AUD" | "NZD" | "EUR" | "CHF"
  | "SEK" | "NOK" | "DKK" | "ISK" | "PLN" | "CZK" | "HUF" | "RON" | "BGN"
  | "RSD" | "BAM" | "MKD" | "ALL" | "UAH" | "BYN" | "RUB";

interface CurrencyConfig {
  symbol: string;
  code: string;
  locale: string;
  decimals: number;
}

const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  // South Asia
  INR: { symbol: "\u20B9", code: "INR", locale: "en-IN", decimals: 0 },
  PKR: { symbol: "\u20A8", code: "PKR", locale: "en-PK", decimals: 0 },
  BDT: { symbol: "\u09F3", code: "BDT", locale: "bn-BD", decimals: 0 },
  LKR: { symbol: "Rs", code: "LKR", locale: "si-LK", decimals: 0 },
  NPR: { symbol: "Rs", code: "NPR", locale: "ne-NP", decimals: 0 },
  MVR: { symbol: "Rf", code: "MVR", locale: "dv-MV", decimals: 0 },
  AFN: { symbol: "\u060B", code: "AFN", locale: "fa-AF", decimals: 0 },
  BTN: { symbol: "Nu.", code: "BTN", locale: "dz-BT", decimals: 0 },
  // Middle East
  SAR: { symbol: "\uFDFC", code: "SAR", locale: "ar-SA", decimals: 2 },
  AED: { symbol: "\u062F.\u0625", code: "AED", locale: "ar-AE", decimals: 2 },
  OMR: { symbol: "\uFDFC", code: "OMR", locale: "ar-OM", decimals: 3 },
  YER: { symbol: "\uFDFC", code: "YER", locale: "ar-YE", decimals: 0 },
  BHD: { symbol: "\u062F.\u0628", code: "BHD", locale: "ar-BH", decimals: 3 },
  QAR: { symbol: "\uFDFC", code: "QAR", locale: "ar-QA", decimals: 2 },
  KWD: { symbol: "\u062F.\u0643", code: "KWD", locale: "ar-KW", decimals: 3 },
  IQD: { symbol: "\u0639.\u062F", code: "IQD", locale: "ar-IQ", decimals: 0 },
  JOD: { symbol: "\u062F.\u0627", code: "JOD", locale: "ar-JO", decimals: 3 },
  LBP: { symbol: "\u0644.\u0644", code: "LBP", locale: "ar-LB", decimals: 0 },
  SYP: { symbol: "\u0644.\u0633", code: "SYP", locale: "ar-SY", decimals: 0 },
  ILS: { symbol: "\u20AA", code: "ILS", locale: "he-IL", decimals: 2 },
  IRR: { symbol: "\uFDFC", code: "IRR", locale: "fa-IR", decimals: 0 },
  TRY: { symbol: "\u20BA", code: "TRY", locale: "tr-TR", decimals: 2 },
  EGP: { symbol: "\u062C.\u0645", code: "EGP", locale: "ar-EG", decimals: 2 },
  LYD: { symbol: "\u0644.\u062F", code: "LYD", locale: "ar-LY", decimals: 3 },
  TND: { symbol: "\u062F.\u062A", code: "TND", locale: "ar-TN", decimals: 3 },
  DZD: { symbol: "\u062F.\u062C", code: "DZD", locale: "ar-DZ", decimals: 2 },
  MAD: { symbol: "\u062F.\u0645", code: "MAD", locale: "ar-MA", decimals: 2 },
  SDG: { symbol: "\u062C.\u0633", code: "SDG", locale: "ar-SD", decimals: 2 },
  MRO: { symbol: "UM", code: "MRO", locale: "ar-MR", decimals: 2 },
  // East/SE Asia
  CNY: { symbol: "\u00A5", code: "CNY", locale: "zh-CN", decimals: 2 },
  JPY: { symbol: "\u00A5", code: "JPY", locale: "ja-JP", decimals: 0 },
  KRW: { symbol: "\u20A9", code: "KRW", locale: "ko-KR", decimals: 0 },
  MNT: { symbol: "\u20AE", code: "MNT", locale: "mn-MN", decimals: 0 },
  TWD: { symbol: "NT$", code: "TWD", locale: "zh-TW", decimals: 0 },
  PHP: { symbol: "\u20B1", code: "PHP", locale: "en-PH", decimals: 2 },
  VND: { symbol: "\u20AB", code: "VND", locale: "vi-VN", decimals: 0 },
  THB: { symbol: "\u0E3F", code: "THB", locale: "th-TH", decimals: 2 },
  MMK: { symbol: "K", code: "MMK", locale: "my-MM", decimals: 0 },
  KHR: { symbol: "\u17DB", code: "KHR", locale: "km-KH", decimals: 0 },
  LAK: { symbol: "\u20AD", code: "LAK", locale: "lo-LA", decimals: 0 },
  MYR: { symbol: "RM", code: "MYR", locale: "ms-MY", decimals: 2 },
  SGD: { symbol: "S$", code: "SGD", locale: "en-SG", decimals: 2 },
  IDR: { symbol: "Rp", code: "IDR", locale: "id-ID", decimals: 0 },
  BND: { symbol: "B$", code: "BND", locale: "ms-BN", decimals: 2 },
  // Central Asia
  KZT: { symbol: "\u20B8", code: "KZT", locale: "kk-KZ", decimals: 0 },
  UZS: { symbol: "\u0441\u043E\u043C", code: "UZS", locale: "uz-UZ", decimals: 0 },
  TMT: { symbol: "m.", code: "TMT", locale: "tk-TM", decimals: 0 },
  KGS: { symbol: "\u0441\u043E\u043C", code: "KGS", locale: "ky-KG", decimals: 0 },
  TJS: { symbol: "\u0405\u041C", code: "TJS", locale: "tg-TJ", decimals: 0 },
  // Western
  USD: { symbol: "$", code: "USD", locale: "en-US", decimals: 2 },
  GBP: { symbol: "\u00A3", code: "GBP", locale: "en-GB", decimals: 2 },
  CAD: { symbol: "C$", code: "CAD", locale: "en-CA", decimals: 2 },
  AUD: { symbol: "A$", code: "AUD", locale: "en-AU", decimals: 2 },
  NZD: { symbol: "NZ$", code: "NZD", locale: "en-NZ", decimals: 2 },
  EUR: { symbol: "\u20AC", code: "EUR", locale: "de-DE", decimals: 2 },
  CHF: { symbol: "Fr.", code: "CHF", locale: "de-CH", decimals: 2 },
  SEK: { symbol: "kr", code: "SEK", locale: "sv-SE", decimals: 0 },
  NOK: { symbol: "kr", code: "NOK", locale: "nb-NO", decimals: 0 },
  DKK: { symbol: "kr", code: "DKK", locale: "da-DK", decimals: 0 },
  ISK: { symbol: "kr", code: "ISK", locale: "is-IS", decimals: 0 },
  PLN: { symbol: "z\u0142", code: "PLN", locale: "pl-PL", decimals: 2 },
  CZK: { symbol: "K\u010D", code: "CZK", locale: "cs-CZ", decimals: 0 },
  HUF: { symbol: "Ft", code: "HUF", locale: "hu-HU", decimals: 0 },
  RON: { symbol: "lei", code: "RON", locale: "ro-RO", decimals: 2 },
  BGN: { symbol: "\u043B\u0432.", code: "BGN", locale: "bg-BG", decimals: 2 },
  RSD: { symbol: "\u0434\u0438\u043D.", code: "RSD", locale: "sr-RS", decimals: 0 },
  BAM: { symbol: "KM", code: "BAM", locale: "bs-BA", decimals: 2 },
  MKD: { symbol: "\u0434\u0435\u043D.", code: "MKD", locale: "mk-MK", decimals: 0 },
  ALL: { symbol: "L", code: "ALL", locale: "sq-AL", decimals: 0 },
  UAH: { symbol: "\u20B4", code: "UAH", locale: "uk-UA", decimals: 2 },
  BYN: { symbol: "Br", code: "BYN", locale: "be-BY", decimals: 2 },
  RUB: { symbol: "\u20BD", code: "RUB", locale: "ru-RU", decimals: 2 },
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
  const formatted = n.toLocaleString("en-US", { maximumFractionDigits: cfg.decimals });
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
export const formatBTN = (n: number) => formatCurrency(n, "BTN");

// ═══════════════════════════════════════════════════════════════
// FORMAT: Abbreviated currency (no symbol)
// ═══════════════════════════════════════════════════════════════

export function formatCurrencyAbbrev(n: number, currency?: string): string {
  const cfg = getConfig(currency);

  if (currency === "INR" || currency === "PKR" || currency === "NPR" || currency === "BTN" || currency === "BDT" || currency === "LKR" || currency === "MVR" || currency === "AFN") {
    // South Asian numbering: Lakh, Crore
    if (n === 0) return "0";
    if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
    if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
    return n.toLocaleString("en-US");
  }

  // Western numbering: K, M, B
  if (n === 0) return "0";
  if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString("en-US");
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

  if (currency === "INR" || currency === "PKR" || currency === "NPR" || currency === "BDT" || currency === "BTN" || currency === "LKR" || currency === "MVR" || currency === "AFN") {
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
    // South Asia
    case "INR": return { min: 100000, max: 50000000, step: 50000 };
    case "PKR": return { min: 1500000, max: 50000000, step: 500000 };
    case "BDT": return { min: 300000, max: 20000000, step: 100000 };
    case "LKR": return { min: 500000, max: 20000000, step: 100000 };
    case "NPR": return { min: 500000, max: 10000000, step: 100000 };
    case "MVR": return { min: 50000, max: 10000000, step: 10000 };
    case "AFN": return { min: 300000, max: 50000000, step: 100000 };
    case "BTN": return { min: 100000, max: 50000000, step: 50000 };
    // Middle East
    case "SAR": return { min: 20000, max: 500000, step: 5000 };
    case "AED": return { min: 20000, max: 500000, step: 5000 };
    case "OMR": return { min: 2000, max: 100000, step: 500 };
    case "YER": return { min: 500000, max: 20000000, step: 500000 };
    case "BHD": return { min: 2000, max: 100000, step: 500 };
    case "QAR": return { min: 20000, max: 500000, step: 5000 };
    case "KWD": return { min: 2000, max: 100000, step: 500 };
    case "IQD": return { min: 50000000, max: 2000000000, step: 10000000 };
    case "JOD": return { min: 2000, max: 100000, step: 500 };
    case "LBP": return { min: 1500000000, max: 50000000000, step: 500000000 };
    case "SYP": return { min: 50000000, max: 2000000000, step: 10000000 };
    case "ILS": return { min: 20000, max: 500000, step: 5000 };
    case "IRR": return { min: 5000000000, max: 200000000000, step: 1000000000 };
    case "TRY": return { min: 500000, max: 20000000, step: 100000 };
    case "EGP": return { min: 100000, max: 5000000, step: 25000 };
    case "LYD": return { min: 2000, max: 100000, step: 500 };
    case "TND": return { min: 2000, max: 100000, step: 500 };
    case "DZD": return { min: 2000000, max: 100000000, step: 500000 };
    case "MAD": return { min: 50000, max: 5000000, step: 100000 };
    case "SDG": return { min: 5000000, max: 200000000, step: 5000000 };
    case "MRO": return { min: 20000, max: 5000000, step: 50000 };
    // East/SE Asia
    case "CNY": return { min: 50000, max: 1000000, step: 10000 };
    case "JPY": return { min: 1000000, max: 20000000, step: 500000 };
    case "KRW": return { min: 10000000, max: 100000000, step: 5000000 };
    case "MNT": return { min: 10000000, max: 500000000, step: 10000000 };
    case "TWD": return { min: 100000, max: 5000000, step: 50000 };
    case "PHP": return { min: 100000, max: 5000000, step: 50000 };
    case "VND": return { min: 100000000, max: 5000000000, step: 100000000 };
    case "THB": return { min: 100000, max: 5000000, step: 50000 };
    case "MMK": return { min: 500000, max: 50000000, step: 1000000 };
    case "KHR": return { min: 50000000, max: 2000000000, step: 50000000 };
    case "LAK": return { min: 50000000, max: 2000000000, step: 50000000 };
    case "MYR": return { min: 20000, max: 500000, step: 5000 };
    case "SGD": return { min: 10000, max: 200000, step: 2000 };
    case "IDR": return { min: 50000000, max: 2000000000, step: 50000000 };
    case "BND": return { min: 10000, max: 200000, step: 2000 };
    // Central Asia
    case "KZT": return { min: 5000000, max: 100000000, step: 5000000 };
    case "UZS": return { min: 50000000, max: 2000000000, step: 50000000 };
    case "TMT": return { min: 10000, max: 500000, step: 5000 };
    case "KGS": return { min: 500000, max: 20000000, step: 500000 };
    case "TJS": return { min: 500000, max: 20000000, step: 500000 };
    // Western
    case "USD": return { min: 5000, max: 100000, step: 1000 };
    case "GBP": return { min: 5000, max: 80000, step: 1000 };
    case "CAD": return { min: 10000, max: 100000, step: 1000 };
    case "AUD": return { min: 10000, max: 100000, step: 1000 };
    case "NZD": return { min: 10000, max: 100000, step: 1000 };
    case "EUR": return { min: 5000, max: 80000, step: 1000 };
    case "CHF": return { min: 10000, max: 100000, step: 1000 };
    case "SEK": return { min: 50000, max: 500000, step: 10000 };
    case "NOK": return { min: 50000, max: 500000, step: 10000 };
    case "DKK": return { min: 30000, max: 400000, step: 5000 };
    case "ISK": return { min: 500000, max: 5000000, step: 100000 };
    case "PLN": return { min: 20000, max: 200000, step: 5000 };
    case "CZK": return { min: 100000, max: 1000000, step: 25000 };
    case "HUF": return { min: 1000000, max: 10000000, step: 500000 };
    case "RON": return { min: 20000, max: 200000, step: 5000 };
    case "BGN": return { min: 10000, max: 100000, step: 2000 };
    case "RSD": return { min: 500000, max: 5000000, step: 100000 };
    case "BAM": return { min: 10000, max: 100000, step: 2000 };
    case "MKD": return { min: 300000, max: 3000000, step: 50000 };
    case "ALL": return { min: 200000, max: 2000000, step: 50000 };
    case "UAH": return { min: 100000, max: 2000000, step: 50000 };
    case "BYN": return { min: 5000, max: 50000, step: 1000 };
    case "RUB": return { min: 500000, max: 10000000, step: 100000 };
    default: return { min: 100000, max: 50000000, step: 50000 };
  }
}
