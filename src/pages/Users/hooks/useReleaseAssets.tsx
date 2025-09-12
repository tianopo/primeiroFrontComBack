import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { KeyType } from "../components/PendingOrders";

interface IReleaseAssets {
  orderId: string;
  keyType: KeyType;
}

export const useReleaseAssets = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ orderId, keyType }: IReleaseAssets) => {
      const result = await api().post(
        `${apiRoute.releaseAssets}?orderId=${orderId}&keyType=${keyType}`,
      );
      return result.data;
    },
    onSuccess: () => {
      responseSuccess("Ativos liberados com sucesso");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] }); // 🔄 força refetch
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
