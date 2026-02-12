import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelBybit = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  const [titlesRaw, ...rows] = json;

  const norm = (v: any) =>
    String(v ?? "")
      .trim()
      .toLowerCase();

  const titles = (titlesRaw ?? []).map(norm);

  // ✅ valida os títulos sem quebrar com "Time (UTC-03:00)"
  const expected = [
    "order no.",
    "p2p-convert",
    "type",
    "fiat amount",
    "currency",
    "price",
    "currency",
    "coin amount",
    "cryptocurrency",
    "transaction fees",
    "cryptocurrency",
    "counterparty",
    "status",
  ];

  const isValid =
    expected.every((t, i) => titles[i] === t) &&
    // último cabeçalho pode ser "time" ou "time (utc-03:00)"
    titles[13]?.startsWith("time");

  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  const toBRL2 = (value: any): string => {
    const n = parseFloat(String(value));
    return Number.isFinite(n) ? n.toFixed(2).replace(".", ",") : "";
  };

  return rows
    .map((row) => {
      const [
        numeroOrdem, // 0
        // 1 p2p-convert
        ,
        type, // 2 BUY/SELL
        fiatAmount, // 3
        currency, // 4
        price, // 5
        // 6 currency (repetido)
        ,
        coinAmount, // 7
        cryptocurrency, // 8
        transactionFees, // 9
        // 10 crypto (repetido)
        ,
        counterparty, // 11
        status, // 12
        timeStr, // 13 Time (UTC-03:00)
      ] = row ?? [];

      // ✅ pegar só BUY e Completed (exclui canceladas e SELL)
      if (norm(status) !== "completed") return false;
      if (norm(type) !== "buy") return false;
      if (String(currency ?? "").trim() !== "BRL") return false;

      return {
        numeroOrdem: String(numeroOrdem),
        tipo: "compras",
        dataHora: String(timeStr ?? ""), // já vem em UTC-03:00
        exchange: selectedBroker,
        ativo: String(cryptocurrency ?? ""),
        apelido: String(counterparty ?? ""),
        quantidade: String(coinAmount ?? ""),
        valor: toBRL2(fiatAmount),
        valorToken: String(price ?? ""),
        taxa: String(transactionFees ?? "0"),
      };
    })
    .filter(Boolean) as any[];
};
