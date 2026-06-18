import {
  escapeCsv,
  formatDateTime,
  getBankName,
  getCounterpartyDocument,
  getCounterpartyName,
  sortByDateDesc,
} from "../utils/statementExport.helpers";
import { StatementExportItem } from "../utils/statementExport.types";

export const buildStatementCsv = (items: StatementExportItem[]) => {
  const headers = ["Data", "Operação", "Valor", "Nome", "Documento", "Banco", "EndToEndId"];

  const rows = sortByDateDesc(items).map((item: any) => {
    const amount = Number(item.amount ?? 0);

    return [
      formatDateTime(item.timestamp),
      item.operation ?? item.transactionType ?? "",
      Number.isFinite(amount) ? amount.toFixed(2).replace(".", ",") : "",
      getCounterpartyName(item),
      getCounterpartyDocument(item),
      getBankName(item),
      item.endToEndId ?? "",
    ];
  });

  return [
    "\uFEFF" + headers.map(escapeCsv).join(";"),
    ...rows.map((row: any) => row.map(escapeCsv).join(";")),
  ].join("\n");
};
