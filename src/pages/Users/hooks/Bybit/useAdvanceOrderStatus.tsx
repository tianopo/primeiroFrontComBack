import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";

export const useAdvanceOrderStatus = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api().patch(`/orders/${orderId}/status/advance`);
      return data;
    },
    onSuccess: () => {
      responseSuccess("Moedas enviadas com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
