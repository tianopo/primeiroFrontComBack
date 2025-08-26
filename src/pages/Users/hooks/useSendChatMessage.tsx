import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { KeyType } from "../components/PendingOrders";

interface ISendChatMessage {
  message: string;
  contentType: "str" | "pic" | "pdf" | "video";
  orderId: string;
  keyType: KeyType;
}

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ISendChatMessage) => {
      const result = await api().post(apiRoute.sendChatMessage, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] }); // 🔄 força refetch
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
