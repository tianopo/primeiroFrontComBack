import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { normalizeDate, querystring } from "../../utils/Interface";

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

export const useCorpxStatement = (params: {
  accountId?: string;
  startDate?: string; // YYYY-MM-DD ou RFC3339
  endDate?: string; // YYYY-MM-DD ou RFC3339
  page?: number;
  size?: number;
}) => {
  const { startDate, endDate, page = 1, size = 50 } = params;

  const start = normalizeDate(startDate, false);
  const end = normalizeDate(endDate, true);

  return useQuery({
    queryKey: ["corpx-statement", start, end, page, size],
    enabled: !!start && !!end,
    queryFn: async () => {
      const url =
        apiRoute.corpxPix.statement + querystring({ startDate: start, endDate: end, page, size });

      const res = await api().get(url);
      return res.data as CorpxStatementResponse;
    },
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });
};
