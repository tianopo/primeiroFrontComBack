import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { Regex } from "src/utils/Regex";
import * as Yup from "yup";

export interface ICompliance {
  documento: string;
  cnpj?: string;
}

const schema = Yup.object({
  documento: Yup.string()
    .required()
    .matches(
      Regex.cpf_cnpj_mask,
      "Documento inválido, correto: XXX.XXX.XXX-XX ou XX.XXX.XXX/0001-XX",
    )
    .label("Documento"),
});

export const useCompliance = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Transações enviadas com sucesso");
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const context = useForm<ICompliance>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: ICompliance): Promise<ICompliance> {
    const result = await api().post(apiRoute.compliance, data);
    return result.data;
  }

  return { mutate, isPending, context };
};
