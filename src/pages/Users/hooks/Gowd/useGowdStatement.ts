import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
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

type UseGowdStatementParams = {
  startDate: string;
  endDate: string;
  page?: number;
  size?: number;
};

export const useGowdStatement = ({
  startDate,
  endDate,
  page = 1,
  size = 1000,
}: UseGowdStatementParams) => {
  const query = useQuery({
    queryKey: ["gowd-statement", startDate, endDate, page, size],
    queryFn: async () => {
      const response = await api().post(apiRoute.gowd.statement, {
        startDate: `${startDate}T00:00:00.000Z`,
        endDate: `${endDate}T23:59:59.999Z`,
        currency: "BRL",
        page,
        pageSize: size,
        direction: "DESC",
      });

      return response.data;
    },
    enabled: !!startDate && !!endDate,
    refetchInterval: 30000,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      responseError(query.error as AxiosError);
    }
  }, [query.error]);

  return query;
};
