import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";

export type BankMeResponse = {
  source: "env" | "database" | "none";
  userId: string;
  name: string;
  document: string;
  role: string;
  accountId: string | null;
  branchNumber: string | null;
  accountNumber: string | null;
  ispb: string | null;
  pixKeys: Array<{
    key: string;
    type?: string;
    providerId?: string | null;
  }>;
};

export const useBankMe = () => {
  return useQuery({
    queryKey: ["bank-me"],
    queryFn: async () => {
      const { data } = await api().get<BankMeResponse>("/bank/me");
      return data;
    },
    retry: false,
  });
};
