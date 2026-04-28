import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const useDeleteMedEvent = () => {
  const mutation = useMutation({
    mutationFn: async (eventId: string) => {
      const result = await api().patch(apiRoute.complianceDeleteMed(eventId));
      return result.data;
    },
    onSuccess: () => responseSuccess("MED excluído com sucesso."),
    onError: (erro: AxiosError) => responseError(erro),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
