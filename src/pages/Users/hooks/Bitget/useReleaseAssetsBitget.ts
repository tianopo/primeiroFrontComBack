import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { BitgetOrderActionPayload } from "./useMarkOrderAsPaidBitget";

export const useReleaseAssetsBitget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BitgetOrderActionPayload) => {
      const result = await api().post(apiRoute.bitgetReleaseAssets, payload);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Ativos liberados na Bitget.");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: () => {
      toast.error("Falha ao liberar ativos na Bitget.");
    },
  });
};
