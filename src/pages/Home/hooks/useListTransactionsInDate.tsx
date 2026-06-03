import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export const useListTransactionsInDate = (startDate: string, endDate: string) => {
  const path = async () => {
    const result = await api().get(apiRoute.tax, { params: { startDate, endDate } });
    return result.data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["orders-data", startDate, endDate],
    queryFn: path,
    staleTime: 0, // ✅ não “eterniza” cache
    refetchOnWindowFocus: false,
    refetchOnMount: "always", // ✅ garante refetch ao montar
    enabled: !!startDate && !!endDate,
  });

  return { data, error, isLoading };
};
