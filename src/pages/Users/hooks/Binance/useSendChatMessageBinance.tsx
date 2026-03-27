import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

interface ISendChatMessageBinance {
  orderNo: string;
  content: string;
  type?: "text" | "pic";
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
