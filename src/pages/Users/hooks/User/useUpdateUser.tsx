import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { Regex } from "src/utils/Regex";
import * as Yup from "yup";

export interface IUpdateUserPayload {
  nome: string;
  apelido?: string;
  exchange: string;
  documento?: string;
  bloqueado?: boolean;
}

interface IUpdateUserVariables {
  id: string;
  payload: IUpdateUserPayload;
}

const schema = Yup.object({
  nome: Yup.string().required().label("Nome"),
  apelido: Yup.string().optional().label("Apelido"),
  exchange: Yup.string().required().label("Exchange"),
  documento: Yup.string()
    .optional()
    .test("validate-documento", "Documento inválido, correto: XXX.XXX.XXX-XX", (value) =>
      value && value.length > 0 ? Regex.cpf_cnpj_mask.test(value || "") : true,
    )
    .label("Documento"),
  bloqueado: Yup.boolean().optional().label("Bloqueado"),
});

export const useUpdateUser = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ id, payload }: IUpdateUserVariables) => {
      const { data } = await api().put(`${apiRoute.user}/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      responseSuccess("Atualização feita com sucesso");
      queryClient.invalidateQueries({ queryKey: ["users-data"] });
      queryClient.invalidateQueries({ queryKey: ["orders-data"] });
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const context = useForm<IUpdateUserPayload>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  return { mutate, isPending, context };
};
