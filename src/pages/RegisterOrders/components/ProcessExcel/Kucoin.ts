import { excelDateToJSDate } from "src/utils/formats";
import * as XLSX from "xlsx";

export const processExcelKucoin = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [, ...rows] = json;

  const formatNumber = (value: string): string => {
    return parseFloat(value).toFixed(2).replace(".", ",");
  };

  return rows.map((row) => {
    const [
      time, // "TIME"
      side, // "SIDE"
      // "STATUS"
      ,
      legalCurrency, // "LEGAL/CURRENCY"
      legalAmount, // "LEGAL_AMOUNT"
      price, // "PRICE"
      currencyAmount, // "CURRENCY_AMOUNT"
      rate, // "RATE"
      traderName, // "OP_TRADER_NAME"
      orderId, // "ORDER_ID"
    ] = row;

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
  });
};
