import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

type GateKeyType = "empresa" | "pessoal";

export const useMarkOrderAsPaidGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { txid: string; keyType: GateKeyType; paymentMethod?: string }) => {
      const response = await api().post(
        apiRoute.gateMarkPaid(payload.txid),
        {
          paymentMethod: payload.paymentMethod,
        },
        {
          params: {
            keyType: payload.keyType,
          },
        },
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success("Pagamento confirmado na Gate.");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: () => {
      toast.error("Falha ao confirmar pagamento na Gate.");
    },
  });
};
