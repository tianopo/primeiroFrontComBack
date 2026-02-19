import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export const useCorpxBalance = () => {
  return useQuery({
    queryKey: ["corpx-balance"],
    queryFn: async () => {
      const res = await api().get(apiRoute.corpxPix.balance);
      return res.data;
    },
    refetchInterval: 30000,
    retry: 1,
  });
};
