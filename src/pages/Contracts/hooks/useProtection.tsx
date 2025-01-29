import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { assetsOptions } from "src/utils/selectsOptions";
import * as Yup from "yup";

export interface IProtection {
  tipoTransferencia: string;
  comprador: string;
  instituicao: string;
  dataHora: string;
  quantidade: string;
  valor: string;
  ativo: string;
  exchange?: string;
  uid?: string;
  wallet?: string;
  endereco?: string;
  ordem?: string;
  usuario?: string;
}

const schema = Yup.object({
  tipoTransferencia: Yup.string()
    .oneOf(["exchange", "wallet", "usuario"], "Selecione um tipo de transferência válido")
    .required("O tipo de transferência é obrigatório")
    .label("Tipo Transferência") as Yup.StringSchema<string>,
  comprador: Yup.string().required("Instituição é obrigatória").label("Comprador"),
  instituicao: Yup.string().required("Instituição é obrigatória").label("Instituição"),
  dataHora: Yup.string()
    .required("Data e Hora é obrigatória")
    .matches(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      "Data e Hora da Transação deve estar no formato AAAA-MM-DD HH:MM:SS",
    )
    .label("Data Hora"),
  quantidade: Yup.string().required("Quantidade é obrigatória").label("Quantidade"),
  valor: Yup.string().required("Valor é obrigatório").label("Valor"),
  ativo: Yup.string()
    .oneOf(assetsOptions, "Selecione um ativo válido")
    .required("Ativo é obrigatório")
    .label("Ativo"),
  exchange: Yup.string()
    .optional()
    .test(
      "is-required-when-exchange",
      "A Exchange é obrigatória para transferências via Exchange",
      function (value) {
        return (
          this.parent.tipoTransferencia !== "exchange" ||
          this.parent.tipoTransferencia !== "usuario" ||
          !!value
        );
      },
    )
    .label("Exchange"),
  uid: Yup.string()
    .optional()
    .test(
      "is-required-when-exchange",
      "O UID é obrigatório para transferências via Exchange",
      function (value) {
        return this.parent.tipoTransferencia !== "exchange" || !!value;
      },
    ),
  wallet: Yup.string()
    .optional()
    .test(
      "is-required-when-wallet",
      "A Wallet é obrigatória para transferências via plataforma",
      function (value) {
        return this.parent.tipoTransferencia !== "endereco" || !!value;
      },
    )
    .label("Wallet"),
  endereco: Yup.string()
    .optional()
    .test(
      "is-required-when-wallet",
      "O Endereço é obrigatório para transferências via Carteira",
      function (value) {
        return this.parent.tipoTransferencia !== "endereco" || !!value;
      },
    )
    .label("Endereço"),
  usuario: Yup.string()
    .optional()
    .test(
      "is-required-when-wallet",
      "O Usuário é obrigatório para transferências via ordem",
      function (value) {
        return this.parent.tipoTransferencia !== "usuario" || !!value;
      },
    )
    .label("Usuário"),
});

export const useProtection = () => {
  const context = useForm<IProtection>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  return { context };
};
