export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";

export interface PixOutBody {
  accountId: string;
  amount: number;
  currency: "BRL";
  keyType: PixKeyType;
  key: string;
  description?: string;
  identifier?: string;
}

export interface PixRefundBody {
  accountId: string;
  originalEndToEnd: string;
  amount: number;
  currency: "BRL";
  reason?: string;
}

export interface UpdatePixLimitsBody {
  dailyLimitBrl: number;
  nightlyLimitBrl: number;
  instantLimitBrl: number;
}

// util p/ querystring simples
export const querystring = (obj: Record<string, any>) => {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

export const normalizeDate = (dateStr?: string, endOfDay?: boolean) => {
  if (!dateStr) return "";
  if (dateStr.includes("T")) return dateStr; // já é datetime/rfc3339
  return endOfDay ? `${dateStr}T23:59:59.999Z` : `${dateStr}T00:00:00.000Z`;
};

// response
export type StatementDirection = "IN" | "OUT" | string;

export interface CorpxStatementItem {
  timestamp: string;
  amount: number;
  currency: string;
  operation?: string;
  description?: string;
  balance?: number;
  transactionType?: string; // PIX_IN, PIX_OUT...
  method?: string; // DYNAMIC_QR_CODE...
  status?: string; // SUCCESS...
  direction?: StatementDirection;
  identifier?: string;

  payer?: {
    name?: string;
    document?: string;
    bankCode?: string;
    bankName?: string;
    branch?: string;
    account?: string;
    pixKey?: string;
  };

  payee?: {
    name?: string;
    document?: string;
    bankCode?: string;
    bankName?: string;
    branch?: string;
    account?: string;
    pixKey?: string;
  };

  // Campos úteis p/ refund/conciliacao
  endToEndId?: string; // pode existir em alguns retornos
  originalEndToEnd?: string; // seu exemplo traz esse
  refundEndToEndIds?: string[];
  qrcodeId?: string;
  qrcodeIdentifier?: string;
  reconciliationId?: string;
  feeServiceType?: string;
}

export interface CorpxStatementResponse {
  accountId: string;
  items: CorpxStatementItem[];
  // se o backend retornar paginação, adicione:
  // page?: number; size?: number; total?: number;
}
