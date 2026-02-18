import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { UpdatePixLimitsBody } from "../../utils/Interface";

export const useUpdateCorpxPixLimits = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: { body: UpdatePixLimitsBody }) => {
      const res = await api().patch(apiRoute.corpxPix.limits, payload.body);
      return res.data;
    },
    onSuccess: () => {
      responseSuccess("Limites atualizados");
      queryClient.invalidateQueries({ queryKey: ["corpx-pix-limits"] });
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
