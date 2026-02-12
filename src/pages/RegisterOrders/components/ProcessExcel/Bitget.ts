import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelBitget = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  const [titlesRaw, ...rows] = json;

  const normalize = (v: any) =>
    String(v ?? "")
      .trim()
      .toLowerCase();

  const titles = (titlesRaw ?? []).map(normalize);

  // ✅ required (Counterparty é opcional porque seu arquivo não tem)
  const required = [
    "order number",
    "time created",
    "order type",
    "crypto",
    "flat",
    "amount",
    "price",
    "quantity",
    "status",
  ];

  const hasAll = required.every((t) => titles.includes(t));

  if (!hasAll) {
    toast.error(`Esta planilha não pertence à corretora ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  const idx = Object.fromEntries(required.map((t) => [t, titles.indexOf(t)])) as Record<
    string,
    number
  >;
  const idxCounterparty = titles.indexOf("counterparty"); // opcional

  const excelDateToString = (v: any) => {
    // Bitget costuma vir como número serial do Excel (ex.: 46053.97)
    if (typeof v === "number" && isFinite(v)) {
      const d = XLSX.SSF.parse_date_code(v);
      if (!d) return String(v);

      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.y}-${pad(d.m)}-${pad(d.d)} ${pad(d.H)}:${pad(d.M)}:${pad(Math.floor(d.S || 0))}`;
    }

    // se já vier como string
    return String(v ?? "");
  };

  const formatToTwoDecimalPlaces = (value: string | number): string => {
    const numericValue = parseFloat(String(value));
    return isNaN(numericValue) ? "" : numericValue.toFixed(2).replace(".", ",");
  };

  return rows
    .map((row) => {
      if (!row || row.length === 0) return false;

      const orderId = row[idx["order number"]];
      const createdAt = row[idx["time created"]];
      const side = row[idx["order type"]];
      const crypto = row[idx["crypto"]];
      const totalPrice = row[idx["amount"]];
      const price = row[idx["price"]];
      const quantity = row[idx["quantity"]];
      const status = row[idx["status"]];
      const counterparty = idxCounterparty >= 0 ? row[idxCounterparty] : undefined;

      if (!orderId) return false;
      if (normalize(status) !== "completed") return false;

      return {
        numeroOrdem: String(orderId),
        tipo: normalize(side) === "sell" ? "vendas" : "compras",
        dataHora: excelDateToString(createdAt),
        exchange: selectedBroker,
        ativo: String(crypto),
        nome: counterparty ? String(counterparty) : "-", // ✅ não existe no seu arquivo
        quantidade: String(quantity),
        valor: formatToTwoDecimalPlaces(totalPrice),
        valorToken: String(price),
        taxa: "0",
      };
    })
    .filter(Boolean) as any[];
};
