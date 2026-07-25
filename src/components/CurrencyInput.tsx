"use client";

import { useState, useEffect, useRef } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  className = "",
  disabled = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focused) {
      setDisplayValue(value > 0 ? value.toLocaleString("en-IN") : "");
    }
  }, [value, focused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = raw ? parseInt(raw, 10) : 0;
    setDisplayValue(raw);
    onChange(num);
  };

  const handleFocus = () => {
    setFocused(true);
    setDisplayValue(value > 0 ? String(value) : "");
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  return (
    <div className={`input-currency ${className}`}>
      <span className="currency-symbol">{'₹'}</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={focused ? displayValue : (value > 0 ? value.toLocaleString("en-IN") : "")}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
}
