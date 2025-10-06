import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export const useListTransactions = (pg = 1, limit = 25) => {
  const fetcher = async () => {
    const result = await api().get(apiRoute.extrato, { params: { pg, limit } });
    return result.data;
  };

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["transactions-data", pg, limit],
    queryFn: fetcher,
    refetchInterval: 30000,
    retry: 1,
    placeholderData: (prev) => prev, // mantém dados anteriores enquanto carrega
  });

  return { data, error, isLoading, isFetching };
};
