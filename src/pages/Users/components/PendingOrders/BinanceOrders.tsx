import { ArrowCircleRight, Copy, ImageSquare } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { FlexRow } from "src/components/Flex/FlexRow";
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
  price: string;
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

  // ✅ vem do backend (não muda backend; só tipa no front)
  paymentDetails?: {
    buyerName?: string;
    sellerName?: string;
    price: string;
    paymentFieldValues: string[];
  };
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>("markPaid");
  const [confirmPayload, setConfirmPayload] = useState<{
    orderId: string;
    advNo?: string;
    text: string;
    endToEnd?: string;
    order: BinanceOrder;
  } | null>(null);

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
    order: BinanceOrder;
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

  const sendBinancePic = (payload: { orderNo: string; content: string; fileName?: string }) =>
    new Promise<void>((resolve, reject) => {
      sendChatBinance(
        {
          orderNo: payload.orderNo,
          content: payload.content,
          type: "pic",
          fileName: payload.fileName,
        },
        {
          onSuccess: () => resolve(),
          onError: (e) => reject(e),
        },
      );
    });

  // ✅ Nome exibido na UI (não altera backend)
  const getDisplayName = (o: BinanceOrder) => {
    const tradeType = String(o?.tradeType ?? "").toUpperCase();
    const isBuy = tradeType === "BUY";

    const paymentDetails = Array.isArray(o?.paymentDetails) ? o.paymentDetails : [];
    const receiverName = String(paymentDetails?.[0]?.sellerName ?? "").trim(); // BUY -> quem recebe
    const registeredName = String(o?.counterparty?.name ?? "").trim(); // do cadastro
    const payerFallback = String(o?.buyerNickname ?? "").trim(); // SELL -> quem paga (fallback)

    if (isBuy) {
      // ✅ BUY: mostrar nome de quem recebe (payee). Se não vier, cai no sellerNickname/cadastro.
      return (
        receiverName || String(o?.sellerNickname ?? "").trim() || registeredName || "Não informado"
      );
    }

    // ✅ SELL: mostrar nome de quem paga (buyer). Se cadastrado, usa cadastro; senão nickname.
    return registeredName || payerFallback || "Não informado";
  };

  const mapBinanceToReceiptItem = (o: BinanceOrder, endToEnd?: string) => {
    const tradeType = String(o.tradeType ?? "").toUpperCase();
    const isBuy = tradeType === "BUY";

    const qty = Number(String(o.amount ?? "0").replace(",", "."));
    const total = Number(String(o.totalPrice ?? "0").replace(",", "."));
    const unitPrice = qty > 0 && Number.isFinite(total) ? String((total / qty).toFixed(2)) : "0";

    const displayName = getDisplayName(o);

    return {
      id: o.orderNumber,
      formattedDate: new Date(Number(o.createTime ?? Date.now())).toLocaleString("pt-BR"),
      targetNickName: isBuy ? o.sellerNickname : o.buyerNickname,

      // recibo usa buyerRealName/sellerRealName no canvas; então preenche com o nome "correto"
      buyerRealName: displayName,
      sellerRealName: displayName,

      exchange: "Binance",
      tokenId: o.asset,
      currencyId: o.fiat,
      side: isBuy ? 0 : 1,

      amount: String(o.totalPrice ?? ""),
      price: unitPrice,
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

  const handleConfirm = async () => {
    if (!confirmPayload) return;

    const orderId = confirmPayload.orderId;
    const order = confirmPayload.order;

    const receiptItem = mapBinanceToReceiptItem(order, confirmPayload.endToEnd);
    const base64Image = await generateSingleReceipt(receiptItem);
    if (!base64Image) return;

    if (confirmAction === "markPaid") {
      markPaidMutate(
        { orderNumber: orderId, advNo: String(confirmPayload.advNo ?? "") },
        {
          onSuccess: async () => {
            closeConfirm();
            try {
              await sendBinancePic({
                orderNo: orderId,
                content: base64Image,
                fileName: `recibo-${orderId}.png`,
              });
            } catch {}
          },
          onError: () => closeConfirm(),
        },
      );
      return;
    }

    releaseMutate(
      { orderNumber: orderId },
      {
        onSuccess: async () => {
          closeConfirm();
          try {
            await sendBinancePic({
              orderNo: orderId,
              content: base64Image,
              fileName: `recibo-${orderId}.png`,
            });
          } catch {}
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

          const tradeType = String(order?.tradeType ?? "").toUpperCase();
          const isBuy = tradeType === "BUY";
          const fieldValues = Array.isArray((order as any)?.paymentDetails.paymentFieldValues)
            ? (order as any).paymentDetails.paymentFieldValues
            : [];

          const isPendingAny = isReleasePending || isMarkPaidPending;

          // ✅ payment terms vindo do backend (no order)
          const displayName = getDisplayName(order);

          const modalText = isBuy
            ? `Você confirma que já efetuou o pagamento e deseja marcar como PAGO na Binance?\n\nOrdem: ${orderId}\nRecebedor: ${displayName}\nValor: ${order?.totalPrice ?? "-"} ${order?.fiat ?? ""}`
            : `Você confirma que deseja liberar os ativos na Binance?\n\nOrdem: ${orderId}\nPagador: ${displayName}\nQuantidade: ${order?.amount ?? "-"} ${order?.asset ?? ""}`;

          const ChatBox = () => {
            const [message, setMessage] = useState("");
            const imageInputRef = useRef<HTMLInputElement>(null);

            const handleSend = () => {
              const text = message.trim();
              if (!text || isChatPending) return;

              setMessage("");

              sendChatBinance(
                { orderNo: orderId, content: text, type: "text" },
                { onError: () => setMessage(text) },
              );
            };

            const fileToBase64 = (file: File): Promise<string> =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
              });

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
          return (
            <div
              key={orderId}
              className="relative flex w-fit flex-col gap-0.5 rounded-xl border border-gray-200 p-4 shadow"
            >
              {isBuy && fieldValues.length > 0 && (
                <div className="mt-2 rounded-xl border border-gray-200 p-3">
                  <p className="mb-2 text-14 font-semibold">Dados PIX</p>

                  <div className="flex flex-col gap-1">
                    {fieldValues.map((v: string, idx: number) => (
                      <p key={`${v}-${idx}`} className="text-13">
                        {v}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="absolute right-2 top-2 rounded-6 border border-gray-200 bg-white p-2 hover:bg-gray-100 hover:opacity-80"
                onClick={() => {
                  const apelido = isBuy
                    ? String(order?.sellerNickname ?? "").trim()
                    : String(order?.buyerNickname ?? "").trim();

                  setInitialRegisterData({
                    apelido,
                    nome: order.counterparty.name,
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

              <p>
                <strong>Nome:</strong> {order.counterparty.name}
              </p>
              {String(order?.counterparty?.document ?? "").trim() && (
                <p>
                  <strong>Documento:</strong> {order.counterparty.document}
                </p>
              )}
              <p>
                <strong>Apelido:</strong> {order?.buyerNickname || "N/A"}
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
                <strong>Preço:</strong> {order?.price}
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
                    order,
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
