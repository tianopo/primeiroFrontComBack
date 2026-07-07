import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import * as Yup from "yup";

type GowdScope = "own" | "baas";

export interface IGowdRefundForm {
  orderId: string;
  requestedBy: {
    name: string;
  };
  amount: string;
  scope?: GowdScope;
}

const schema = Yup.object({
  orderId: Yup.string().uuid("OrderId inválido").required("OrderId é obrigatório"),
  requestedBy: Yup.object({
    name: Yup.string().required("Nome é obrigatório"),
  }).required(),
  amount: Yup.string().required("Valor é obrigatório"),
  scope: Yup.mixed<GowdScope>().oneOf(["own", "baas"]).optional(),
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
      scope: "own",
    },
    reValidateMode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: IGowdRefundForm) => {
      const route = data.scope === "baas" ? apiRoute.gowd.baasRefund : apiRoute.gowd.refund;
      const idempotencyKey = `refund-${data.scope ?? "own"}-${data.orderId}-${Date.now()}`;

      const response = await api().put(
        route,
        {
          orderId: data.orderId,
          requestedBy: data.requestedBy,
          amount: data.amount,
        },
        {
          headers: {
            "idempotency-key": idempotencyKey,
          },
        },
      );

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
    reset: mutation.reset,
  };
};
