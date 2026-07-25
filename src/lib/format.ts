/**
 * Format a number as Indian currency with proper comma grouping.
 * Uses Indian numbering: 30,00,000 (not 3,000,000)
 *
 * formatINR(3000000)  → "₹30,00,000"
 * formatINR(30000)    → "₹30,000"
 * formatINR(0)        → "₹0"
 */
export function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Format a number as Indian currency without ₹ prefix.
 *
 * formatINRAbbrev(3000000)  → "30 L"
 * formatINRAbbrev(30000000) → "3 Cr"
 * formatINRAbbrev(30000)    → "30K"
 */
export function formatINRAbbrev(n: number): string {
  if (n === 0) return "0";
  if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  return n.toLocaleString("en-IN");
}

/**
 * Format a number as Indian currency with ₹ prefix, abbreviated.
 *
 * formatINRAbbrevWithSymbol(3000000)  → "₹30 L"
 * formatINRAbbrevWithSymbol(30000000) → "₹3 Cr"
 */
export function formatINRAbbrevWithSymbol(n: number): string {
  return `₹${formatINRAbbrev(n)}`;
}

/**
 * Parse a formatted Indian currency string back to a number.
 * Handles ₹ symbol, commas, and spaces.
 *
 * parseINR("₹30,00,000")  → 3000000
 * parseINR("30,000")      → 30000
 * parseINR("3 Lakh")      → 300000
 * parseINR("2 Crore")     → 20000000
 */
export function parseINR(s: string): number {
  if (!s) return 0;
  let str = s.replace(/[₹\s]/g, "").toLowerCase();
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
  const num = parseFloat(str.replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}
