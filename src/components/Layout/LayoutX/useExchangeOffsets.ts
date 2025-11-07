import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import type { IExchangeOffsets } from "./UseUpdateExchangesOffsets";

export const useExchangeOffsets = () => {
  const fetcher = async (): Promise<IExchangeOffsets> => {
    const { data } = await api().get(apiRoute.exchangeOffsets);
    return data; // { sellOffset, buyOffset }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["exchange-offsets"],
    queryFn: fetcher,
    refetchOnWindowFocus: false,
    staleTime: 0, // sempre buscar o atual quando precisar
  });

  return { data, isLoading, error };
};
