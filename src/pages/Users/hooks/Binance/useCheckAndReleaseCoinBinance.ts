import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export type BinancePostReleaseOrderContext = {
  orderNumber: string;
  createTime?: number | string;
  asset?: string;
  fiat?: string;
  amount?: number | string;
  totalPrice?: number | string;
  unitPrice?: number | string;
  tradeType?: "BUY" | "SELL" | string;
  buyerNickname?: string;
  sellerNickname?: string;
  counterpartyName?: string;
};

export interface ConfirmOrderPaidReq {
  authType?: "FIDO2" | "GOOGLE" | "EMAIL" | "MOBILE" | "YUBIKEY" | string;
  code?: string;
  confirmPaidType?: string;

  emailVerifyCode?: string;
  googleVerifyCode?: string;
  mobileVerifyCode?: string;

  orderNumber: string;
  payId?: number;

  yubikeyVerifyCode?: string;

  /**
   * Dados usados após a liberação para:
   * - cadastrar a ordem liberada;
   * - atualizar o complianceProfile;
   * - enviar comprovante quando houver EndToEnd.
   */
  document?: string;
  endToEnd?: string;
  orderContext?: BinancePostReleaseOrderContext;
}

export type BinancePostReleaseResult = {
  orderSaved: boolean;
  complianceRefreshed: boolean;
  receiptSent: boolean;
  warning?: string;
};

export type CheckAndReleaseCoinBinanceResponse = {
  check: unknown;
  release: unknown;
  postRelease?: BinancePostReleaseResult;
};

export const useCheckAndReleaseCoinBinance = () => {
  const { mutate, isPending } = useMutation<
    CheckAndReleaseCoinBinanceResponse,
    AxiosError,
    ConfirmOrderPaidReq
  >({
    mutationFn: async (payload) => {
      const result = await api().post<CheckAndReleaseCoinBinanceResponse>(
        apiRoute.binanceCheckAndReleaseCoin,
        payload,
      );

      return result.data;
    },

    onSuccess: (data) => {
      responseSuccess("Ativo liberado na Binance com sucesso");

      if (data?.postRelease?.orderSaved === false) {
        responseError(
          `[BINANCE][POST_RELEASE] Ativo liberado, mas a ordem não foi cadastrada: ${
            data.postRelease.warning ?? "motivo não informado"
          }`,
        );
      }

      if (data?.postRelease?.orderSaved && !data?.postRelease?.complianceRefreshed) {
        responseError(
          "[BINANCE][POST_RELEASE] Ordem cadastrada, mas o complianceProfile não foi atualizado.",
        );
      }

      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },

    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
