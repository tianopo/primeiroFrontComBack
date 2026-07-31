import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import {
  buildGowdIdempotencyKey,
  GowdPixOutResponseData,
} from "src/pages/Users/utils/gowdPixDireto.helpers";
import { apiRoute } from "src/routes/api";

type GowdScope = "own" | "baas";

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
  scope?: GowdScope;
  accountId?: string;
};

export const useGowdPixOut = () => {
  const { mutate, mutateAsync, isPending, data, reset } = useMutation<
    GowdPixOutResponseData,
    AxiosError,
    GowdPixOutPayload
  >({
    mutationFn: async (payload) => {
      const scope = payload.scope ?? "own";
      const route = scope === "baas" ? apiRoute.gowd.baasPixOut : apiRoute.gowd.pixOut;

      const body =
        scope === "baas"
          ? {
              ...payload.body,
              accountId: payload.accountId,
            }
          : payload.body;

      const response = await api().put<GowdPixOutResponseData>(route, body, {
        headers: {
          "idempotency-key": payload.idempotencyKey || buildGowdIdempotencyKey(),
        },
      });

      return response.data;
    },
    onSuccess: (response) => {
      if (String(response?.status ?? "").toUpperCase() === "PARTIALLY_PAID") {
        responseSuccess("PIX parcialmente pago. Verifique o valor pendente.");
        return;
      }

      responseSuccess("PIX enviado");
    },
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
