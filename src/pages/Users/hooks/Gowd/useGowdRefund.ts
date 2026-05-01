import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface IGowdRefundForm {
  orderId: string;
  externalId: string;
  amount: {
    currency: "BRL";
    value: string;
  };
  refundCode: string;
  refundReason?: string | null;
  description?: string | null;
}

const schema = Yup.object({
  orderId: Yup.string().uuid("OrderId inválido").required("OrderId é obrigatório"),
  externalId: Yup.string().required("ExternalId é obrigatório"),
  amount: Yup.object({
    currency: Yup.mixed<"BRL">().oneOf(["BRL"]).required(),
    value: Yup.string().required("Valor é obrigatório"),
  }).required(),
  refundCode: Yup.string().required("RefundCode é obrigatório"),
  refundReason: Yup.string().nullable(),
  description: Yup.string().nullable(),
});

export const useGowdRefund = () => {
  const form = useForm<IGowdRefundForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      orderId: "",
      externalId: "",
      amount: {
        currency: "BRL",
        value: "25000.00",
      },
      refundCode: "RECEIVER_REQUEST",
      refundReason: "Solicitação do cliente",
      description: "Reembolso integral",
    },
    reValidateMode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: IGowdRefundForm) => {
      const idempotencyKey = `refund-${data.orderId}-${Date.now()}`;

      const response = await api().post(apiRoute.gowd.refunds, data, {
        headers: {
          "x-idempotency-key": idempotencyKey,
        },
      });

      return response.data;
    },
    onSuccess: () => {
      responseSuccess("Reembolso enviado com sucesso");
    },
    onError: (error: AxiosError) => {
      responseError(error);
    },
  });

  return {
    form,
    sendRefund: mutation.mutate,
    sendRefundAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data,
  };
};
