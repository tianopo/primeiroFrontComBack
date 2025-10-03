import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export interface PixConsultarResp {
  status?: string;
  retorno?: any;
}

export const usePixConsultar = (endToEndId: string) => {
  return useQuery<PixConsultarResp>({
    queryKey: ["pix-consultar", endToEndId],
    enabled: false, // igual ao seu usePixDictLookup
    queryFn: async () => {
      const { data } = await api().get(apiRoute.consultarPix(endToEndId));
      return data;
    },
  });
};
