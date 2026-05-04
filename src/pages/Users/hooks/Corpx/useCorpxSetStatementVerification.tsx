import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export const useGowdSetStatementsVerificationBulk = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      items: Array<{ endToEnd: string; verification: boolean }>;
      date?: string;
    }) => {
      const base = apiRoute.gowd.statementRedisVerificationBulk;
      const url = payload.date ? base + querystring({ date: payload.date }) : base;

      const res = await api().patch(url, { items: payload.items });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gowd-statement-redis"] });
    },
  });
};
