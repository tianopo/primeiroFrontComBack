import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Yup from "src/utils/yupValidation";

export interface ISchemaValidation {
  nome: string;
  cpf: string;
  cnh: string;
  categoria: string;
  validade: string;
  tipoDesconto: string;
  autoInfracao: string;
  dataInfracao: string;
  horaInfracao: string;
  localInfracao: string;
  placaVeiculo: string;
  marcaModeloAno: string;
  tipoVeiculo: string;
  valorMulta: string;
  prazoRecurso: string;
}

export const useTestValidation = () => {
  const schemaValidation = Yup.object().shape({
    nome: Yup.string().required().label("Nome"),
    cpf: Yup.string().required().label("CPF"),
    cnh: Yup.string().required().label("CNH"),
    categoria: Yup.string().required().label("Categoria"),
    validade: Yup.string().required().label("Validade"),
    tipoDesconto: Yup.string().required().label("Tipo de Desconto"),
    autoInfracao: Yup.string().required().label("Auto de Infração"),
    dataInfracao: Yup.string().required().label("Data da Infração"),
    horaInfracao: Yup.string().required().label("Hora da Infração"),
    localInfracao: Yup.string().required().label("Local da Infração"),
    placaVeiculo: Yup.string().required().label("Placa do Veículo"),
    marcaModeloAno: Yup.string().required().label("Marca/Modelo/Ano"),
    tipoVeiculo: Yup.string().required().label("Tipo de Veículo"),
    valorMulta: Yup.string().required().label("Valor da Multa"),
    prazoRecurso: Yup.string().required().label("Prazo para Recurso"),
  });

  const context = useForm<ISchemaValidation>({
    resolver: yupResolver(schemaValidation),
    reValidateMode: "onChange",
  });

  return { context };
};
