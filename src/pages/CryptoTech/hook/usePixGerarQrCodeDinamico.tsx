import { useMutation } from "@tanstack/react-query";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export type GerarQrCodeBody = {
  chave: string;
  solicitacao_pagador: string | null;
  cpf_cnpj_pagador: string;
  nome_pagador: string;
  valor: string; // "350.27" (ponto + 2 casas)
  modalidade_alteracao: number; // 0 no seu exemplo
  expiracao_QR: number; // em segundos
  identificador: string;
  dados_adicionais_nome?: string;
  dados_adicionais_valor?: string;
  reutilizavel: boolean;
  formato: number; // 1 = apenas payload, 2 = payload + imagem (depende do backend)
};

export type GerarQrCodeResp =
  | {
      status?: string;
      retorno?: any;
    }
  | any;

export const usePixGerarQrCodeDinamico = () => {
  return useMutation<GerarQrCodeResp, any, GerarQrCodeBody>({
    mutationFn: async (payload) => {
      const { data } = await api().post(apiRoute.gerarQrCodePix, payload);
      return data;
    },
    onError: (err) => responseError(err),
  });
};
