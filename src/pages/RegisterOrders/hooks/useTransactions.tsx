import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import * as Yup from "yup";

export interface IVenda {
  nomeComprador?: string;
  apelidoComprador?: string;
  documentoComprador?: string;
  numeroOrdem: string;
  dataHoraTransacao: string;
  exchangeUtilizada: string;
  ativoDigital: string;
  tipoTransacao: "vendas";
  quantidadeVendida: string;
  valorVenda: string;
  valorTokenDataVenda: string;
  taxaTransacao: string;
}

export interface ICompra {
  nomeVendedor?: string;
  apelidoVendedor?: string;
  numeroOrdem: string;
  dataHoraTransacao: string;
  exchangeUtilizada: string;
  ativoDigital: string;
  tipoTransacao: "compras";
  quantidadeComprada: string;
  valorCompra: string;
  valorTokenDataCompra: string;
  taxaTransacao: string;
}

export interface ITransactionData {
  vendas: IVenda[];
  compras: ICompra[];
}

const vendaSchema = Yup.object({
  nomeComprador: Yup.string().optional(),
  apelidoComprador: Yup.string().optional(),
  documentoComprador: Yup.string().optional(),
  numeroOrdem: Yup.string().required("Número da Ordem é obrigatório").label("Número Ordem"),
  dataHoraTransacao: Yup.string()
    .required("Hora da Transação é obrigatória")
    .matches(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      "Data e Hora da Transação deve estar no formato AAAA-MM-DD HH:MM:SS",
    ),
  exchangeUtilizada: Yup.string().required("Exchange Utilizada é obrigatória"),
  ativoDigital: Yup.string().required("Ativo Digital é obrigatório"),
  tipoTransacao: Yup.string().oneOf(["vendas"]).required("Tipo de Transação é obrigatório"),
  quantidadeVendida: Yup.string().required("Quantidade Vendida é obrigatória"),
  valorVenda: Yup.string().required("Valor da Venda é obrigatório"),
  valorTokenDataVenda: Yup.string().required("Valor do Token na Data da Venda é obrigatório"),
  taxaTransacao: Yup.string().required("Taxa de Transação é obrigatória"),
});

const compraSchema = Yup.object({
  nomeVendedor: Yup.string().optional(),
  apelidoVendedor: Yup.string().optional(),
  numeroOrdem: Yup.string().required("Número da Ordem é obrigatório"),
  dataHoraTransacao: Yup.string()
    .required("Data e Hora da Transação é obrigatória")
    .matches(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      "Data e Hora da Transação deve estar no formato AAAA-MM-DD HH:MM:SS",
    ),
  exchangeUtilizada: Yup.string().required("Exchange Utilizada é obrigatória"),
  ativoDigital: Yup.string().required("Ativo Digital é obrigatório"),
  tipoTransacao: Yup.string().oneOf(["compras"]).required("Tipo de Transação é obrigatório"),
  quantidadeComprada: Yup.string().required("Quantidade Comprada é obrigatória"),
  valorCompra: Yup.string().required("Valor da Compra é obrigatório"),
  valorTokenDataCompra: Yup.string().required("Valor do Token na Data da Compra é obrigatório"),
  taxaTransacao: Yup.string().required("Taxa de Transação é obrigatória"),
});

const schema = Yup.object({
  vendas: Yup.array().of(vendaSchema).required("Vendas são obrigatórias"),
  compras: Yup.array().of(compraSchema).required("Compras são obrigatórias"),
});

export const useTransaction = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Transações enviadas com sucesso");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const context = useForm<ITransactionData>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  const contextCompra = useForm<ICompra>({
    resolver: yupResolver(compraSchema),
    reValidateMode: "onChange",
  });

  const contextVenda = useForm<IVenda>({
    resolver: yupResolver(vendaSchema),
    reValidateMode: "onChange",
  });

  async function path(data: ITransactionData): Promise<ITransactionData> {
    const result = await api().post(apiRoute.transactions, data);
    return result.data;
  }

  return { mutate, isPending, context, contextCompra, contextVenda };
};
