import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface ConfirmOrderPaidReq {
  authType?: "FIDO2" | "GOOGLE" | "EMAIL" | "MOBILE" | "YUBIKEY" | string;
  code?: string;
  confirmPaidType?: string;

  emailVerifyCode?: string;
  googleVerifyCode?: string;
  mobileVerifyCode?: string;

  orderNumber: string; // obrigatório
  payId?: number;

  yubikeyVerifyCode?: string;
}

export const useCheckAndReleaseCoinBinance = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: ConfirmOrderPaidReq) => {
      const result = await api().post(apiRoute.binanceCheckAndReleaseCoin, payload);
      return result.data;
    },
    onSuccess: () => {
      responseSuccess("Ativo liberado na Binance com sucesso");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
