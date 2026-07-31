export const GOWD_PAYOUT_STATUSES = [
  "INITIAL",
  "PENDING",
  "PAID",
  "PARTIALLY_PAID",
  "EXPIRED",
  "ANALYSIS",
  "REFUNDED",
  "PARTIAL_REFUNDED",
  "CANCELED",
  "ERROR",
] as const;

export type GowdPayoutStatus = (typeof GOWD_PAYOUT_STATUSES)[number];

export type GowdBatchTransaction = {
  id?: string;
  idempotencyKey?: string;
  sequence?: number;
  amount?: string;
  status?: GowdPayoutStatus | string;
  endToEndId?: string | null;
  paidAt?: string | null;
  errorMessage?: string | null;
};

export type GowdBatch = {
  id?: string;
  transactionsCount?: number;
  totalAmount?: string;
  paidAmount?: string;
  pendingAmount?: string;
  transactions?: GowdBatchTransaction[];
};

export type GowdPixOutResponseData = {
  id?: string;
  externalId?: string;
  status?: GowdPayoutStatus | string;
  amount?: string | number | { currency?: string; value?: string | number };
  currency?: string;
  description?: string;
  endToEndId?: string;
  errorMessage?: string;
  createdAt?: string;
  fee?: {
    fixed?: string | number;
    variable?: string | number;
    additional?: string | number;
  };
  batch?: GowdBatch;
};

export const normalizeGowdStatus = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

export const isPartiallyPaid = (value: unknown) => normalizeGowdStatus(value) === "PARTIALLY_PAID";

export const hasGowdBatch = (value: unknown): value is GowdBatch => {
  if (!value || typeof value !== "object") return false;

  const batch = value as GowdBatch;

  return Boolean(
    batch.id ||
      batch.transactionsCount ||
      batch.totalAmount ||
      batch.paidAmount ||
      batch.pendingAmount ||
      (Array.isArray(batch.transactions) && batch.transactions.length > 0),
  );
};

export const formatBRLFromUnknown = (value?: string | number | null) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "-";
  }

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const buildGowdIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `pixout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const isGowdPixDiretoMaintenanceWindow = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  const dateKey = `${values.year}-${values.month}-${values.day}`;
  const hour = Number(values.hour ?? 0);
  const minute = Number(values.minute ?? 0);
  const minutesOfDay = hour * 60 + minute;

  return dateKey === "2026-07-23" && minutesOfDay >= 9 * 60 && minutesOfDay <= 21 * 60;
};
