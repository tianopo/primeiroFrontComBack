import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { querystring } from "../../utils/Interface";

export const useCorpxTransactionStatus = () => {
  const { mutate, data, isPending } = useMutation({
    mutationFn: async (payload: { endToEndId: string }) => {
      const url =
        apiRoute.corpxPix.transactionStatus + querystring({ endToEndId: payload.endToEndId });
      const res = await api().get(url);
      return res.data;
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, data, isPending };
};
