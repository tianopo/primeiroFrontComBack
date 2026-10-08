import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { MexcKeyType } from "./useReleaseCoinMexc";

type SendTextPayload = {
  orderNo: string;
  keyType: MexcKeyType;
  content: string;
  type: "text";
};

type SendFilePayload = {
  orderNo: string;
  keyType: MexcKeyType;
  file: File;
  type: "image" | "file";
  content?: string;
};

export type SendChatMessageMexcPayload = SendTextPayload | SendFilePayload;

type UnknownRecord = Record<string, unknown>;

const MEXC_FILE_SCAN_RETRY_MS = 10_000;
const MEXC_FILE_SCAN_MAX_ATTEMPTS = 7;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const getDataRecord = (value: unknown): UnknownRecord | undefined => {
  if (!isRecord(value)) return undefined;
  return isRecord(value.data) ? value.data : value;
};

const getString = (value: unknown, key: string): string => {
  const field = getDataRecord(value)?.[key];
  return typeof field === "string" ? field.trim() : "";
};

const getNumber = (value: unknown, key: string): number | undefined => {
  if (!isRecord(value)) return undefined;
  const numericValue = Number(value[key]);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const getBoolean = (value: unknown, key: string): boolean | undefined => {
  if (!isRecord(value)) return undefined;
  const field = value[key];
  return typeof field === "boolean" ? field : undefined;
};

const getErrorMessage = (value: unknown): string => {
  if (!isRecord(value)) return "";

  const message = value.msg ?? value.message;
  return typeof message === "string" ? message.trim() : "";
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

const validateFile = (file: File, type: "image" | "file") => {
  if (file.size <= 0) {
    throw new Error("O arquivo da MEXC está vazio.");
  }

  if (type === "image") {
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedImageTypes.includes(file.type.toLowerCase())) {
      throw new Error("Envie uma imagem JPG, JPEG ou PNG para a MEXC.");
    }

    return;
  }

  const isPdf =
    file.type.toLowerCase() === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("O contrato enviado como arquivo para a MEXC deve ser PDF.");
  }
};

const waitForFileUrl = async (fileId: string, keyType: MexcKeyType): Promise<string> => {
  for (let attempt = 1; attempt <= MEXC_FILE_SCAN_MAX_ATTEMPTS; attempt += 1) {
    const response = await api().get<unknown>(apiRoute.mexcDownloadFile(fileId), {
      params: { keyType },
    });

    const fileUrl = getString(response.data, "fileUrl");

    if (fileUrl) {
      return fileUrl;
    }

    const code = getNumber(response.data, "code");

    if (code === 80016) {
      throw new Error("A MEXC bloqueou o arquivo por considerá-lo inseguro.");
    }

    const scanIsPending = code === 80014 || code === 80015;

    if (!scanIsPending) {
      throw new Error(
        getErrorMessage(response.data) || `A MEXC não retornou fileUrl para o arquivo ${fileId}.`,
      );
    }

    if (attempt === MEXC_FILE_SCAN_MAX_ATTEMPTS) {
      throw new Error("A varredura de segurança do arquivo na MEXC excedeu o tempo esperado.");
    }

    await wait(MEXC_FILE_SCAN_RETRY_MS);
  }

  throw new Error("Não foi possível obter a URL do arquivo na MEXC.");
};

const assertWebSocketSendSucceeded = (value: unknown) => {
  const success = getBoolean(value, "success");

  if (success !== true) {
    throw new Error(
      getErrorMessage(value) || "A MEXC não confirmou o envio da mensagem no WebSocket.",
    );
  }
};

export const useSendChatMessageMexc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendChatMessageMexcPayload): Promise<unknown> => {
      if (payload.type === "text") {
        const response = await api().post<unknown>(
          apiRoute.mexcSendChatMessage,
          {
            orderNo: payload.orderNo,
            content: payload.content,
            type: "text",
          },
          {
            params: { keyType: payload.keyType },
          },
        );

        assertWebSocketSendSucceeded(response.data);
        return response.data;
      }

      validateFile(payload.file, payload.type);

      const form = new FormData();
      form.append("file", payload.file, payload.file.name);

      const upload = await api().post<unknown>(apiRoute.mexcUploadFile, form, {
        params: { keyType: payload.keyType },
      });

      const fileId = getString(upload.data, "fileId");

      if (!fileId) {
        throw new Error(
          getErrorMessage(upload.data) || "A MEXC não retornou fileId do arquivo enviado.",
        );
      }

      const fileUrl = await waitForFileUrl(fileId, payload.keyType);

      const response = await api().post<unknown>(
        apiRoute.mexcSendChatMessage,
        {
          orderNo: payload.orderNo,
          content: payload.content ?? payload.file.name,
          type: payload.type,
          imageUrl: payload.type === "image" ? fileUrl : undefined,
          imageThumbUrl: payload.type === "image" ? fileUrl : undefined,
          fileUrl: payload.type === "file" ? fileUrl : undefined,
        },
        {
          params: { keyType: payload.keyType },
        },
      );

      assertWebSocketSendSucceeded(response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: (error: unknown) => {
      console.error("[MEXC_CHAT] Falha ao enviar mensagem", error);
      toast.error(error instanceof Error ? error.message : "Falha ao enviar mensagem na MEXC.");
    },
  });
};
