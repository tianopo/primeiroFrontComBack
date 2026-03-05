import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export interface CorpxStatementRedisItem {
  timestamp: string;
  amount: number;
  name: string;
  document: string;
  verification: boolean;
  endToEnd: string;
  direction: "IN" | "OUT" | string;
}

export interface CorpxStatementRedisResponse {
  accountId: string;
  date?: string;
  items: CorpxStatementRedisItem[];
}

export const useCorpxStatementRedis = (params?: { date?: string }) => {
  const date = params?.date;

  return useQuery({
    queryKey: ["corpx-statement-redis", date ?? "today"],
    queryFn: async () => {
      const base = apiRoute.corpxPix.statementRedis;
      const url = date ? base + querystring({ date }) : base;

      const res = await api().get(url);
      return res.data as CorpxStatementRedisResponse;
    },
    refetchInterval: 30000,
    retry: 1,
  });
};
