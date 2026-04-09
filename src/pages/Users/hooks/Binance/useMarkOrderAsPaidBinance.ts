import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface MarkBuyOrderPaidReq {
  orderNumber: string;
  advNo: string;
}

export const useMarkOrderAsPaidBinance = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: MarkBuyOrderPaidReq) => {
      const result = await api().post(apiRoute.binanceMarkOrderAsPaid, payload);
      return result.data;
    },
    onSuccess: () => {
      responseSuccess("Ordem marcada como paga na Binance.");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
