import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { KeyType } from "../components/PendingOrders";

interface ISendChatMessageBybit {
  message: string;
  contentType: "str" | "pic" | "pdf" | "video";
  orderId: string;
  keyType: KeyType;
}

export const useSendChatMessageBybit = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ISendChatMessageBybit) => {
      const result = await api().post(apiRoute.sendChatMessageBybit, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] }); // 🔄 força refetch
    },
    onError: (err: AxiosError) => responseError(err),
  });

  return { mutate, isPending };
};
