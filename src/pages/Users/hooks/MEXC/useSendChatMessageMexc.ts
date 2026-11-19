import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import type { MexcKeyType } from "./useReleaseCoinMexc";
type ChatContext = { orderNo: string; keyType: MexcKeyType };
export type SendChatMessageMexcPayload = ChatContext &
  ({ type: "text"; content: string } | { type: "image" | "file"; file: File; content?: string });
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
const errorMessage = (error: unknown): string => {
  const response = record(record(error).response);
  const body = record(response.data);
  if (response.status === 413) return "HTTP 413: o servidor ou proxy recusou o tamanho do arquivo.";
  const message = body.message ?? body.msg ?? record(error).message;
  const detail = Array.isArray(message)
    ? message.join("; ")
    : String(message || "Falha ao comunicar com a MEXC.");
  return response.status ? `HTTP ${String(response.status)}: ${detail}` : detail;
};
const assertSuccess = (value: unknown): Record<string, unknown> => {
  const response = record(value);
  if (response.code !== 0 && response.code !== "0") {
    throw new Error(String(response.msg ?? response.message ?? "Resposta inválida da MEXC."));
  }
  return record(response.data);
};
const normalizeFile = async (file: File, type: "image" | "file"): Promise<File> => {
  if (!file.size) throw new Error("O arquivo está vazio.");
  if (file.size > 20 * 1024 * 1024) throw new Error("O limite de upload desta aplicação é 20 MB.");
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const mime =
    type === "file"
      ? head.slice(0, 5).join(",") === "37,80,68,70,45"
        ? "application/pdf"
        : ""
      : head.join(",") === "137,80,78,71,13,10,26,10"
        ? "image/png"
        : head[0] === 255 && head[1] === 216 && head[2] === 255
          ? "image/jpeg"
          : "";
  if (!mime)
    throw new Error(
      type === "file" ? "Envie o contrato PDF válido." : "Envie uma imagem PNG ou JPEG válida.",
    );
  return new File([file], file.name, { type: mime });
};
const waitForFileUrl = async (fileId: string, keyType: MexcKeyType): Promise<string> => {
  for (let attempt = 0; attempt < 7; attempt++) {
    const response = await api().get<unknown>(apiRoute.mexcDownloadFile(fileId), {
      params: { keyType },
      timeout: 60_000,
    });
    const body = record(response.data);
    const code = Number(body.code);
    if (code === 80016) throw new Error("A MEXC bloqueou o arquivo na análise de segurança.");
    if (body.code !== undefined && code === 0) {
      const fileUrl = assertSuccess(body).fileUrl;
      if (typeof fileUrl === "string" && fileUrl.trim()) return fileUrl.trim();
      throw new Error("A MEXC não retornou fileUrl.");
    }
    if (code !== 80014 && code !== 80015)
      throw new Error(String(body.msg ?? body.message ?? "Falha ao consultar o arquivo."));
    if (attempt < 6)
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 10_000);
      });
  }
  throw new Error("O arquivo ainda está em análise na MEXC. Nenhuma mensagem foi enviada.");
};
export const useSendChatMessageMexc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (payload: SendChatMessageMexcPayload): Promise<unknown> => {
      let stage = "Envio da mensagem";
      try {
        const params = { keyType: payload.keyType };
        let fileUrl: string | undefined;
        if (payload.type !== "text") {
          stage = "Upload do arquivo";
          const file = await normalizeFile(payload.file, payload.type);
          const form = new FormData();
          form.append("file", file, file.name);
          const upload = await api().post<unknown>(apiRoute.mexcUploadFile, form, {
            params,
            timeout: 60_000,
            transformRequest: [
              (_body: unknown, headers) => {
                headers.delete("Content-Type");
                return form;
              },
            ],
          });
          const fileId = assertSuccess(upload.data).fileId;
          if (typeof fileId !== "string" || !fileId.trim())
            throw new Error("A MEXC não retornou fileId.");
          stage = "Análise do arquivo";
          fileUrl = await waitForFileUrl(fileId.trim(), payload.keyType);
        } else if (!payload.content.trim()) {
          throw new Error("A mensagem está vazia.");
        }
        stage = "Envio ao chat";
        const response = await api().post<unknown>(
          apiRoute.mexcSendChatMessage,
          {
            orderNo: payload.orderNo,
            content:
              payload.type === "text" ? payload.content : (payload.content ?? payload.file.name),
            type: payload.type,
            imageUrl: payload.type === "image" ? fileUrl : undefined,
            imageThumbUrl: payload.type === "image" ? fileUrl : undefined,
            fileUrl: payload.type === "file" ? fileUrl : undefined,
          },
          { params, timeout: 60_000 },
        );
        const acknowledgement = record(response.data);
        if (acknowledgement.success !== true || acknowledgement.method !== "SEND_MESSAGE") {
          throw new Error(
            String(
              acknowledgement.msg ?? acknowledgement.message ?? "A MEXC não confirmou o envio.",
            ),
          );
        }
        return response.data;
      } catch (error: unknown) {
        throw new Error(`${stage}: ${errorMessage(error)}`);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error));
    },
  });
};
