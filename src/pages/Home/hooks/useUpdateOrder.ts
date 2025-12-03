import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { IOrder } from "src/pages/RegisterOrders/hooks/useOrders";
import { apiRoute } from "src/routes/api";

export interface IUpdateOrder extends Partial<IOrder> {
  id: string;
}

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: IUpdateOrder) => {
      const result = await api().patch(`${apiRoute.orders}/${data.id}`, data);
      return result.data;
    },
    onSuccess: () => {
      responseSuccess("Ordem atualizada com sucesso");

      // força refetch do useListTransactionsInDate
      queryClient.invalidateQueries({
        queryKey: ["orders-data"],
        exact: false,
      });
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  return { mutate, isPending };
};
