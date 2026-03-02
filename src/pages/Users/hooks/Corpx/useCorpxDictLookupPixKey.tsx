import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { DictLookupResponse, PixKeyType, querystringPixOut } from "../../utils/Interface";

export const useCorpxDictLookupPixKey = () => {
  const { mutate, isPending, data } = useMutation({
    mutationFn: async (payload: { pixKey: string; keyType?: PixKeyType }) => {
      const url =
        apiRoute.corpxPix.dictLookup(payload.pixKey) +
        querystringPixOut({ keyType: payload.keyType });
      const res = await api().get<DictLookupResponse>(url);
      return res.data;
    },
    onSuccess: () => responseSuccess("Chave consultada (DICT)"),
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending, data };
};
