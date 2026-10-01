import * as XLSX from "xlsx";

export type MexcProcessedTransaction = {
  numeroOrdem: string;
  tipo: "vendas" | "compras";
  dataHora: string;
  exchange: string;
  ativo: string;
  apelido: string;
  quantidade: string;
  valor: string;
  valorToken: string;
  taxa: "0";
};

type ColumnKey =
  | "counterparty"
  | "orderId"
  | "adId"
  | "adType"
  | "createdAt"
  | "asset"
  | "currency"
  | "state"
  | "quantity"
  | "price"
  | "amount"
  | "paymentMethod";

type ColumnMap = Record<ColumnKey, number>;

const HEADER_ALIASES: Record<ColumnKey, string[]> = {
  counterparty: ["contraparte", "counterparty"],
  orderId: ["id da ordem", "order id", "orderid"],
  adId: ["id do anuncio", "ad id", "advertisement id"],
  adType: ["tipo de anuncio", "ad type", "advertisement type"],
  createdAt: ["hora de abertura", "create time", "created time", "creation time"],
  asset: ["nome moeda", "coin name", "coin", "criptoativo", "asset"],
  currency: ["moeda", "currency", "fiat"],
  state: ["estado", "state", "status"],
  quantity: ["quantidade", "quantity"],
  price: ["preco", "price"],
  amount: ["montante", "amount", "total amount"],
  paymentMethod: ["forma de pagamento", "payment method", "payment"],
};

const REQUIRED_COLUMNS: ColumnKey[] = [
  "orderId",
  "adType",
  "createdAt",
  "asset",
  "state",
  "quantity",
  "price",
  "amount",
];

const COMPLETED_STATES = new Set([
  "pronto",
  "concluido",
  "concluida",
  "finalizado",
  "finalizada",
  "done",
  "completed",
  "complete",
  "finished",
  "success",
  "successful",
]);

const SELL_TYPES = new Set(["vender", "venda", "sell", "selling"]);
const BUY_TYPES = new Set(["comprar", "compra", "buy", "buying"]);

const normalizeText = (value: unknown): string => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const NORMALIZED_HEADER_ALIASES = Object.fromEntries(
  Object.entries(HEADER_ALIASES).map(([key, aliases]) => [key, aliases.map(normalizeText)]),
) as Record<ColumnKey, string[]>;

const findColumnIndex = (headers: unknown[], key: ColumnKey): number => {
  const aliases = NORMALIZED_HEADER_ALIASES[key];
  return headers.findIndex((header) => aliases.includes(normalizeText(header)));
};

const buildColumnMap = (headers: unknown[]): ColumnMap => {
  const entries = Object.keys(HEADER_ALIASES).map((key) => [
    key,
    findColumnIndex(headers, key as ColumnKey),
  ]);

  return Object.fromEntries(entries) as ColumnMap;
};

const hasRequiredColumns = (columnMap: ColumnMap): boolean => {
  return REQUIRED_COLUMNS.every((key) => columnMap[key] >= 0);
};

const findHeaderRowIndex = (rows: unknown[][]): number => {
  const searchLimit = Math.min(rows.length, 20);

  for (let index = 0; index < searchLimit; index += 1) {
    if (hasRequiredColumns(buildColumnMap(rows[index] ?? []))) return index;
  }

  return -1;
};

const describeMissingColumns = (columnMap: ColumnMap): string[] => {
  return REQUIRED_COLUMNS.filter((key) => columnMap[key] < 0).map((key) => HEADER_ALIASES[key][0]);
};

const readCell = (row: unknown[], index: number): unknown => {
  return index >= 0 ? row[index] : "";
};

const cellToText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    return Number.isInteger(value) ? value.toFixed(0) : String(value);
  }

  return String(value).trim();
};

const orderIdToText = (value: unknown, rowNumber: number): string => {
  if (typeof value === "number" && !Number.isSafeInteger(value)) {
    throw new Error(
      `O ID da ordem na linha ${rowNumber} foi convertido pelo Excel em número e perdeu precisão. ` +
        "Baixe novamente o relatório original da MEXC sem editar a coluna de ID.",
    );
  }

  return cellToText(value);
};

