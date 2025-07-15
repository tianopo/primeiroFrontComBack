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
    "Taker Fee",
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
    .map((row, rowIndex) => {
      const [
        orderNumber, // 0
        orderType, // 1
        assetType, // 2
        ,
        // 3: Fiat Type (ignorado)
        totalPrice, // 4
        price, // 5
        quantity, // 6
        ,
        // 7: Exchange rate (ignorado)
        makerFee, // 8
        takerFee, // 9
        counterparty, // 10
        status, // 11
        createdTime, // 12
      ] = row;

      if (!orderNumber || !orderType || !status || status.trim().toLowerCase() !== "completed") {
        return false;
      }

      const formatTotalPrice = (val: any): string => {
        const num = Number(val);
        if (isNaN(num)) return "";
        return num.toFixed(2).replace(".", ",");
      };

      const safeString = (value: any) =>
        value !== undefined && value !== null ? value.toString() : "0";

      return {
        numeroOrdem: safeString(orderNumber),
        tipo: orderType === "Buy" ? "compras" : "vendas",
        dataHora: excelDateToJSDate(Number(createdTime)),
        exchange: selectedBroker,
        ativo: safeString(assetType),
        apelido: safeString(counterparty),
        quantidade: safeString(quantity),
        valor: formatTotalPrice(totalPrice),
        valorToken: safeString(price),
        taxa: orderType === "Buy" ? safeString(takerFee) : safeString(makerFee),
      };
    })
    .filter(Boolean);
};
