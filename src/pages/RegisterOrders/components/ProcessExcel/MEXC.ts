import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelMEXC = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [titles, ...rows] = json;

  const expectedTitles = [
    "UID",
    "merchant UID",
    "order ID",
    "AD ID",
    "AD type",
    "Create time",
    "Coin_name",
    "currency",
    "state",
    "quantity",
    "price",
    "amount",
    "payment method",
    "taker id",
    "cost time(minutes)",
    "if appeal",
    "appeal result",
    "appeal remark",
  ];

  const isValid = expectedTitles.every((title, index) => titles[index] === title);
  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }
  console.log(json);
  return rows
    .map((row) => {
      const [
        ,
        ,
        // UID, merchant UID
        numeroOrdem, // order ID
        // AD ID
        ,
        tipoTransacao, // AD type
        dataHoraTransacao, // Create time
        cryptocurrency, // Coin_name
        currency, // currency
        status, // state
        coinAmount, // quantity
        price, // price
        fiatAmount, // amount
        // payment method
        ,
        counterparty, // taker id
      ] = row;

      const formatToTwoDecimalPlaces = (value: string): string => {
        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? "" : numericValue.toFixed(2).replace(".", ",");
      };

      const adjustDateTime = (dateTime: string): string => {
        const date = new Date(dateTime);
        date.setTime(date.getTime() - 3 * 60 * 60 * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      if (status?.trim().toLowerCase() !== "completed") return false;
      if (currency?.trim().toUpperCase() !== "BRL") return false;

      return {
        numeroOrdem,
        tipoTransacao: tipoTransacao === "BUY" ? "compras" : "vendas",
        dataHoraTransacao: adjustDateTime(dataHoraTransacao),
        exchangeUtilizada: selectedBroker,
        ativoDigital: cryptocurrency,
        documentoComprador: "", // Não disponível
        apelidoVendedor: tipoTransacao === "BUY" ? counterparty : "",
        apelidoComprador: tipoTransacao === "SELL" ? counterparty : "",
        quantidadeComprada: tipoTransacao === "BUY" ? coinAmount : "",
        quantidadeVendida: tipoTransacao === "SELL" ? coinAmount : "",
        valorCompra: tipoTransacao === "BUY" ? formatToTwoDecimalPlaces(fiatAmount) : "",
        valorVenda: tipoTransacao === "SELL" ? formatToTwoDecimalPlaces(fiatAmount) : "",
        valorTokenDataCompra: tipoTransacao === "BUY" ? price : "",
        valorTokenDataVenda: tipoTransacao === "SELL" ? price : "",
        taxaTransacao: "", // Campo não disponível
      };
    })
    .filter(Boolean);
};
