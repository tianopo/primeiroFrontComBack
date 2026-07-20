import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

type UpdateBaasAccountIdPayload = {
  userId: string;
  currentAccountId?: string;
  newAccountId: string;
  documentNumber?: string;
  status?: string;
};

export const useGowdBaasUpdateUserAccountId = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      currentAccountId,
      newAccountId,
      documentNumber,
      status,
    }: UpdateBaasAccountIdPayload) => {
      const { data } = await api().patch(apiRoute.gowd.baasUpdateUserBankingAccountId(userId), {
        currentAccountId,
        newAccountId,
        documentNumber,
        status,
      });

      return data;
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        responseError(error);
        return;
      }

      if (error instanceof Error) {
        responseError(error.message);
        return;
      }

      responseError("Erro ao atualizar accountId BAAS.");
    },
  });
};
