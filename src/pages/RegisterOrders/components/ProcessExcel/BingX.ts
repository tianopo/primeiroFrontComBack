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
        tipo: side === "Buy" ? "compras" : "vendas",
        dataHora: time,
        exchange: selectedBroker,
        ativo: crypto,
        apelido: counterparty,
        quantidade: amount,
        valor: formatNumber(total),
        valorToken: formatNumber(price),
        taxa: formatNumber(fee),
      };
    })
    .filter(Boolean);
};
