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
        tipo,
        fiatAmount,
        currency,
        price,
        ,
        coinAmount,
        cryptocurrency,
        transactionFees,
        ,
        counterparty,
        status,
        dataHora,
      ] = row;
      const formatToTwoDecimalPlaces = (value: string): string => {
        const numericValue = parseFloat(value);
        const roundedValue = numericValue.toFixed(2);

        return roundedValue.replace(".", ",");
      };

      // Subtrair 3 horas de dataHoraTransacao
      const adjustDateTime = (dateTime: string): string => {
        const date = new Date(dateTime);
        date.setTime(date.getTime() - 3 * 60 * 60 * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        // Retorna no formato "YYYY-MM-DD HH:mm:ss"
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      if (status?.trim().toLowerCase() !== "completed") return false;
      if (currency?.trim() !== "BRL") return false;
      return {
        numeroOrdem,
        tipo: tipo === "BUY" ? "compras" : "vendas",
        dataHora: adjustDateTime(dataHora),
        exchange: selectedBroker,
        ativo: cryptocurrency,
        apelido: counterparty,
        quantidade: coinAmount,
        valor: formatToTwoDecimalPlaces(fiatAmount),
        valorToken: price,
        taxa: transactionFees,
      };
    })
    .filter(Boolean);
};
