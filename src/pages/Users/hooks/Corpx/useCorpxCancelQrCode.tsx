import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseSuccess, responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export const useCorpxCancelQrCode = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: { identifier: string }) => {
      const url = apiRoute.corpxPix.qrcode + querystring({ identifier: payload.identifier });
      const res = await api().delete(url);
      return res.data;
    },
    onSuccess: () => responseSuccess("Cobrança cancelada"),
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
