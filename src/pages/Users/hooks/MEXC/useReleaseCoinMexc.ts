import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export type MexcKeyType = "empresa" | "pessoal";

export type ReleaseCoinMexcPayload = {
  advOrderNo: string;
  keyType: MexcKeyType;
};

export const useReleaseCoinMexc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ advOrderNo, keyType }: ReleaseCoinMexcPayload) => {
      const result = await api().post(
        apiRoute.mexcReleaseCoin(advOrderNo),
        {},
        {
          params: { keyType },
        },
      );

      return result.data;
    },
    onSuccess: () => {
      toast.success("Ativos liberados na MEXC.");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: () => {
      toast.error("Falha ao liberar ativos na MEXC.");
    },
  });
};
