import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { SyncDeskdataPayload, SyncDeskdataResponse } from "../utils/deskdataTypes";

export const useSyncDeskdata = () => {
  const mutation = useMutation({
    mutationFn: async (payload: SyncDeskdataPayload): Promise<SyncDeskdataResponse> => {
      const result = await api().post(apiRoute.complianceDeskdataSync, {
        ...payload,
        strategy: "auto",
      });
      return result.data;
    },
    onSuccess: () => {
      responseSuccess("Deskdata sincronizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["compliance-data"] });
      queryClient.invalidateQueries({ queryKey: ["users-data"] });
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
