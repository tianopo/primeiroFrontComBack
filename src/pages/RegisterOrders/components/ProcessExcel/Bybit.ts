import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelBybit = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  }) as any[][];

  const norm = (value: any) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const normalizeHeader = (value: any) =>
    norm(value)
      .replace(/\s+/g, " ")
      .replace(/\ufeff/g, "");

  const findHeaderRowIndex = () => {
    return json.findIndex((row) => {
      const headers = (row ?? []).map(normalizeHeader);

      return (
        headers.includes("order no.") &&
        headers.includes("direction") &&
        headers.includes("fiat amount") &&
        headers.includes("status") &&
        headers.some((header) => header.startsWith("time"))
      );
    });
  };

  const headerRowIndex = findHeaderRowIndex();

  if (headerRowIndex === -1) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  const titlesRaw = json[headerRowIndex] ?? [];
  const rows = json.slice(headerRowIndex + 1);

  const titles = titlesRaw.map(normalizeHeader);

  const findColumnIndex = (aliases: string[]) => {
    const normalizedAliases = aliases.map(normalizeHeader);

    return titles.findIndex((title) => {
      return normalizedAliases.some((alias) => {
        return title === alias || title.startsWith(alias);
      });
    });
  };

  const orderNoIndex = findColumnIndex(["order no.", "order no", "order id"]);
  const directionIndex = findColumnIndex(["direction", "type"]);
  const fiatAmountIndex = findColumnIndex(["fiat amount"]);
  const fiatCurrencyIndex = findColumnIndex(["fiat currency"]);
  const unitPriceIndex = findColumnIndex(["unit price", "price"]);
  const coinAmountIndex = findColumnIndex(["coin amount"]);
  const coinTypeIndex = findColumnIndex(["coin type", "cryptocurrency"]);
  const transactionFeesIndex = findColumnIndex(["transaction fees", "fee", "fees"]);
  const counterpartyIndex = findColumnIndex(["counterparty", "trader name", "name"]);
  const statusIndex = findColumnIndex(["status"]);
  const timeIndex = titles.findIndex((title) => title.startsWith("time"));

  const requiredIndexes = [
    orderNoIndex,
    directionIndex,
    fiatAmountIndex,
    fiatCurrencyIndex,
    unitPriceIndex,
    coinAmountIndex,
    coinTypeIndex,
    statusIndex,
    timeIndex,
  ];

  const isValid = requiredIndexes.every((index) => index >= 0);

  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  const parseNumber = (value: any): number => {
    const text = String(value ?? "").trim();

    if (!text) return 0;

    const hasComma = text.includes(",");
    const hasDot = text.includes(".");

    let normalized = text.replace(/[^\d,.-]/g, "");

    if (hasComma && hasDot) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else if (hasComma) {
      normalized = normalized.replace(",", ".");
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toBRL2 = (value: any): string => {
    const parsed = parseNumber(value);

    return parsed.toFixed(2).replace(".", ",");
  };

  const toStringValue = (value: any): string => {
    return String(value ?? "").trim();
  };

  return rows
    .map((row) => {
      const numeroOrdem = row?.[orderNoIndex];
      const direction = row?.[directionIndex];
      const fiatAmount = row?.[fiatAmountIndex];
      const fiatCurrency = row?.[fiatCurrencyIndex];
      const unitPrice = row?.[unitPriceIndex];
      const coinAmount = row?.[coinAmountIndex];
      const coinType = row?.[coinTypeIndex];
      const transactionFees = transactionFeesIndex >= 0 ? row?.[transactionFeesIndex] : "0";
      const counterparty = counterpartyIndex >= 0 ? row?.[counterpartyIndex] : "";
      const status = row?.[statusIndex];
      const timeStr = row?.[timeIndex];

      if (!toStringValue(numeroOrdem)) return false;
      if (norm(status) !== "completed") return false;
      if (toStringValue(fiatCurrency).toUpperCase() !== "BRL") return false;

      const normalizedDirection = toStringValue(direction).toUpperCase();

      if (normalizedDirection !== "BUY") return false;

      return {
        numeroOrdem: toStringValue(numeroOrdem),
        tipo: normalizedDirection === "BUY" ? "compras" : "vendas",
        dataHora: toStringValue(timeStr),
        exchange: selectedBroker,
        ativo: toStringValue(coinType),
        apelido: toStringValue(counterparty),
        quantidade: toStringValue(coinAmount),
        valor: toBRL2(fiatAmount),
        valorToken: toStringValue(unitPrice),
        taxa: toStringValue(transactionFees || "0"),
      };
    })
    .filter(Boolean) as any[];
};
