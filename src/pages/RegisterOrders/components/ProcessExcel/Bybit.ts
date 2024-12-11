import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelBybit = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [titles, ...rows] = json;
  const expectedTitles = [
    "Order No.",
    "p2p-convert",
    "Type",
    "Fiat Amount",
    "Currency",
    "Price",
    "Currency",
    "Coin Amount",
    "Cryptocurrency",
    "Transaction Fees",
    "Cryptocurrency",
    "Counterparty",
    "Status",
    "Time",
  ];

  const isValid = expectedTitles.every((title, index) => titles[index] === title);
  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  return rows
    .map((row) => {
      const [
        numeroOrdem,
        ,
        tipoTransacao,
        fiatAmount,
        ,
        price,
        ,
        coinAmount,
        cryptocurrency,
        transactionFees,
        ,
        counterparty,
        status,
        dataHoraTransacao,
      ] = row;
      const formatToTwoDecimalPlaces = (value: string): string => {
        const numericValue = parseFloat(value);
        const roundedValue = numericValue.toFixed(2);

        return roundedValue.replace(".", ",");
      };

      if (status?.trim().toLowerCase() !== "completed") return false;
      return {
        numeroOrdem,
        tipoTransacao: tipoTransacao === "BUY" ? "compras" : "vendas",
        dataHoraTransacao,
        exchangeUtilizada: selectedBroker,
        ativoDigital: cryptocurrency,
        documentoComprador: tipoTransacao === "SELL" ? "" : "",
        apelidoVendedor: tipoTransacao === "BUY" ? counterparty : "",
        apelidoComprador: tipoTransacao === "SELL" ? counterparty : "",
        quantidadeComprada: tipoTransacao === "BUY" ? coinAmount : "",
        quantidadeVendida: tipoTransacao === "SELL" ? coinAmount : "",
        valorCompra: tipoTransacao === "BUY" ? formatToTwoDecimalPlaces(fiatAmount) : "",
        valorVenda: tipoTransacao === "SELL" ? formatToTwoDecimalPlaces(fiatAmount) : "",
        valorTokenDataCompra: tipoTransacao === "BUY" ? price : "",
        valorTokenDataVenda: tipoTransacao === "SELL" ? price : "",
        taxaTransacao: transactionFees,
      };
    })
    .filter(Boolean);
};
