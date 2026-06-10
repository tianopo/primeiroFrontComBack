import { useMutation } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export type GowdPixDictCheckPayload = {
  key: string;
};

export type GowdPixDictCheckResponse = {
  id: string;
  personType: string;
  document: {
    type: string;
    number: string;
  };
  createdAt: string;
  possedAt: string;
  keyType: string;
  key: string;
  accountType: string;
  branchNumber: string;
  accountNumber: string;
  accountCreatedAt: string;
  name: string;
  bankName: string;
  ispb: string;
  code: string;
};

export const useGowdPixDictCheck = () => {
  return useMutation({
    mutationFn: async (payload: GowdPixDictCheckPayload) => {
      const { data } = await api().post<GowdPixDictCheckResponse>(
        apiRoute.gowd.dictKeyCheck,
        payload,
      );
      return data;
    },
  });
};