const canonicalDecimal = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value.toFixed(12).replace(/0+$/, "").replace(/\.$/, "");
  }

  let raw = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/[^0-9,.-]/g, "");

  if (!raw) return null;

  const negative = raw.startsWith("-");
  raw = raw.replace(/-/g, "");

  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  let integerPart = raw;
  let fractionPart = "";

  if (lastComma >= 0 && lastDot >= 0) {
    const separatorIndex = Math.max(lastComma, lastDot);
    integerPart = raw.slice(0, separatorIndex).replace(/[.,]/g, "");
    fractionPart = raw.slice(separatorIndex + 1).replace(/[.,]/g, "");
  } else if (lastComma >= 0) {
    integerPart = raw.slice(0, lastComma).replace(/,/g, "");
    fractionPart = raw.slice(lastComma + 1).replace(/,/g, "");
  } else if (lastDot >= 0) {
    /* Nos relatórios MEXC, ponto isolado é sempre separador decimal. */
    integerPart = raw.slice(0, lastDot).replace(/\./g, "");
    fractionPart = raw.slice(lastDot + 1).replace(/\./g, "");
  }

  integerPart = integerPart.replace(/^0+(?=\d)/, "") || "0";
  fractionPart = fractionPart.replace(/0+$/, "");

  return `${negative ? "-" : ""}${integerPart}${fractionPart ? `.${fractionPart}` : ""}`;
};

const formatMoneyToTwoDecimals = (value: unknown): string => {
  const canonical = canonicalDecimal(value);
  if (!canonical) return "";

  const negative = canonical.startsWith("-");
  const unsigned = canonical.replace(/^-/, "");
  const [integerText = "0", fractionText = ""] = unsigned.split(".");
  const fraction = fractionText.padEnd(3, "0");

  let cents = BigInt(integerText || "0") * 100n + BigInt(fraction.slice(0, 2) || "0");
  if (Number(fraction.charAt(2) || "0") >= 5) cents += 1n;
  if (negative) cents = -cents;

  const absoluteCents = cents < 0n ? -cents : cents;
  const integer = absoluteCents / 100n;
  const decimals = (absoluteCents % 100n).toString().padStart(2, "0");

  return `${cents < 0n ? "-" : ""}${integer.toString()},${decimals}`;
};

const pad2 = (value: number | string) => String(value).padStart(2, "0");

