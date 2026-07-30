import { Copy } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { generateSingleReceipt } from "src/pages/Home/config/handleReceipt";
import { useAccessControl } from "src/routes/context/AccessControl";
import { useListPendingOrders } from "../hooks/Bybit/useListPendingOrders";
import { useMarkOrderAsPaidBybit } from "../hooks/Bybit/useMarkOrderAsPaidBybit";
import { useReleaseAssets } from "../hooks/Bybit/useReleaseAssets";
import { useSendChatMessageBybit } from "../hooks/Bybit/useSendChatMessageBybit";
import { confirmContract } from "../utils/confirmContract";
import { toBRDate } from "../utils/helpers";
import { ChatBox } from "./ChatBox";
import { StatementRedisPanel } from "./Gowd/Extrato/StatementRedisPanel";
import { PixToolInitialValues, PixToolModal } from "./Gowd/Pix/PixToolModal";
import { OrderMessages } from "./OrderMessages";
import { CompliancePopover } from "./PendingOrders/CompliancePopover";
import { PaymentTermsBox } from "./PendingOrders/PaymentTermsBox";

interface IPendingOrders {
  setForm: Dispatch<SetStateAction<boolean>>;
  setInitialRegisterData: Dispatch<
    SetStateAction<{ apelido: string; nome: string; exchange: string }>
  >;
}

export type KeyType = "empresa" | "pessoal";
type TabKey = "bybitCryptotech" | "bybitPessoal";

type TabConfig = { tab: TabKey; keyType: KeyType; label: string };

const TABS: TabConfig[] = [
  { tab: "bybitCryptotech", keyType: "empresa", label: "Bybit E" },
  { tab: "bybitPessoal", keyType: "pessoal", label: "Bybit P" },
];

const onlyDigits = (v?: string) => String(v ?? "").replace(/\D/g, "");
const isCpfCnpj = (v?: string) => [11, 14].includes(onlyDigits(v).length);
const brl = (v: unknown) => String(v ?? "").replace(".", ",");
const getEndToEnd = (value: any) => String(value?.originalEndToEnd ?? value?.endToEndId ?? "");
const isBotCancel = (m: any) =>
  [
    "You have a new appeal. Please negotiate and communicate with the other party within the valid period.",
    "anular ordem",
    "CRYPTOTECH: anular ordem",
    "CRYPTOTECH: Anular ordem",
  ].includes(String(m?.mensagem ?? m?.message ?? ""));

const legacyBybitOrder = (o: any) => ({
  ...o,
  exchange: "Bybit",
  amount: o?.valor,
  currencyId: o?.moeda,
  tokenId: o?.token,
  price: o?.preco,
  notifyTokenQuantity: o?.quantidade,
  targetNickName: o?.apelido,
  targetUserId: o?.uid,
  sellerRealName: o?.vendedor,
  buyerRealName: o?.comprador,
  formattedDate: o?.data,
  document: o?.documento,
  paymentTerms: o?.pagamento ?? [],
  pixInStatement: o?.endtoend,
  messages: o?.mensagens ?? [],
});

const getSavedTab = (): TabKey => {
  if (typeof window === "undefined") return "bybitCryptotech";

  const stored = window.localStorage.getItem("pendingOrdersActiveTab");

  if (stored === "bybitPessoal" || stored === "pessoal") return "bybitPessoal";
  return "bybitCryptotech";
};

const complianceState = (c: any) => {
  const status = String(c?.status ?? "").toUpperCase();

  if (c?.blocked || status === "BLOCKED")
    return [
      "bg-red-50 border-red-300 shadow-red-100",
      "bg-red-100 text-red-800 border border-red-300",
      "Compliance bloqueado",
    ];
  if (status === "RESTRICTED")
    return [
      "bg-amber-50 border-amber-300 shadow-amber-100",
      "bg-amber-100 text-amber-800 border border-amber-300",
      "Compliance restrito",
    ];
  if (["PENDING", "ENHANCED_DUE_DILIGENCE"].includes(status))
    return [
      "bg-yellow-50 border-yellow-300 shadow-yellow-100",
      "bg-yellow-100 text-yellow-800 border border-yellow-300",
      "Compliance pendente",
    ];
  if (status === "MONITORING")
    return [
      "bg-blue-50 border-blue-300 shadow-blue-100",
      "bg-blue-100 text-blue-800 border border-blue-300",
      "Compliance monitorado",
    ];
  if (status === "APPROVED")
    return [
      "bg-green-50 border-green-300 shadow-green-100",
      "bg-green-100 text-green-800 border border-green-300",
      "Compliance aprovado",
    ];

  return ["bg-white border-gray-200 shadow", "", ""];
};

