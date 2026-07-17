import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export type GowdBaasUserAccountResponse = {
  found: boolean;
  canCreate: boolean;
  reason: string;
  message: string;
  accountId: string | null;
  account: any | null;
  user: {
    id: string;
    name: string;
    document: string;
    role: string;
  } | null;
};

export const useGowdBaasUserAccount = (
  userId: string,
  documentNumber: string,
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery({
    queryKey: ["gowd-baas-user-account", userId, documentNumber],
    queryFn: async () => {
      const { data } = await api().get(apiRoute.gowd.baasUserBankingAccount(userId), {
        params: {
          documentNumber,
        },
      });

      return data;
    },
    enabled: Boolean(userId || documentNumber) && Boolean(options?.enabled),
    retry: false,
  });
};
