import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const useGowdBaasCreateAccount = () => {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api().post(apiRoute.gowd.baasCreateAccount, payload, {
        headers: {
          "idempotency-key": `gowd-baas-create-account-${Date.now()}`,
        },
      });

      return data;
    },
    onSuccess: () => responseSuccess("Conta BAAS criada com sucesso."),
    onError: (error) => responseError(error as AxiosError),
  });
};
