import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { assetsOptions, blockchainsOptions } from "src/utils/selectsOptions";
import * as Yup from "yup";

export interface IService {
  quantidade: string;
  valor: string;
  ativo: string;
  blockchain: string;
}

const schema = Yup.object({
  quantidade: Yup.string().required().label("Quantidade"),
  valor: Yup.string().required().label("Valor"),
  ativo: Yup.string().oneOf(assetsOptions, "Selecione um ativo válido").required().label("Ativo"),
  blockchain: Yup.string()
    .oneOf(blockchainsOptions, "Selecione uma blockchain válida")
    .required()
    .label("Blockchain"),
});

export const useService = () => {
  const context = useForm<IService>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  return { context };
};
