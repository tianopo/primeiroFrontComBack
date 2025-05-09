import { useMutation } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { responseSuccess, responseError } from "src/config/responseErrors";
import { AxiosError } from "axios";

interface ReleaseAssetsParams {
  orderId: string;
}

export const useReleaseAssets = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ orderId }: ReleaseAssetsParams) => {
      const result = await api().post(`${apiRoute.releaseAssets}?orderId=${orderId}`);
      return result.data;
    },
    onSuccess: () => responseSuccess("Ativos liberados com sucesso"),
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
