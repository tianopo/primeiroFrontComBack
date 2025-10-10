import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { Regex } from "src/utils/Regex";
import Yup from "src/utils/yupValidation";

export interface IComplianceCheck {
  documento: string;
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

export const useComplianceCheck = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Documento Verificado !");
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const context = useForm<IComplianceCheck>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: IComplianceCheck): Promise<IComplianceCheck> {
    const result = await api().post(apiRoute.checkCryptotech, data);
    return result.data;
  }

  return { mutate, isPending, context };
};
