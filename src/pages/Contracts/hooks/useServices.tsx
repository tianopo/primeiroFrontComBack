import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  assetsOptions,
  blockchainsOptions,
  limitDateOptions,
  paymentOptions,
  walletOptions,
} from "src/utils/selectsOptions";
import * as Yup from "yup";

export interface IService {
  quantidade: string;
  valor: string;
  ativo: string;
  pagamento: string;
  tempoLimite: string;
  blockchain: string;
  enderecoComprador: string;
  wallet: string;
}

const schema = Yup.object({
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
    .required()
    .label("Blockchain"),
  enderecoComprador: Yup.string().required().label("Endereço Comprador"),
  wallet: Yup.string()
    .oneOf(walletOptions, "Selecione uma carteira válida")
    .required()
    .label("Wallet"),
});

export const useService = () => {
  const context = useForm<IService>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  return { context };
};
