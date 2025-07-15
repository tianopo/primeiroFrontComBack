import { toast } from "react-toastify";
import { excelDateToJSDate } from "src/utils/formats";
import * as XLSX from "xlsx";

export const processExcelGateIO = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [titles, ...rows] = json;
  const expectedTitles = [
    "No",
    "Created date",
    "Updated date",
    "Type",
    "Fund Type",
    "Payment Method",
    "Price（Fiat）",
    "Amount（Crypto）",
    "Total（Fiat）",
    "Status",
    "Name",
  ];

  const isValid = expectedTitles.every((title, index) => titles[index] === title);
  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }
  const formatNumber = (value: string): string => {
    return parseFloat(value).toFixed(2).replace(".", ",").split("/")[0];
  };
  return rows
    .map((row) => {
      const [
        no, // Ex: "No"
        createdTime, // Ex: "Created date"
        ,
        // Ex: "Updated date"
        type, // Ex: "Type"
        fundType, // Ex: "Fund Type"
        ,
        // Ex: "Payment Method"
        price, // Ex: "Price"
        amount, // Ex: "Amount"
        total, // Ex: "Total"
        status, // Ex: "Status"
        name, // Ex: "Name"
      ] = row;

      const ativo = fundType.split("/")[0];
      if (status?.trim().toLowerCase() !== "concluído") return false;
      return {
        numeroOrdem: no.toString(),
        tipo: type === "Comprar" ? "compras" : "vendas",
        dataHora: excelDateToJSDate(Number(createdTime)),
        exchange: selectedBroker,
        ativo,
        nome: name,
        quantidade: amount.toString(),
        valor: formatNumber(total.toString()),
        valorToken: price.toString(),
        taxa: "0",
      };
    })
    .filter(Boolean);
};
