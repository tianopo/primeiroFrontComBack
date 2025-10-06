import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import React from "react";

interface PaginationBarProps {
  page: number;
  limit: number;
  rowCount: number; // qtde recebida do backend nesta página
  displayCount?: number; // qtde exibida após filtro (opcional)
  isFetching?: boolean;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  limit,
  rowCount,
  displayCount,
  isFetching = false,
  onPrev,
  onNext,
  className = "",
}) => {
  const canPrev = page > 1;
  const canNext = rowCount === limit && rowCount > 0;

  const shown = typeof displayCount === "number" ? displayCount : rowCount;
  const startIdx = shown ? (page - 1) * limit + 1 : 0;
  const endIdx = shown ? startIdx + shown - 1 : 0;

  return (
    <div className={`mb-2 flex items-center justify-between ${className}`}>
      <div className="text-sm text-gray-600">
        {shown > 0 ? `Mostrando ${startIdx}–${endIdx}` : `Mostrando 0–0`}{" "}
        {isFetching && <span className="ml-1 animate-pulse text-gray-400">(atualizando…)</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          title={canPrev ? "Anterior" : "Sem anteriores"}
          className={`rounded-lg border px-2 py-1 ${
            canPrev
              ? "cursor-pointer border-gray-300 hover:bg-gray-100"
              : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
          }`}
        >
          <ArrowLeft size={18} />
        </button>

        <span className="text-sm text-gray-700">Página {page}</span>

        <button
          onClick={onNext}
          disabled={!canNext}
          title={canNext ? "Próximos" : "Sem próximos"}
          className={`rounded-lg border px-2 py-1 ${
            canNext
              ? "cursor-pointer border-gray-300 hover:bg-gray-100"
              : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
          }`}
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
