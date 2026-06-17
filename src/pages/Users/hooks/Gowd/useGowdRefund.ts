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
  requestedBy: {
    name: string;
  };
  amount: string;
}

const schema = Yup.object({
  orderId: Yup.string().uuid("OrderId inválido").required("OrderId é obrigatório"),
  requestedBy: Yup.object({
    name: Yup.string().required("Nome é obrigatório"),
  }).required(),
  amount: Yup.string().required("Valor é obrigatório"),
});

export const useGowdRefund = () => {
  const form = useForm<IGowdRefundForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      orderId: "",
      requestedBy: {
        name: "",
      },
      amount: "0.00",
    },
    reValidateMode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: IGowdRefundForm) => {
      const idempotencyKey = `refund-${data.orderId}-${Date.now()}`;

      const response = await api().put(apiRoute.gowd.refund, data, {
        headers: {
          "idempotency-key": idempotencyKey,
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