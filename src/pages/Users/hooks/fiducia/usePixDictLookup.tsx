import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

interface PixDictOculto {
  banco_destino: number;
  agencia_destino: number;
  conta_destino: string;
  cpfcnpj_destino: string;
  nome_razaosocial_destino: string;
  tipo_pessoa_destino: "F" | "J";
  tipo_conta_destino: "CC" | "CP" | string;
}

export const usePixDictLookup = (chave: string) => {
  return useQuery<PixDictOculto>({
    queryKey: ["pix-dict-oculto", chave],
    enabled: false,
    queryFn: async () => {
      const { data } = await api().get(apiRoute.chaveOculto(chave));
      return data;
    },
  });
};
