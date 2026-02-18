import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseSuccess, responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export const useCorpxCreateDynamicQrCode = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: { body: any; idempotencyKey?: string }) => {
      const url =
        apiRoute.corpxPix.qrcodeDynamic + querystring({ idempotencyKey: payload.idempotencyKey });
      const res = await api().post(url, payload.body);
      return res.data;
    },
    onSuccess: () => responseSuccess("QR Code criado"),
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