export const PendingOrders = ({ setForm, setInitialRegisterData }: IPendingOrders) => {
  const { data, isLoading, error } = useListPendingOrders();
  const { mutate: sendChatMessage } = useSendChatMessageBybit();
  const { mutate: releaseAssets } = useReleaseAssets();
  const { mutate: markPaidBybitMutate, isPending: isMarkPaidPending } = useMarkOrderAsPaidBybit();
  const { acesso } = useAccessControl();

  const [activeTab, setActiveTab] = useState<TabKey>(getSavedTab);
  const [modalAction, setModalAction] = useState<"release" | "markPaid">("release");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [openedComplianceOrderId, setOpenedComplianceOrderId] = useState<string | null>(null);
  const [pixModalInitialValues, setPixModalInitialValues] = useState<PixToolInitialValues | null>(
    null,
  );

  const activeConfig = TABS.find((t) => t.tab === activeTab) ?? TABS[0];
  const activeKeyType = activeConfig.keyType;
  const orders = useMemo(() => ((data as any)?.[activeTab] ?? []) as any[], [data, activeTab]);

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    window.localStorage.setItem("pendingOrdersActiveTab", tab);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const openActionModal = (order: any, action: "release" | "markPaid") => {
    setSelectedOrder(order);
    setModalAction(action);
    setShowModal(true);
  };

  const openPixModal = (order: any) => {
    setPixModalInitialValues({
      pixKey: String(order?.pagamento?.find((p: any) => p?.pix)?.pix ?? ""),
      amount: String(order?.valor ?? ""),
      orderId: String(order?.id ?? ""),
    });
  };

  const sendReceiptAndContract = async (order: any, cryptotechIsBuyer?: boolean) => {
    const base64Image = await generateSingleReceipt(legacyBybitOrder(order));

    if (base64Image) {
      sendChatMessage({
        message: base64Image,
        contentType: "pic",
        orderId: String(order.id),
        keyType: activeKeyType,
      });
    }

    const contract = await confirmContract({
      usuario: {
        apelido: order?.apelido ?? "-",
        name: Number(order?.side) === 0 ? (order?.vendedor ?? "-") : (order?.comprador ?? "-"),
        document: order?.documento ?? "-",
      },
      ordem: String(order?.id ?? "-"),
      data: toBRDate(order?.data),
      exchange: "Bybit",
      quantidade: String(order?.quantidade ?? "-"),
      valor: String(order?.valor ?? "-"),
      ativo: String(order?.token ?? "-"),
      cryptotechIsBuyer,
    });

    sendChatMessage(
      {
        message: contract.pdfBase64,
        contentType: "pdf",
        orderId: String(order.id),
        keyType: activeKeyType,
      },
      { onError: () => toast.error("Falha ao enviar contrato no chat") },
    );
  };

  const confirmMarkPaid = () => {
    if (!selectedOrder) return;

    const order = selectedOrder;

    markPaidBybitMutate(
      { orderId: String(order.id), keyType: activeKeyType },
      {
        onSuccess: async () => {
          closeModal();
          try {
            await sendReceiptAndContract(order, true);
          } catch {
            toast.error("Falha ao gerar/enviar recibo e contrato");
          }
        },
        onError: () => toast.error("Falha ao marcar como pago na Bybit"),
      },
    );
  };

  const confirmRelease = () => {
    if (!selectedOrder) return;

    const order = selectedOrder;

    releaseAssets(
      { orderId: order.id, keyType: activeKeyType },
      {
        onSuccess: async () => {
          closeModal();
          try {
            await sendReceiptAndContract(order);
          } catch {
            toast.error("Falha ao emitir o contrato assinado");
          }
        },
      },
    );
  };

  if (isLoading) return <p>Carregando ordens...</p>;
  if (error) return <p>Erro ao carregar ordens.</p>;
  if (!data) return <p>Sem ordens pendentes.</p>;

  return (
    <CardContainer full>
      <h3 className="text-28 font-bold">ORDENS PENDENTES</h3>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ tab, label }) => {
          const hasOrders = (((data as any)?.[tab] ?? []) as any[]).length > 0;

          return (
            <div key={tab} className="relative">
              <Button
                onClick={() => changeTab(tab)}
                className={`rounded-6 p-2 ${activeTab === tab ? "bg-gray-400 text-white" : "bg-gray-200"}`}
              >
                {label}
              </Button>
              {hasOrders && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
              )}
            </div>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p>Sem ordens em {activeConfig.label}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2 overflow-visible">
          {orders.map((order) => {
            const isBuy = Number(order?.side) === 0;
            const compliance = order?.compliance ?? null;
            const documento = String(order?.documento ?? compliance?.documento ?? "");
            const [cardClass, badgeClass, badgeLabel] = complianceState(compliance);
            const mensagens = order?.mensagens ?? [];
            const disabledAction =
              isMarkPaidPending ||
              acesso !== "Master" ||
              mensagens.length === 0 ||
              !isCpfCnpj(documento) ||
              mensagens.slice(0).reverse().slice(-10).some(isBotCancel) ||
              (isBuy
                ? Number(order.status) !== 10
                : Number(order.status) <= 10 || Number(order.status) >= 30);

            return (
              <div
                key={`${order.keyType}-${order.id}`}
                className={`relative flex w-fit flex-col gap-0.5 rounded-xl border p-4 pt-10 shadow ${cardClass}`}
              >
                {isBuy && order?.pagamento?.length > 0 && (
                  <PaymentTermsBox terms={order.pagamento} title="Dados para pagamento" />
                )}

                <button
                  className="absolute right-2 top-2 rounded-6 border border-gray-200 bg-white p-2 hover:bg-gray-100 hover:opacity-80"
                  onClick={() => {
                    setInitialRegisterData({
                      apelido: order?.apelido || "",
                      nome: isBuy ? order?.vendedor : order?.comprador,
                      exchange: "Bybit https://www.bybit.com/ SG",
                    });
                    setForm(true);
                  }}
                >
                  <Copy width={20} height={20} weight="duotone" />
                </button>

                {badgeLabel && (
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-semibold ${badgeClass}`}
                  >
                    {badgeLabel}
                  </span>
                )}

                {isCpfCnpj(documento) && compliance && (
                  <button
                    type="button"
                    className="absolute right-14 top-2 rounded-6 border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-100"
                    onClick={() =>
                      setOpenedComplianceOrderId((prev) =>
                        prev === String(order.id) ? null : String(order.id),
                      )
                    }
                  >
                    Compliance
                  </button>
                )}

                {isCpfCnpj(documento) && isBuy && Number(order.status) === 10 && (
                  <button
                    type="button"
                    className="absolute right-2 top-12 rounded-6 border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                    onClick={() => openPixModal(order)}
                  >
                    Pix
                  </button>
                )}

                <p>
                  <strong>ID da Ordem:</strong> {order.id}
                </p>
                <p>
                  <strong>Data:</strong> {order.data || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {Number(order.status) === 10
                    ? "Pendente"
                    : Number(order.status) === 30
                      ? "Apelando"
                      : "À liberar"}
                </p>
                <p>
                  <strong>Apelido:</strong> {order.apelido || "Não informado"}
                </p>
                <p>
                  <strong>Nome:</strong>{" "}
                  {(isBuy ? order.vendedor : order.comprador) || "Não informado"}
                </p>
                <p>
                  <strong>Tipo:</strong> {isBuy ? "compras" : "vendas"}
                </p>
                <p>
                  <strong>Quantidade:</strong> {order.quantidade} {order.token}
                </p>
                <p>
                  <strong>Valor:</strong> {order.valor} {order.moeda}
                </p>
                <p>
                  <strong>Preço Unitário:</strong> {brl(order.preco)} {order.moeda}
                </p>
                <p>
                  <strong>CPF/CNPJ:</strong> {documento || "Não informado"}
                </p>

                {onlyDigits(documento).length === 11 && getEndToEnd(order?.endtoend) && (
                  <p>
                    <strong>EndToEnd:</strong> {getEndToEnd(order.endtoend)}
                  </p>
                )}

                <OrderMessages messages={mensagens} />
                <ChatBox orderId={order.id} keyType={activeKeyType} />

                <Button
                  disabled={disabledAction}
                  onClick={() => openActionModal(order, isBuy ? "markPaid" : "release")}
                >
                  {Number(order.status) === 10
                    ? "Aguardando pagamento"
                    : Number(order.status) === 20
                      ? "Pago / Aguardando liberação"
                      : "Apelando"}
                </Button>

                {openedComplianceOrderId === String(order.id) && compliance && (
                  <div className="absolute left-[calc(100%+12px)] top-0 z-50">
                    <CompliancePopover
                      data={compliance}
                      documento={documento}
                      onClose={() => setOpenedComplianceOrderId(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && selectedOrder && (
        <ConfirmationModalButton
          text={`${modalAction === "release"
              ? `Está certo que deseja liberar para ${selectedOrder?.comprador} `
              : `Está certo que já fez o pagamento para ${selectedOrder?.vendedor} `
            }a quantidade de ${selectedOrder?.quantidade} ${selectedOrder?.token} no valor de ${selectedOrder?.valor} ${selectedOrder?.moeda}?`}
          onConfirm={modalAction === "release" ? confirmRelease : confirmMarkPaid}
          onCancel={closeModal}
          showExtra
          extra={<StatementRedisPanel autoSelectEndToEnd={getEndToEnd(selectedOrder?.endtoend)} />}
        />
      )}

      {pixModalInitialValues && (
        <PixToolModal
          initialValues={pixModalInitialValues}
          onClose={() => setPixModalInitialValues(null)}
        />
      )}
    </CardContainer>
  );
};
