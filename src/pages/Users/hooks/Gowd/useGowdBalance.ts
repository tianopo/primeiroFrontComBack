import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

type GowdBalanceResponse = {
  id: string;
  fullName: string;
  document: {
    type: string;
    number: string;
  };
  country: string;
  createdAt: string;
  accounts: Array<{
    id: string;
    type: string;
    balance: Array<{
      currency: string;
      value: string;
    }>;
  }>;
};

export const useGowdBalance = () => {
  return useQuery({
    queryKey: ["gowd-balance"],
    queryFn: async () => {
      const res = await api().get<GowdBalanceResponse>(apiRoute.gowd.balance, {
        params: {
          accountType: "PAYMENT",
        },
      });

      const paymentAccount = res.data.accounts?.find((account) => account.type === "PAYMENT");

      const brlBalance = paymentAccount?.balance?.find((item) => item.currency === "BRL");

      return brlBalance?.value ?? "0.00";
    },
    refetchInterval: 30000,
    retry: 1,
  });
};
