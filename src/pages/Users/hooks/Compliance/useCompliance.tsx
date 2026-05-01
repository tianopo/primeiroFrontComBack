import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { Regex } from "src/utils/Regex";
import * as Yup from "yup";
import { ComplianceProfileResponse } from "../../utils/complianceProfileTypes";

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
  const { mutate, mutateAsync, isPending } = useMutation<
    ComplianceProfileResponse,
    AxiosError,
    ICompliance
  >({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Compliance Encontrado");
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const context = useForm<ICompliance>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: ICompliance): Promise<ComplianceProfileResponse> {
    const result = await api().post(apiRoute.compliance, data);
    return result.data as ComplianceProfileResponse;
  }

  return { mutate, mutateAsync, isPending, context };
};
