import { toast } from "react-toastify";
import { excelDateToJSDate } from "src/utils/formats";
import * as XLSX from "xlsx";

export const processExcelGateIO = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  }) as Array<Array<string | number>>;

  const normalize = (v: string | number) =>
    String(v ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // acha o header mesmo que o CSV tenha linhas vazias antes
  const headerRowIndex = json.findIndex(
    (row) => normalize(row?.[0] ?? "") === "no" && normalize(row?.[1] ?? "") === "created date",
  );

  if (headerRowIndex === -1) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  const titles = json[headerRowIndex].map((x) => String(x ?? "").trim());
  const rows = json.slice(headerRowIndex + 1);

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

  const isValid = expectedTitles.every(
    (title, index) => normalize(titles[index] ?? "") === normalize(title),
  );
  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  const formatNumber = (value: string | number): string => {
    const n = Number(String(value ?? "").replace(",", "."));
    return Number.isFinite(n) ? n.toFixed(2).replace(".", ",") : "";
  };

  const pad2 = (value: string | number) => String(value).padStart(2, "0");

  const toFullYear = (year: string | number) => {
    const y = Number(year);

    if (!Number.isFinite(y)) return "";

    if (y < 100) {
      return String(2000 + y);
    }

    return String(y);
  };

  const parseDateTime = (value: string | number): string => {
    if (value === "" || value == null) return "";

    // Se vier serial do Excel
    if (typeof value === "number" && Number.isFinite(value)) {
      return excelDateToJSDate(value);
    }

    const s = String(value).trim();

    // Gate.io antigo: "YYYY-MM-DD HH:mm:ss"
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(s)) {
      return s;
    }

    // Caso venha só "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return `${s} 00:00:00`;
    }

    // Novo caso Gate.io: "MM/DD/AA", "MM/DD/AAAA", com ou sem hora, com ou sem AM/PM
    const match = s.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i,
    );

    if (match) {
      const [, month, day, year, hourRaw = "00", minute = "00", second = "00", ampm] = match;

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

    return s;
  };

  const isCompleted = (status: string | number) => {
    const s = normalize(status);
    return s === "done" || s === "completed" || s === "concluido" || s === "concluído";
  };

  const mapSide = (type: string | number) => {
    const t = normalize(type);
    if (t === "buy" || t === "comprar") return "compras";
    if (t === "sell" || t === "vender") return "vendas";
    return "vendas";
  };

  return rows
    .map((row) => {
      if (!row || row.length < 11) return false;

      const [no, createdTime, , type, fundType, , price, amount, total, status, name] = row;

      if (!no) return false;
      if (!isCompleted(status)) return false;

      const ativo = String(fundType ?? "")
        .split("/")[0]
        .trim();

      return {
        numeroOrdem: String(no).trim(),
        tipo: mapSide(type),
        dataHora: parseDateTime(createdTime),
        exchange: selectedBroker,
        ativo,
        nome: String(name ?? "").trim(),
        quantidade: String(amount ?? "").trim(),
        valor: formatNumber(total),
        valorToken: formatNumber(price),
        taxa: "0",
      };
    })
    .filter(Boolean);
};
