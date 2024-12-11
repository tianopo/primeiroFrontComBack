import { toast } from "react-toastify";
import { excelDateToJSDate } from "src/utils/formats";
import * as XLSX from "xlsx";

export const processExcelBinance = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [titles, ...rows] = json;
  const expectedTitles = [
    "Order Number",
    "Order Type",
    "Asset Type",
    "Fiat Type",
    "Total Price",
    "Price",
    "Quantity",
    "Exchange rate",
    "Maker Fee",
    "Maker Fee Rate",
    "Taker Fee",
    "Taker Fee Rate",
    "Couterparty",
    "Status",
    "Created Time",
  ];
  const isValid = expectedTitles.every((title, index) => titles[index] === title);
  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  return rows
    .map((row) => {
      const [
        orderNumber, // "Order Number"
        orderType, // "Order Type"
        assetType, // "Asset Type"
        ,
        // "Fiat Type"
        totalPrice, // "Total Price"
        price, // "Price"
        quantity, // "Quantity"
        ,
        // "Exchange rate"
        makerFee, // "Maker Fee"
        ,
        // "Maker Fee Rate"
        takerFee, // "Taker Fee"
        ,
        // "Taker Fee Rate"
        counterparty, // "Counterparty"
        status, // "Status"
        createdTime, // "Created Time"
      ] = row;
      const formatTotalPrice = (price: string): string => {
        if (Number.isInteger(price)) {
          return `${price},00`;
        } else {
          return parseFloat(price).toFixed(2).replace(".", ",").toString();
        }
      };

      if (status?.trim().toLowerCase() !== "completed") return false;
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
    })
    .filter(Boolean);
};
