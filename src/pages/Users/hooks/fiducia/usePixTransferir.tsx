import { useMutation } from "@tanstack/react-query";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const usePixTransferir = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api().post(apiRoute.transferir, payload);
      return data;
    },
    onSuccess: () => {
      responseSuccess("PIX enviado com sucesso.");
    },
    onError: (err: any) => responseError(err),
  });
};
