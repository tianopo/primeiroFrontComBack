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

const getData = <T>(value: any, key: string): T | undefined => {
  return value?.data?.[key] ?? value?.[key];
};

export const useSendChatMessageMexc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendChatMessageMexcPayload) => {
      if (payload.type === "text") {
        const result = await api().post(
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

        return result.data;
      }

      const form = new FormData();
      form.append("file", payload.file);

      const upload = await api().post(apiRoute.mexcUploadFile, form, {
        params: { keyType: payload.keyType },
      });

      const fileId = getData<string>(upload.data, "fileId");

      if (!fileId) {
        throw new Error("fileId não retornado pela MEXC.");
      }

      const download = await api().get(apiRoute.mexcDownloadFile(fileId), {
        params: { keyType: payload.keyType },
      });

      const fileUrl = getData<string>(download.data, "fileUrl");

      if (!fileUrl) {
        throw new Error("fileUrl não retornado pela MEXC.");
      }

      const result = await api().post(
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

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: () => {
      toast.error("Falha ao enviar mensagem na MEXC.");
    },
  });
};
