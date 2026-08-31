import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

type GateKeyType = "empresa" | "pessoal";

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

export type SendChatMessageGatePayload = SendGateTextPayload | SendGateImagePayload;

const fileToBase64 = (file: File) =>
  new Promise<{
    contentType: "image/jpeg" | "image/jpg" | "image/png";
    base64: string;
  }>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const value = String(reader.result ?? "");
      const match = value.match(/^data:([^;]+);base64,(.+)$/i);

      const contentType = String(match?.[1] ?? file.type ?? "image/png");

      if (
        contentType !== "image/jpeg" &&
        contentType !== "image/jpg" &&
        contentType !== "image/png"
      ) {
        reject(new Error("A Gate aceita apenas JPEG, JPG ou PNG no chat."));
        return;
      }

      resolve({
        contentType,
        base64: String(match?.[2] ?? ""),
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const pickFileKey = (value: any) => {
  return String(
    value?.data?.file_key ?? value?.data?.fileKey ?? value?.file_key ?? value?.fileKey ?? "",
  ).trim();
};

export const useSendChatMessageGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendChatMessageGatePayload) => {
      if (payload.type === "text") {
        const response = await api().post(
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

      const upload = await api().post(
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

      const response = await api().post(
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
    onError: (error) => {
      console.error("[GATE_CHAT] Falha ao enviar mensagem", error);
      toast.error("Falha ao enviar mensagem na Gate.");
    },
  });
};
