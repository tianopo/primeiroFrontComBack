import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export type OrderTipo = "vendas";
export type OrderStatus = "Pending";

export interface CreateOrderDTO {
  numeroOrdem: string; // idDocumento
  dataHora: string; // ISO atual
  exchange: string; // "CRYPTOTECH https://www.cryptotechdev.com/ BR"
  ativo: string; // ativo
  quantidade: string; // quantidadeAtivo
  valor: string; // quantidadeFiat
  valorToken: string; // quantidadeFiat / quantidadeAtivo
  taxa: string; // "0"
  tipo: OrderTipo; // "vendas"
  status: OrderStatus; // "Pending"
  document: string; // cpfOuCnpj (sanitizado)
}

export const useCreateOrder = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: CreateOrderDTO) => {
      const res = await api().post(apiRoute.qrCode, payload);
      return res.data;
    },
    onSuccess: () => responseSuccess("Ordem criada com sucesso"),
    onError: (e: AxiosError) => responseError(e),
  });

  return { createOrder: mutateAsync, creatingOrder: isPending };
};
