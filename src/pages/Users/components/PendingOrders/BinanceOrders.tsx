import { Copy } from "@phosphor-icons/react";
import { Button } from "src/components/Buttons/Button";
import { ChatBox } from "../ChatBox";
import { OrderMessages } from "../OrderMessages";

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

        // Normaliza mensagens pro OrderMessages (Bybit usa msg.message)
        const normalizedForOrderMessages = messages.map((m: any) => ({
          ...m,
          message: m?.content ?? "",
          time: m?.createTime,
        }));

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

            {/* mensagens */}
            <OrderMessages messages={normalizedForOrderMessages} />

            {/* chatbox (envio de msg) */}
            {/* <ChatBox orderId={orderId} keyType={"binance" as any} /> */}

            <Button disabled={!orderId} onClick={() => navigator.clipboard.writeText(orderId)}>
              Copiar OrderNo
            </Button>
          </div>
        );
      })}
    </div>
  );
};
