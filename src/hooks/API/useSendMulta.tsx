import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { Regex } from "src/utils/Regex";
import Yup from "src/utils/yupValidation";

export interface IMultaDto {
  nome: string;
  cpf: string;
  email: string;
  cnh: string;
  categoria: string;
  validade: string;
  tipoDesconto: string;
  numeroAutoInfracao: string;
  dataInfracao: string;
  horaInfracao: string;
  localInfracao: string;
  placaVeiculo: string;
  marcaModeloAno: string;
  tipoVeiculo: string;
  valorMulta: string;
  prazoRecurso: string;
}

export const useSendMulta = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Multa enviada com sucesso");
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const schema = Yup.object().shape({
    nome: Yup.string()
      .required("Nome é obrigatório")
      .min(1, "Nome deve ter pelo menos 1 caractere")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    cpf: Yup.string()
      .required("CPF é obrigatório")
      .matches(Regex.cpf_mask, "CPF inválido: XXX.XXX.XXX-XX"),
    email: Yup.string()
      .required("E-mail é obrigatório")
      .email("E-mail inválido")
      .max(255, "E-mail deve ter no máximo 255 caracteres"),
    cnh: Yup.string().required("CNH é obrigatória"),
    categoria: Yup.string().required("Categoria é obrigatória"),
    validade: Yup.string()
      .required("Validade é obrigatória")
      .typeError("Data de validade inválida"),
    tipoDesconto: Yup.string().required("Tipo de desconto é obrigatório"),
    numeroAutoInfracao: Yup.string().required("Número do auto de infração é obrigatório"),
    dataInfracao: Yup.string()
      .required("Data da infração é obrigatória")
      .typeError("Data da infração inválida"),
    horaInfracao: Yup.string().required("Hora da infração é obrigatória"),
    localInfracao: Yup.string().required("Local da infração é obrigatório"),
    placaVeiculo: Yup.string().required("Placa do veículo é obrigatória"),
    marcaModeloAno: Yup.string().required("Marca, modelo e ano são obrigatórios"),
    tipoVeiculo: Yup.string().required("Tipo de veículo é obrigatório"),
    valorMulta: Yup.string()
      .required("Valor da multa é obrigatório")
      .typeError("Valor da multa deve ser um número"),
    prazoRecurso: Yup.string()
      .required("Prazo para recurso é obrigatório")
      .typeError("Data do prazo de recurso inválida"),
  });

  const context = useForm<IMultaDto>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: Yup.InferType<typeof schema>): Promise<IMultaDto> {
    const result = await api().post(apiRoute.multa, data);
    return result.data;
  }

  return { mutate, isPending, context };
};
