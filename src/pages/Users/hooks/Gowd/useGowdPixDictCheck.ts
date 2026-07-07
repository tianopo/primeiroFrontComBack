import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

type GowdScope = "own" | "baas";

export type GowdPixDictCheckPayload = {
  key: string;
  scope?: GowdScope;
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
      const route =
        payload.scope === "baas" ? apiRoute.gowd.baasDictKeyCheck : apiRoute.gowd.dictKeyCheck;

      const { data } = await api().post<GowdPixDictCheckResponse>(route, {
        key: payload.key,
      });

      return data;
    },
    onError: (error) => {
      responseError(error as AxiosError);
    },
  });
};
