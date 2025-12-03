import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const result = await api().delete(`${apiRoute.orders}/${id}`);
      return result.data;
    },
    onSuccess: () => {
      responseSuccess("Ordem excluída com sucesso");

      // invalida todas as queries que começam com ["orders-data"]
      queryClient.invalidateQueries({
        queryKey: ["orders-data"],
        exact: false,
      });
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  return { mutate, isPending };
};
