import { toast } from "react-toastify";
import { excelDateToJSDate } from "src/utils/formats";
import * as XLSX from "xlsx";

const normalizeHeaders = (arr: any[] = []) => arr.map((v) => String(v ?? "").trim());
const headersMatch = (got: string[], expected: string[]) =>
  expected.every((title, i) => (got[i] ?? "") === title);

// Extrai o primeiro número (suporta 15000, 15,000.00, 15000.00 BRL, etc.)
const extractNumber = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === "number" && Number.isFinite(val)) return val;
  const s = String(val);
  const m = s.match(/-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?|-?\d+(?:[.,]\d+)?/);
  if (!m) return null;
  let num = m[0];

  // remove separador de milhar
  // regra: se existir tanto "." quanto ",", assume "." como milhar e "," como decimal (pt-BR)
  if (num.includes(".") && num.includes(",")) {
    num = num.replace(/\./g, "").replace(",", ".");
  } else {
    // senão, apenas troca vírgula por ponto
    num = num.replace(",", ".");
  }
  const n = Number(num);
  return Number.isFinite(n) ? n : null;
};

const formatBRMoneyNoSep = (n: number): string => `R$ ${n.toFixed(2).replace(".", ",")}`;
const formatDecimalComma = (n: number): string => n.toFixed(2).replace(".", ",");

export const processExcelBinance = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  const [rawTitles = [], ...rows] = json;
  const titles = normalizeHeaders(rawTitles);

  // CSV — ordens
  const expectedCsv = [
    "Order Number",
    "Order Type",
    "Asset Type",
    "Fiat Type",
    "Total Price",
    "Price",
    "Quantity",
    "Exchange rate",
    "Maker Fee",
    "Taker Fee",
    "Couterparty",
    "Status",
    "Created Time",
  ];

  // XLSX — depósitos
  const expectedXlsx = [
    "Date(UTC-3)",
    "Method",
    "Deposit Amount",
    "Receive Amount",
    "Fee",
    "Status",
    "Transaction ID",
  ];

  // -------- CSV (ordens) --------
  if (headersMatch(titles, expectedCsv)) {
    return rows
      .map((row) => {
        const [
          orderNumber, // 0
          orderType, // 1
          assetType, // 2
          // 3
          ,
          totalPrice, // 4
          price, // 5
          quantity, // 6
          // 7
          ,
          makerFee, // 8
          takerFee, // 9
          counterparty, // 10
          status, // 11
          createdTime, // 12
        ] = row;

        const st = String(status ?? "").toLowerCase();
        if (!orderNumber || !orderType || !(st === "completed" || st === "successful")) {
          return false;
        }

        const tp = String(orderType).toLowerCase() === "buy" ? "compras" : "vendas";
        const totalNum = extractNumber(totalPrice);
        const createdNum = extractNumber(createdTime);

        const safeString = (v: any) => (v !== undefined && v !== null ? String(v) : "0");

        return {
          numeroOrdem: safeString(orderNumber),
          tipo: tp,
          dataHora:
            typeof createdTime === "number" || createdNum !== null
              ? excelDateToJSDate(createdNum ?? Number(createdTime))
              : String(createdTime ?? ""),
          exchange: selectedBroker,
          ativo: safeString(assetType),
          apelido: safeString(counterparty),
          quantidade: safeString(quantity),
          valor: totalNum !== null ? formatDecimalComma(totalNum) : "",
          valorToken: safeString(price),
          taxa: tp === "compras" ? safeString(takerFee * 5.3) : safeString(makerFee * 5.3),
        };
      })
      .filter(Boolean) as any[];
  }

  // -------- XLSX (depósitos) --------
  if (headersMatch(titles, expectedXlsx)) {
    const exchangeValue = selectedBroker || "Binance https://www.binance.com/ CN";

    return rows
      .map((row) => {
        const [
          dateUtc3, // 0: "2025-09-29 20:47:24" (string) ou número excel
          method, // 1
          depositAmount, // 2: "15000.00 BRL"
          receiveAmount, // 3
          fee, // 4: "0.00 BRL"
          status, // 5: "Successful"
          txId, // 6
        ] = row;

        const st = String(status ?? "").toLowerCase();
        if (!txId || !(st === "successful" || st === "completed")) return false;

        const depNum = extractNumber(depositAmount);
        if (depNum === null) return false;

        let dataHora = "";
        if (typeof dateUtc3 === "number") {
          dataHora = excelDateToJSDate(dateUtc3);
        } else {
          dataHora = String(dateUtc3 ?? "");
        }

        return {
          numeroOrdem: String(txId),
          tipo: "compras",
          dataHora,
          exchange: exchangeValue,
          ativo: "BRL",
          apelido: "BINANCE DEPÓSITO",
          quantidade: formatDecimalComma(depNum), // R$15000,00
          valor: formatBRMoneyNoSep(depNum), // 15000,00
          valorToken: "1.00",
          taxa: "0",
        };
      })
      .filter(Boolean) as any[];
  }

  toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
  return [];
};
