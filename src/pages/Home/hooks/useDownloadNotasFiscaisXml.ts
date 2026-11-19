import { useMutation } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import JSZip from "jszip";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

type ArquivoXml =
  | string
  | {
      Base64?: string;
      Base64Xml?: string;
      ChaveNF?: string;
      Chaves?: string[];
    };

interface RespostaXml {
  Quantidade?: number;
  Base64FilesCompacted?: string;
  Error?: string | null;
  arquivos?: ArquivoXml[];
}

interface DownloadNotasXmlDTO {
  startDate: string;
  endDate: string;
}

export const useDownloadNotasFiscaisXml = () => {
  const { mutateAsync, isPending } = useMutation<number, Error, DownloadNotasXmlDTO>({
    mutationFn: async ({ startDate, endDate }) => {
      if (!startDate || !endDate || startDate > endDate) {
        throw new Error("Selecione um período de datas válido.");
      }

      const res = await api().post<RespostaXml | ArquivoXml[]>(
        apiRoute.brasilNfeListarEBaixar,
        {
          TipoDocumentoFiscal: 1,
          DtInicio: `${startDate}T00:00:00-03:00`,
          DtFim: `${endDate}T23:59:59-03:00`,
          TipoAmbiente: 1,
          FileType: 1,
        },
        {
          timeout: 180000,
        },
      );

      const data = res.data;

      if (!data) {
        throw new Error("O backend retornou uma resposta vazia.");
      }

      if (!Array.isArray(data) && data.Error) {
        throw new Error(data.Error);
      }

      const zip = new JSZip();

      // Caso o backend retorne um ZIP em Base64.
      if (
        !Array.isArray(data) &&
        typeof data.Base64FilesCompacted === "string" &&
        data.Base64FilesCompacted.trim()
      ) {
        const base64 = data.Base64FilesCompacted.replace(/^data:[^,]+;base64,/i, "").replace(
          /\s/g,
          "",
        );

        await zip.loadAsync(base64, {
          base64: true,
        });
      } else {
        // Caso o backend retorne os XMLs individualmente.
        const arquivos = Array.isArray(data)
          ? data
          : Array.isArray(data.arquivos)
            ? data.arquivos
            : [];

        for (let i = 0; i < arquivos.length; i++) {
          const item = arquivos[i];

          const base64 = (typeof item === "string" ? item : item.Base64Xml || item.Base64 || "")
            .replace(/^data:[^,]+;base64,/i, "")
            .replace(/\s/g, "");

          if (!base64) {
            throw new Error(`O XML ${i + 1} foi retornado vazio.`);
          }

          const amostra = atob(base64.slice(0, 128)).trimStart();

          if (!amostra.startsWith("<")) {
            throw new Error(`O arquivo ${i + 1} não contém um XML válido.`);
          }

          const chave =
            typeof item === "string"
              ? `nota-${i + 1}`
              : item.ChaveNF || item.Chaves?.[0] || `nota-${i + 1}`;

          zip.file(`${chave}.xml`, base64, {
            base64: true,
          });
        }
      }

      // Conta os XMLs recebidos.
      const totalXml = Object.values(zip.files).filter(
        (arquivo) => !arquivo.dir && arquivo.name.toLowerCase().endsWith(".xml"),
      ).length;

      if (totalXml === 0) {
        throw new Error("Nenhum arquivo XML foi recebido do backend.");
      }

      // Compacta e gera o arquivo ZIP.
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
      });

      // Inicia o download no navegador.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `notas-fiscais-xml-${startDate}-a-${endDate}.zip`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 30000);

      return totalXml;
    },

    onSuccess: (quantidade) => {
      responseSuccess(`${quantidade} notas fiscais em XML baixadas com sucesso.`);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        responseError(error as AxiosError);
      } else {
        toast.error(error.message);
      }
    },
  });

  return {
    baixarNotasXml: (startDate: string, endDate: string) => mutateAsync({ startDate, endDate }),

    isDownloading: isPending,
  };
};
