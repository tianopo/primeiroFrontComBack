import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { generateSingleReceipt } from "src/pages/Home/config/handleReceipt";
import { useAccessControl } from "src/routes/context/AccessControl";
import type { PixToolInitialValues } from "../components/Gowd/Pix/PixToolModal";
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
  isGate,
  isMexc,
  legacyOrder,
  onlyDigits,
} from "../components/PendingOrders/utils/pendingOrdersHelpers";
import type {
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
import { useMarkOrderAsPaidBitget } from "./Bitget/useMarkOrderAsPaidBitget";
import { useReleaseAssetsBitget } from "./Bitget/useReleaseAssetsBitget";
import { useListPendingOrders } from "./Bybit/useListPendingOrders";
import { useMarkOrderAsPaidBybit } from "./Bybit/useMarkOrderAsPaidBybit";
import { useReleaseAssets } from "./Bybit/useReleaseAssets";
import { useSendChatMessageBybit } from "./Bybit/useSendChatMessageBybit";
import { useMarkOrderAsPaidGate } from "./Gate/useMarkOrderAsPaidGate";
import { useReleaseGate } from "./Gate/useReleaseGate";
import { useSendChatMessageGate } from "./Gate/useSendChatMessageGate";
import { useMarkOrderAsPaidMexc } from "./MEXC/useMarkOrderAsPaidMexc";
import { useReleaseCoinMexc } from "./MEXC/useReleaseCoinMexc";
import { useSendChatMessageMexc } from "./MEXC/useSendChatMessageMexc";
type PixOrderContext = {
  order: OrderLike;
  config: TabConfig;
};
type MutationCompletion = {
  onSuccess: () => void;
  onError: (error: unknown) => void;
};
const waitForMutation = (startMutation: (completion: MutationCompletion) => void): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    startMutation({
      onSuccess: () => resolve(),
      onError: (error: unknown) => reject(error),
    });
  });
