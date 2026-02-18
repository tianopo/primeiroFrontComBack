import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export const useCorpxListQrCodes = (status?: string) => {
  return useQuery({
    queryKey: ["corpx-qrcodes", status],
    queryFn: async () => {
      const url = apiRoute.corpxPix.qrcodes + querystring({ status });
      const res = await api().get(url);
      return res.data; // pode ser {items,count} ou array, a tela trata
    },
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });
};
