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

  // ✅ BingX export geralmente é UTC+8
  const BINGX_TZ_OFFSET_MINUTES = 8 * 60;

  const pad2 = (n: number) => String(n).padStart(2, "0");

  const formatLocal = (d: Date) => {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
      d.getHours(),
    )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  };

  const parseYmdHms = (s: string) => {
    // aceita: "YYYY-MM-DD HH:mm:ss" ou "YYYY/MM/DD HH:mm:ss"
    const m = String(s ?? "")
      .trim()
      .match(/^(\d{4})[-/](\d{2})[-/](\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return null;

    return {
      y: Number(m[1]),
      mo: Number(m[2]),
      d: Number(m[3]),
      h: Number(m[4]),
      mi: Number(m[5]),
      s: Number(m[6]),
    };
  };

  const adjustDateTime = (dateTime: string | number): string => {
    if (!dateTime) return "";

    // Excel serial (número)
    if (typeof dateTime === "number") {
      const parsed = XLSX.SSF.parse_date_code(dateTime);
      if (parsed) {
        const utcMs =
          Date.UTC(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, Math.floor(parsed.S)) -
          BINGX_TZ_OFFSET_MINUTES * 60_000; // trata como UTC+8 -> UTC
        return formatLocal(new Date(utcMs)); // converte para TZ local do browser
      }
      return "";
    }

    const asString = String(dateTime).trim();
    const parts = parseYmdHms(asString);

    if (parts) {
      const utcMs =
        Date.UTC(parts.y, parts.mo - 1, parts.d, parts.h, parts.mi, parts.s) -
        BINGX_TZ_OFFSET_MINUTES * 60_000; // trata como UTC+8 -> UTC
      return formatLocal(new Date(utcMs)); // mostra no TZ local (ex: Brasil)
    }

    // fallback: devolve como veio
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

      // ✅ preferir createTime (mais próximo do que você vê na corretora)
      const dateSource = orderCreateTime || orderCompleteTime;

      return {
        numeroOrdem: String(orderId).trim(),
        tipo: normalize(side) === "buy" ? "compras" : "vendas",
        dataHora: adjustDateTime(dateSource),
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
