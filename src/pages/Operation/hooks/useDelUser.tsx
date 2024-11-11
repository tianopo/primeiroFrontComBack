import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const useDelUser = (id: string) => {
  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Usuário excluido com sucesso");
      queryClient.refetchQueries({ queryKey: ["users-data"] });
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  async function path(): Promise<void> {
    const result = await api().delete(apiRoute.operationId(id));
    return result.data;
  }

  return { mutate, isPending };
};
