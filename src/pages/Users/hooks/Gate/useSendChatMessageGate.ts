import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
export type GateKeyType = "empresa" | "pessoal";
type ImageMime = "image/jpeg" | "image/png";
type ChatContext = { txid: string; keyType: GateKeyType };
export type SendChatMessageGatePayload = ChatContext &
  ({ type: "text"; message: string } | { type: "image"; file: File });
const MAX_BASE64_BYTES = 20_000_000;
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
const errorMessage = (error: unknown): string => {
  const response = record(record(error).response);
  const body = record(response.data);
  if (response.status === 413)
    return "HTTP 413: o servidor ou proxy recusou o tamanho da imagem. Confira o limite do JSON no backend.";
  const message = body.message ?? body.msg ?? record(error).message;
  const detail = Array.isArray(message)
    ? message.join("; ")
    : String(message || "Falha ao comunicar com a Gate.");
  return response.status ? `HTTP ${String(response.status)}: ${detail}` : detail;
};
const assertSuccess = (value: unknown): Record<string, unknown> => {
  const response = record(value);
  if (response.code !== 0 && response.code !== "0") {
    throw new Error(String(response.message ?? response.msg ?? "Resposta inválida da Gate."));
  }
  return record(response.data);
};
const imageToBase64 = async (file: File): Promise<{ contentType: ImageMime; base64: string }> => {
  if (!file.size) throw new Error("A imagem está vazia.");
  if (4 * Math.ceil(file.size / 3) > MAX_BASE64_BYTES) {
    throw new Error(
      "A Gate limita o Base64 a 20 MB. Escolha uma imagem de até aproximadamente 15 MB.",
    );
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType: ImageMime | undefined =
    bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
      ? "image/png"
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        ? "image/jpeg"
        : undefined;
  if (!contentType) throw new Error("Envie uma imagem PNG ou JPEG válida.");
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return { contentType, base64: btoa(binary) };
};
export const useSendChatMessageGate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (payload: SendChatMessageGatePayload): Promise<unknown> => {
      let stage = "Envio da mensagem";
      try {
        const params = { keyType: payload.keyType };
        let message: string;
        let type: 0 | 1;
        if (payload.type === "image") {
          stage = "Upload da imagem";
          const image = await imageToBase64(payload.file);
          const upload = await api().post<unknown>(
            apiRoute.gateUploadChat,
            {
              image_content_type: image.contentType,
              base64_img: image.base64,
            },
            { params, timeout: 60_000 },
          );
          const fileKey = assertSuccess(upload.data).file_key;
          if (typeof fileKey !== "string" || !fileKey.trim()) {
            throw new Error("A Gate não retornou file_key.");
          }
          message = fileKey.trim();
          type = 1;
        } else {
          message = payload.message.trim();
          if (!message || message.length > 500)
            throw new Error("A mensagem deve ter entre 1 e 500 caracteres.");
          type = 0;
        }
        stage = "Envio ao chat";
        const response = await api().post<unknown>(
          apiRoute.gateSendChat(payload.txid),
          { message, type },
          { params, timeout: 60_000 },
        );
        const data = assertSuccess(response.data);
        if (Number(data.risk_type) === 1)
          toast.warning(String(data.toast_msg || "A Gate sinalizou um risco nesta mensagem."));
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
