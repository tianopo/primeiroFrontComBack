import { toast } from "react-toastify";
import * as XLSX from "xlsx";
//manutenção
export const processExcelBingX = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  toast.error(`Não há arquivo na corretora ${selectedBroker.split(" ")[0]}`);

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [, ...rows] = json;

  const formatNumber = (value: string): string => {
    return parseFloat(value).toFixed(2).replace(".", ",");
  };

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
        ,
        // "Status"
        counterparty, // "Counterparty"
      ] = row;

      return {
        numeroOrdem: orderId,
        tipoTransacao: side === "Buy" ? "compras" : "vendas",
        dataHoraTransacao: time,
        exchangeUtilizada: selectedBroker,
        ativoDigital: crypto,
        apelidoComprador: side === "Sell" ? counterparty : "",
        apelidoVendedor: side === "Buy" ? counterparty : "",
        quantidadeComprada: side === "Buy" ? amount : "",
        quantidadeVendida: side === "Sell" ? amount : "",
        valorCompra: side === "Buy" ? formatNumber(total) : "",
        valorVenda: side === "Sell" ? formatNumber(total) : "",
        valorTokenDataCompra: side === "Buy" ? formatNumber(price) : "",
        valorTokenDataVenda: side === "Sell" ? formatNumber(price) : "",
        taxaTransacao: formatNumber(fee),
      };
    })
    .filter(Boolean);
};
