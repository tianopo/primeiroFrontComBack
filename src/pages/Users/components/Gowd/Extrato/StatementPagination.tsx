import { Button } from "src/components/Buttons/Button";

type StatementPaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  isLoading?: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export const StatementPagination = ({
  page,
  pageSize,
  totalItems,
  isLoading,
  onPrev,
  onNext,
}: StatementPaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-gray-600">
        Página {page} de {totalPages} • {totalItems} transações
      </span>

      <div className="flex gap-2">
        <Button onClick={onPrev} disabled={isLoading || !canPrev}>
          Anterior
        </Button>

        <Button onClick={onNext} disabled={isLoading || !canNext}>
          Próxima
        </Button>
      </div>
    </div>
  );
};
