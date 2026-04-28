import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface ICreateMedEventPayload {
  document: string;
  title?: string;
  reason: string;
  endToEnd?: string;
  bankName?: string;
  transactionDate?: string;
  amountBrl?: string;
  exchange?: string;
  orderId?: string;
}

export const useCreateMedEvent = () => {
  const mutation = useMutation({
    mutationFn: async ({ document, ...body }: ICreateMedEventPayload) => {
      const result = await api().post(apiRoute.complianceCreateMed(document), body);

      return result.data;
    },
    onSuccess: () => responseSuccess("MED registrado com sucesso."),
    onError: (erro: AxiosError) => responseError(erro),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
