"use client";
import React, { useState } from "react";

function removeSeparators(value: string) {
  return value.replace(/,/g, "");
}
function normalizeDigits(value: string) {
  const persian = "۰۱۲۳۴۵۶۷۸۹";

  return value.replace(/[۰-۹]/g, (digit) => {
    return persian.indexOf(digit).toString();
  });
}

function formatNumber(value: string) {
  const [integer, decimal] = value.split(".");

  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimal !== undefined
    ? `${formattedInteger}.${decimal}`
    : formattedInteger;
}

function isValidNumber(value: string) {
  return /^\d*\.?\d*$/.test(value);
}
type NumberInputProps = {
  value: string;
  onChange: (value: string) => void;
};
export default function CurrencyInput({ onChange, value }: NumberInputProps) {
  //   const [value, setValue] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    // Cursor position before formatting
    const cursorPosition = input.selectionStart ?? 0;
    // Count how many digits exist before the cursor.
    // Ignore commas because they are only formatting.
    const digitsBeforeCursor = input.value
      .slice(0, cursorPosition)
      .replace(/,/g, "").length;

    // Remove commas from the entered value
    let rawValue = removeSeparators(input.value);

    // Convert Persian digits to English digits
    rawValue = normalizeDigits(rawValue);

    // Allow only digits and one decimal point
    if (!isValidNumber(rawValue)) {
      return;
    }

    // Update parent state (React will rerender)
    onChange(rawValue);

    // Restore cursor after React has updated the input
    requestAnimationFrame(() => {
      const formattedValue = formatNumber(rawValue);

      let digitCount = 0;
      let newCursorPosition = 0;

      for (let i = 0; i < formattedValue.length; i++) {
        if (/\d/.test(formattedValue[i])) {
          digitCount++;
        }

        newCursorPosition++;

        if (digitCount >= digitsBeforeCursor) {
          break;
        }
      }

      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };
  return (
    <div>
      <input
        value={formatNumber(value)}
        onChange={handleChange}
        className="border "
      />
    </div>
  );
}
