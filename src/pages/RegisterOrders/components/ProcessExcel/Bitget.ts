import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelBitget = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [titles, ...rows] = json;

  const expectedTitles = [
    "Order number",
    "Time created",
    "Order type",
    "Crypto",
    "Flat",
    "Amount",
    "Price",
    "Quantity",
    "Counterparty",
    "status",
  ];

  const isValid = expectedTitles.every(
    (title, index) => titles[index]?.toLowerCase().trim() === title.toLowerCase().trim(),
  );

  if (!isValid) {
    toast.error(`Esta planilha não pertence à corretora ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  return rows
    .map((row) => {
      const [
        orderId, // 0: "Order number"
        createdAt, // 1: "Time created"
        side, // 2: "Order type"
        crypto, // 3: "Crypto"
        ,
        // 4: "Flat"
        totalPrice, // 5: "Amount"
        price, // 6: "Price"
        value, // 7: "Quantity"
        counterparty, // 8: "Counterparty"
        status, // 9: "status"
      ] = row;

      if (!orderId || status.toLowerCase().trim() !== "completed") return false;

      const formatToTwoDecimalPlaces = (value: string | number): string => {
        const numericValue = parseFloat(String(value));
        return isNaN(numericValue) ? "" : numericValue.toFixed(2).replace(".", ",");
      };

      return {
        numeroOrdem: String(orderId),
        tipo: String(side).toLowerCase() === "sell" ? "vendas" : "compras",
        dataHora: createdAt,
        exchange: selectedBroker,
        ativo: String(crypto),
        nome: String(counterparty),
        quantidade: String(value),
        valor: formatToTwoDecimalPlaces(totalPrice),
        valorToken: String(price),
        taxa: "0",
      };
    })
    .filter(Boolean);
};
