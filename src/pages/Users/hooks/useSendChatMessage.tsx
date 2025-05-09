import { useMutation } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
import { responseSuccess, responseError } from "src/config/responseErrors";
import { AxiosError } from "axios";

interface SendChatMessageParams {
  message: string;
  contentType: "str" | "pic" | "pdf" | "video";
  orderId: string;
}

export const useSendChatMessage = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SendChatMessageParams) => {
      const result = await api().post(apiRoute.sendChatMessage, data);
      return result.data;
    },
    onSuccess: () => responseSuccess("Recibo gerado com sucesso"),
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
