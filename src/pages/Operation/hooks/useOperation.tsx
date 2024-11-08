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
