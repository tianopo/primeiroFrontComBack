import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export type GateKeyType = "empresa" | "pessoal";

type GateImageContentType = "image/jpeg" | "image/jpg" | "image/png";

type SendGateTextPayload = {
  txid: string;
  keyType: GateKeyType;
  message: string;
  type: "text";
};

type SendGateImagePayload = {
  txid: string;
  keyType: GateKeyType;
  file: File;
  type: "image";
};

type GateUploadChatResponse = {
  data?: {
    file_key?: unknown;
    fileKey?: unknown;
  };
  file_key?: unknown;
  fileKey?: unknown;
};

export type SendChatMessageGatePayload = SendGateTextPayload | SendGateImagePayload;

const GATE_MAX_FILE_SIZE = 20 * 1024 * 1024;

const isGateImageContentType = (value: string): value is GateImageContentType =>
  value === "image/jpeg" || value === "image/jpg" || value === "image/png";

const fileToBase64 = (
  file: File,
): Promise<{
  contentType: GateImageContentType;
  base64: string;
}> =>
  new Promise((resolve, reject) => {
    if (file.size <= 0) {
      reject(new Error("O arquivo da Gate está vazio."));
      return;
    }

    if (file.size > GATE_MAX_FILE_SIZE) {
      reject(new Error("A Gate aceita arquivos de chat com no máximo 20 MB."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const value = String(reader.result ?? "");
      const match = value.match(/^data:([^;]+);base64,(.+)$/i);
      const contentType = String(match?.[1] ?? file.type ?? "image/png").toLowerCase();
      const base64 = String(match?.[2] ?? "").trim();

      if (!isGateImageContentType(contentType)) {
        reject(new Error("A Gate aceita apenas JPEG, JPG ou PNG no chat."));
        return;
      }

      if (!base64) {
        reject(new Error("Não foi possível converter a imagem para Base64."));
        return;
      }

      resolve({
        contentType,
        base64,
      });
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Não foi possível ler a imagem da Gate."));
    };

    reader.readAsDataURL(file);
  });

const pickFileKey = (value: GateUploadChatResponse): string =>
  String(
    value.data?.file_key ?? value.data?.fileKey ?? value.file_key ?? value.fileKey ?? "",
  ).trim();

export const useSendChatMessageGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendChatMessageGatePayload): Promise<unknown> => {
      if (payload.type === "text") {
        const response = await api().post<unknown>(
          apiRoute.gateSendChat(payload.txid),
          {
            message: payload.message,
            type: 0,
          },
          {
            params: {
              keyType: payload.keyType,
            },
          },
        );

        return response.data;
      }

      const file = await fileToBase64(payload.file);

      const upload = await api().post<GateUploadChatResponse>(
        apiRoute.gateUploadChat,
        {
          image_content_type: file.contentType,
          base64_img: file.base64,
        },
        {
          params: {
            keyType: payload.keyType,
          },
        },
      );

      const fileKey = pickFileKey(upload.data);

      if (!fileKey) {
        throw new Error("A Gate não retornou file_key do arquivo enviado.");
      }

      const response = await api().post<unknown>(
        apiRoute.gateSendChat(payload.txid),
        {
          message: fileKey,
          type: 1,
        },
        {
          params: {
            keyType: payload.keyType,
          },
        },
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: (error: unknown) => {
      console.error("[GATE_CHAT] Falha ao enviar mensagem", error);
      toast.error(error instanceof Error ? error.message : "Falha ao enviar mensagem na Gate.");
    },
  });
};
