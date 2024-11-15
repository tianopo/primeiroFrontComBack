import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export const useListTransactions = (startDate: string, endDate: string) => {
  const path = async () => {
    const result = await api().get(apiRoute.order, {
      params: { startDate, endDate },
    });
    return result.data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["transactions-data", startDate, endDate],
    queryFn: path,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled: !!startDate && !!endDate,
  });

  return { data, error, isLoading };
};
