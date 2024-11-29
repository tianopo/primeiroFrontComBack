import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { Regex } from "src/utils/Regex";
import * as Yup from "yup";

export interface IRegisterUser {
  nome?: string;
  apelido: string;
  exchange: string;
  documento?: string;
}

const schema = Yup.object({
  nome: Yup.string().optional().label("Nome"),
  apelido: Yup.string().required().label("Apelido"),
  exchange: Yup.string().required().label("Exchange"),
  documento: Yup.string()
    .optional()
    .test("validate-documento", "Documento inválido, correto: XXX.XXX.XXX-XX", (value) =>
      value && value.length > 0 ? Regex.cpf_cnpj_mask.test(value || "") : true,
    )
    .label("Documento"),
});

export const useRegisterUser = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Cadastro efetuado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["users-data"] });
      queryClient.invalidateQueries({ queryKey: ["buyer-data"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-data"] });
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const context = useForm<IRegisterUser>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: IRegisterUser): Promise<IRegisterUser> {
    const result = await api().post(apiRoute.operation, data);
    return result.data;
  }

  return { mutate, isPending, context };
};
