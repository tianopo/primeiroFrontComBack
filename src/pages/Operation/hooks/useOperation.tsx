import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { Regex } from "src/utils/Regex";
import * as Yup from "yup";

export interface IOperation {
  nome: string;
  apelido?: string;
  exchange: string;
  cpf?: string;
}

const schema = Yup.object({
  nome: Yup.string().required().label("Nome"),
  apelido: Yup.string().optional().label("Apelido"),
  exchange: Yup.string().required().label("Exchange"),
  cpf: Yup.string()
    .optional()
    .test("validate-cpf", "CPF inválido, correto: XXX.XXX.XXX-XX", (value) =>
      value && value.length > 0 ? Regex.cpf_mask.test(value || "") : true,
    )
    .label("CPF"),
});

export const useOperation = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Cadastro efetuado com sucesso");
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const context = useForm<IOperation>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: IOperation): Promise<IOperation> {
    const result = await api().post(apiRoute.operation, data);
    return result.data;
  }

  return { mutate, isPending, context };
};
