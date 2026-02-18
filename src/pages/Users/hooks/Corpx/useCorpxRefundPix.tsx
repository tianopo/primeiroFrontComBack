import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { PixRefundBody, querystring } from "../../utils/Interface";

export const useCorpxRefundPix = () => {
  const { mutate, isPending, data } = useMutation({
    mutationFn: async (payload: { body: PixRefundBody; idempotencyKey?: string }) => {
      const url =
        apiRoute.corpxPix.refund + querystring({ idempotencyKey: payload.idempotencyKey });
      const res = await api().post(url, payload.body);
      return res.data;
    },
    onSuccess: () => responseSuccess("Devolução solicitada"),
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending, data };
};
