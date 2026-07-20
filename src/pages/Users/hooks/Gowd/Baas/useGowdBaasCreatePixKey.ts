import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM";

type CreateBaasPixKeyPayload = {
  accountId: string;
  body: {
    type: PixKeyType;
    key?: string;
  };
};

export const useGowdBaasCreatePixKey = () => {
  return useMutation({
    mutationFn: async ({ accountId, body }: CreateBaasPixKeyPayload) => {
      const { data } = await api().post(apiRoute.gowd.baasBankingAccountKeys(accountId), body);
      return data;
    },
    onSuccess: () => {
      responseSuccess("Chave Pix criada com sucesso.");
    },
    onError: (error: unknown) => {
      responseError(isAxiosError(error) ? error : "Erro ao criar chave Pix BAAS.");
    },
  });
};
