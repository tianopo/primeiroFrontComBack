import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseSuccess, responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { PixOutBody, querystring } from "../../utils/Interface";

export const useCorpxPixOut = () => {
  const { mutate, isPending, data } = useMutation({
    mutationFn: async (payload: { body: PixOutBody; idempotencyKey?: string }) => {
      const url =
        apiRoute.corpxPix.pixOut + querystring({ idempotencyKey: payload.idempotencyKey });
      const res = await api().post(url, payload.body);
      return res.data;
    },
    onSuccess: () => responseSuccess("PIX enviado"),
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending, data };
};
