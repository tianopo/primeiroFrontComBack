import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { generateSingleReceipt } from "src/pages/Home/config/handleReceipt";
import { useAccessControl } from "src/routes/context/AccessControl";
import { PixToolInitialValues } from "../components/Gowd/Pix/PixToolModal";
import { TABS } from "../components/PendingOrders/utils/pendingOrdersConfig";
import {
  buildBinanceOrderContext,
  getEndToEnd,
  getOrdersByTab,
  getSavedTab,
  isBinance,
  isBitget,
  isBybit,
  isCpfCnpj,
  legacyOrder,
  onlyDigits,
} from "../components/PendingOrders/utils/pendingOrdersHelpers";
import {
  BybitKeyType,
  ConfirmAction,
  OrderLike,
  TabConfig,
  TabKey,
} from "../components/PendingOrders/utils/pendingOrdersTypes";
import { confirmContract } from "../utils/confirmContract";
import { toBRDate } from "../utils/helpers";
import {
  BinancePostReleaseOrderContext,
  useCheckAndReleaseCoinBinance,
} from "./Binance/useCheckAndReleaseCoinBinance";
import { useMarkOrderAsPaidBinance } from "./Binance/useMarkOrderAsPaidBinance";
import { useSendChatMessageBinance } from "./Binance/useSendChatMessageBinance";
import { useListPendingOrders } from "./Bybit/useListPendingOrders";
import { useMarkOrderAsPaidBybit } from "./Bybit/useMarkOrderAsPaidBybit";
import { useReleaseAssets } from "./Bybit/useReleaseAssets";
import { useSendChatMessageBybit } from "./Bybit/useSendChatMessageBybit";
import { useMarkOrderAsPaidBitget } from "./Bitget/useMarkOrderAsPaidBitget";
import { useReleaseAssetsBitget } from "./Bitget/useReleaseAssetsBitget";

