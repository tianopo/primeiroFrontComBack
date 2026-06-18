import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { buildStatementCsv } from "src/pages/Users/config/buildStatementCsv";
import { buildStatementOfx } from "src/pages/Users/config/buildStatementOfx";
import { generateStatementPdf } from "src/pages/Users/config/generateStatementPdf";
import {
  downloadTextFile,
  buildStatementFilename,
} from "src/pages/Users/utils/statementExport.helpers";
import { StatementExportItem } from "src/pages/Users/utils/statementExport.types";

type StatementExportButtonsProps = {
  items: StatementExportItem[];
  startDate: string;
  endDate: string;
  balance?: number;
  entradas?: number;
  saidas?: number;
  taxas?: number;
};

export const StatementExportButtons = ({
  items,
  startDate,
  endDate,
  balance,
  entradas,
  saidas,
  taxas,
}: StatementExportButtonsProps) => {
  const hasItems = Array.isArray(items) && items.length > 0;

  const handleCsv = () => {
    if (!hasItems) {
      toast.error("Não há transações para exportar.");
      return;
    }

    const content = buildStatementCsv(items);

    downloadTextFile({
      filename: buildStatementFilename("csv", startDate, endDate),
      content,
      mimeType: "text/csv;charset=utf-8;",
    });
  };

  const handleOfx = () => {
    if (!hasItems) {
      toast.error("Não há transações para exportar.");
      return;
    }

    const content = buildStatementOfx(items);

    downloadTextFile({
      filename: buildStatementFilename("ofx", startDate, endDate),
      content,
      mimeType: "application/x-ofx;charset=utf-8;",
    });
  };

  const handlePdf = () => {
    if (!hasItems) {
      toast.error("Não há transações para exportar.");
      return;
    }

    generateStatementPdf({
      items,
      resume: {
        startDate,
        endDate,
        balance,
        entradas,
        saidas,
        taxas,
      },
    });
  };

  return (
    <div className="flex w-full flex-col gap-1.5 md:w-auto md:flex-row">
      <div className="w-full md:w-auto">
        <Button onClick={handleCsv}>CSV</Button>
      </div>

      <div className="w-full md:w-auto">
        <Button onClick={handleOfx}>OFX</Button>
      </div>

      <div className="w-full md:w-auto">
        <Button onClick={handlePdf}>PDF</Button>
      </div>
    </div>
  );
};
