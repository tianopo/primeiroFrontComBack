import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export type BitgetKeyType = "empresa" | "pessoal";

export type BitgetOrderActionPayload = {
  orderId: string;
  keyType: BitgetKeyType;
};

export const useMarkOrderAsPaidBitget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BitgetOrderActionPayload) => {
      const result = await api().post(apiRoute.bitgetMarkPaid, payload);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Pagamento confirmado na Bitget.");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: () => {
      toast.error("Falha ao confirmar pagamento na Bitget.");
    },
  });
};
