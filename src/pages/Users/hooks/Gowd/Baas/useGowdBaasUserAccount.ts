import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export type GowdBaasUserAccountResponse = {
  found: boolean;
  canCreate: boolean;
  canUpdateAccountId: boolean;
  reason: string;
  message: string;
  accountId: string | null;
  account: {
    id?: string;
    status?: string;
    country?: string;
    holderType?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    birthdate?: string;
    document?: {
      type?: string;
      number?: string;
    };
    address?: {
      street?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      complement?: string;
    };
    bankAccountData?: {
      ispb?: string;
      branchNumber?: string;
      accountNumber?: string;
    };
  } | null;
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
