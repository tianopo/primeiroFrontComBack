import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

type SendType = "text" | "pic" | "pdf";

interface ISendChatMessageBinance {
  orderNo: string;
  content: string; // texto OU dataURL base64
  type?: SendType;
  fileName?: string;
  caption?: string;
}

export const useSendChatMessageBinance = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ISendChatMessageBinance) => {
      const result = await api().post(apiRoute.sendChatMessageBinance, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
