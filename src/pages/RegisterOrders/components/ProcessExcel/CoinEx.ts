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
  const formatNumber = (value: string): string => {
    return parseFloat(value.split(" ")[0]).toFixed(2).replace(".", ",");
  };
  return rows
    .map((row) => {
      const [
        orderId, // "ORDER ID"
        createdAt, // "CREATED AT"
        side, // "SIDE"
        legalCurrency, // "CURRENCY"
        legalAmount, // "AMOUNT"
        price, // "PRICE"
        total, // "TOTAL"
        traderName, // "TRADER NAME"
        ,
        // "PAYMENT METHOD"
        status, // "STATUS"
      ] = row;

      if (status?.trim().toLowerCase() !== "finished") return false;
      return {
        numeroOrdem: orderId,
        tipoTransacao: side === "BUY" ? "compras" : "vendas",
        dataHoraTransacao: createdAt,
        exchangeUtilizada: selectedBroker,
        ativoDigital: legalCurrency,
        documentoComprador: side === "SELL" ? "" : "",
        nomeComprador: side === "SELL" ? traderName : "",
        nomeVendedor: side === "BUY" ? traderName : "",
        quantidadeComprada: side === "BUY" ? total : "",
        quantidadeVendida: side === "SELL" ? total : "",
        valorCompra: side === "BUY" ? formatNumber(price) : "",
        valorVenda: side === "SELL" ? formatNumber(price) : "",
        valorTokenDataCompra: side === "BUY" ? legalAmount : "",
        valorTokenDataVenda: side === "SELL" ? legalAmount : "",
        taxaTransacao: "0",
      };
    })
    .filter(Boolean);
};
