import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface IExchangeOffsets {
  sellOffset: number;
  buyOffset: number;
}

export const useUpdateExchangeOffsets = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: IExchangeOffsets) => {
      const { data } = await api().put(apiRoute.exchangeOffsets, payload);
      return data;
    },
    onSuccess: (data) => {
      responseSuccess("Offsets atualizados com sucesso");
      queryClient.setQueryData(["exchange-offsets"], data);
      localStorage.setItem("exchange-offsets", JSON.stringify(data));
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
