import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

type DeleteBaasPixKeyPayload = {
  accountId: string;
  keyId: string;
};

export const useGowdBaasDeletePixKey = () => {
  return useMutation({
    mutationFn: async (payload: DeleteBaasPixKeyPayload) => {
      const { data } = await api().delete(
        apiRoute.gowd.baasBankingAccountKey(payload.accountId, payload.keyId),
      );

      return data;
    },
    onSuccess: () => {
      responseSuccess("Chave Pix deletada com sucesso.");
    },
    onError: (error: AxiosError) => {
      responseError(error);
    },
  });
};
