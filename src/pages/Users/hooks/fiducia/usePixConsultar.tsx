import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export interface PixConsultarResponse {
  status: string;
  retorno?: any; // mantemos flexível, o backend pode variar campos
}

export const usePixConsultar = (endToEndId?: string) => {
  return useQuery<PixConsultarResponse>({
    queryKey: ["pix-consultar", endToEndId],
    enabled: !!endToEndId && endToEndId.trim().length > 0,
    queryFn: async () => {
      const { data } = await api().get(apiRoute.pixConsultar, { params: { endToEndId } });
      return data;
    },
    retry: 1,
  });
};
