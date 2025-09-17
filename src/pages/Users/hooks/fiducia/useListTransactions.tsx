import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export const useListTransactions = () => {
  const path = async () => {
    const result = await api().get(apiRoute.extrato, { params: { pg: 1, limit: 10 } });
    return result.data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["transactions-data"],
    queryFn: path,
    refetchInterval: 30000,
    retry: 1,
  });

  return { data, error, isLoading };
};
