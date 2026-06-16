import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export type GowdPixOutBody = {
  amount: {
    currency: string;
    value: string;
  };
  paymentMethod: "PIX";
  customer: {
    fullName: string;
    email?: string;
    phone?: string;
    birth?: string;
    document?: {
      type?: "CPF" | "CNPJ";
      number?: string;
    };
  };

  bank: {
    pix: {
      type: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM";
      key: string;
    };
  };

  description: string;
  code: string;
};

export type GowdPixOutPayload = {
  body: GowdPixOutBody;
  idempotencyKey?: string;
};

export const useGowdPixOut = () => {
  const { mutate, mutateAsync, isPending, data, reset } = useMutation<
    any,
    AxiosError,
    GowdPixOutPayload
  >({
    mutationFn: async (payload) => {
      const res = await api().put(apiRoute.gowd.pixOut, payload.body, {
        headers: {
          "idempotency-key": payload.idempotencyKey ?? `gowd-pixout-${Date.now()}`,
        },
      });

      return res.data;
    },
    onSuccess: () => responseSuccess("PIX enviado"),
    onError: (err: AxiosError) => responseError(err),
  });

  return {
    mutate,
    mutateAsync,
    isPending,
    data,
    reset,
  };
};
