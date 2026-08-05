"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import DatePicker from "@/components/DatePicker";
import { COUNTRIES, CITIES_BY_COUNTRY, CITIES_BY_REGION, RELIGIONS_BY_COUNTRY, WEDDING_TEMPLATES } from "@/lib/weddingTemplates";

function formatBudgetDisplay(value: number, currency?: string): string {
  const cfg = (COUNTRIES as any).find((c: any) => c.currency === currency) || { symbol: "\u20B9", currency: "INR" };
  const symbol = getSymbol(currency);

  if (["INR", "PKR", "NPR", "BDT", "BTN"].includes(currency || "INR")) {
    if (value >= 10000000) {
      const c = value / 10000000;
      return c % 1 === 0 ? `${symbol}${c} Crore` : `${symbol}${c.toFixed(1)} Crore`;
    }
    const l = value / 100000;
    return l % 1 === 0 ? `${symbol}${l} Lakh` : `${symbol}${l.toFixed(1)} Lakh`;
  }

  if (value >= 1000000) {
    const m = value / 1000000;
    return m % 1 === 0 ? `${symbol}${m}M` : `${symbol}${m.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return k % 1 === 0 ? `${symbol}${k}K` : `${symbol}${k.toFixed(1)}K`;
  }
  return `${symbol}${value}`;
}

function formatCompactNumber(value: number): string {
  if (value >= 1000000000) {
    const b = value / 1000000000;
    return b % 1 === 0 ? `${b}B` : `${b.toFixed(1)}B`;
  }
  if (value >= 1000000) {
    const m = value / 1000000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return value.toLocaleString();
}

function getSymbol(currency?: string): string {
  switch (currency) {
    case "INR": return "\u20B9";
    case "PKR": return "\u20A8";
    case "BDT": return "\u09F3";
    case "LKR": return "Rs ";
    case "NPR": return "\u20A8";
    case "MVR": return "Rf ";
    case "AFN": return "\u060B";
    case "USD": return "$";
    case "GBP": return "\u00A3";
    case "EUR": return "\u20AC";
    case "CAD": return "C$";
    case "AUD": return "A$";
    case "NZD": return "NZ$";
    case "SGD": return "S$";
    case "CHF": return "CHF ";
    case "SEK": return "kr";
    case "NOK": return "kr";
    case "DKK": return "kr";
    case "ISK": return "kr";
    case "PLN": return "z\u0142";
    case "CZK": return "K\u010D";
    case "HUF": return "Ft";
    case "RON": return "lei";
    case "BGN": return "\u043B\u0432";
    case "RSD": return "din";
    case "BAM": return "KM";
    case "MKD": return "den";
    case "ALL": return "L";
    case "UAH": return "\u20B4";
    case "BYN": return "Br";
    case "RUB": return "\u20BD";
    case "KZT": return "\u20B8";
    case "UZS": return "so\u02BBm";
    case "KGS": return "som";
    case "TJS": return "SM";
    case "CNY": return "\u00A5";
    case "JPY": return "\u00A5";
    case "KRW": return "\u20A9";
    case "TWD": return "NT$";
    case "MNT": return "\u20AE";
    case "THB": return "\u0E3F";
    case "VND": return "\u20AB";
    case "IDR": return "Rp";
    case "MYR": return "RM";
    case "PHP": return "\u20B1";
    case "KHR": return "៛";
    case "LAK": return "\u20AD";
    case "MMK": return "K";
    case "BND": return "B$";
    case "TRY": return "\u20BA";
    case "SAR": return "\uFDFC";
    case "AED": return "AED";
    case "QAR": return "QR";
    case "KWD": return "KD";
    case "BHD": return "BD";
    case "OMR": return "OMR";
    case "JOD": return "JD";
    case "LBP": return "L£";
    case "EGP": return "E\u00A3";
    case "MAD": return "MAD";
    case "DZD": return "DA";
    case "TND": return "DT";
    case "LYD": return "LD";
    case "SDG": return "SDG";
    case "MRU": return "UM";
    case "ILS": return "\u20AA";
    case "IRR": return "﷼";
    case "IQD": return "IQD";
    case "SYP": return "SYP";
    case "YER": return "YR";
    case "GEL": return "\u20BE";
    case "AMD": return "֏";
    case "AZN": return "\u20BC";
    case "HRK": return "kn";
    case "TMT": return "m";
    default: return "$";
  }
}

function getBudgetRange(currency?: string): { min: number; max: number; step: number } {
  switch (currency) {
    // South Asia
    case "INR": return { min: 100000, max: 50000000, step: 50000 };
    case "PKR": return { min: 1500000, max: 50000000, step: 500000 };
    case "BDT": return { min: 300000, max: 20000000, step: 100000 };
    case "LKR": return { min: 500000, max: 20000000, step: 100000 };
    case "NPR": return { min: 500000, max: 10000000, step: 100000 };
    case "MVR": return { min: 50000, max: 10000000, step: 10000 };
    case "AFN": return { min: 300000, max: 50000000, step: 100000 };
    case "BTN": return { min: 1000000, max: 20000000, step: 100000 };
    // Middle East
    case "AED": return { min: 10000, max: 500000, step: 5000 };
    case "SAR": return { min: 10000, max: 500000, step: 5000 };
    case "QAR": return { min: 10000, max: 500000, step: 5000 };
    case "KWD": return { min: 1000, max: 100000, step: 500 };
    case "BHD": return { min: 1000, max: 100000, step: 500 };
    case "OMR": return { min: 1000, max: 100000, step: 500 };
    case "JOD": return { min: 5000, max: 200000, step: 2000 };
    case "LBP": return { min: 100000000, max: 5000000000, step: 50000000 };
    case "EGP": return { min: 50000, max: 2000000, step: 25000 };
    case "MAD": return { min: 50000, max: 1000000, step: 25000 };
    case "DZD": return { min: 500000, max: 10000000, step: 250000 };
    case "TND": return { min: 5000, max: 200000, step: 2000 };
    case "LYD": return { min: 5000, max: 200000, step: 2000 };
    case "SDG": return { min: 500000, max: 10000000, step: 250000 };
    case "MRU": return { min: 50000, max: 1000000, step: 25000 };
    case "IQD": return { min: 10000000, max: 500000000, step: 5000000 };
    case "IRR": return { min: 1000000000, max: 50000000000, step: 500000000 };
    case "SYP": return { min: 10000000, max: 500000000, step: 5000000 };
    case "YER": return { min: 1000000, max: 50000000, step: 500000 };
    case "ILS": return { min: 10000, max: 500000, step: 5000 };
    // East Asia
    case "CNY": return { min: 50000, max: 3000000, step: 25000 };
    case "JPY": return { min: 1000000, max: 30000000, step: 500000 };
    case "KRW": return { min: 10000000, max: 500000000, step: 5000000 };
    case "TWD": return { min: 200000, max: 10000000, step: 100000 };
    case "MNT": return { min: 5000000, max: 100000000, step: 5000000 };
    // Southeast Asia
    case "THB": return { min: 100000, max: 5000000, step: 50000 };
    case "VND": return { min: 50000000, max: 2000000000, step: 50000000 };
    case "IDR": return { min: 50000000, max: 2000000000, step: 50000000 };
    case "MYR": return { min: 10000, max: 300000, step: 5000 };
    case "PHP": return { min: 100000, max: 5000000, step: 50000 };
    case "KHR": return { min: 5000000, max: 200000000, step: 5000000 };
    case "LAK": return { min: 50000000, max: 2000000000, step: 50000000 };
    case "MMK": return { min: 5000000, max: 200000000, step: 5000000 };
    case "SGD": return { min: 5000, max: 200000, step: 2000 };
    case "BND": return { min: 5000, max: 200000, step: 2000 };
    // Central Asia
    case "KZT": return { min: 500000, max: 30000000, step: 250000 };
    case "UZS": return { min: 50000000, max: 2000000000, step: 50000000 };
    case "KGS": return { min: 500000, max: 30000000, step: 250000 };
    case "TJS": return { min: 100000, max: 5000000, step: 50000 };
    case "TMT": return { min: 10000, max: 500000, step: 5000 };
    // Eastern Europe
    case "UAH": return { min: 50000, max: 3000000, step: 25000 };
    case "BYN": return { min: 5000, max: 200000, step: 2000 };
    case "RUB": return { min: 500000, max: 30000000, step: 250000 };
    case "PLN": return { min: 20000, max: 1000000, step: 10000 };
    case "CZK": return { min: 200000, max: 10000000, step: 100000 };
    case "HUF": return { min: 2000000, max: 100000000, step: 1000000 };
    case "RON": return { min: 20000, max: 1000000, step: 10000 };
    case "BGN": return { min: 10000, max: 500000, step: 5000 };
    case "RSD": return { min: 500000, max: 20000000, step: 250000 };
    case "BAM": return { min: 10000, max: 500000, step: 5000 };
    case "MKD": return { min: 500000, max: 20000000, step: 250000 };
    case "ALL": return { min: 200000, max: 10000000, step: 100000 };
    case "HRK": return { min: 30000, max: 1500000, step: 15000 };
    // Western Europe
    case "EUR": return { min: 5000, max: 200000, step: 2000 };
    case "GBP": return { min: 5000, max: 200000, step: 2000 };
    case "CHF": return { min: 5000, max: 250000, step: 2000 };
    case "SEK": return { min: 50000, max: 2000000, step: 25000 };
    case "NOK": return { min: 50000, max: 2000000, step: 25000 };
    case "DKK": return { min: 30000, max: 1500000, step: 15000 };
    case "ISK": return { min: 500000, max: 20000000, step: 250000 };
    // Americas
    case "USD": return { min: 5000, max: 200000, step: 2000 };
    case "CAD": return { min: 5000, max: 200000, step: 2000 };
    case "AUD": return { min: 5000, max: 200000, step: 2000 };
    case "NZD": return { min: 5000, max: 200000, step: 2000 };
    // Africa
    case "ZAR": return { min: 50000, max: 2000000, step: 25000 };
    case "NGN": return { min: 500000, max: 20000000, step: 250000 };
    case "KES": return { min: 100000, max: 5000000, step: 50000 };
    case "GHS": return { min: 5000, max: 200000, step: 2000 };
    // Turkiye
    case "TRY": return { min: 100000, max: 5000000, step: 50000 };
    // Caucasus
    case "GEL": return { min: 10000, max: 500000, step: 5000 };
    case "AMD": return { min: 1000000, max: 50000000, step: 500000 };
    case "AZN": return { min: 10000, max: 500000, step: 5000 };
    default: return { min: 5000, max: 200000, step: 2000 };
  }
}

interface Props {
  onComplete: (data: any) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState({
    country: "",
    religion: "",
    region: "",
    budget: 1000000,
    guestCount: 200,
    weddingDays: 1,
    selectedEvents: [] as string[],
    weddingDate: "",
    weddingCity: "",
    customCity: "",
    userName: "",
  });
  const [budgetInput, setBudgetInput] = useState("1000000");
  const [guestInput, setGuestInput] = useState("200");
  const [daysInput, setDaysInput] = useState("1");
  const [countrySearch, setCountrySearch] = useState("");

  const totalSteps = 9;
  const progress = (step / totalSteps) * 100;

  const currency = COUNTRIES.find((c) => c.id === data.country)?.currency || "INR";
  const budgetRange = getBudgetRange(currency);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [countrySearch]);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 1: return !!data.country;
      case 2: return !!data.religion;
      case 3: return !!data.region;
      case 4: return !!data.weddingCity;
      case 5: return data.budget >= budgetRange.min;
      case 6: return data.guestCount >= 10;
      case 7: return data.weddingDays >= 1;
      case 8: return data.selectedEvents.length > 0;
      case 9: return true;
      default: return false;
    }
  };

  const handleContinue = () => {
    if (!canContinue()) {
      showToast("Please pick an option to move to the next section");
      return;
    }
    setStep(step + 1);
  };

  const selectCountry = (countryId: string) => {
    const country = COUNTRIES.find((c) => c.id === countryId);
    const newCurrency = country?.currency || "INR";
    const range = getBudgetRange(newCurrency);
    setData({
      ...data,
      country: countryId,
      religion: "",
      region: "",
      selectedEvents: [],
      budget: range.min,
      weddingCity: "",
    });
    setBudgetInput(range.min.toString());
  };

  const selectReligion = (r: string) => {
    const religions = RELIGIONS_BY_COUNTRY[data.country] || [];
    const religionData = religions.find((rel) => rel.id === r);

    // Auto-populate events from template - with fallback logic
    const defaultTemplate = WEDDING_TEMPLATES.find(
      (t) => t.country === data.country && t.religion === r
    ) || WEDDING_TEMPLATES.find(
      (t) => t.religion === r
    ) || WEDDING_TEMPLATES[0];
    const events = defaultTemplate ? defaultTemplate.events.map((e) => e.name) : [];

    setData({ ...data, religion: r, region: "", selectedEvents: events });
  };

  const selectRegion = (r: string) => {
    // Find the template for this combination and update events - with fallback logic
    const template = WEDDING_TEMPLATES.find(
      (t) => t.country === data.country && t.religion === data.religion && t.region === r
    ) || WEDDING_TEMPLATES.find(
      (t) => t.country === data.country && t.religion === data.religion
    ) || WEDDING_TEMPLATES.find(
      (t) => t.religion === data.religion
    ) || WEDDING_TEMPLATES[0];
    const events = template ? template.events.map((e) => e.name) : data.selectedEvents;

    setData({ ...data, region: r, selectedEvents: events, weddingCity: "" });
  };

  const toggleEvent = (e: string) => {
    setData({
      ...data,
      selectedEvents: data.selectedEvents.includes(e)
        ? data.selectedEvents.filter((x) => x !== e)
        : [...data.selectedEvents, e],
    });
  };

  const handleBudgetChange = (value: number) => {
    const clamped = Math.max(budgetRange.min, Math.min(budgetRange.max, value));
    setData({ ...data, budget: clamped });
    setBudgetInput(clamped.toString());
  };

  const handleBudgetInputChange = (val: string) => {
    setBudgetInput(val);
    const num = parseInt(val.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num)) {
      const clamped = Math.max(budgetRange.min, Math.min(budgetRange.max, num));
      setData({ ...data, budget: clamped });
    }
  };

  const handleGuestChange = (value: number) => {
    const clamped = Math.max(10, Math.min(5000, value));
    setData({ ...data, guestCount: clamped });
    setGuestInput(clamped.toString());
  };

  const handleGuestInputChange = (val: string) => {
    setGuestInput(val);
    const num = parseInt(val.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num)) {
      const clamped = Math.max(10, Math.min(5000, num));
      setData({ ...data, guestCount: clamped });
    }
  };

  const handleDaysChange = (value: number) => {
    const clamped = Math.max(1, Math.min(15, value));
    setData({ ...data, weddingDays: clamped });
    setDaysInput(clamped.toString());
  };

  const religions = RELIGIONS_BY_COUNTRY[data.country] || [];
  const regions: Record<string, string[]> = {
    hindu: data.country === "india"
      ? ["North Indian", "South Indian", "Bengali", "Gujarati", "Maharashtrian", "Rajput", "Punjabi", "Kashmiri", "Assamese", "Odia", "Bihari", "Malayali", "Sindhi"]
      : data.country === "bangladesh"
        ? ["Bengali"]
        : data.country === "nepal"
          ? ["Nepali", "Newari", "Tamang"]
          : data.country === "sri_lanka"
            ? ["Tamil Hindu", "Hill Country Tamil"]
            : data.country === "pakistan"
              ? ["Punjabi"]
              : data.country === "bhutan"
                ? ["Lhotshampa"]
                : data.country === "malaysia" || data.country === "singapore" || data.country === "myanmar" || data.country === "indonesia"
                  ? ["Indian Hindu", "Tamil Hindu"]
                  : ["Indian", "Sri Lankan", "Tamil", "Nepali", "Gujarati", "Bengali"],
    muslim: data.country === "pakistan"
      ? ["Sunni", "Sindhi", "Baloch", "Kashmiri"]
      : data.country === "bangladesh"
        ? ["Bengali"]
        : data.country === "maldives"
          ? ["Maldivian"]
          : data.country === "afghanistan"
            ? ["Pashtun", "Tajik", "Hazara", "Uzbek"]
            : data.country === "nepal"
              ? ["Nepali"]
              : data.country === "sri_lanka"
                ? ["Sri Lankan"]
                : data.country === "saudi_arabia"
                  ? ["Hejazi", "Najdi", "Eastern Province", "Southern", "Shia Arab"]
                  : data.country === "uae"
                    ? ["Emirati", "Baluchi", "South Asian Muslim", "Shia"]
                    : data.country === "oman"
                      ? ["Ibadi", "Sunni Arab", "Baluchi", "Shia"]
                      : data.country === "yemen"
                        ? ["Hadhrami", "Yemeni", "Tihami", "Zaydi"]
                        : data.country === "bahrain"
                          ? ["Sunni Arab", "Baharna"]
                          : data.country === "qatar"
                            ? ["Qatari", "Baluchi", "South Asian Muslim", "Shia"]
                            : data.country === "kuwait"
                              ? ["Kuwaiti", "Baluchi", "South Asian Muslim", "Shia"]
                              : data.country === "iraq"
                                ? ["Arab Shia", "Arab Sunni", "Kurdish Sunni"]
                                : data.country === "jordan"
                                  ? ["Jordanian", "Palestinian", "Circassian"]
                                  : data.country === "lebanon"
                                    ? ["Sunni Arab", "Shia Arab"]
                                    : data.country === "syria"
                                      ? ["Syrian Arab"]
                                      : data.country === "palestine"
                                        ? ["Palestinian"]
                                        : data.country === "israel"
                                          ? ["Arab Israeli", "Bedouin"]
                                          : data.country === "iran"
                                            ? ["Persian", "Azerbaijani", "Kurdish"]
                                            : data.country === "turkey"
                                              ? ["Turkish", "Kurdish", "Arab"]
                                              : data.country === "egypt"
                                                ? ["Egyptian Arab"]
                                                : data.country === "libya"
                                                  ? ["Libyan Arab"]
                                                  : data.country === "tunisia"
                                                    ? ["Tunisian Arab"]
                                                    : data.country === "algeria"
                                                      ? ["Algerian Arab"]
                                                      : data.country === "morocco"
                                                        ? ["Moroccan Arab"]
                                                        : data.country === "sudan"
                                                          ? ["Sudanese Arab"]
                                                          : data.country === "mauritania"
                                                            ? ["Moorish"]
                                                            : data.country === "kazakhstan"
                                                              ? ["Kazakh"]
                                                              : data.country === "uzbekistan"
                                                                ? ["Uzbek"]
                                                                : data.country === "turkmenistan"
                                                                  ? ["Turkmen"]
                                                                  : data.country === "kyrgyzstan"
                                                                    ? ["Kyrgyz"]
                                                                    : data.country === "tajikistan"
                                                                      ? ["Tajik"]
                                                                      : data.country === "china"
                                                                        ? ["Hui", "Uyghur"]
                                                                        : data.country === "mongolia"
                                                                          ? ["Kazakh"]
                                                                          : data.country === "thailand"
                                                                            ? ["Malay", "Thai Muslim"]
                                                                            : data.country === "myanmar"
                                                                              ? ["Rohingya"]
                                                                              : data.country === "cambodia"
                                                                                ? ["Cham Muslim"]
                                                                                : data.country === "malaysia"
                                                                                  ? ["Malay"]
                                                                                  : data.country === "singapore"
                                                                                    ? ["Malay Singaporean"]
                                                                                    : data.country === "indonesia"
                                                                                      ? ["Javanese", "Sundanese", "Malay"]
                                                                                      : data.country === "brunei"
                                                                                        ? ["Malay"]
                                                                                        : data.country === "philippines"
                                                                                          ? ["Maranao", "Tausug", "Maguindanao"]
                                                                                          : data.country === "usa"
                                                                                            ? ["Arab American", "South Asian American", "African American", "Somali", "Pakistani", "Bangladeshi", "Turkish", "Iranian", "Malay"]
                                                                                            : data.country === "uk"
                                                                                              ? ["Pakistani", "Bangladeshi", "Arab", "Somali", "Turkish", "Malay", "West African", "North African"]
                                                                                              : data.country === "canada"
                                                                                                ? ["Arab Canadian", "South Asian Canadian", "Somali", "Pakistani", "Turkish"]
                                                                                                : data.country === "australia"
                                                                                                  ? ["Lebanese Australian", "Afghan", "Turkish", "Somali", "Indonesian", "Malay"]
                                                                                                  : data.country === "new_zealand"
                                                                                                    ? ["Indian", "Fijian", "Somali"]
                                                                                                    : data.country === "france"
                                                                                                      ? ["North African", "Sub-Saharan African", "Turkish"]
                                                                                                      : data.country === "germany"
                                                                                                        ? ["Turkish", "Arab", "Kurdish"]
                                                                                                        : data.country === "netherlands"
                                                                                                          ? ["Turkish", "Moroccan", "Somali"]
                                                                                                          : data.country === "belgium"
                                                                                                            ? ["Moroccan", "Turkish", "Congolese"]
                                                                                                            : data.country === "switzerland"
                                                                                                              ? ["Bosnian", "Turkish", "Arab"]
                                                                                                              : data.country === "austria"
                                                                                                                ? ["Turkish", "Bosnian"]
                                                                                                                : data.country === "sweden"
                                                                                                                  ? ["Somali", "Iraqi", "Bosnian"]
                                                                                                                  : data.country === "norway"
                                                                                                                    ? ["Somali", "Iraqi", "Pakistani"]
                                                                                                                    : data.country === "denmark"
                                                                                                                      ? ["Pakistani", "Somali", "Iraqi"]
                                                                                                                      : data.country === "finland"
                                                                                                                        ? ["Iraqi", "Somali"]
                                                                                                                        : data.country === "italy"
                                                                                                                          ? ["North African", "Somali"]
                                                                                                                          : data.country === "spain"
                                                                                                                            ? ["Moroccan"]
                                                                                                                            : data.country === "portugal"
                                                                                                                              ? ["Moroccan"]
                                                                                                                              : data.country === "poland"
                                                                                                                                ? ["Tatar"]
                                                                                                                                : data.country === "bulgaria"
                                                                                                                                  ? ["Turkish"]
                                                                                                                                  : data.country === "greece"
                                                                                                                                    ? ["Turkish", "Albanian"]
                                                                                                                                    : data.country === "croatia"
                                                                                                                                      ? ["Bosniak"]
                                                                                                                                      : data.country === "slovenia"
                                                                                                                                        ? ["Bosniak"]
                                                                                                                                        : data.country === "serbia"
                                                                                                                                          ? ["Bosniak", "Albanian"]
                                                                                                                                          : data.country === "bosnia"
                                                                                                                                            ? ["Bosniak"]
                                                                                                                                            : data.country === "montenegro"
                                                                                                                                              ? ["Bosniak", "Albanian"]
                                                                                                                                              : data.country === "north_macedonia"
                                                                                                                                                ? ["North Macedonian Albanian"]
                                                                                                                                                : data.country === "albania"
                                                                                                                                                  ? ["Albanian"]
                                                                                                                                                  : data.country === "ukraine"
                                                                                                                                                    ? ["Crimean Tatar"]
                                                                                                                                                    : data.country === "russia"
                                                                                                                                                      ? ["Tatar", "Chechen", "Dagestani"]
                                                                                                                                                      : data.country === "ireland"
                                                                                                                                                        ? ["Pakistani", "Somali", "Arab"]
                                                                                                                                                        : data.country === "japan"
                                                                                                                                                          ? ["Pakistani", "Bangladeshi"]
                                                                                                                                                          : data.country === "south_korea"
                                                                                                                                                            ? ["Pakistani"]
                                                                                                                                                            : data.country === "china"
                                                                                                                                                              ? ["Uyghur", "Hui"]
                                                                                                                                                              : data.country === "thailand"
                                                                                                                                                                ? ["Malay", "Thai Muslim"]
                                                                                                                                                                : data.country === "myanmar"
                                                                                                                                                                  ? ["Rohingya"]
                                                                                                                                                                  : data.country === "south_africa"
                                                                                                                                                                    ? ["Cape Malay", "Somali"]
                                                                                                                                                                    : data.country === "nigeria"
                                                                                                                                                                      ? ["Hausa", "Yoruba", "Igbo"]
                                                                                                                                                                      : data.country === "kenya"
                                                                                                                                                                        ? ["Swahili", "Somali"]
                                                                                                                                                                        : data.country === "tanzania"
                                                                                                                                                                          ? ["Swahili", "Shirazi"]
                                                                                                                                                                          : data.country === "uganda"
                                                                                                                                                                            ? ["Ugandan"]
                                                                                                                                                                            : data.country === "ethiopia"
                                                                                                                                                                              ? ["Oromo", "Somali"]
                                                                                                                                                                              : data.country === "ghana"
                                                                                                                                                                                ? ["Hausa", "Mamprusi"]
                                                                                                                                                                                : ["South Asian"],
    sikh: data.country === "uk"
      ? ["Punjabi Sikh"]
      : data.country === "canada"
        ? ["Punjabi Sikh"]
        : data.country === "usa"
          ? ["Punjabi Sikh", "Sikh American"]
          : data.country === "australia"
            ? ["Punjabi Sikh", "Sikh Australian"]
            : data.country === "new_zealand"
              ? ["Punjabi Sikh"]
              : data.country === "malaysia"
                ? ["Punjabi Sikh", "Malaysian Sikh"]
                : data.country === "kenya"
                  ? ["Kenyan Sikh"]
                  : data.country === "uganda"
                    ? ["Ugandan Sikh"]
                    : ["Punjabi"],
    buddhist: data.country === "sri_lanka"
      ? ["Sinhalese"]
      : data.country === "nepal"
        ? ["Nepali", "Sherpa"]
        : data.country === "india"
          ? ["Ladakhi"]
          : data.country === "bangladesh"
            ? ["Chakma"]
            : data.country === "bhutan"
              ? ["Ngalop"]
              : data.country === "china"
                ? ["Han"]
                : data.country === "japan"
                  ? ["Japanese Buddhist"]
                  : data.country === "south_korea"
                    ? ["Korean Buddhist"]
                    : data.country === "mongolia"
                      ? ["Mongolian Buddhist"]
                      : data.country === "taiwan"
                        ? ["Taiwanese Buddhist"]
                        : data.country === "vietnam"
                          ? ["Kinh"]
                          : data.country === "thailand"
                            ? ["Thai", "Lao Isan", "Khon Muang"]
                            : data.country === "myanmar"
                              ? ["Bamar", "Shan", "Mon"]
                              : data.country === "cambodia"
                                ? ["Khmer"]
                                : data.country === "laos"
                                  ? ["Lao Loum"]
                                  : data.country === "malaysia"
                                    ? ["Chinese Malaysian"]
                                    : data.country === "singapore"
                                      ? ["Chinese Singaporean"]
                                      : data.country === "indonesia"
                                        ? ["Chinese Indonesian"]
                                        : data.country === "brunei"
                                          ? ["Chinese Bruneian"]
                                          : data.country === "kazakhstan"
                                            ? ["Kazakh"]
                                            : data.country === "russia"
                                              ? ["Buryat", "Kalmyk", "Tuvinian"]
                                              : data.country === "usa"
                                                ? ["East Asian Buddhist", "Tibetan Buddhist", "Thai Buddhist", "Japanese Buddhist", "Korean Buddhist"]
                                                : data.country === "canada"
                                                  ? ["Chinese Canadian", "Vietnamese Canadian", "Japanese Canadian"]
                                                  : data.country === "australia"
                                                    ? ["Chinese Australian", "Thai Australian", "Vietnamese Australian"]
                                                    : data.country === "uk"
                                                      ? ["Chinese Buddhist", "Thai Buddhist", "Japanese Buddhist", "Tibetan Buddhist"]
                                                      : data.country === "new_zealand"
                                                        ? ["Chinese New Zealander", "Thai"]
                                                        : data.country === "france"
                                                          ? ["Chinese", "Vietnamese", "Cambodian"]
                                                          : data.country === "germany"
                                                            ? ["Chinese", "Thai", "Vietnamese"]
                                                            : data.country === "denmark"
                                                              ? ["Thai", "Vietnamese"]
                                                              : data.country === "netherlands"
                                                                ? ["Thai", "Indonesian", "Vietnamese"]
                                                                : data.country === "switzerland"
                                                                  ? ["Thai", "Sri Lankan", "Vietnamese"]
                                                                  : [],
    christian: data.country === "pakistan"
      ? ["Pakistani"]
      : data.country === "sri_lanka"
        ? ["Sri Lankan Christian"]
        : data.country === "india"
          ? ["Indian Christian", "Goan Christian", "Kerala Christian", "Northeast Christian"]
          : data.country === "uae"
            ? ["Catholic", "Protestant", "Orthodox"]
            : data.country === "bahrain"
              ? ["Catholic", "Protestant"]
              : data.country === "kuwait"
                ? ["Catholic", "Protestant"]
                : data.country === "iraq"
                  ? ["Assyrian", "Chaldean"]
                  : data.country === "jordan"
                    ? ["Greek Orthodox", "Catholic"]
                    : data.country === "lebanon"
                      ? ["Maronite", "Greek Orthodox", "Melkite", "Armenian"]
                      : data.country === "syria"
                        ? ["Greek Orthodox", "Syriac", "Armenian"]
                        : data.country === "palestine"
                          ? ["Greek Orthodox", "Catholic"]
                          : data.country === "israel"
                            ? ["Greek Orthodox", "Catholic", "Maronite"]
                            : data.country === "iran"
                              ? ["Armenian", "Assyrian"]
                              : data.country === "turkey"
                                ? ["Greek Orthodox", "Armenian"]
                                : data.country === "egypt"
                                  ? ["Coptic"]
                                  : data.country === "libya"
                                    ? ["Coptic", "Catholic"]
                                    : data.country === "tunisia"
                                      ? ["Catholic", "Protestant"]
                                      : data.country === "algeria"
                                        ? ["Catholic", "Protestant"]
                                        : data.country === "morocco"
                                          ? ["Catholic", "Protestant"]
                                          : data.country === "sudan"
                                            ? ["Coptic", "Catholic", "Protestant"]
                                            : data.country === "philippines"
                                              ? ["Tagalog", "Cebuano", "Ilocano", "Hiligaynon", "Bicolano"]
                                              : data.country === "south_korea"
                                                ? ["Korean Protestant", "Korean Catholic"]
                                                : data.country === "japan"
                                                  ? ["Protestant", "Catholic"]
                                                  : data.country === "vietnam"
                                                    ? ["Vietnamese Catholic"]
                                                    : data.country === "thailand"
                                                      ? ["Protestant", "Catholic"]
                                                      : data.country === "myanmar"
                                                        ? ["Baptist", "Catholic"]
                                                        : data.country === "cambodia"
                                                          ? ["Catholic", "Protestant"]
                                                          : data.country === "laos"
                                                            ? ["Protestant", "Catholic"]
                                                            : data.country === "malaysia"
                                                              ? ["Catholic", "Protestant"]
                                                              : data.country === "singapore"
                                                                ? ["Catholic", "Protestant"]
                                                                : data.country === "indonesia"
                                                                  ? ["Protestant", "Catholic"]
                                                                  : data.country === "brunei"
                                                                    ? ["Catholic", "Protestant"]
                                                                    : data.country === "china"
                                                                      ? ["Protestant", "Catholic"]
                                                                      : data.country === "mongolia"
                                                                        ? ["Protestant", "Catholic"]
                                                                        : data.country === "usa"
                                                                          ? ["Evangelical", "Mainline Protestant", "Black Protestant", "Irish Catholic", "Italian Catholic", "Hispanic Catholic", "Polish Catholic"]
                                                                          : data.country === "uk"
                                                                            ? ["English", "Welsh", "Scottish", "Irish Catholic", "African Caribbean", "West African", "East African"]
                                                                            : data.country === "canada"
                                                                              ? ["French Canadian", "Irish Catholic", "Italian Catholic", "United Church"]
                                                                              : data.country === "australia"
                                                                                ? ["Irish Australian", "Italian Australian", "English Australian", "Greek Orthodox", "Lebanese Catholic"]
                                                                                : data.country === "new_zealand"
                                                                                  ? ["Pākehā", "Māori", "Polynesian", "Pacific Islander"]
                                                                                  : data.country === "ireland"
                                                                                    ? ["Irish", "Church of Ireland"]
                                                                                    : data.country === "france"
                                                                                      ? ["French", "Reformed"]
                                                                                      : data.country === "germany"
                                                                                        ? ["Bavarian", "Rhineland", "Lutheran"]
                                                                                        : data.country === "italy"
                                                                                          ? ["Neapolitan", "Sicilian", "Lombard", "Venetian", "Tuscan", "Emilian"]
                                                                                          : data.country === "spain"
                                                                                            ? ["Castilian", "Andalusian", "Catalan", "Valencian", "Galician"]
                                                                                            : data.country === "portugal"
                                                                                              ? ["Portuguese", "Brazilian"]
                                                                                              : data.country === "netherlands"
                                                                                                ? ["Dutch Reformed", "Calvinist", "Brabantian"]
                                                                                                : data.country === "belgium"
                                                                                                  ? ["Flemish", "Walloon"]
                                                                                                  : data.country === "switzerland"
                                                                                                    ? ["Swiss", "Italian Swiss", "Reformed"]
                                                                                                    : data.country === "austria"
                                                                                                      ? ["Austrian"]
                                                                                                      : data.country === "sweden"
                                                                                                        ? ["Church of Sweden"]
                                                                                                        : data.country === "norway"
                                                                                                          ? ["Church of Norway"]
                                                                                                          : data.country === "denmark"
                                                                                                            ? ["Church of Denmark"]
                                                                                                            : data.country === "finland"
                                                                                                              ? ["Finnish"]
                                                                                                              : data.country === "iceland"
                                                                                                                ? ["Evangelical Lutheran"]
                                                                                                                : data.country === "poland"
                                                                                                                  ? ["Polish", "Lutheran", "Polish Orthodox"]
                                                                                                                  : data.country === "czech_republic"
                                                                                                                    ? ["Czech", "Moravian", "Hussite"]
                                                                                                                    : data.country === "slovakia"
                                                                                                                      ? ["Slovak", "Hungarian", "Greek Catholic"]
                                                                                                                      : data.country === "hungary"
                                                                                                                        ? ["Hungarian", "German Hungarian", "Calvinist", "Lutheran"]
                                                                                                                        : data.country === "romania"
                                                                                                                          ? ["Romanian", "Aromanian", "Romanian Catholic", "Hungarian Catholic", "Calvinist"]
                                                                                                                          : data.country === "bulgaria"
                                                                                                                            ? ["Bulgarian"]
                                                                                                                            : data.country === "greece"
                                                                                                                              ? ["Greek", "Macedonian", "Pontic"]
                                                                                                                              : data.country === "croatia"
                                                                                                                                ? ["Croatian", "Serbian Orthodox"]
                                                                                                                                : data.country === "slovenia"
                                                                                                                                  ? ["Slovenian", "Serbian Orthodox"]
                                                                                                                                  : data.country === "serbia"
                                                                                                                                    ? ["Serbian", "Hungarian Catholic"]
                                                                                                                                    : data.country === "bosnia"
                                                                                                                                      ? ["Serb", "Croat"]
                                                                                                                                      : data.country === "montenegro"
                                                                                                                                        ? ["Montenegrin", "Serb", "Croat"]
                                                                                                                                        : data.country === "north_macedonia"
                                                                                                                                          ? ["Macedonian"]
                                                                                                                                          : data.country === "albania"
                                                                                                                                            ? ["Albanian Orthodox", "Albanian Catholic"]
                                                                                                                                            : data.country === "ukraine"
                                                                                                                                              ? ["Ukrainian Orthodox", "Ukrainian Greek Catholic", "Roman Catholic"]
                                                                                                                                              : data.country === "belarus"
                                                                                                                                                ? ["Belarusian", "Belarusian Catholic"]
                                                                                                                                                : data.country === "russia"
                                                                                                                                                  ? ["Russian"]
                                                                                                                                                  : data.country === "estonia"
                                                                                                                                                    ? ["Estonian"]
                                                                                                                                                    : data.country === "latvia"
                                                                                                                                                      ? ["Latvian"]
                                                                                                                                                      : data.country === "lithuania"
                                                                                                                                                        ? ["Lithuanian"]
                                                                                                                                                        : data.country === "south_africa"
                                                                                                                                                          ? ["Zulu", "Xhosa", "Afrikaner", "English South African"]
                                                                                                                                                          : data.country === "nigeria"
                                                                                                                                                            ? ["Catholic", "Anglican", "Pentecostal"]
                                                                                                                                                            : data.country === "kenya"
                                                                                                                                                              ? ["Catholic", "Anglican"]
                                                                                                                                                              : data.country === "tanzania"
                                                                                                                                                                ? ["Catholic", "Lutheran"]
                                                                                                                                                                : data.country === "ghana"
                                                                                                                                                                  ? ["Catholic", "Pentecostal", "Anglican"]
                                                                                                                                                                  : data.country === "ethiopia"
                                                                                                                                                                    ? ["Ethiopian Orthodox", "Catholic"]
                                                                                                                                                                    : data.country === "jamaica"
                                                                                                                                                                      ? ["Protestant", "Catholic"]
                                                                                                                                                                      : data.country === "trinidad"
                                                                                                                                                                        ? ["Catholic", "Anglican", "Hindu"]
                                                                                                                                                                        : data.country === "guyana"
                                                                                                                                                                          ? ["Hindu", "Catholic"]
                                                                                                                                                                          : data.country === "fiji"
                                                                                                                                                                            ? ["Methodist", "Catholic"]
                                                                                                                                                                            : ["Indian"],
    jewish: data.country === "israel"
      ? ["Ashkenazi", "Mizrahi", "Sephardi", "Ethiopian"]
      : data.country === "iran"
        ? ["Persian Jews"]
        : data.country === "morocco"
          ? ["Moroccan Jews"]
          : data.country === "usa"
            ? ["American Jewish", "Orthodox", "Conservative", "Reform", "Hasidic"]
            : data.country === "uk"
              ? ["Ashkenazi", "Sephardi", "Orthodox", "Reform"]
              : data.country === "canada"
                ? ["Ashkenazi", "Sephardi"]
                : data.country === "france"
                  ? ["Ashkenazi", "Sephardi", "Mizrahi"]
                  : data.country === "australia"
                    ? ["Ashkenazi", "Sephardi"]
                    : data.country === "argentina"
                      ? ["Ashkenazi", "Sephardi"]
                      : ["Ashkenazi", "Sephardi"],
    yazidi: data.country === "iraq"
      ? ["Yazidi"]
      : data.country === "germany"
        ? ["Yazidi"]
        : data.country === "syria"
          ? ["Yazidi"]
          : data.country === "usa"
            ? ["Yazidi American"]
            : [],
    druze: data.country === "lebanon"
      ? ["Druze"]
      : data.country === "syria"
        ? ["Druze"]
        : data.country === "israel"
          ? ["Druze"]
          : [],
    zoroastrian: data.country === "iran"
      ? ["Zoroastrian"]
      : data.country === "india"
        ? ["Parsi", "Iranian"]
        : data.country === "usa"
          ? ["Parsi", "Iranian"]
          : data.country === "uk"
            ? ["Parsi", "Iranian"]
            : ["Parsi", "Iranian"],
    shinto: data.country === "japan"
      ? ["Japanese"]
      : [],
    folk: data.country === "china"
      ? ["Han Folk"]
      : data.country === "south_korea"
        ? ["Korean Folk"]
        : data.country === "taiwan"
          ? ["Taiwanese Folk", "Taoist"]
          : data.country === "vietnam"
            ? ["Vietnamese Folk"]
            : data.country === "laos"
              ? ["Lao Theung", "Lao Soung"]
              : data.country === "malaysia"
                ? ["Chinese Folk"]
                : data.country === "singapore"
                  ? ["Chinese Folk"]
                  : [],
    taoist: data.country === "taiwan"
      ? ["Taoist"]
      : data.country === "singapore"
        ? ["Taoist"]
        : data.country === "malaysia"
          ? ["Chinese Taoist"]
          : [],
    caodaist: data.country === "vietnam"
      ? ["Caodaist"]
      : [],
    hoa_hao: data.country === "vietnam"
      ? ["Hoa Hao"]
      : [],
    shamanic: data.country === "mongolia"
      ? ["Tengerist"]
      : data.country === "russia"
        ? ["Siberian"]
        : [],
    lds: data.country === "usa"
      ? ["Mormon"]
      : data.country === "mexico"
        ? ["Mexican Mormon"]
        : data.country === "brazil"
          ? ["Brazilian Mormon"]
          : data.country === "philippines"
            ? ["Filipino Mormon"]
            : ["LDS"],
    maori: data.country === "new_zealand"
      ? ["Māori"]
      : [],
    neopagan: data.country === "iceland"
      ? ["Neopagan"]
      : data.country === "lithuania"
        ? ["Romuva"]
        : data.country === "usa"
          ? ["Wiccan", "Asatru"]
          : data.country === "uk"
            ? ["Wiccan", "Druid"]
            : [],
    traditional: data.country === "sudan"
      ? ["Traditional"]
      : data.country === "china"
        ? ["Confucian"]
        : data.country === "japan"
          ? ["Shinto"]
          : data.country === "nigeria"
            ? ["Yoruba", "Igbo", "Hausa"]
            : data.country === "ghana"
              ? ["Akan", "Ewe"]
              : data.country === "kenya"
                ? ["Maasai", "Kikuyu"]
                : data.country === "south_africa"
                  ? ["Zulu", "Xhosa"]
                  : data.country === "ethiopia"
                    ? ["Oromo"]
                    : data.country === "tanzania"
                      ? ["Maasai"]
                      : ["Traditional"],
    jain: data.country === "india"
      ? ["Marwari", "Gujarati", "Digambara", "Shvetambara"]
      : ["Indian"],
    parsi: data.country === "india"
      ? ["Parsi"]
      : ["Parsi"],
    anglican: data.country === "uk"
      ? ["English", "Welsh"]
      : data.country === "usa"
        ? ["Episcopalian"]
        : data.country === "canada"
          ? ["Anglican Canadian"]
          : data.country === "australia"
            ? ["Anglican Australian"]
            : ["Anglican"],
    presbyterian: data.country === "uk"
      ? ["Scottish", "Irish Presbyterian"]
      : data.country === "usa"
        ? ["Presbyterian American"]
        : data.country === "south_korea"
          ? ["Korean Presbyterian"]
          : ["Presbyterian"],
    protestant: data.country === "usa"
      ? ["Baptist", "Methodist", "Lutheran", "Pentecostal", "Reformed"]
      : data.country === "uk"
        ? ["Methodist", "Baptist", "Quaker"]
        : data.country === "germany"
          ? ["Lutheran", "Reformed"]
          : data.country === "south_korea"
            ? ["Korean Protestant"]
            : ["Protestant"],
    orthodox: data.country === "russia"
      ? ["Russian Orthodox"]
      : data.country === "greece"
        ? ["Greek Orthodox"]
        : data.country === "romania"
          ? ["Romanian Orthodox"]
          : data.country === "serbia"
            ? ["Serbian Orthodox"]
            : data.country === "ukraine"
              ? ["Ukrainian Orthodox"]
              : data.country === "usa"
                ? ["Greek Orthodox", "Russian Orthodox", "Antiochian Orthodox"]
                : data.country === "uk"
                  ? ["Greek Orthodox", "Russian Orthodox", "Romanian Orthodox"]
                  : ["Orthodox"],
    catholic: data.country === "italy"
      ? ["Neapolitan", "Sicilian", "Lombard", "Venetian", "Tuscan", "Emilian"]
      : data.country === "spain"
        ? ["Castilian", "Andalusian", "Catalan", "Valencian", "Galician"]
        : data.country === "portugal"
          ? ["Portuguese", "Brazilian"]
          : data.country === "france"
            ? ["French Catholic"]
            : data.country === "usa"
              ? ["Irish Catholic", "Italian Catholic", "Hispanic Catholic", "Polish Catholic"]
              : data.country === "uk"
                ? ["Irish Catholic", "English Catholic", "Polish Catholic"]
                : data.country === "canada"
                  ? ["French Canadian", "Irish Catholic", "Italian Catholic"]
                  : data.country === "australia"
                    ? ["Irish Australian", "Italian Australian"]
                    : data.country === "ireland"
                      ? ["Irish"]
                      : data.country === "philippines"
                        ? ["Tagalog", "Cebuano", "Ilocano", "Hiligaynon", "Bicolano"]
                        : data.country === "mexico"
                          ? ["Mexican"]
                          : data.country === "brazil"
                            ? ["Brazilian"]
                            : data.country === "argentina"
                              ? ["Argentinian"]
                              : data.country === "colombia"
                                ? ["Colombian"]
                                : data.country === "poland"
                                  ? ["Polish"]
                                  : data.country === "germany"
                                    ? ["Bavarian", "Rhineland"]
                                    : data.country === "austria"
                                      ? ["Austrian"]
                                      : data.country === "belgium"
                                        ? ["Flemish", "Walloon"]
                                        : data.country === "netherlands"
                                          ? ["Dutch Catholic"]
                                          : data.country === "switzerland"
                                            ? ["Italian Swiss"]
                                            : data.country === "czech_republic"
                                              ? ["Czech"]
                                              : data.country === "hungary"
                                                ? ["Hungarian"]
                                                : data.country === "croatia"
                                                  ? ["Croatian"]
                                                  : ["Catholic"],
    islam: data.country === "pakistan"
      ? ["Sunni", "Shia", "Deobandi", "Barelvi"]
      : data.country === "bangladesh"
        ? ["Bengali"]
        : data.country === "india"
          ? ["Sunni", "Shia", "Bohra", "Khoja"]
          : data.country === "uk"
            ? ["Pakistani", "Bangladeshi", "Arab", "Somali", "Turkish", "Malay"]
            : data.country === "usa"
              ? ["Arab American", "South Asian American", "African American", "Somali", "Turkish"]
              : data.country === "canada"
                ? ["Pakistani", "Bangladeshi", "Arab", "Somali", "Turkish"]
                : data.country === "australia"
                  ? ["Lebanese", "Afghan", "Turkish", "Somali"]
                  : ["Muslim"],
    mormon: data.country === "usa"
      ? ["American Mormon"]
      : data.country === "uk"
        ? ["British Mormon"]
        : data.country === "mexico"
          ? ["Mexican Mormon"]
          : ["Mormon"],
  };

  // Get events for current selection - with fallback logic
  const template = WEDDING_TEMPLATES.find(
    (t) => t.country === data.country && t.religion === data.religion && t.region === data.region
  ) || WEDDING_TEMPLATES.find(
    (t) => t.country === data.country && t.religion === data.religion
  ) || WEDDING_TEMPLATES.find(
    (t) => t.religion === data.religion
  ) || WEDDING_TEMPLATES[0];
  const availableEvents = template ? template.events.map((e) => e.name) : [];

  // Get cities for selected country, filtered by region if available
  const allCountryCities = CITIES_BY_COUNTRY[data.country] || [];
  const regionCities = CITIES_BY_REGION[data.region];
  const cities = regionCities || allCountryCities;

  return (
    <div className="min-h-screen bg-cream flex flex-col relative">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg" style={{ animation: "toastSlideIn 0.3s ease" }}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between px-4 md:px-10 py-3 md:py-5">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "55px", width: "auto" }} />
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-[100px] md:w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-maroon to-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs md:text-sm text-gray-500 font-medium whitespace-nowrap">Step {step} of {totalSteps}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 md:px-6">
        <div className="w-full max-w-[720px]">

          {/* STEP 1: Country */}
          {step === 1 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Where is your wedding?</h2>
              <p className="text-gray-500 mb-4 md:mb-6 text-sm md:text-base">Start typing to search for your country.</p>
              <div className="relative mb-4">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={countrySearch || (data.country ? `${COUNTRIES.find((c) => c.id === data.country)?.flag || ""} ${COUNTRIES.find((c) => c.id === data.country)?.name || ""}` : "")}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Type a country name..."
                  readOnly={!!data.country && !countrySearch}
                  onFocus={() => { if (data.country) setCountrySearch(""); }}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent cursor-text"
                />
                {(countrySearch || data.country) && (
                  <button onClick={() => { setCountrySearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <i className="fas fa-times text-xs" />
                  </button>
                )}
              </div>
              {countrySearch && filteredCountries.length > 0 && (
                <div className="border border-gray-200 rounded-xl bg-white shadow-lg max-h-[300px] overflow-y-auto">
                  {filteredCountries.map((c) => (
                    <button key={c.id} onClick={() => { selectCountry(c.id); setCountrySearch(""); }}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-maroon/5 transition-colors cursor-pointer ${data.country === c.id ? "bg-maroon/5" : ""}`}>
                      <span className="text-xl">{c.flag}</span>
                      <span className="font-medium text-sm">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {countrySearch && filteredCountries.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <i className="fas fa-globe text-2xl mb-2" />
                  <p className="text-sm">No countries found. Try a different search.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Religion */}
          {step === 2 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">What type of wedding are you planning?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">This helps us load the right rituals, templates, and budget categories.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {religions.map((r) => (
                  <button key={r.id} onClick={() => selectReligion(r.id)}
                    className={`flex flex-col items-center gap-2 md:gap-3 p-4 md:p-7 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.religion === r.id ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)] bg-gradient-to-br from-maroon/5 to-gold/5" : "border-gray-200"}`}>
                    <div className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-colors ${data.religion === r.id ? "bg-maroon text-white" : "bg-gradient-to-br from-maroon/10 to-gold/10 text-maroon"}`}>
                      <ReligionIcon religion={r.id} />
                    </div>
                    <span className="font-semibold text-xs md:text-sm">{r.name} Wedding</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Region */}
          {step === 3 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Which region/community?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">This customizes the specific rituals and traditions.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {(regions[data.religion] || []).map((r) => (
                  <button key={r} onClick={() => selectRegion(r)}
                    className={`flex flex-col items-center gap-2 md:gap-3 p-4 md:p-7 bg-white border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${data.region === r ? "border-maroon shadow-[0_0_0_3px_rgba(139,0,0,0.1)] bg-gradient-to-br from-maroon/5 to-gold/5" : "border-gray-200"}`}>
                    <div className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-colors ${data.region === r ? "bg-maroon text-white" : "bg-gradient-to-br from-maroon/10 to-gold/10 text-maroon"}`}>
                      <MapPinIcon />
                    </div>
                    <span className="font-semibold text-sm">{r}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: City */}
          {step === 4 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Where is the wedding?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Select your wedding city for vendor recommendations and local insights.</p>
              <div className="max-w-[400px]">
                <select value={data.weddingCity} onChange={(e) => setData({ ...data, weddingCity: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-maroon transition-colors bg-white text-sm">
                  <option value="">Select your city</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {data.weddingCity === "Other" && (
                  <input type="text" placeholder="Type your city" value={data.customCity || ""} onChange={(e) => setData({ ...data, customCity: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-maroon transition-colors mt-2 text-sm" />
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Budget */}
          {step === 5 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">What&apos;s your wedding budget?</h2>
              <p className="text-gray-500 mb-1 text-sm md:text-base">This helps us suggest realistic allocations.</p>
              <p className="text-xs md:text-sm text-gray-400 mb-6 md:mb-8 italic">Can always be changed later</p>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <span className="text-3xl md:text-5xl font-extrabold text-maroon">{formatBudgetDisplay(data.budget, currency)}</span>
                </div>
                <input
                  type="range"
                  min={budgetRange.min}
                  max={budgetRange.max}
                  step={budgetRange.step}
                  value={data.budget}
                  onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium mb-6">
                  <span>{getSymbol(currency)}{formatCompactNumber(budgetRange.min)}</span>
                  <span>{getSymbol(currency)}{formatCompactNumber(budgetRange.max)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-600">Or type amount:</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">{getSymbol(currency)}</span>
                    <input
                      type="text"
                      value={budgetInput}
                      onChange={(e) => handleBudgetInputChange(e.target.value)}
                      onBlur={() => {
                        const num = parseInt(budgetInput.replace(/[^\d]/g, ""), 10);
                        handleBudgetChange(isNaN(num) ? budgetRange.min : Math.max(budgetRange.min, Math.min(budgetRange.max, num)));
                      }}
                      className="w-48 pl-8 pr-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors text-right font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Guest Count */}
          {step === 6 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">How many guests are you expecting?</h2>
              <p className="text-gray-500 mb-1 text-sm md:text-base">This affects your catering budget and venue selection.</p>
              <p className="text-xs md:text-sm text-gray-400 mb-6 md:mb-8 italic">Can always be changed later</p>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <span className="text-3xl md:text-5xl font-extrabold text-maroon">{data.guestCount.toLocaleString("en-IN")}</span>
                  <span className="text-base md:text-lg text-gray-500 ml-2">guests</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={5000}
                  step={10}
                  value={data.guestCount}
                  onChange={(e) => handleGuestChange(parseInt(e.target.value))}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium mb-6">
                  <span>10</span>
                  <span>5,000</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-600">Or type number:</label>
                  <input
                    type="text"
                    value={guestInput}
                    onChange={(e) => handleGuestInputChange(e.target.value)}
                    onBlur={() => {
                      const num = parseInt(guestInput.replace(/[^\d]/g, ""), 10);
                      handleGuestChange(isNaN(num) ? 10 : Math.max(10, Math.min(5000, num)));
                    }}
                    className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors text-right font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Wedding Days */}
          {step === 7 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">How many days will the main wedding span?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">This helps us plan the timeline. Many South Asian weddings span multiple days.</p>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <span className="text-3xl md:text-5xl font-extrabold text-maroon">{data.weddingDays}</span>
                  <span className="text-base md:text-lg text-gray-500 ml-2">{data.weddingDays === 1 ? "day" : "days"}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={data.weddingDays}
                  onChange={(e) => handleDaysChange(parseInt(e.target.value))}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium mb-6">
                  <span>1 day</span>
                  <span>15 days</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-600">Or type number:</label>
                  <input
                    type="text"
                    value={daysInput}
                    onChange={(e) => {
                      setDaysInput(e.target.value);
                      const num = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
                      if (!isNaN(num)) handleDaysChange(num);
                    }}
                    onBlur={() => {
                      const num = parseInt(daysInput.replace(/[^\d]/g, ""), 10);
                      handleDaysChange(isNaN(num) ? 1 : Math.max(1, Math.min(15, num)));
                    }}
                    className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon transition-colors text-right font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Events */}
          {step === 8 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Which events are you planning?</h2>
              <p className="text-gray-500 mb-1 text-sm md:text-base">Select all that apply. We&apos;ll create a timeline for each.</p>
              <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6 italic">You can add more events later</p>
              {availableEvents.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {availableEvents.map((e) => (
                    <button key={e} onClick={() => toggleEvent(e)}
                      className={`flex items-center gap-3 p-4 bg-white border-2 rounded-lg cursor-pointer transition-all ${data.selectedEvents.includes(e) ? "border-maroon bg-maroon/5" : "border-gray-200"}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${data.selectedEvents.includes(e) ? "border-maroon bg-maroon" : "border-gray-300"}`}>
                        {data.selectedEvents.includes(e) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-sm">{e}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Loading events for your selection...</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 9: Date, Name */}
          {step === 9 && (
            <div className="animate-[fadeInUp_0.4s_ease]">
              <h2 className="text-xl md:text-3xl font-bold mb-2">Almost done! When and who?</h2>
              <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">We&apos;ll set up reminders based on your wedding date. You can always change this later.</p>
              <div className="max-w-[400px] space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Wedding Date</label>
                  <DatePicker value={data.weddingDate} min={new Date().toISOString().split("T")[0]} onChange={(val) => setData({ ...data, weddingDate: val })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                  <input type="text" placeholder="e.g., Priya Sharma" value={data.userName} onChange={(e) => setData({ ...data, userName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-maroon transition-colors text-sm" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-6 md:mt-10 pt-4 md:pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-600 hover:text-maroon font-medium transition-colors text-sm md:text-base">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : <div />}
            {step < totalSteps ? (
              <button onClick={handleContinue}
                className={`flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-4 text-sm md:text-lg font-bold rounded-lg transition-all ${
                  canContinue()
                    ? "text-white bg-gradient-to-br from-maroon to-maroon-light shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)] cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}>
                Continue
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button onClick={() => onComplete({ ...data, currency })}
                className="flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-4 text-sm md:text-lg font-bold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)] transition-all cursor-pointer">
                Create My Wedding Plan
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReligionIcon({ religion }: { religion: string }) {
  switch (religion) {
    case "hindu":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
          <path d="M4 18h16" />
          <path d="M5 18v-4h14v4" />
          <path d="M7 14v-3h10v3" />
          <path d="M8 11V8h8v3" />
          <path d="M9 8c0-3 1.5-5 3-5s3 2 3 5" />
          <circle cx="12" cy="2.5" r="1" fill="currentColor" opacity="0.3" />
          <line x1="7" y1="14" x2="7" y2="18" />
          <line x1="17" y1="14" x2="17" y2="18" />
        </svg>
      );
    case "muslim":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18h18v2H3z" fill="currentColor" opacity="0.15" />
          <path d="M3 18h18" />
          <path d="M5 18v-5h14v5" />
          <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
          <line x1="4" y1="8" x2="4" y2="18" />
          <line x1="20" y1="8" x2="20" y2="18" />
          <circle cx="4" cy="7.5" r="0.8" fill="currentColor" opacity="0.3" />
          <circle cx="20" cy="7.5" r="0.8" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case "sikh":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18h18v2H3z" fill="currentColor" opacity="0.15" />
          <path d="M3 18h18" />
          <path d="M6 18v-4h12v4" />
          <path d="M8 14c0-4 2-7 4-7s4 3 4 7" />
          <path d="M10.5 7c0-1.5.7-3 1.5-3s1.5 1.5 1.5 3" />
          <line x1="12" y1="5" x2="12" y2="3" />
          <circle cx="12" cy="2.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case "christian":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
          <path d="M4 18h16" />
          <path d="M6 18v-6h12v6" />
          <path d="M10 12V7l2-4 2 4v5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="11" y1="2" x2="13" y2="2" />
          <circle cx="12" cy="14.5" r="1" />
        </svg>
      );
    case "jain":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
          <path d="M4 18h16" />
          <path d="M6 18v-5h12v5" />
          <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3" />
          <line x1="12" y1="6" x2="12" y2="4" />
          <circle cx="12" cy="3.5" r="0.5" fill="currentColor" opacity="0.4" />
        </svg>
      );
    case "buddhist":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
          <path d="M4 18h16" />
          <path d="M6 18v-5h12v5" />
          <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="12" r="0.8" fill="currentColor" opacity="0.3" />
          <line x1="12" y1="6" x2="12" y2="4" />
          <circle cx="12" cy="3" r="0.5" fill="currentColor" />
        </svg>
      );
    case "parsi":
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
          <path d="M4 18h16" />
          <path d="M6 18v-5h12v5" />
          <circle cx="12" cy="10" r="3" />
          <path d="M12 7v6" /><path d="M9 10h6" />
          <path d="M12 4v2" /><circle cx="12" cy="3" r="0.5" fill="currentColor" />
        </svg>
      );
    default:
      return <MapPinIcon />;
  }
}

function MapPinIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
