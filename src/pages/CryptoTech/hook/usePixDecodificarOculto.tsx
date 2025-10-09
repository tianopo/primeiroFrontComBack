import { useMutation } from "@tanstack/react-query";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const usePixDecodificarOculto = () => {
  return useMutation({
    mutationFn: async (payload: { qrcode_payload: string; data_pagamento_pretendida?: string }) => {
      const { data } = await api().post(apiRoute.decodificarQrCodeOculto, payload);
      return data;
    },
    onError: () => responseError("erro"),
  });
};
