import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface MarkBybitOrderPaidReq {
  orderId: string;
  keyType: "empresa" | "pessoal";
}

export const useMarkOrderAsPaidBybit = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: MarkBybitOrderPaidReq) => {
      const result = await api().post(apiRoute.bybitMarkOrderAsPaid, payload);
      return result.data;
    },
    onSuccess: () => {
      responseSuccess("Ordem marcada como paga na Bybit.");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
      queryClient.invalidateQueries({ queryKey: ["bybit-orders"] });
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
