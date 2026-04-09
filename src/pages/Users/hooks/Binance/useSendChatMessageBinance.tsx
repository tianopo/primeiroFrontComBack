import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

type SendType = "text" | "pic" | "pdf";

interface ISendChatMessageBinance {
  orderNo: string;
  content: string;
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

    // ✅ otimista: aparece instantâneo no OrderMessages
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["pending-orders"] });

      const previous = queryClient.getQueryData<any>(["pending-orders"]);

      const now = Date.now();
      const optimisticMessage = {
        orderNo: vars.orderNo,
        content:
          vars.type === "text"
            ? vars.content
            : vars.type === "pdf"
              ? `📄 ${vars.fileName ?? "PDF"} (enviando...)`
              : `🖼️ ${vars.fileName ?? "Imagem"} (enviando...)`,
        status: "optimistic",
        createTime: now,
        self: true,
        fromNickName: "Você",
      };

      const patch = (arr: any[]) =>
        arr.map((item: any) => {
          const id = String(item?.order?.orderNumber ?? item?.orderNo ?? "");
          if (id !== String(vars.orderNo)) return item;

          const oldMsgs = Array.isArray(item?.messages) ? item.messages : [];
          const oldTotal = Number(item?.messagesTotal ?? oldMsgs.length);

          return {
            ...item,
            messages: [...oldMsgs, optimisticMessage],
            messagesTotal: oldTotal + 1,
          };
        });

      queryClient.setQueryData(["pending-orders"], (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) return patch(old);
        if (Array.isArray(old?.orders)) return { ...old, orders: patch(old.orders) };
        return old;
      });

      return { previous };
    },

    onError: (err: AxiosError, _vars, ctx: any) => {
      // ✅ rollback se falhar
      if (ctx?.previous) queryClient.setQueryData(["pending-orders"], ctx.previous);
      responseError(err);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
  });

  return { mutate, isPending };
};
