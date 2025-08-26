import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export const useListPendingOrders = () => {
  return useQuery({
    queryKey: ["pending-orders"],
    queryFn: async () => {
      const result = await api().get(apiRoute.pendingOrders);
      return result.data || [];
    },
    refetchInterval: 10000, // 🔹 mantém atualização automática a cada 10s
    retry: 1, // 🔹 em caso de erro tenta 1x
  });
};
