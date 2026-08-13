import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { MexcKeyType } from "./useReleaseCoinMexc";

export type MarkOrderAsPaidMexcPayload = {
  advOrderNo: string;
  keyType: MexcKeyType;
  userConfirmPaymentId?: string;
  payId?: string;
};

export const useMarkOrderAsPaidMexc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      advOrderNo,
      keyType,
      userConfirmPaymentId,
      payId,
    }: MarkOrderAsPaidMexcPayload) => {
      const result = await api().post(
        apiRoute.mexcMarkPaid(advOrderNo),
        {
          userConfirmPaymentId,
          payId,
        },
        {
          params: { keyType },
        },
      );

      return result.data;
    },
    onSuccess: () => {
      toast.success("Pagamento confirmado na MEXC.");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: () => {
      toast.error("Falha ao confirmar pagamento na MEXC.");
    },
  });
};
