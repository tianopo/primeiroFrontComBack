import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export const useCorpxGetQrCode = () => {
  const { mutate, data, isPending } = useMutation({
    mutationFn: async (payload: { accountId: string; identifier: string }) => {
      const url = apiRoute.corpxPix.qrcode + querystring({ identifier: payload.identifier });
      const res = await api().get(url);
      return res.data;
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, data, isPending };
};
