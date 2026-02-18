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
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
};
