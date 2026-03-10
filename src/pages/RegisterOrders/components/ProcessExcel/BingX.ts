import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelBingX = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  }) as Array<Array<string | number>>;

  const normalize = (value: string | number) =>
    value
      ?.toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const formatToTwoDecimalPlaces = (value: string | number): string => {
    const numericValue = parseFloat(String(value).replace(",", "."));
    return Number.isNaN(numericValue) ? "" : numericValue.toFixed(2).replace(".", ",");
  };

  const adjustDateTime = (dateTime: string | number): string => {
    if (!dateTime) return "";

    if (typeof dateTime === "number") {
      const parsed = XLSX.SSF.parse_date_code(dateTime);

      if (parsed) {
        const year = parsed.y;
        const month = String(parsed.m).padStart(2, "0");
        const day = String(parsed.d).padStart(2, "0");
        const hours = String(parsed.H).padStart(2, "0");
        const minutes = String(parsed.M).padStart(2, "0");
        const seconds = String(Math.floor(parsed.S)).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
    }

    const asString = String(dateTime).trim();
    const date = new Date(asString);

    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    return asString;
  };

  const headerRowIndex = json.findIndex(
    (row) =>
      normalize(row?.[0] ?? "") === "order number" && normalize(row?.[1] ?? "") === "order type",
  );

  if (headerRowIndex === -1) {
    toast.error(`Estrutura do arquivo da ${selectedBroker.split(" ")[0]} não reconhecida.`);
    return [];
  }

  return json
    .slice(headerRowIndex + 1)
    .map((row) => {
      if (row.length < 12) return false;

      const [
        orderId,
        side,
        asset,
        ,
        totalPrice,
        price,
        quantity,
        ,
        counterparty,
        status,
        orderCreateTime,
        orderCompleteTime,
      ] = row;

      if (!orderId) return false;
      if (normalize(status) !== "completed") return false;

      return {
        numeroOrdem: String(orderId).trim(),
        tipo: normalize(side) === "buy" ? "compras" : "vendas",
        dataHora: adjustDateTime(orderCompleteTime || orderCreateTime),
        exchange: selectedBroker,
        ativo: String(asset ?? "").trim(),
        apelido: String(counterparty ?? "").trim(),
        quantidade: String(quantity ?? "").trim(),
        valor: formatToTwoDecimalPlaces(totalPrice),
        valorToken: formatToTwoDecimalPlaces(price),
        taxa: "0",
      };
    })
    .filter(Boolean);
};
