import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Regex } from "src/utils/Regex";
import {
  assetsOptions,
  blockchainsOptions,
  estadoCivilOptions,
  limitDateOptions,
  paymentOptions,
  walletOptions,
} from "src/utils/selectsOptions";
import * as Yup from "yup";

export interface IUsuario {
  name: string;
  document: string;
}

export interface IService {
  usuario: IUsuario;
  tipo: string;
  quantidade: string;
  valor: string;
  ativo: string;
  pagamento: string;
  tempoLimite: string;
  blockchain?: string;
  enderecoComprador?: string;
  uid?: string;
  wallet: string;
  cep: string;
  rua: string;
  cidade: string;
  numero: string;
  bairro: string;
  complemento?: string;
  estado: string;
  estadoCivil: string;
}

const schema = Yup.object({
  usuario: Yup.object({
    name: Yup.string().required(),
    document: Yup.string().required(),
  }).required(),
  tipo: Yup.string().required().label("Tipo"),
  quantidade: Yup.string().required().label("Quantidade"),
  valor: Yup.string().required().label("Valor"),
  ativo: Yup.string().oneOf(assetsOptions, "Selecione um ativo válido").required().label("Ativo"),
  pagamento: Yup.string()
    .oneOf(paymentOptions, "Selecione um pagamento válido")
    .required()
    .label("Pagamento"),
  tempoLimite: Yup.string()
    .oneOf(limitDateOptions, "Selecione um tempo limite de horas válido")
    .required()
    .label("Tempo Limite"),
  blockchain: Yup.string()
    .oneOf(blockchainsOptions, "Selecione uma blockchain válida")
    .optional()
    .label("Blockchain"),
  enderecoComprador: Yup.string().optional().label("Endereço Comprador"),
  uid: Yup.string().optional().label("Uid"),
  wallet: Yup.string()
    .oneOf(walletOptions, "Selecione uma carteira válida")
    .required()
    .label("Wallet"),
  estadoCivil: Yup.string()
    .oneOf(estadoCivilOptions, "Selecione um estado civil válido")
    .required()
    .label("Estado Civil"),
  cep: Yup.string().required().matches(Regex.cep_mask, "CEP inválido").label("CEP"),
  rua: Yup.string().required().max(255).label("Rua"),
  cidade: Yup.string().required().max(255).label("Cidade"),
  numero: Yup.string().required().max(25).label("Número"),
  bairro: Yup.string().required().max(100).label("Bairro"),
  complemento: Yup.string().optional().max(100).label("Complemento"),
  estado: Yup.string().required().label("Estado"),
});

export const useService = () => {
  const context = useForm<IService>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  return { context };
};