const base64ToFile = (value: string, name: string, fallbackType: string) => {
  const match = String(value ?? "")
    .trim()
    .match(/^data:([^;]+);base64,(.+)$/is);
  const base64 = String(match?.[2] ?? value ?? "").replace(/\s/g, "");
  const bytes = Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
  if (!bytes.length) throw new Error(`O arquivo ${name} está vazio.`);
  return new File([bytes.slice().buffer], name, {
    type: String(match?.[1] ?? fallbackType).toLowerCase(),
  });
};
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
  const { mutate: releaseMexc, isPending: isReleaseMexcPending } = useReleaseCoinMexc();
  const { mutate: markPaidMexc, isPending: isMarkPaidMexcPending } = useMarkOrderAsPaidMexc();
  const { mutate: sendChatMessageMexc } = useSendChatMessageMexc();
  const { mutate: releaseGate, isPending: isReleaseGatePending } = useReleaseGate();
  const { mutate: markPaidGate, isPending: isMarkPaidGatePending } = useMarkOrderAsPaidGate();
  const { mutate: sendChatMessageGate } = useSendChatMessageGate();
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
  const [pixOrderContext, setPixOrderContext] = useState<PixOrderContext | null>(null);
  const activeConfig = TABS.find((t) => t.tab === activeTab) ?? TABS[0];
  const modalConfig = selectedConfig ?? activeConfig;
  const activeBybitKeyType: BybitKeyType =
    activeConfig.keyType === "pessoal" ? "pessoal" : "empresa";
  const modalBybitKeyType: BybitKeyType = modalConfig.keyType === "pessoal" ? "pessoal" : "empresa";
  const modalBitgetKeyType = modalConfig.keyType === "pessoal" ? "pessoal" : "empresa";
  const modalMexcKeyType = modalConfig.keyType === "pessoal" ? "pessoal" : "empresa";
  const modalGateKeyType = modalConfig.keyType === "pessoal" ? "pessoal" : "empresa";
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
    setPixOrderContext({
      order,
      config: activeConfig,
    });
    setPixModalInitialValues({
      pixKey: String(pagamento.find((p) => (p as { pix?: unknown })?.pix)?.pix ?? ""),
      amount: String(order.valor ?? ""),
      orderId: String(order.id ?? ""),
      description: `Pagamento da ordem '${String(order.id ?? "")}'`,
    });
  };
  const closePixModal = () => {
    setPixModalInitialValues(null);
    setPixOrderContext(null);
  };
  const handlePixSuccess = async () => {
    if (!pixOrderContext) {
      toast.error("Pix enviado, mas não foi possível identificar a ordem para marcar como paga.");
      return;
    }
    const { order, config } = pixOrderContext;
    const orderId = String(order.id ?? "").trim();
    const keyType: BybitKeyType = config.keyType === "pessoal" ? "pessoal" : "empresa";
    if (!orderId) {
      toast.error("Pix enviado, mas a ordem não possui um identificador válido.");
      return;
    }
    try {
      if (isBinance(config)) {
        await waitForMutation((completion) => {
          markPaidBinance(
            {
              orderNumber: orderId,
              advNo: String(order.advNo ?? ""),
            },
            completion,
          );
        });
      } else if (isBybit(config)) {
        await waitForMutation((completion) => {
          markPaidBybit({ orderId, keyType }, completion);
        });
      } else if (isBitget(config)) {
        await waitForMutation((completion) => {
          markPaidBitget({ orderId, keyType }, completion);
        });
      } else if (isMexc(config)) {
        await waitForMutation((completion) => {
          markPaidMexc(
            {
              advOrderNo: orderId,
              keyType,
              userConfirmPaymentId:
                String(order.userConfirmPaymentId ?? order.payId ?? "") || undefined,
              payId: String(order.payId ?? "") || undefined,
            },
            completion,
          );
        });
      } else if (isGate(config)) {
        const paymentTerms = Array.isArray(order.pagamento) ? order.pagamento : [];
        const firstPayment = paymentTerms[0] as { paymentType?: unknown } | undefined;
        await waitForMutation((completion) => {
          markPaidGate(
            {
              txid: orderId,
              keyType,
              paymentMethod: firstPayment?.paymentType
                ? String(firstPayment.paymentType)
                : undefined,
            },
            completion,
          );
        });
      } else {
        throw new Error(`Corretora não suportada: ${config.exchangeName}`);
      }
    } catch (error) {
      console.error(
        `[PIX][MARK_PAID] O Pix da ordem ${orderId} foi enviado, mas a marcação falhou:`,
        error,
      );
      toast.error(
        `O Pix foi enviado, mas não foi possível marcar a ordem ${orderId} como paga na ${config.exchangeName}. Use o botão manual para tentar novamente.`,
      );
      return;
    }
    setPixOrderContext(null);
    try {
      if (isBinance(config)) {
        await sendBinanceReceipt(order);
        toast.success(
          `Pix enviado, ordem ${orderId} marcada como paga e comprovante enviado no chat da Binance.`,
        );
        return;
      }
      if (isBybit(config)) {
        await sendBybitReceiptAndContract(order, keyType, true);
        toast.success(
          `Pix enviado, ordem ${orderId} marcada como paga e recibo e contrato enviados no chat da Bybit.`,
        );
        return;
      }
      toast.success(`Pix enviado e ordem ${orderId} marcada como paga na ${config.exchangeName}.`);
    } catch (error) {
      console.error(
        `[PIX][DOCUMENTS] A ordem ${orderId} foi marcada como paga, mas o envio dos documentos falhou:`,
        error,
      );
      const documentDescription = isBinance(config)
        ? "o comprovante no chat da Binance"
        : "todos os documentos (recibo e contrato) no chat da Bybit";
      toast.error(
        `O Pix foi enviado e a ordem ${orderId} foi marcada como paga, mas não foi possível enviar ${documentDescription}.`,
      );
    }
  };
  async function sendBybitReceiptAndContract(
    order: OrderLike,
    keyType: BybitKeyType,
    cryptotechIsBuyer?: boolean,
  ): Promise<void> {
    const base64Image = await generateSingleReceipt(legacyOrder(order, "Bybit"));
    if (!base64Image) {
      throw new Error("Não foi possível gerar o recibo da Bybit.");
    }
    await waitForMutation((completion) => {
      sendChatMessageBybit(
        {
          message: base64Image,
          contentType: "pic",
          orderId: String(order.id),
          keyType,
        },
        completion,
      );
    });
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
    if (!contract?.pdfBase64) {
      throw new Error("Não foi possível gerar o contrato da Bybit.");
    }
    await waitForMutation((completion) => {
      sendChatMessageBybit(
        {
          message: contract.pdfBase64,
          contentType: "pdf",
          orderId: String(order.id),
          keyType,
        },
        completion,
      );
    });
  }
  async function sendBinanceReceipt(order: OrderLike): Promise<void> {
    const orderId = String(order.id);
    const base64Image = await generateSingleReceipt(legacyOrder(order, "Binance"));
    if (!base64Image) {
      throw new Error("Não foi possível gerar o comprovante da Binance.");
    }
    await waitForMutation((completion) => {
      sendChatBinance(
        {
          orderNo: orderId,
          content: base64Image,
          type: "pic",
          fileName: `recibo-${orderId}.png`,
        },
        completion,
      );
    });
  }
  const confirmBybitMarkPaid = (order: OrderLike) => {
    markPaidBybit(
      { orderId: String(order.id), keyType: modalBybitKeyType },
      {
        onSuccess: async () => {
          closeModal();
          try {
            await sendBybitReceiptAndContract(order, modalBybitKeyType, true);
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
            await sendBybitReceiptAndContract(order, modalBybitKeyType);
          } catch {
            toast.error("Falha ao emitir o contrato assinado");
          }
        },
      },
    );
  };
  const confirmBinanceMarkPaid = (order: OrderLike) => {
    const orderId = String(order.id);
    markPaidBinance(
      {
        orderNumber: orderId,
        advNo: String(order.advNo ?? ""),
      },
      {
        onSuccess: async () => {
          closeModal();
          try {
            await sendBinanceReceipt(order);
          } catch {
            toast.error("Ordem marcada como paga, mas o comprovante não foi enviado na Binance");
          }
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
  const confirmMexcMarkPaid = (order: OrderLike) => {
    const orderId = String(order.id);
    markPaidMexc(
      {
        advOrderNo: orderId,
        keyType: modalMexcKeyType,
        userConfirmPaymentId: String(order.userConfirmPaymentId ?? order.payId ?? "") || undefined,
        payId: String(order.payId ?? "") || undefined,
      },
      {
        onSuccess: async () => {
          closeModal();
          try {
            const [receiptBase64, contract] = await Promise.all([
              generateSingleReceipt(legacyOrder(order, "MEXC")),
              confirmContract({
                usuario: {
                  apelido: String(order.apelido ?? "-"),
                  name:
                    Number(order.side) === 0
                      ? String(order.vendedor ?? "-")
                      : String(order.comprador ?? "-"),
                  document: String(order.documento ?? "-"),
                },
                ordem: orderId,
                data: toBRDate(String(order.data ?? "")),
                exchange: "MEXC",
                quantidade: String(order.quantidade ?? "-"),
                valor: String(order.valor ?? "-"),
                ativo: String(order.token ?? "-"),
                cryptotechIsBuyer: true,
              }),
            ]);
            if (!receiptBase64) throw new Error("Não foi possível gerar o comprovante da MEXC.");
            if (!contract?.pdfBase64) throw new Error("Não foi possível gerar o contrato da MEXC.");
            const receiptFile = base64ToFile(receiptBase64, `recibo-${orderId}.png`, "image/png");
            const contractFile = base64ToFile(
              contract.pdfBase64,
              contract.fileName || `contrato-${orderId}.pdf`,
              "application/pdf",
            );
            await waitForMutation((completion) =>
              sendChatMessageMexc(
                {
                  orderNo: orderId,
                  keyType: modalMexcKeyType,
                  file: receiptFile,
                  type: "image",
                  content: receiptFile.name,
                },
                completion,
              ),
            );
            await waitForMutation((completion) =>
              sendChatMessageMexc(
                {
                  orderNo: orderId,
                  keyType: modalMexcKeyType,
                  file: contractFile,
                  type: "file",
                  content: contractFile.name,
                },
                completion,
              ),
            );
            toast.success("Comprovante e contrato enviados no chat da MEXC.");
          } catch (error: unknown) {
            console.error("[MEXC][MARK_PAID][DOCUMENTS]", error);
            toast.error(
              "Pagamento confirmado, mas o comprovante ou contrato não foi enviado na MEXC.",
            );
          }
        },
        onError: () => {
          closeModal();
        },
      },
    );
  };
  const confirmMexcRelease = (order: OrderLike) => {
    releaseMexc(
      {
        advOrderNo: String(order.id),
        keyType: modalMexcKeyType,
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
  const confirmGateMarkPaid = (order: OrderLike) => {
    const orderId = String(order.id);
    const paymentTerms = Array.isArray(order.pagamento) ? order.pagamento : [];
    const firstPayment = paymentTerms[0] as { paymentType?: unknown } | undefined;
    markPaidGate(
      {
        txid: orderId,
        keyType: modalGateKeyType,
        paymentMethod: firstPayment?.paymentType ? String(firstPayment.paymentType) : undefined,
      },
      {
        onSuccess: async () => {
          closeModal();
          try {
            const receiptBase64 = await generateSingleReceipt(legacyOrder(order, "Gate"));
            if (!receiptBase64) throw new Error("Não foi possível gerar o comprovante da Gate.");
            const receiptFile = base64ToFile(receiptBase64, `recibo-${orderId}.png`, "image/png");
            await waitForMutation((completion) =>
              sendChatMessageGate(
                {
                  txid: orderId,
                  keyType: modalGateKeyType,
                  file: receiptFile,
                  type: "image",
                },
                completion,
              ),
            );
            toast.success("Comprovante enviado no chat da Gate.");
          } catch (error: unknown) {
            console.error("[GATE][MARK_PAID][RECEIPT]", error);
            toast.error("Pagamento confirmado, mas o comprovante não foi enviado na Gate.");
          }
        },
        onError: () => {
          closeModal();
        },
      },
    );
  };
  const confirmGateRelease = (order: OrderLike) => {
    releaseGate(
      {
        txid: String(order.id),
        keyType: modalGateKeyType,
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
    if (isMexc(modalConfig) && modalAction === "markPaid") {
      return confirmMexcMarkPaid(selectedOrder);
    }
    if (isMexc(modalConfig)) {
      return confirmMexcRelease(selectedOrder);
    }
    if (isGate(modalConfig) && modalAction === "markPaid") {
      return confirmGateMarkPaid(selectedOrder);
    }
    if (isGate(modalConfig)) {
      return confirmGateRelease(selectedOrder);
    }
  };
  return {
    acesso,
    activeBybitKeyType,
    activeConfig,
    activeTab,
    changeTab,
    closePixModal,
    closeModal,
    data,
    error,
    handleConfirm,
    handlePixSuccess,
    isChatBinancePending,
    isLoading,
    isMarkPaidBybitPending,
    isMarkPaidBinancePending,
    isReleaseBinancePending,
    isMarkPaidBitgetPending,
    isReleaseBitgetPending,
    isMarkPaidMexcPending,
    isReleaseMexcPending,
    isMarkPaidGatePending,
    isReleaseGatePending,
    modalAction,
    openActionModal,
    openPixModal,
    openedComplianceOrderId,
    orders,
    pixModalInitialValues,
    selectedOrder,
    sendChatBinance,
    setOpenedComplianceOrderId,
    showModal,
  };
};
