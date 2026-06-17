import { ChangeEvent, InputHTMLAttributes, useLayoutEffect, useRef } from "react";

const onlyDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

export const normalizeBRLAmountDigits = (value: unknown) => {
  const digits = onlyDigits(value);

  if (!digits) return "";

  return digits.replace(/^0+(?=\d{3,})/, "");
};

export const formatBRLAmountFromDigits = (value: unknown) => {
  const digits = normalizeBRLAmountDigits(value);

  if (!digits) return "";

  const padded = digits.padStart(3, "0");
  const cents = padded.slice(-2);
  const integer = padded.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";

  return `${integer},${cents}`;
};

export const formatBRLInputValue = (value: unknown) => {
  const raw = String(value ?? "").trim();

  if (!raw) return "";

  if (typeof value === "number") {
    return formatBRLAmountFromDigits(Math.round(value * 100));
  }

  if (/^\d+(\.\d{1,2})?$/.test(raw)) {
    return formatBRLAmountFromDigits(Math.round(Number(raw) * 100));
  }

  return formatBRLAmountFromDigits(raw);
};

export const brlInputToNumber = (value: unknown) => {
  const digits = normalizeBRLAmountDigits(value);

  if (!digits) return Number.NaN;

  return Number(digits) / 100;
};

export const brlInputToBackendValue = (value: unknown) => {
  const parsed = brlInputToNumber(value);

  if (!Number.isFinite(parsed)) return "";

  return parsed.toFixed(2);
};

const countDigitsBeforeCaret = (value: string, caret: number) => {
  return onlyDigits(value.slice(0, caret)).length;
};

const getCaretPositionAfterDigitIndex = (formatted: string, digitIndex: number) => {
  if (digitIndex <= 0) return 0;

  let count = 0;

  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) {
      count += 1;

      if (count >= digitIndex) {
        return index + 1;
      }
    }
  }

  return formatted.length;
};

type BRLAmountInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value: string;
  onChange: (value: string) => void;
};

export const BRLAmountInput = ({
  value,
  onChange,
  placeholder = "0,00",
  inputMode = "numeric",
  ...props
}: BRLAmountInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caretRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const caret = caretRef.current;

    if (!input || caret === null) return;

    if (document.activeElement === input) {
      const safeCaret = Math.min(caret, input.value.length);

      input.setSelectionRange(safeCaret, safeCaret);
    }

    caretRef.current = null;
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const caret = event.target.selectionStart ?? rawValue.length;

    const rawDigits = onlyDigits(rawValue);
    const normalizedDigits = normalizeBRLAmountDigits(rawDigits);

    const rawDigitsBeforeCaret = countDigitsBeforeCaret(rawValue, caret);
    const removedLeadingZeros = rawDigits.length - normalizedDigits.length;

    const normalizedDigitsBeforeCaret = Math.max(
      0,
      rawDigitsBeforeCaret - Math.min(rawDigitsBeforeCaret, removedLeadingZeros),
    );

    const paddingDigits = Math.max(0, 3 - normalizedDigits.length);
    const formatted = formatBRLAmountFromDigits(normalizedDigits);

    caretRef.current = getCaretPositionAfterDigitIndex(
      formatted,
      paddingDigits + normalizedDigitsBeforeCaret,
    );

    onChange(formatted);
  };

  return (
    <input
      {...props}
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      inputMode={inputMode}
    />
  );
};
