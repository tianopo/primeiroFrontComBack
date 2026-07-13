import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const useGowdBaasGetAccount = () => {
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { data } = await api().get(apiRoute.gowd.baasBankingAccount(accountId));
      return data;
    },
    onError: (error: AxiosError) => {
      responseError(error);
    },
  });
};
