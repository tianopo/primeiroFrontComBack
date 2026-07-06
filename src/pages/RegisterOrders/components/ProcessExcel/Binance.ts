import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelBinance = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  }) as Array<Array<string | number>>;

  const normalize = (value: string | number) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const formatToTwoDecimalPlaces = (value: string | number): string => {
    const numericValue = parseFloat(String(value).replace(",", "."));
    return Number.isNaN(numericValue) ? "" : numericValue.toFixed(2).replace(".", ",");
  };

  const adjustDateTimeBinance = (dateTime: string | number): string => {
    const raw = String(dateTime ?? "").trim();

    if (!raw) return "";

    const pad2 = (value: string | number) => String(value).padStart(2, "0");

    const toFullYear = (year: string | number) => {
      const parsed = Number(year);

      if (!Number.isFinite(parsed)) return String(year);

      if (parsed < 100) {
        return String(2000 + parsed);
      }

      return String(parsed);
    };

    // Formato já correto: "2026-03-01 12:23:29"
    const alreadyFormatted = raw.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);

    if (alreadyFormatted) {
      return raw;
    }

    // Formato antigo: "26-03-01 12:23:29" ou "2026-03-01 12:23:29"
    const dashFormat = raw.match(/^(\d{2,4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})$/);

    if (dashFormat) {
      const [, year, month, day, hour, minute, second] = dashFormat;

      return `${toFullYear(year)}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${pad2(
        minute,
      )}:${pad2(second)}`;
    }

    // Formato Binance: "M/D/YY", "M/D/YYYY", com ou sem hora e com ou sem AM/PM
    const slashFormat = raw.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i,
    );

    if (slashFormat) {
      const [, month, day, year, hourRaw = "00", minute = "00", second = "00", ampm] = slashFormat;

      let hour = Number(hourRaw);

      if (ampm) {
        const upper = ampm.toUpperCase();

        if (upper === "PM" && hour < 12) {
          hour += 12;
        }

        if (upper === "AM" && hour === 12) {
          hour = 0;
        }
      }

      return `${toFullYear(year)}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${pad2(
        minute,
      )}:${pad2(second)}`;
    }

    return raw;
  };

  // acha a linha do header no CSV PT
  const headerRowIndex = rows.findIndex(
    (r) =>
      normalize(r?.[0] ?? "") === "numero do pedido" && normalize(r?.[1] ?? "") === "tipo de ordem",
  );

  if (headerRowIndex === -1) {
    toast.error(`Estrutura do CSV da ${selectedBroker.split(" ")[0]} não reconhecida.`);
    return [];
  }

  const header = rows[headerRowIndex].map((h) => normalize(h));

  const idx = (name: string) => header.findIndex((h) => h === normalize(name));

  const iOrderId = idx("Número do Pedido");
  const iSide = idx("Tipo de Ordem");
  const iAsset = idx("Ativo");
  const iTotalPrice = idx("Preço Total");
  const iPrice = idx("Preço");
  const iQuantity = idx("Quantidade");
  const iCounterparty = idx("Contraparte");
  const iStatus = idx("Status");
  const iCreateTime = idx("Hora de Criação");

  return rows
    .slice(headerRowIndex + 1)
    .map((row) => {
      const orderId = row[iOrderId];
      if (!orderId) return false;

      const status = row[iStatus];
      if (normalize(status) !== "completed") return false; // ✅ só concluídas

      const side = row[iSide];
      const asset = row[iAsset];
      const totalPrice = row[iTotalPrice];
      const price = row[iPrice];
      const quantity = row[iQuantity];
      const counterparty = row[iCounterparty];
      const createTime = row[iCreateTime];

      return {
        numeroOrdem: String(orderId).trim(),
        tipo: normalize(side) === "buy" ? "compras" : "vendas",
        dataHora: adjustDateTimeBinance(createTime),
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