const formatDateParts = (
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
) => {
  return `${year}-${pad2(month)}-${pad2(day)} ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
};

const parseExcelSerialDate = (serial: number): string => {
  /* O marco 1899-12-30 compensa o erro histórico do ano bissexto do Excel. */
  const milliseconds = Math.round(serial * 86_400_000);
  const date = new Date(Date.UTC(1899, 11, 30) + milliseconds);

  return formatDateParts(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
};

const formatDateTime = (value: unknown): string => {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return formatDateParts(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate(),
      value.getHours(),
      value.getMinutes(),
      value.getSeconds(),
    );
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return parseExcelSerialDate(value);
  }

  const raw = cellToText(value);
  if (!raw) return "";

  const yearFirst = raw.match(
    /^(\d{4})[-/]([01]?\d)[-/]([0-3]?\d)(?:[ T]([0-2]?\d):([0-5]?\d)(?::([0-5]?\d))?)?/,
  );

  if (yearFirst) {
    return formatDateParts(
      Number(yearFirst[1]),
      Number(yearFirst[2]),
      Number(yearFirst[3]),
      Number(yearFirst[4] ?? 0),
      Number(yearFirst[5] ?? 0),
      Number(yearFirst[6] ?? 0),
    );
  }

  const dayFirst = raw.match(
    /^([0-3]?\d)[-/]([01]?\d)[-/](\d{4})(?:[ T]([0-2]?\d):([0-5]?\d)(?::([0-5]?\d))?)?/,
  );

  if (dayFirst) {
    return formatDateParts(
      Number(dayFirst[3]),
      Number(dayFirst[2]),
      Number(dayFirst[1]),
      Number(dayFirst[4] ?? 0),
      Number(dayFirst[5] ?? 0),
      Number(dayFirst[6] ?? 0),
    );
  }

  return "";
};

const resolveType = (value: unknown): "vendas" | "compras" | null => {
  const normalized = normalizeText(value);
  if (SELL_TYPES.has(normalized)) return "vendas";
  if (BUY_TYPES.has(normalized)) return "compras";
  return null;
};

const isCompleted = (value: unknown): boolean => {
  return COMPLETED_STATES.has(normalizeText(value));
};

/**
 * Função pura exportada para facilitar testes com linhas já extraídas.
 */
export const processMexcRows = (
  rows: unknown[][],
  selectedBroker: string,
): MexcProcessedTransaction[] => {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const headerRowIndex = findHeaderRowIndex(rows);

  if (headerRowIndex < 0) {
    throw new Error(
      "Não foi possível localizar os cabeçalhos do relatório MEXC nas primeiras 20 linhas.",
    );
  }

  const headers = rows[headerRowIndex] ?? [];
  const columns = buildColumnMap(headers);
  const missingColumns = describeMissingColumns(columns);

  if (missingColumns.length > 0) {
    throw new Error(
      `Planilha MEXC inválida. Colunas obrigatórias não encontradas: ${missingColumns.join(", ")}.`,
    );
  }

  const transactions: MexcProcessedTransaction[] = [];
  let skippedByState = 0;
  let skippedInvalid = 0;

  rows.slice(headerRowIndex + 1).forEach((row, relativeIndex) => {
    const rowNumber = headerRowIndex + relativeIndex + 2;

    if (!row?.some((cell) => cell !== null && cell !== undefined && cell !== "")) return;

    if (!isCompleted(readCell(row, columns.state))) {
      skippedByState += 1;
      return;
    }

    const type = resolveType(readCell(row, columns.adType));
    const orderId = orderIdToText(readCell(row, columns.orderId), rowNumber);
    const dateTime = formatDateTime(readCell(row, columns.createdAt));
    const asset = cellToText(readCell(row, columns.asset)).toUpperCase();
    const quantity = canonicalDecimal(readCell(row, columns.quantity));
    const price = canonicalDecimal(readCell(row, columns.price));
    const amount = formatMoneyToTwoDecimals(readCell(row, columns.amount));

    if (
      !type ||
      !orderId ||
      !dateTime ||
      !asset ||
      !quantity ||
      !price ||
      !amount ||
      Number(canonicalDecimal(readCell(row, columns.amount)) ?? 0) <= 0
    ) {
      skippedInvalid += 1;
      return;
    }

    transactions.push({
      numeroOrdem: orderId,
      tipo: type,
      dataHora: dateTime,
      exchange: selectedBroker,
      ativo: asset,
      apelido: cellToText(readCell(row, columns.counterparty)),
      quantidade: quantity,
      valor: amount,
      valorToken: price,
      taxa: "0",
    });
  });

  if (skippedByState > 0 || skippedInvalid > 0) {
    console.warn("Importação MEXC concluída com linhas ignoradas.", {
      ignoradasPorStatus: skippedByState,
      ignoradasPorDadosInvalidos: skippedInvalid,
    });
  }

  return transactions;
};

/**
 * Aceita os dois modelos verificados:
 * - português: Tipo de anúncio / Hora de abertura / pronto;
 * - inglês: AD type / Create time / done.
 */
export const processExcelMEXC = (
  workbook: XLSX.WorkBook,
  selectedBroker: string,
): MexcProcessedTransaction[] => {
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("A planilha MEXC não possui nenhuma aba.");
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`A primeira aba da planilha MEXC (${sheetName}) não pôde ser lida.`);
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    raw: true,
    defval: "",
    blankrows: false,
  });

  return processMexcRows(rows, selectedBroker);
};

/**
 * Use quando o usuário selecionar mais de um relatório MEXC.
 * Ordens repetidas são removidas pelo numeroOrdem.
 */
export const processExcelMEXCWorkbooks = (
  workbooks: XLSX.WorkBook[],
  selectedBroker: string,
): MexcProcessedTransaction[] => {
  const uniqueTransactions = new Map<string, MexcProcessedTransaction>();

  for (const workbook of workbooks) {
    for (const transaction of processExcelMEXC(workbook, selectedBroker)) {
      if (!uniqueTransactions.has(transaction.numeroOrdem)) {
        uniqueTransactions.set(transaction.numeroOrdem, transaction);
      }
    }
  }

  return Array.from(uniqueTransactions.values());
};
