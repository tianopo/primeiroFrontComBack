import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export interface GowdStatementItem {
  timestamp: string;
  amount: number;
  currency: string;
  operation?: string;
  description?: string;
  transactionType?: string;
  method?: string;
  status?: string;
  direction?: "IN" | "OUT" | string;
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

  endToEndId?: string;
  orderId?: string;
  code?: string;
  transactionId?: string;

  raw?: any;
}

export interface GowdStatementResponse {
  accountId: string;
  count: number;
  page: number;
  items: GowdStatementItem[];
}

const toStartOfDayUtc = (value?: string) => {
  if (!value) return undefined;

  if (value.includes("T")) {
    return value;
  }

  return `${value}T00:00:00.000Z`;
};

const toEndOfDayUtc = (value?: string) => {
  if (!value) return undefined;

  if (value.includes("T")) {
    return value;
  }

  return `${value}T23:59:59.999Z`;
};

export const useGowdStatement = (params: {
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}) => {
  const { startDate, endDate, page = 1, size = 1000 } = params;

  const start = toStartOfDayUtc(startDate);
  const end = toEndOfDayUtc(endDate);

  return useQuery({
    queryKey: ["gowd-statement", start, end, page, size],
    enabled: !!start && !!end,
    queryFn: async () => {
      const body = {
        startDate: start,
        endDate: end,
        currency: "BRL",
        page,
        pageSize: size,
        direction: "DESC" as const,
      };

      const res = await api().post<GowdStatementResponse>(apiRoute.gowd.statement, body);

      return res.data;
    },
    refetchInterval: 30000,
    retry: 1,
  });
};
