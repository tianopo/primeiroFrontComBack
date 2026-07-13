import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const useGowdBaasListPixKeys = (
  accountId: string,
  options?: {
    enabled?: boolean;
  },
) => {
  const query = useQuery({
    queryKey: ["gowd-baas-pix-keys", accountId],
    queryFn: async () => {
      const { data } = await api().get(apiRoute.gowd.baasBankingAccountKeys(accountId));
      return data;
    },
    enabled: Boolean(accountId) && Boolean(options?.enabled),
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      responseError(query.error as AxiosError);
    }
  }, [query.error]);

  return query;
};
