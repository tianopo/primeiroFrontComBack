import { useMutation } from "@tanstack/react-query";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export type BuscarQrCodeResp =
  | {
      status?: string;
      retorno?: {
        situacao?: string; // EM_ABERTO, LIQUIDADO, etc
        atualizadoEm?: string;
        [k: string]: any;
      };
    }
  | any;

export const usePixBuscarQrCode = () => {
  return useMutation<BuscarQrCodeResp, any, { id_documento: string }>({
    mutationFn: async ({ id_documento }) => {
      const { data } = await api().get(apiRoute.buscarQrCodePix, { params: { id_documento } });
      return data;
    },
    onError: (err) => responseError(err),
  });
};
