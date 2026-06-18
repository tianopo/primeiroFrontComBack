import { StatementExportItem } from "./statementExport.types";

export const pad2 = (value: number) => String(value).padStart(2, "0");

export const escapeCsv = (value: unknown) => {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
};

export const escapeHtml = (value?: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const sanitizeOfx = (value?: unknown) =>
  String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const formatBRL = (value: number) =>
  Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const formatDateTime = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR");
};

export const toOfxDate = (value?: string) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) return "";

  return (
    `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}` +
    `${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`
  );
};

export const getTxnDateMs = (item: StatementExportItem) => {
  const value = item.timestamp ?? item.raw?.transactionDate ?? item.raw?.date ?? "";
  const ms = new Date(value).getTime();

  return Number.isFinite(ms) ? ms : 0;
};

export const sortByDateDesc = (items: StatementExportItem[]) => {
  return [...items].sort((a, b) => getTxnDateMs(b) - getTxnDateMs(a));
};

export const sortByDateAsc = (items: StatementExportItem[]) => {
  return [...items].sort((a, b) => getTxnDateMs(a) - getTxnDateMs(b));
};

export const getCounterpartyName = (item: StatementExportItem) => {
  return item.payer?.name || item.payee?.name || item.raw?.counterparty?.name || "";
};

export const getCounterpartyDocument = (item: StatementExportItem) => {
  return (
    item.payer?.document || item.payee?.document || item.raw?.counterparty?.document?.number || ""
  );
};

export const getBankName = (item: StatementExportItem) => {
  return item.payer?.bankName || item.payee?.bankName || item.raw?.counterparty?.bankName || "";
};

export const getBankId = (item?: StatementExportItem) => {
  return (
    item?.payer?.bankCode || item?.payee?.bankCode || item?.raw?.counterparty?.ispb || "00000000"
  );
};

export const getAccountId = (item?: StatementExportItem) => {
  return (
    item?.payer?.account || item?.payee?.account || item?.raw?.counterparty?.account || "0000000000"
  );
};

export const getFitId = (item: StatementExportItem, index: number) => {
  return (
    item.transactionId ||
    item.identifier ||
    item.endToEndId ||
    item.orderId ||
    item.code ||
    `TX-${index + 1}`
  );
};

export const downloadTextFile = ({
  filename,
  content,
  mimeType,
}: {
  filename: string;
  content: string;
  mimeType: string;
}) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};

export const buildStatementFilename = (
  extension: "csv" | "ofx",
  startDate: string,
  endDate: string,
) => {
  const safeStart = String(startDate || "").replace(/\D/g, "") || "inicio";
  const safeEnd = String(endDate || "").replace(/\D/g, "") || "fim";

  return `extrato_gowd_${safeStart}_${safeEnd}.${extension}`;
};
