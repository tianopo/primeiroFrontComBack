import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export interface GowdStatementRedisItem {
  timestamp: string;
  amount: number;
  name: string;
  document: string;
  verification: boolean;
  endToEnd: string;
  direction: "IN" | "OUT" | string;
}

export interface GowdStatementRedisResponse {
  date?: string;
  items: GowdStatementRedisItem[];
}

export const useGowdStatementRedis = (params?: { date?: string }) => {
  const date = params?.date;

  return useQuery({
    queryKey: ["gowd-statement-redis", date ?? "today"],
    queryFn: async () => {
      const base = apiRoute.gowd.statementRedis;
      const url = date ? base + querystring({ date }) : base;

      const res = await api().get(url);
      return res.data as GowdStatementRedisResponse;
    },
    refetchInterval: 10000,
    retry: 1,
  });
};
