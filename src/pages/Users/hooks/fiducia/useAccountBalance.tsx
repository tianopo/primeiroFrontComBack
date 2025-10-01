import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export interface AccountBalance {
  Credito: number;
  Debito: number;
  Saldo: number;
}

export const useAccountBalance = () => {
  const fetchBalance = async (): Promise<AccountBalance> => {
    const res = await api().get(`${apiRoute.balance}`);
    return res.data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["account-balance"],
    queryFn: fetchBalance,
    refetchInterval: 30000,
    retry: 1,
  });

  return { data, error, isLoading };
};
