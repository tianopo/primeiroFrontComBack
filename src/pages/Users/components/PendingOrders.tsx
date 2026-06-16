import { Copy } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useState } from "react";
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
import { PixToolInitialValues, PixToolModal } from "./Gowd/Pix/PixToolModal";
import { StatementRedisPanel } from "./Gowd/StatementRedisPanel";
import { OrderMessages } from "./OrderMessages";
import { BinanceOrders } from "./PendingOrders/BinanceOrders";
import { CoinexOrders } from "./PendingOrders/CoinexOrders";
import { CompliancePopover } from "./PendingOrders/CompliancePopover";
import { CryptotechOrders } from "./PendingOrders/CryptotechOrders";
import { PaymentTermsBox } from "./PendingOrders/PaymentTermsBox";

interface IPendingOrders {
  setForm: Dispatch<SetStateAction<boolean>>;
  setInitialRegisterData: Dispatch<
    SetStateAction<{
      apelido: string;
      nome: string;
      exchange: string;
    }>
  >;
}

export type KeyType =
  | "empresa"
  | "pessoal"
  | "coinexEmpresa"
  | "coinexPessoal"
  | "cryptotech"
  | "binance";

export const PendingOrders = ({ setForm, setInitialRegisterData }: IPendingOrders) => {
  const { data, isLoading, error } = useListPendingOrders();
  const { mutate: sendChatMessage } = useSendChatMessageBybit();
  const { mutate: releaseAssets } = useReleaseAssets();
  const { mutate: markPaidBybitMutate, isPending: isMarkPaidBybitPending } =
    useMarkOrderAsPaidBybit();
  const { acesso } = useAccessControl();
  const [modalAction, setModalAction] = useState<"release" | "markPaid">("release");

  const [showModal, setShowModal] = useState(false);
  const [orderToRelease, setOrderToRelease] = useState<any>(null);
  const [openedComplianceOrderId, setOpenedComplianceOrderId] = useState<string | null>(null);

  const [pixModalInitialValues, setPixModalInitialValues] = useState<PixToolInitialValues | null>(
    null,
  );

  // 🔹 activeTab persistido no localStorage
  const [activeTab, setActiveTab] = useState<KeyType>(() => {
    if (typeof window === "undefined") return "empresa";

    const stored = window.localStorage.getItem("pendingOrdersActiveTab") as KeyType | null;
    const validTabs: KeyType[] = [
      "empresa",
      "pessoal",
      "coinexEmpresa",
      "coinexPessoal",
      "cryptotech",
      "binance",
    ];

    if (stored && validTabs.includes(stored)) {
      return stored;
    }

    return "empresa";
  });

  const openPendingOrderPixModal = (order: any) => {
    setPixModalInitialValues({
      pixKey: "",
      amount: String(order?.amount ?? ""),
      orderId: String(order?.id ?? ""),
    });
  };

  const handleChangeTab = (key: KeyType) => {
    setActiveTab(key);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pendingOrdersActiveTab", key);
    }
  };

  const handleSendReceipt = (order: any, action: "release" | "markPaid") => {
    setOrderToRelease({
      ...order,
      exchange: "Bybit",
    });
    setModalAction(action);
    setShowModal(true);
  };

  const handleConfirmMarkPaid = async () => {
    if (!orderToRelease) return;

    // 1) Primeiro marca como pago
    markPaidBybitMutate(
      {
        orderId: String(orderToRelease.id),
        keyType: activeTab as any,
      },
      {
        onSuccess: async () => {
          setShowModal(false);
          setOrderToRelease(null);
          try {
            // 2) Depois gera e envia recibo (imagem)
            const base64Image = await generateSingleReceipt(orderToRelease);
            if (base64Image) {
              sendChatMessage({
                message: base64Image,
                contentType: "pic",
                orderId: String(orderToRelease.id),
                keyType: activeTab,
              });
            }

            // 3) Gera contrato (Cryptotech como COMPRADORA) e envia no chat
            const contract = await confirmContract({
              usuario: {
                apelido: orderToRelease?.targetNickName ?? "-",
                // ✅ compra: contraparte é VENDEDORA
                name: orderToRelease?.sellerRealName ?? "-",
                document: orderToRelease?.document ?? "-",
              },
              ordem: String(orderToRelease?.id ?? "-"),
              data: toBRDate(orderToRelease?.formattedDate),
              exchange: "Bybit",
              quantidade: String(orderToRelease?.notifyTokenQuantity ?? "-"),
              valor: String(orderToRelease?.amount ?? "-"),
              ativo: String(orderToRelease?.tokenId ?? "-"),

              // ✅ CRUCIAL: inverte papéis
              cryptotechIsBuyer: true,
            });

            sendChatMessage(
              {
                message: contract.pdfBase64,
                contentType: "pdf",
                orderId: String(orderToRelease?.id),
                keyType: activeTab,
              },
              {
                onError: () => toast.error("Falha ao enviar contrato no chat"),
              },
            );
          } catch (e) {
            toast.error("Falha ao gerar/enviar recibo e contrato");
            setShowModal(false);
            setOrderToRelease(null);
          }
        },
        onError: () => toast.error("Falha ao marcar como pago na Bybit"),
      },
    );
  };

  const handleConfirmRelease = async () => {
    if (!orderToRelease) return;

    const base64Image = await generateSingleReceipt(orderToRelease);
    if (!base64Image) return;

    releaseAssets(
      { orderId: orderToRelease.id, keyType: activeTab },
      {
        onSuccess: async () => {
          setShowModal(false);
          setOrderToRelease(null);
          try {
            sendChatMessage({
              message: base64Image,
              contentType: "pic",
              orderId: orderToRelease.id,
              keyType: activeTab,
            });
            const contract = await confirmContract({
              usuario: {
                apelido: orderToRelease?.targetNickName ?? "-",
                name:
                  orderToRelease?.side === 0
                    ? (orderToRelease?.sellerRealName ?? "-")
                    : (orderToRelease?.buyerRealName ?? "-"),
                document: orderToRelease?.document ?? "-",
              },
              ordem: String(orderToRelease?.id ?? "-"),
              data: toBRDate(orderToRelease?.formattedDate),
              exchange: String(),
              quantidade: String(orderToRelease?.notifyTokenQuantity ?? "-"),
              valor: String(orderToRelease?.amount ?? "-"),
              ativo: String(orderToRelease?.tokenId ?? "-"),
            });

            sendChatMessage(
              {
                message: contract.pdfBase64,
                contentType: "pdf",
                orderId: String(orderToRelease?.id),
                keyType: activeTab,
              },
              {
                onSuccess: () => {
                  setShowModal(false);
                  setOrderToRelease(null);
                },
              },
            );
          } catch (e) {
            toast.error("falha em emitir o contrato assinado");
          }
        },
        onError: () => {},
      },
    );
  };

  const onlyDigits = (value?: string) => String(value ?? "").replace(/\D/g, "");

  const isValidCpfOrCnpj = (value?: string) => {
    const digits = onlyDigits(value);
    return digits.length === 11 || digits.length === 14;
  };

  const getOrderCompliance = (order: any) => {
    return order?.compliance ?? order?.order?.compliance ?? null;
  };

  const getOrderDocument = (order: any) => {
    return (
      String(order?.document ?? "").trim() ||
      String(order?.compliance?.document ?? "").trim() ||
      String(order?.order?.counterparty?.document ?? "").trim() ||
      String(order?.order?.compliance?.document ?? "").trim()
    );
  };

  const hasAvailableDocument = (order: any) => {
    return isValidCpfOrCnpj(getOrderDocument(order));
  };

  const getComplianceVisualState = (input: any) => {
    const compliance = input?.status ? input : input?.compliance;

    const complianceStatus = String(compliance?.status ?? "").toUpperCase();

    if (compliance?.blocked || complianceStatus === "BLOCKED") {
      return {
        cardClass: "bg-red-50 border-red-300 shadow-red-100",
        badgeClass: "bg-red-100 text-red-800 border border-red-300",
        badgeLabel: "Compliance bloqueado",
      };
    }

    if (complianceStatus === "RESTRICTED") {
      return {
        cardClass: "bg-amber-50 border-amber-300 shadow-amber-100",
        badgeClass: "bg-amber-100 text-amber-800 border border-amber-300",
        badgeLabel: "Compliance restrito",
      };
    }

    if (complianceStatus === "PENDING" || complianceStatus === "ENHANCED_DUE_DILIGENCE") {
      return {
        cardClass: "bg-yellow-50 border-yellow-300 shadow-yellow-100",
        badgeClass: "bg-yellow-100 text-yellow-800 border border-yellow-300",
        badgeLabel: "Compliance pendente",
      };
    }

    if (complianceStatus === "MONITORING") {
      return {
        cardClass: "bg-blue-50 border-blue-300 shadow-blue-100",
        badgeClass: "bg-blue-100 text-blue-800 border border-blue-300",
        badgeLabel: "Compliance monitorado",
      };
    }

    if (complianceStatus === "APPROVED") {
      return {
        cardClass: "bg-green-50 border-green-300 shadow-green-100",
        badgeClass: "bg-green-100 text-green-800 border border-green-300",
        badgeLabel: "Compliance aprovado",
      };
    }

    return {
      cardClass: "bg-white border-gray-200 shadow",
      badgeClass: "",
      badgeLabel: "",
    };
  };

  const hasRegisteredCpf = (doc?: string) => onlyDigits(doc).length === 11;

  if (isLoading) return <p>Carregando ordens...</p>;
  if (error) return <p>Erro ao carregar ordens.</p>;
  if (!data) return <p>Sem ordens pendentes.</p>;

  const orders =
    activeTab === "binance"
      ? ((data as any)?.binance?.items ?? [])
      : (((data as any)[activeTab] as any[]) ?? []);

  return (
    <CardContainer full>
      <h3 className="text-28 font-bold">ORDENS PENDENTES</h3>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "empresa", label: "Bybit E" },
          { key: "pessoal", label: "Bybit P" },
          { key: "coinexEmpresa", label: "Coinex E" },
          { key: "coinexPessoal", label: "Coinex P" },
          { key: "cryptotech", label: "Cryptotech" },
          { key: "binance", label: "Binance" },
        ].map(({ key, label }) => {
          const hasOrders =
            key === "binance"
              ? ((data as any)?.binance?.items ?? []).length > 0
              : (((data as any)[key] ?? []) as any[]).length > 0;
          return (
            <div key={key} className="relative">
              <Button
                onClick={() => handleChangeTab(key as KeyType)}
                className={`rounded-6 p-2 ${
                  activeTab === key ? "bg-gray-400 text-white" : "bg-gray-200"
                }`}
              >
                {label}
              </Button>
              {hasOrders && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Lista de ordens */}
      {orders.length === 0 ? (
        <p>Sem ordens em {activeTab}</p>
      ) : activeTab === "cryptotech" ? (
        <CryptotechOrders
          orders={orders}
          activeTab={activeTab}
          setForm={setForm}
          setInitialRegisterData={setInitialRegisterData}
        />
      ) : activeTab === "coinexEmpresa" || activeTab === "coinexPessoal" ? (
        <CoinexOrders
          orders={orders}
          title={activeTab === "coinexEmpresa" ? "Coinex Empresa" : "Coinex Pessoal"}
        />
      ) : activeTab === "binance" ? (
        <BinanceOrders
          orders={orders}
          acesso={acesso ?? ""}
          setForm={setForm}
          setInitialRegisterData={setInitialRegisterData}
        />
      ) : (
        <div className="flex flex-wrap gap-2 overflow-visible">
          {orders.map((order: any) => {
            const isBuy = Number(order?.side) === 0;
            const isPendingAny = isMarkPaidBybitPending;
            const compliance = getOrderCompliance(order);
            const documentForCompliance = getOrderDocument(order);
            const complianceUi = getComplianceVisualState(compliance);
            return (
              <div
                key={order.id}
                className={`relative flex w-fit flex-col gap-0.5 rounded-xl border p-4 pt-10 shadow ${complianceUi.cardClass}`}
              >
                {order?.side === 0 &&
                  Array.isArray(order?.paymentTerms) &&
                  order.paymentTerms.length > 0 && (
                    <PaymentTermsBox terms={order.paymentTerms} title="Dados para pagamento" />
                  )}

                <button
                  className="absolute right-2 top-2 rounded-6 border border-gray-200 bg-white p-2 hover:bg-gray-100 hover:opacity-80"
                  onClick={() => {
                    setInitialRegisterData({
                      apelido: order.targetNickName || "",
                      nome: order?.side === 0 ? order.sellerRealName : order.buyerRealName,
                      exchange: "Bybit https://www.bybit.com/ SG",
                    });
                    setForm(true);
                  }}
                >
                  <Copy width={20} height={20} weight="duotone" />
                </button>
                {complianceUi.badgeLabel && (
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-semibold ${complianceUi.badgeClass}`}
                  >
                    {complianceUi.badgeLabel}
                  </span>
                )}
                {hasAvailableDocument(order) && compliance && (
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

                {hasAvailableDocument(order) && order?.side === 0 && order.status === 10 && (
                  <button
                    type="button"
                    className="absolute right-2 top-12 rounded-6 border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                    onClick={() => openPendingOrderPixModal(order)}
                    title="Fazer PIX pela GOWD"
                  >
                    Pix
                  </button>
                )}

                <p>
                  <strong>ID da Ordem:</strong> {order.id}
                </p>
                <p>
                  <strong>Data:</strong> {order.formattedDate || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {order.status === 10
                    ? "Pendente"
                    : order.status === 30
                      ? "Apelando"
                      : "À liberar"}
                </p>
                <p>
                  <strong>Apelido:</strong> {order.targetNickName || "Não informado"}
                </p>
                <p>
                  <strong>Nome:</strong>{" "}
                  {order?.side === 0
                    ? order.sellerRealName || "Não informado"
                    : order.buyerRealName || "Não informado"}
                </p>
                <p>
                  <strong>Tipo:</strong> {order.side === 0 ? "compras" : "vendas"}
                </p>
                <p>
                  <strong>Quantidade:</strong> {order.notifyTokenQuantity} {order.tokenId}
                </p>
                <p>
                  <strong>Valor:</strong> {order.amount} {order.currencyId}
                </p>
                <p>
                  <strong>Preço Unitário:</strong> {order.price?.replace(".", ",")}{" "}
                  {order.currencyId}
                </p>
                <p>
                  <strong>CPF/CNPJ:</strong> {order.document || "Não informado"}
                </p>

                {hasRegisteredCpf(order.document) && order?.pixInStatement?.originalEndToEnd ? (
                  <p>
                    <strong>EndToEnd:</strong> {order.pixInStatement.originalEndToEnd}
                  </p>
                ) : null}

                <OrderMessages messages={order.messages} />
                <ChatBox orderId={order.id} keyType={activeTab} />

                <Button
                  disabled={
                    isPendingAny ||
                    acesso !== "Master" ||
                    order.messages.length === 0 ||
                    order.document === "documento não disponível" ||
                    order.messages
                      ?.slice(0)
                      .reverse()
                      .slice(-10)
                      .some((msg: any) =>
                        [
                          "You have a new appeal. Please negotiate and communicate with the other party within the valid period.",
                          "anular ordem",
                          "CRYPTOTECH: anular ordem",
                          "CRYPTOTECH: Anular ordem",
                        ].includes(msg.message),
                      ) ||
                    (isBuy ? order.status !== 10 : order.status <= 10 || order.status >= 30)
                  }
                  onClick={() => {
                    if (isBuy) {
                      handleSendReceipt(order, "markPaid");
                    } else {
                      handleSendReceipt(order, "release");
                    }
                  }}
                >
                  {order.status === 10
                    ? "Aguardando pagamento"
                    : order.status === 20
                      ? "Pago / Aguardando liberação"
                      : "Apelando"}
                </Button>

                {openedComplianceOrderId === String(order.id) && compliance && (
                  <div className="absolute left-[calc(100%+12px)] top-0 z-50">
                    <CompliancePopover
                      data={compliance}
                      documento={documentForCompliance}
                      onClose={() => setOpenedComplianceOrderId(null)}
                    />
                  </div>
                )}

                {showModal && orderToRelease && (
                  <ConfirmationModalButton
                    text={`${
                      modalAction === "release"
                        ? `Está certo que deseja liberar para ${orderToRelease?.buyerRealName} `
                        : `Está certo que já fez o pagamento para ${orderToRelease?.sellerRealName} `
                    }a quantidade de ${orderToRelease?.notifyTokenQuantity} ${orderToRelease?.tokenId} no valor de ${orderToRelease?.amount} ${orderToRelease?.currencyId}?`}
                    onConfirm={
                      modalAction === "release" ? handleConfirmRelease : handleConfirmMarkPaid
                    }
                    onCancel={() => {
                      setShowModal(false);
                      setOrderToRelease(null);
                    }}
                    showExtra
                    extra={
                      <StatementRedisPanel
                        autoSelectEndToEnd={orderToRelease?.pixInStatement?.originalEndToEnd}
                      />
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
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
