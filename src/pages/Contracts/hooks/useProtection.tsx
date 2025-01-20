import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { assetsOptions } from "src/utils/selectsOptions";
import * as Yup from "yup";

export interface IProtection {
  dataHora: string;
  quantidade: string;
  valor: string;
  ativo: string;
  exchange: string;
}

const schema = Yup.object({
  dataHora: Yup.string()
    .required("Data e Hora é obrigatória")
    .matches(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      "Data e Hora da Transação deve estar no formato AAAA-MM-DD HH:MM:SS",
    ),
  quantidade: Yup.string().required().label("Quantidade"),
  valor: Yup.string().required().label("Valor"),
  ativo: Yup.string().oneOf(assetsOptions, "Selecione um ativo válido").required().label("Ativo"),
  exchange: Yup.string().required().label("Exchange"),
});

export const useProtection = () => {
  const context = useForm<IProtection>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  return { context };
};
