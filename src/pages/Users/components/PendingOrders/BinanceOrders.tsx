import { ArrowCircleRight, Copy, ImageSquare } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { useCheckAndReleaseCoinBinance } from "../../hooks/Binance/useCheckAndReleaseCoinBinance";
import { useSendChatMessageBinance } from "../../hooks/Binance/useSendChatMessageBinance";
import { OrderMessages } from "../OrderMessages";

type BinanceMessage = {
  orderNo: string;
  content: string;
  status: string;
  createTime: number;
  self: boolean;
  fromNickName: string;
};

type CounterpartyInfo = {
  name: string;
  document: string;
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

  counterparty: CounterpartyInfo;
};

type BinanceOrderItem = {
  order: BinanceOrder;
  messages: BinanceMessage[];
  messagesTotal: number;

  endToEnd?: string;
  pixInStatement?: any;
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

export const BinanceOrders = ({
  orders,
  setForm,
  setInitialRegisterData,
}: {
  orders: BinanceOrderItem[];
  setForm: Dispatch<SetStateAction<boolean>>;
  setInitialRegisterData: Dispatch<
    SetStateAction<{
      apelido: string;
      nome: string;
      exchange: string;
    }>
  >;
}) => {
  if (!Array.isArray(orders) || orders.length === 0) return <p>Sem ordens Binance.</p>;
  const { mutate, isPending } = useCheckAndReleaseCoinBinance();

  return (
    <div className="flex flex-wrap gap-2">
      {orders.map((item) => {
        const order = item?.order;
        const messages = Array.isArray(item?.messages) ? item.messages : [];
        const messagesTotal = Number(item?.messagesTotal ?? 0);
        const endToEnd = String((item as any)?.endToEnd ?? "").trim();

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
                const tradeType = String(order?.tradeType ?? "").toUpperCase();
                const apelido =
                  tradeType === "SELL"
                    ? String(order?.buyerNickname ?? "").trim() // SELL => comprador
                    : String(order?.sellerNickname ?? "").trim(); // BUY  => vendedor

                const nome = String(order?.counterparty?.name ?? "").trim();

                setInitialRegisterData({
                  apelido,
                  nome,
                  exchange: "Binance https://www.binance.com/ CN",
                });

                setForm(true);

                // opcional: se quiser manter copiar para clipboard também
                // if (apelido) navigator.clipboard.writeText(apelido);
              }}
              title="Copiar para cadastro"
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
            {order?.counterparty?.document && (
              <>
                <p>
                  <strong>Nome:</strong> {order?.counterparty?.name}
                </p>
                <p>
                  <strong>Documento:</strong> {order?.counterparty?.document}
                </p>
              </>
            )}
            <p>
              <strong>Vendedor:</strong> {order?.sellerNickname || "N/A"}
            </p>
            <p>
              <strong>Comprador:</strong> {order?.buyerNickname || "N/A"}
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
            {endToEnd && (
              <p>
                <strong>EndToEnd:</strong> {endToEnd}
              </p>
            )}
            <p>
              <strong>Mensagens:</strong> {messagesTotal}
            </p>

            <OrderMessages messages={normalizedForOrderMessages} />

            <ChatBox />
            <Button
              disabled={
                isPending ||
                order.orderStatus !== 2 ||
                order.counterparty.document.length === 0 ||
                messagesTotal === 0 ||
                String(order?.tradeType ?? "").toUpperCase() === "BUY" ||
                normalizedForOrderMessages
                  ?.slice(0)
                  .reverse()
                  .slice(-10)
                  .some((msg: any) =>
                    [
                      "anular ordem",
                      "CRYPTOTECH: anular ordem",
                      "CRYPTOTECH: Anular ordem",
                    ].includes(msg.message),
                  )
              }
              onClick={() => mutate({ orderNumber: orderId })}
            >
              {mapOrderStatus(order?.orderStatus)}
            </Button>
          </div>
        );
      })}
    </div>
  );
};
