import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseSuccess, responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const useCorpxRespondMed = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: {
      accountId: string;
      medId: string;
      body: { answer: "AGREE" | "DISAGREE"; message?: string };
    }) => {
      const res = await api().post(apiRoute.corpxPix.respondMed(payload.medId), payload.body);
      return res.data;
    },
    onSuccess: (_, vars) => {
      responseSuccess("MED respondido");
      queryClient.invalidateQueries({ queryKey: ["corpx-meds", vars.accountId] });
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