export const usePendingOrdersController = () => {
  const { data, isLoading, error } = useListPendingOrders();

  const { mutate: sendChatMessageBybit } = useSendChatMessageBybit();
  const { mutate: releaseBybit } = useReleaseAssets();
  const { mutate: markPaidBybit, isPending: isMarkPaidBybitPending } = useMarkOrderAsPaidBybit();

  const { mutate: releaseBinance, isPending: isReleaseBinancePending } =
    useCheckAndReleaseCoinBinance();
  const { mutate: markPaidBinance, isPending: isMarkPaidBinancePending } =
    useMarkOrderAsPaidBinance();
  const { mutate: sendChatBinance, isPending: isChatBinancePending } = useSendChatMessageBinance();

  const { mutate: releaseBitget, isPending: isReleaseBitgetPending } = useReleaseAssetsBitget();
  const { mutate: markPaidBitget, isPending: isMarkPaidBitgetPending } = useMarkOrderAsPaidBitget();

  const { acesso } = useAccessControl();

  const [activeTab, setActiveTab] = useState<TabKey>(getSavedTab);
  const [modalAction, setModalAction] = useState<ConfirmAction>("release");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderLike | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<TabConfig | null>(null);
  const [openedComplianceOrderId, setOpenedComplianceOrderId] = useState<string | null>(null);
  const [pixModalInitialValues, setPixModalInitialValues] = useState<PixToolInitialValues | null>(
    null,
  );

  const activeConfig = TABS.find((t) => t.tab === activeTab) ?? TABS[0];
  const modalConfig = selectedConfig ?? activeConfig;
  const activeBybitKeyType: BybitKeyType =
    activeConfig.keyType === "pessoal" ? "pessoal" : "empresa";
  const modalBybitKeyType: BybitKeyType = modalConfig.keyType === "pessoal" ? "pessoal" : "empresa";
  const modalBitgetKeyType = modalConfig.keyType === "pessoal" ? "pessoal" : "empresa";
  const orders = useMemo(() => getOrdersByTab(data, activeTab), [data, activeTab]);

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    window.localStorage.setItem("pendingOrdersActiveTab", tab);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setSelectedConfig(null);
  };

  const openActionModal = (order: OrderLike, action: ConfirmAction) => {
    setSelectedOrder(order);
    setSelectedConfig(activeConfig);
    setModalAction(action);
    setShowModal(true);
  };

  const openPixModal = (order: OrderLike) => {
    const pagamento = Array.isArray(order.pagamento) ? order.pagamento : [];

    setPixModalInitialValues({
      pixKey: String(pagamento.find((p) => (p as { pix?: unknown })?.pix)?.pix ?? ""),
      amount: String(order.valor ?? ""),
      orderId: String(order.id ?? ""),
      description: `Pagamento da ordem '${String(order.id ?? "")}'`,
    });
  };

  const sendBybitReceiptAndContract = async (order: OrderLike, cryptotechIsBuyer?: boolean) => {
    const base64Image = await generateSingleReceipt(legacyOrder(order, "Bybit"));

    if (base64Image) {
      sendChatMessageBybit({
        message: base64Image,
        contentType: "pic",
        orderId: String(order.id),
        keyType: modalBybitKeyType,
      });
    }

    const contract = await confirmContract({
      usuario: {
        apelido: String(order.apelido ?? "-"),
        name:
          Number(order.side) === 0 ? String(order.vendedor ?? "-") : String(order.comprador ?? "-"),
        document: String(order.documento ?? "-"),
      },
      ordem: String(order.id ?? "-"),
      data: toBRDate(String(order.data ?? "")),
      exchange: "Bybit",
      quantidade: String(order.quantidade ?? "-"),
      valor: String(order.valor ?? "-"),
      ativo: String(order.token ?? "-"),
      cryptotechIsBuyer,
    });

    sendChatMessageBybit(
      {
        message: contract.pdfBase64,
        contentType: "pdf",
        orderId: String(order.id),
        keyType: modalBybitKeyType,
      },
      { onError: () => toast.error("Falha ao enviar contrato no chat") },
    );
  };

  const confirmBybitMarkPaid = (order: OrderLike) => {
    markPaidBybit(
      { orderId: String(order.id), keyType: modalBybitKeyType },
      {
        onSuccess: async () => {
          closeModal();

          try {
            await sendBybitReceiptAndContract(order, true);
          } catch {
            toast.error("Falha ao gerar/enviar recibo e contrato");
          }
        },
        onError: () => toast.error("Falha ao marcar como pago na Bybit"),
      },
    );
  };

  const confirmBybitRelease = (order: OrderLike) => {
    releaseBybit(
      { orderId: String(order.id), keyType: modalBybitKeyType },
      {
        onSuccess: async () => {
          closeModal();

          try {
            await sendBybitReceiptAndContract(order);
          } catch {
            toast.error("Falha ao emitir o contrato assinado");
          }
        },
      },
    );
  };

  const confirmBinanceMarkPaid = async (order: OrderLike) => {
    const orderId = String(order.id);
    const base64Image = await generateSingleReceipt(legacyOrder(order, "Binance"));

    if (!base64Image) return;

    markPaidBinance(
      {
        orderNumber: orderId,
        advNo: String(order.advNo ?? ""),
      },
      {
        onSuccess: () => {
          closeModal();

          sendChatBinance({
            orderNo: orderId,
            content: base64Image,
            type: "pic",
            fileName: `recibo-${orderId}.png`,
          });
        },
        onError: () => closeModal(),
      },
    );
  };

  const confirmBinanceRelease = (order: OrderLike) => {
    const orderId = String(order.id);
    const documentDigits = onlyDigits(String(order.documento ?? ""));
    const document = isCpfCnpj(documentDigits) ? documentDigits : undefined;
    const endToEnd = getEndToEnd(order.endtoend) || undefined;

    releaseBinance(
      {
        orderNumber: orderId,
        document,
        endToEnd,
        orderContext: buildBinanceOrderContext(order) as BinancePostReleaseOrderContext,
      },
      {
        onSuccess: (response) => {
          closeModal();

          if (response?.postRelease?.orderSaved === false) {
            console.error(
              `[BINANCE][RELEASE] Ordem ${orderId} foi liberada, mas não foi cadastrada: ${
                response.postRelease.warning ?? "motivo não informado"
              }`,
            );
          }
        },
        onError: () => closeModal(),
      },
    );
  };

  const confirmBitgetMarkPaid = (order: OrderLike) => {
    markPaidBitget(
      {
        orderId: String(order.id),
        keyType: modalBitgetKeyType,
      },
      {
        onSuccess: () => {
          closeModal();
        },
        onError: () => {
          closeModal();
        },
      },
    );
  };

  const confirmBitgetRelease = (order: OrderLike) => {
    releaseBitget(
      {
        orderId: String(order.id),
        keyType: modalBitgetKeyType,
      },
      {
        onSuccess: () => {
          closeModal();
        },
        onError: () => {
          closeModal();
        },
      },
    );
  };

  const handleConfirm = () => {
    if (!selectedOrder) return;

    if (isBinance(modalConfig)) {
      if (modalAction === "markPaid") return confirmBinanceMarkPaid(selectedOrder);
      return confirmBinanceRelease(selectedOrder);
    }

    if (isBybit(modalConfig) && modalAction === "markPaid") {
      return confirmBybitMarkPaid(selectedOrder);
    }

    if (isBybit(modalConfig)) {
      return confirmBybitRelease(selectedOrder);
    }

    if (isBitget(modalConfig) && modalAction === "markPaid") {
      return confirmBitgetMarkPaid(selectedOrder);
    }

    if (isBitget(modalConfig)) {
      return confirmBitgetRelease(selectedOrder);
    }
  };

  return {
    acesso,
    activeBybitKeyType,
    activeConfig,
    activeTab,
    changeTab,
    closeModal,
    data,
    error,
    handleConfirm,
    isChatBinancePending,
    isLoading,
    isMarkPaidBybitPending,
    isMarkPaidBinancePending,
    isReleaseBinancePending,
    isMarkPaidBitgetPending,
    isReleaseBitgetPending,
    modalAction,
    openActionModal,
    openPixModal,
    openedComplianceOrderId,
    orders,
    pixModalInitialValues,
    selectedOrder,
    sendChatBinance,
    setOpenedComplianceOrderId,
    setPixModalInitialValues,
    showModal,
  };
};
