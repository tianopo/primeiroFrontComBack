import { useQuery } from "@tanstack/react-query";
import qs from "qs";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export const useCorpxListMeds = (status: string = "OPEN") => {
  return useQuery({
    queryKey: ["corpx-meds", status],
    queryFn: async () => {
      const url = apiRoute.corpxPix.meds + querystring({ status });
      const res = await api().get(url);
      return res.data;
    },
    refetchInterval: 3600000,
    retry: 1,
  });
};
