import { ArrowCircleRight, Copy, ImageSquare } from "@phosphor-icons/react";
import { Button } from "src/components/Buttons/Button";
import { OrderMessages } from "../OrderMessages";
import { useState, useRef } from "react";
import { useAccessControl } from "src/routes/context/AccessControl";
import { useSendChatMessageBinance } from "../../hooks/useSendChatMessageBinance";

type BinanceMessage = {
  orderNo: string;
  content: string;
  status: string;
  createTime: number;
  self: boolean;
  fromNickName: string;
};

type BinanceOrder = {
  orderNumber: string;
  advNo: string;
  tradeType: string; // BUY | SELL
  asset: string; // USDT | BTC | BNB | ETH
  fiat: string;
  amount: string;
  totalPrice: string;
  orderStatus: number; // 1..4
  createTime: number;

  sellerNickname: string;
  buyerNickname: string;

  commissionRate?: string;
  commission?: string;
  takerCommissionRate?: string;
  takerCommission?: string;

  chatUnreadCount?: number;
};

type BinanceOrderItem = {
  order: BinanceOrder;
  messages: BinanceMessage[];
  messagesTotal: number;
};

function formatDateMs(ms?: number) {
  if (!ms || !Number.isFinite(ms)) return "N/A";
  try {
    return new Date(ms).toLocaleString("pt-BR");
  } catch {
    return "N/A";
  }
}

function mapOrderStatus(status?: number) {
  switch (Number(status)) {
    case 1:
      return "Aguardando pagamento";
    case 2:
      return "Pago / Aguardando liberação";
    case 3:
      return "Processando / Disputa";
    case 4:
      return "Concluída";
    default:
      return String(status ?? "N/A");
  }
}

export const BinanceOrders = ({ orders }: { orders: BinanceOrderItem[] }) => {
  if (!Array.isArray(orders) || orders.length === 0) return <p>Sem ordens Binance.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {orders.map((item) => {
        const order = item?.order;
        const messages = Array.isArray(item?.messages) ? item.messages : [];
        const messagesTotal = Number(item?.messagesTotal ?? 0);

        const orderId = String(order?.orderNumber ?? "");
        if (!orderId) return null;

        const normalizedForOrderMessages = messages.map((m: any) => ({
          ...m,
          message: m?.content ?? "",
          time: m?.createTime,
        }));

        const ChatBox = () => {
          const [message, setMessage] = useState("");
          const { mutate: sendChatMessage, isPending } = useSendChatMessageBinance();

          const imageInputRef = useRef<HTMLInputElement>(null);

          const handleSend = () => {
            if (!message.trim()) return;
            sendChatMessage(
              { orderNo: orderId, content: message.trim(), type: "text" },
              {
                onSuccess: () => setMessage(""),
              },
            );
          };

          const fileToBase64 = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (error) => reject(error);
            });
          };

          const handleFileSend = async (file: File) => {
            const base64 = await fileToBase64(file);
            sendChatMessage({ orderNo: orderId, content: base64, type: "pic" });
          };

          return (
            <div className="my-2 flex items-center gap-2 rounded-6 border-1 border-gray-300 p-1">
              <input
                id={`chat-input-binance-${orderId}`}
                name={`chat-input-binance-${orderId}`}
                type="text"
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isPending && message.trim()) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 rounded border-0 px-2 text-12 focus:outline-none"
              />

              <button
                className="rounded-6 bg-blue-500 px-2 py-1.5 text-white hover:opacity-80"
                onClick={() => imageInputRef.current?.click()}
                disabled={isPending}
              >
                <ImageSquare size={22} weight="duotone" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSend(file);
                }}
              />

              <button
                className="rounded-6 bg-primary px-2 py-1.5 text-white hover:opacity-80 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={isPending || !message.trim()}
              >
                {isPending ? (
                  "Enviando..."
                ) : (
                  <ArrowCircleRight color="white" weight="duotone" width={24} height={24} />
                )}
              </button>
            </div>
          );
        };

        return (
          <div
            key={orderId}
            className="relative flex w-fit flex-col gap-0.5 rounded-xl border border-gray-200 p-4 shadow"
          >
            <button
              className="absolute right-2 top-2 rounded-6 border border-gray-200 bg-white p-2 hover:bg-gray-100 hover:opacity-80"
              onClick={() => {
                const textToCopy = (order?.buyerNickname || order?.sellerNickname || "").trim();
                if (textToCopy) navigator.clipboard.writeText(textToCopy);
              }}
              title="Copiar apelido"
            >
              <Copy width={20} height={20} weight="duotone" />
            </button>

            <p>
              <strong>Order No:</strong> {orderId}
            </p>
            <p>
              <strong>Adv No:</strong> {order?.advNo || "N/A"}
            </p>
            <p>
              <strong>Data:</strong> {formatDateMs(order?.createTime)}
            </p>
            <p>
              <strong>Status:</strong> {mapOrderStatus(order?.orderStatus)}
              {Number(order?.chatUnreadCount ?? 0) > 0 && (
                <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-12 font-semibold text-red-700">
                  {order.chatUnreadCount} não lidas
                </span>
              )}
            </p>
            <p>
              <strong>Tipo:</strong> {String(order?.tradeType || "N/A")}
            </p>
            <p>
              <strong>Ativo:</strong> {order?.asset || "N/A"}
            </p>
            <p>
              <strong>Quantidade:</strong> {order?.amount || "N/A"} {order?.asset || ""}
            </p>
            <p>
              <strong>Total:</strong> {order?.totalPrice || "N/A"} {order?.fiat || ""}
            </p>
            <p>
              <strong>Vendedor:</strong> {order?.sellerNickname || "N/A"}
            </p>
            <p>
              <strong>Comprador:</strong> {order?.buyerNickname || "N/A"}
            </p>
            <p>
              <strong>Comissão:</strong> {order?.commission || "0"} ({order?.commissionRate || "0"})
            </p>
            <p>
              <strong>Taker:</strong> {order?.takerCommission || "0"} (
              {order?.takerCommissionRate || "0"})
            </p>
            <p>
              <strong>Mensagens:</strong> {messagesTotal}
            </p>

            <OrderMessages messages={normalizedForOrderMessages} />

            <ChatBox />
          </div>
        );
      })}
    </div>
  );
};
