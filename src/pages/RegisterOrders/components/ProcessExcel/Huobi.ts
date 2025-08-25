import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelHuobi = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [titles, ...rows] = json;
  const expectedTitles = [
    "No.",
    "Type",
    "Order Type",
    "Coin",
    "Amount",
    "Price",
    "Total",
    "Fee",
    "Point Card",
    "Currency",
    "Time",
    "Status",
    "Counterparty",
  ];

  const formatNumber = (value: string): string => {
    return parseFloat(value).toFixed(2).replace(".", ",");
  };

  const isValid = expectedTitles.every((title, index) => titles[index] === title);
  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  return rows
    .map((row) => {
      const [
        orderId, // "No."
        side, // "Type"
        ,
        // "Order Type"
        crypto, // "Coin"
        amount, // "Amount"
        price, // "Price"
        total, // "Total"
        fee, // "Fee"
        ,
        ,
        // "Point Card"
        // "Currency"
        time, // "Time"
        status, // "Status"
        counterparty, // "Counterparty"
      ] = row;

      if (status?.trim().toLowerCase() !== "complete") return false;

      // --- Ajuste da dataHora (-23h) ---
      let adjustedTime = time;
      try {
        const parsed = new Date(time);
        if (!isNaN(parsed.getTime())) {
          parsed.setHours(parsed.getHours() - 14);
          // Formata de volta no padrão YYYY-MM-DD HH:mm:ss
          adjustedTime = parsed.toISOString().replace("T", " ").substring(0, 19);
        }
      } catch {
        // Se não conseguir parsear, mantém o original
        adjustedTime = time;
      }

      return {
        numeroOrdem: orderId,
        tipo: side === "Buy" ? "compras" : "vendas",
        dataHora: adjustedTime,
        exchange: selectedBroker,
        ativo: crypto,
        apelido: counterparty,
        quantidade: amount.toString(),
        valor: formatNumber(total),
        valorToken: formatNumber(price),
        taxa: formatNumber(fee),
      };
    })
    .filter(Boolean);
};
