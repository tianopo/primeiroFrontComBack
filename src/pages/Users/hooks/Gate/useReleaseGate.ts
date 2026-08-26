import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

type GateKeyType = "empresa" | "pessoal";

export const useReleaseGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { txid: string; keyType: GateKeyType }) => {
      const response = await api().post(
        apiRoute.gateRelease(payload.txid),
        {},
        {
          params: {
            keyType: payload.keyType,
          },
        },
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success("Ordem liberada na Gate.");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: () => {
      toast.error("Falha ao liberar ordem na Gate.");
    },
  });
};
