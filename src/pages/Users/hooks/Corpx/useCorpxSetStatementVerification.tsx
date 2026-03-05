import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export const useCorpxSetStatementVerification = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { endToEnd: string; verification: boolean; date?: string }) => {
      const { endToEnd, verification, date } = payload;

      const base = apiRoute.corpxPix.statementRedisVerification(endToEnd);
      const url = date ? base + querystring({ date }) : base;

      const res = await api().post(url, { verification });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["corpx-statement-redis"] });
    },
  });
};
