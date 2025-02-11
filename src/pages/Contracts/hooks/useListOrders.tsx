import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export const useListOrders = () => {
  const path = async () => {
    const result = await api().get(apiRoute.comercial);
    return result.data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["orders-data"],
    queryFn: path,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { data, error, isLoading };
};
