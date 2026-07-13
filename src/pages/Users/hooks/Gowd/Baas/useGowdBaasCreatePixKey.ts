import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

type CreateBaasPixKeyPayload = {
  accountId: string;
  body: {
    type: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM";
    key: string;
  };
  idempotencyKey?: string;
};

export const useGowdBaasCreatePixKey = () => {
  return useMutation({
    mutationFn: async (payload: CreateBaasPixKeyPayload) => {
      const { data } = await api().post(
        apiRoute.gowd.baasBankingAccountKeys(payload.accountId),
        payload.body,
        {
          headers: {
            "idempotency-key":
              payload.idempotencyKey ?? `gowd-baas-pix-key-${payload.accountId}-${Date.now()}`,
          },
        },
      );

      return data;
    },
    onSuccess: () => {
      responseSuccess("Chave Pix criada com sucesso.");
    },
    onError: (error: AxiosError) => {
      responseError(error);
    },
  });
};
