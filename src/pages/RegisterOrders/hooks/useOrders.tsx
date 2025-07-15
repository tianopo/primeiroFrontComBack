import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import * as Yup from "yup";

export interface IOrder {
  nome?: string;
  apelido?: string;
  numeroOrdem: string;
  dataHora: string;
  exchange: string;
  ativo: string;
  tipo: "compras" | "vendas";
  quantidade: string;
  valor: string;
  valorToken: string;
  taxa: string;
}

const schema = Yup.object({
  nome: Yup.string().optional(),
  apelido: Yup.string().optional(),
  numeroOrdem: Yup.string().required("Número da Ordem é obrigatório").label("Número Ordem"),
  dataHora: Yup.string()
    .required("Data e Hora é obrigatória")
    .matches(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      "Data e Hora deve estar no formato AAAA-MM-DD HH:MM:SS",
    ),
  exchange: Yup.string().required("Exchange é obrigatória"),
  ativo: Yup.string().required("Ativo é obrigatório"),
  tipo: Yup.string().oneOf(["vendas", "compras"]).required("Tipo é obrigatório"),
  quantidade: Yup.string().required("Quantidade é obrigatória"),
  valor: Yup.string().required("Valor é obrigatório"),
  valorToken: Yup.string().required("Valor do Token é obrigatório"),
  taxa: Yup.string().required("Taxa é obrigatória"),
});

export const useOrders = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Ordens enviadas com sucesso");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const context = useForm<IOrder>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: IOrder[]): Promise<any> {
    const result = await api().post(apiRoute.orders, data);
    return result.data;
  }

  return { mutate, isPending, context };
};
