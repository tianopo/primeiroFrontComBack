import { toast } from "react-toastify";
import { excelDateToJSDate } from "src/utils/formats";
import * as XLSX from "xlsx";

//kucoin é péssima em administrar datas, deve conferir as primeiras ordens e as últimas, retirar as que estão a mais e adicionar as que não foram adicionadas
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
        tipo: side === "BUY" ? "compras" : "vendas",
        dataHora: excelDateToJSDate(Number(time)),
        exchange: selectedBroker,
        ativo: legalCurrency.split("/")[1],
        apelido: traderName,
        quantidade: currencyAmount.toString(),
        valor: formatNumber(legalAmount.toString()),
        valorToken: price.toString(),
        taxa: rate.toString(),
      };
    })
    .filter(Boolean);
};
