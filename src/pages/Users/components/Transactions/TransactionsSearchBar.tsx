import { MagnifyingGlass, X } from "@phosphor-icons/react";
import React from "react";

interface TransactionsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onEnter?: (value: string) => void; // <- NOVO
  className?: string;
}

export const TransactionsSearchBar: React.FC<TransactionsSearchBarProps> = ({
  value,
  onChange,
  onClear,
  onEnter,
  className = "",
}) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && onEnter) onEnter(value.trim());
  };

  return (
    <div className={`mb-3 flex items-center gap-2 ${className}`}>
      <div className="relative w-full max-w-lg">
        <MagnifyingGlass
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          weight="bold"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown} // <- NOVO
          placeholder="Buscar por EndToEnd"
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:bg-gray-100"
            title="Limpar busca"
          >
            <X size={16} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
};
