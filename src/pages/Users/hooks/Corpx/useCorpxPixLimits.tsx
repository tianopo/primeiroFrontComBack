import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export const useCorpxPixLimits = () => {
  return useQuery({
    queryKey: ["corpx-pix-limits"],
    queryFn: async () => {
      const res = await api().get(apiRoute.corpxPix.limits);
      return res.data;
    },
    refetchInterval: 3600000,
    retry: 1,
  });
};
