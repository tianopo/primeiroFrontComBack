import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelCoinEx = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [titles, ...rows] = json;

  const expectedTitles = [
    "Order ID",
    "Time Created",
    "Order Direction",
    "Coins",
    "Price",
    "Total Value",
    "Amount",
    "Real Name",
    "Payment Method",
    "Status",
  ];

  const isValid = expectedTitles.every((title, index) => titles[index] === title);

  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  const parseNumber = (value: unknown): number => {
    const raw = String(value ?? "")
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const parsed = Number(raw);

    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatNumber = (value: unknown): string => {
    return parseNumber(value).toFixed(2).replace(".", ",");
  };

  const calculateFee = (valueInBrl: unknown): string => {
    const valor = parseNumber(valueInBrl);

    const taxa = valor * 0.002; // 0.2%

    return taxa.toFixed(2).replace(".", ",");
  };

  return rows
    .map((row) => {
      const [
        orderId,
        createdAt,
        side,
        legalCurrency,
        legalAmount,
        price,
        total,
        traderName,
        ,
        status,
      ] = row;

      if (status?.trim().toLowerCase() !== "finished") return false;

      return {
        numeroOrdem: orderId,
        tipo: side === "BUY" ? "compras" : "vendas",
        dataHora: createdAt,
        exchange: selectedBroker,
        ativo: legalCurrency,
        nome: traderName,
        quantidade: total,
        valor: formatNumber(price),
        valorToken: legalAmount,

        // Taxa de 0,2% sobre o valor total em reais
        taxa: calculateFee(price),
      };
    })
    .filter(Boolean);
};
