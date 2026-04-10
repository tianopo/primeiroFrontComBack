import { ArrowCircleRight, Copy, ImageSquare } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { generateSingleReceipt } from "src/pages/Home/config/handleReceipt";
import { useCheckAndReleaseCoinBinance } from "../../hooks/Binance/useCheckAndReleaseCoinBinance";
import { useMarkOrderAsPaidBinance } from "../../hooks/Binance/useMarkOrderAsPaidBinance";
import { useSendChatMessageBinance } from "../../hooks/Binance/useSendChatMessageBinance";
import { StatementRedisPanel } from "../Corpx/StatementRedisPanel";
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

type ConfirmAction = "markPaid" | "release";

export const BinanceOrders = ({
  orders,
  acesso,
  setForm,
  setInitialRegisterData,
}: {
  orders: BinanceOrderItem[];
  acesso: string;
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

  const { mutate: releaseMutate, isPending: isReleasePending } = useCheckAndReleaseCoinBinance();
  const { mutate: markPaidMutate, isPending: isMarkPaidPending } = useMarkOrderAsPaidBinance();
  const { mutate: sendChatBinance, isPending: isChatPending } = useSendChatMessageBinance();

  // ✅ Modal (igual Bybit)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>("markPaid");
  const [confirmPayload, setConfirmPayload] = useState<{
    orderId: string;
    advNo?: string;
    text: string;
    endToEnd?: string;
    order: BinanceOrder; // ✅ NOVO
  } | null>(null);

  const isPendingAny = isReleasePending || isMarkPaidPending || isChatPending;
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmPayload(null);
  };

  const openConfirm = (params: {
    action: ConfirmAction;
    orderId: string;
    advNo?: string;
    text: string;
    endToEnd?: string;
    order: BinanceOrder; // ✅ NOVO
  }) => {
    setConfirmAction(params.action);
    setConfirmPayload({
      orderId: params.orderId,
      advNo: params.advNo,
      text: params.text,
      endToEnd: params.endToEnd,
      order: params.order,
    });
    setConfirmOpen(true);
  };

  const sendBinanceFile = (payload: {
    orderNo: string;
    content: string;
    type: "pic" | "pdf";
    fileName?: string;
  }) =>
    new Promise<void>((resolve, reject) => {
      sendChatBinance(payload, {
        onSuccess: () => resolve(),
        onError: (e) => reject(e),
      });
    });

  const mapBinanceToReceiptItem = (o: BinanceOrder, endToEnd?: string) => {
    const tradeType = String(o.tradeType ?? "").toUpperCase();
    const isBuy = tradeType === "BUY";

    const qty = Number(String(o.amount ?? "0").replace(",", "."));
    const total = Number(String(o.totalPrice ?? "0").replace(",", "."));
    const unitPrice = qty > 0 && Number.isFinite(total) ? String((total / qty).toFixed(2)) : "0";

    return {
      id: o.orderNumber,
      formattedDate: new Date(Number(o.createTime ?? Date.now())).toLocaleString("pt-BR"),
      targetNickName: isBuy ? o.sellerNickname : o.buyerNickname,

      // nomes: a função antiga usa buyerRealName, então jogamos o nome da contraparte aqui
      buyerRealName: o.counterparty?.name ?? "Não informado",
      sellerRealName: o.counterparty?.name ?? "Não informado",

      exchange: "Binance",
      tokenId: o.asset,
      currencyId: o.fiat,
      side: isBuy ? 0 : 1,

      // no recibo: "Valor" deve ser FIAT
      amount: String(o.totalPrice ?? ""),
      // "Preço unitário"
      price: unitPrice,
      // "Quantidade" deve ser o token
      notifyTokenQuantity: String(o.amount ?? ""),

      document: o.counterparty?.document ?? "documento não disponível",

      pixInStatement: endToEnd
        ? {
            originalEndToEnd: endToEnd,
            timestamp: new Date().toLocaleString("pt-BR"),
          }
        : null,
    };
  };
  console.log(orders);
  const handleConfirm = async () => {
    if (!confirmPayload) return;

    const orderId = confirmPayload.orderId;
    const order = confirmPayload.order;

    // gera recibo (imagem)
    const receiptItem = mapBinanceToReceiptItem(order, confirmPayload.endToEnd);
    const base64Image = await generateSingleReceipt(receiptItem);
    if (!base64Image) return;

    // ======== BUY (markPaid): marca pago -> depois envia recibo ========
    if (confirmAction === "markPaid") {
      markPaidMutate(
        { orderNumber: orderId, advNo: String(confirmPayload.advNo ?? "") },
        {
          onSuccess: async () => {
            try {
              await sendBinanceFile({
                orderNo: orderId,
                content: base64Image,
                type: "pic",
                fileName: `recibo-${orderId}.png`,
              });
            } finally {
              closeConfirm();
            }
          },
          onError: () => closeConfirm(),
        },
      );
      return;
    }

    // ======== SELL (release): libera -> depois envia recibo ========
    releaseMutate(
      { orderNumber: orderId },
      {
        onSuccess: async () => {
          try {
            await sendBinanceFile({
              orderNo: orderId,
              content: base64Image,
              type: "pic",
              fileName: `recibo-${orderId}.png`,
            });
          } finally {
            closeConfirm();
          }
        },
        onError: () => closeConfirm(),
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {orders.map((item) => {
          const order = item?.order;
          const messages = Array.isArray(item?.messages) ? item.messages : [];
          const messagesTotal = Number(item?.messagesTotal ?? 0);

          const orderId = String(order?.orderNumber ?? "");
          if (!orderId) return null;

          const endToEnd =
            String((item as any)?.endToEnd ?? "").trim() ||
            String(item?.pixInStatement?.originalEndToEnd ?? "").trim();

          const normalizedForOrderMessages = messages.map((m: any) => ({
            ...m,
            message: m?.content ?? "",
            time: m?.createTime,
          }));

          const ChatBox = () => {
            const [message, setMessage] = useState("");

            const imageInputRef = useRef<HTMLInputElement>(null);

            const handleSend = () => {
              const text = message.trim();
              if (!text || isChatPending) return;

              setMessage("");

              sendChatBinance(
                { orderNo: orderId, content: text, type: "text" },
                {
                  onError: () => setMessage(text),
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
              try {
                const base64 = await fileToBase64(file);

                sendChatBinance({
                  orderNo: orderId,
                  content: base64,
                  type: "pic",
                  fileName: file.name,
                });
              } catch (err) {
                console.error("Erro ao enviar arquivo:", err);
              }
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
                    if (e.key === "Enter" && !isChatPending && message.trim()) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 rounded border-0 px-2 text-12 focus:outline-none"
                />

                <button
                  className="rounded-6 bg-blue-500 px-2 py-1.5 text-white hover:opacity-80 disabled:cursor-not-allowed"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isChatPending}
                  title="Enviar imagem"
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
                    e.target.value = "";
                    if (file) handleFileSend(file);
                  }}
                />

                <button
                  className="rounded-6 bg-primary px-2 py-1.5 text-white hover:opacity-80 disabled:cursor-not-allowed"
                  onClick={handleSend}
                  disabled={isChatPending || !message.trim()}
                >
                  {isChatPending ? (
                    "Enviando..."
                  ) : (
                    <ArrowCircleRight color="white" weight="duotone" width={24} height={24} />
                  )}
                </button>
              </div>
            );
          };

          const tradeType = String(order?.tradeType ?? "").toUpperCase();
          const isBuy = tradeType === "BUY";
          const isPendingAny = isReleasePending || isMarkPaidPending;

          const modalText = isBuy
            ? `Você confirma que já efetuou o pagamento e deseja marcar como PAGO na Binance?\n\nOrdem: ${orderId}\nVendedor: ${
                order?.sellerNickname ?? "-"
              }\nValor: ${order?.totalPrice ?? "-"} ${order?.fiat ?? ""}`
            : `Você confirma que deseja liberar os ativos na Binance?\n\nOrdem: ${orderId}\nComprador: ${
                order?.buyerNickname ?? "-"
              }\nQuantidade: ${order?.amount ?? "-"} ${order?.asset ?? ""}`;

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
                      ? String(order?.buyerNickname ?? "").trim()
                      : String(order?.sellerNickname ?? "").trim();

                  const nome = String(order?.counterparty?.name ?? "").trim();

                  setInitialRegisterData({
                    apelido,
                    nome,
                    exchange: "Binance https://www.binance.com/ CN",
                  });

                  setForm(true);
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
                  isPendingAny ||
                  // ✅ SELL precisa estar 2 (pago aguardando liberação)
                  // ✅ BUY precisa estar 1 (aguardando pagamento) para "marcar como pago"
                  (isBuy ? order.orderStatus !== 1 : order.orderStatus !== 2) ||
                  order.counterparty.document.length === 0 ||
                  acesso !== "Master" ||
                  messagesTotal === 0 ||
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
                onClick={() => {
                  openConfirm({
                    action: isBuy ? "markPaid" : "release",
                    orderId,
                    advNo: String(order?.advNo ?? ""),
                    text: modalText,
                    endToEnd: endToEnd || undefined,
                    order, // ✅ aqui
                  });
                }}
              >
                {mapOrderStatus(order?.orderStatus)}
              </Button>
            </div>
          );
        })}
      </div>

      {confirmOpen && confirmPayload && (
        <ConfirmationModalButton
          text={confirmPayload.text}
          onConfirm={handleConfirm}
          onCancel={closeConfirm}
          showExtra={!!confirmPayload.endToEnd}
          extra={
            confirmPayload.endToEnd ? (
              <StatementRedisPanel autoSelectEndToEnd={confirmPayload.endToEnd} />
            ) : undefined
          }
        />
      )}
    </>
  );
};
