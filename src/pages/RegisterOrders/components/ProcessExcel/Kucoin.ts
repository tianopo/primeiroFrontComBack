import { toast } from "react-toastify";
import { excelDateToJSDate } from "src/utils/formats";
import * as XLSX from "xlsx";

export const processExcelKucoin = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [titles, ...rows] = json;
  const expectedTitles = [
    "TIME",
    "SIDE",
    "STATUS",
    "LEGAL/CURRENCY",
    "LEGAL_AMOUNT",
    "PRICE",
    "CURRENCY_AMOUNT",
    "RATE",
    "OP_TRADER_NAME",
    "ORDER_ID",
  ];

  const isValid = expectedTitles.every((title, index) => titles[index] === title);
  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  const formatNumber = (value: string): string => {
    return parseFloat(value).toFixed(2).replace(".", ",");
  };
  return rows
    .map((row) => {
      const [
        time, // "TIME"
        side, // "SIDE"
        status, // "STATUS"
        legalCurrency, // "LEGAL/CURRENCY"
        legalAmount, // "LEGAL_AMOUNT"
        price, // "PRICE"
        currencyAmount, // "CURRENCY_AMOUNT"
        rate, // "RATE"
        traderName, // "OP_TRADER_NAME"
        orderId, // "ORDER_ID"
      ] = row;

      if (status?.trim().toLowerCase() !== "done") return false;
      return {
        numeroOrdem: orderId,
        tipoTransacao: side === "BUY" ? "compras" : "vendas",
        dataHoraTransacao: excelDateToJSDate(Number(time)),
        exchangeUtilizada: selectedBroker,
        ativoDigital: legalCurrency.split("/")[1],
        documentoComprador: side === "SELL" ? "" : "",
        apelidoVendedor: side === "BUY" ? traderName : "",
        apelidoComprador: side === "SELL" ? traderName : "",
        quantidadeComprada: side === "BUY" ? currencyAmount : "",
        quantidadeVendida: side === "SELL" ? currencyAmount : "",
        valorCompra: side === "BUY" ? formatNumber(legalAmount.toString()) : "",
        valorVenda: side === "SELL" ? formatNumber(legalAmount.toString()) : "",
        valorTokenDataCompra: side === "BUY" ? price : "",
        valorTokenDataVenda: side === "SELL" ? price : "",
        taxaTransacao: rate,
      };
    })
    .filter(Boolean);
};
