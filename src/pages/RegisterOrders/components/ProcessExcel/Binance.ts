import { excelDateToJSDate } from "src/utils/formats";
import * as XLSX from "xlsx";

export const processExcelBinance = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [, ...rows] = json;

  return rows.map((row) => {
    const [
      orderNumber, // "Order Number"
      orderType, // "Order Type"
      assetType, // "Asset Type"
      // "Fiat Type"
      ,
      totalPrice, // "Total Price"
      price, // "Price"
      quantity, // "Quantity"
      // "Exchange rate"
      ,
      makerFee, // "Maker Fee"
      // "Maker Fee Rate"
      ,
      takerFee, // "Taker Fee"
      // "Taker Fee Rate"
      ,
      counterparty, // "Counterparty"
      // "Status"
      ,
      createdTime, // "Created Time"
    ] = row;
    const formatTotalPrice = (price: string): string => {
      if (Number.isInteger(price)) {
        return `${price},00`;
      } else {
        return parseFloat(price).toFixed(2).replace(".", ",").toString();
      }
    };

    return {
      numeroOrdem: orderNumber.toString(),
      tipoTransacao: orderType === "Buy" ? "compras" : "vendas",
      dataHoraTransacao: excelDateToJSDate(Number(createdTime)),
      exchangeUtilizada: selectedBroker,
      ativoDigital: assetType,
      documentoComprador: orderType === "Sell" ? "" : "",
      apelidoVendedor: orderType === "Buy" ? counterparty : "",
      apelidoComprador: orderType === "Sell" ? counterparty : "",
      quantidadeComprada: orderType === "Buy" ? quantity.toString() : "",
      quantidadeVendida: orderType === "Sell" ? quantity.toString() : "",
      valorCompra: orderType === "Buy" ? formatTotalPrice(totalPrice) : "",
      valorVenda: orderType === "Sell" ? formatTotalPrice(totalPrice) : "",
      valorTokenDataCompra: orderType === "Buy" ? price.toString() : "",
      valorTokenDataVenda: orderType === "Sell" ? price.toString() : "",
      taxaTransacao: orderType === "Buy" ? takerFee.toString() : makerFee.toString(),
    };
  });
};
