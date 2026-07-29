"use client";

import { useState, useRef } from "react";
import { getCurrencySymbol } from "@/lib/format";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  currency?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  className = "",
  disabled = false,
  currency = "INR",
}: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const symbol = getCurrencySymbol(currency);
  const formatted = value > 0 ? value.toLocaleString("en-IN") : "";
  const showValue = focused ? typed : formatted;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setTyped(raw);
    onChange(raw ? parseInt(raw, 10) : 0);
  };

  const handleFocus = () => {
    setFocused(true);
    setTyped(value > 0 ? String(value) : "");
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  return (
    <div className={`input-currency ${className}`}>
      <span className="currency-symbol">{symbol}</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={showValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="card-input"
      />
    </div>
  );
}
