import { Copy } from "@phosphor-icons/react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { usePendingOrdersController } from "../hooks/usePendingOrdersController";
import { StatementRedisPanel } from "./Gowd/Extrato/StatementRedisPanel";
import { PixToolModal } from "./Gowd/Pix/PixToolModal";
import { OrderMessages } from "./OrderMessages";
import { BinanceChatBox } from "./PendingOrders/Chat/BinanceChatBox";
import { ChatBox } from "./PendingOrders/Chat/ChatBox";
import { MexcChatBox } from "./PendingOrders/Chat/MexcChatBox";
import { CompliancePopover } from "./PendingOrders/CompliancePopover";
import { PaymentTermsBox } from "./PendingOrders/PaymentTermsBox";
import { TABS } from "./PendingOrders/utils/pendingOrdersConfig";
import {
  brl,
  canActByStatus,
  complianceState,
  getEndToEnd,
  getOrdersByTab,
  isBinance,
  isBitget,
  isBotCancel,
  isBybit,
  isCoinex,
  isCpfCnpj,
  isMexc,
  onlyDigits,
  statusLabel,
} from "./PendingOrders/utils/pendingOrdersHelpers";
import { PendingOrdersProps } from "./PendingOrders/utils/pendingOrdersTypes";

export type KeyType = "empresa" | "pessoal";

export const PendingOrders = ({ setForm, setInitialRegisterData }: PendingOrdersProps) => {
  const {
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
    isMarkPaidMexcPending,
    isReleaseMexcPending,
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
  } = usePendingOrdersController();

  if (isLoading) return <p>Carregando ordens...</p>;
  if (error) return <p>Erro ao carregar ordens.</p>;
  if (!data) return <p>Sem ordens pendentes.</p>;
  return (
    <CardContainer full>
      <h3 className="text-28 font-bold">ORDENS PENDENTES</h3>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ tab, label }) => {
          const hasOrders = getOrdersByTab(data, tab).length > 0;

          return (
            <div key={tab} className="relative">
              <Button
                onClick={() => changeTab(tab)}
                className={`rounded-6 p-2 ${
                  activeTab === tab ? "bg-gray-400 text-white" : "bg-gray-200"
                }`}
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
            const isBuyOrder = Number(order.side) === 0;
            const compliance = (order.compliance ?? null) as Record<string, unknown> | null;

            const orderDocument = String(order.documento ?? "");
            const complianceDocument = String(compliance?.documento ?? "");

            const documento = isCpfCnpj(onlyDigits(orderDocument))
              ? orderDocument
              : isCpfCnpj(onlyDigits(complianceDocument))
                ? complianceDocument
                : "";

            const mensagens = Array.isArray(order.mensagens) ? order.mensagens : [];
            const pagamento = Array.isArray(order.pagamento) ? order.pagamento : [];
            const [cardClass, badgeClass, badgeLabel] = complianceState(compliance);
            const isPendingAny =
              isMarkPaidBybitPending ||
              isMarkPaidBinancePending ||
              isMarkPaidBitgetPending ||
              isMarkPaidMexcPending ||
              isReleaseBinancePending ||
              isReleaseBitgetPending ||
              isReleaseBitgetPending ||
              isReleaseMexcPending;
            const requiresMessages = !isBitget(activeConfig) && !isCoinex(activeConfig);

            const disabledAction =
              isCoinex(activeConfig) ||
              isPendingAny ||
              acesso !== "Master" ||
              (requiresMessages && mensagens.length === 0) ||
              !isCpfCnpj(documento) ||
              (requiresMessages && mensagens.slice(0).reverse().slice(-10).some(isBotCancel)) ||
              !canActByStatus(activeConfig, order, isBuyOrder);

            return (
              <div
                key={`${String(order.keyType ?? activeConfig.keyType)}-${String(order.id)}`}
                className={`relative flex w-fit flex-col gap-0.5 rounded-xl border p-4 pt-10 shadow ${cardClass}`}
              >
                {isBuyOrder && pagamento.length > 0 && (
                  <PaymentTermsBox terms={pagamento} title="Dados para pagamento" />
                )}

                <button
                  className="absolute right-2 top-2 rounded-6 border border-gray-200 bg-white p-2 hover:bg-gray-100 hover:opacity-80"
                  onClick={() => {
                    setInitialRegisterData({
                      apelido: String(order.apelido || ""),
                      nome: String(isBuyOrder ? order.vendedor : order.comprador),
                      exchange: activeConfig.registerExchange,
                    });
                    setForm(true);
                  }}
                  title="Copiar para cadastro"
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

                {isCpfCnpj(documento) &&
                  isBuyOrder &&
                  canActByStatus(activeConfig, order, isBuyOrder) && (
                    <button
                      type="button"
                      className="absolute right-2 top-12 rounded-6 border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                      onClick={() => openPixModal(order)}
                    >
                      Pix
                    </button>
                  )}

                <p>
                  <strong>Exchange:</strong> {activeConfig.exchangeName}
                </p>
                <p>
                  <strong>ID da Ordem:</strong> {String(order.id ?? "-")}
                </p>
                {order.advNo ? (
                  <p>
                    <strong>Adv No:</strong> {String(order.advNo)}
                  </p>
                ) : null}
                <p>
                  <strong>Data:</strong> {String(order.data || "N/A")}
                </p>
                <p>
                  <strong>Status:</strong> {statusLabel(activeConfig, order.status)}
                </p>
                <p>
                  <strong>Apelido:</strong> {String(order.apelido || "Não informado")}
                </p>
                <p>
                  <strong>Nome:</strong>{" "}
                  {String((isBuyOrder ? order.vendedor : order.comprador) || "Não informado")}
                </p>
                <p>
                  <strong>Tipo:</strong> {isBuyOrder ? "compras" : "vendas"}
                </p>
                <p>
                  <strong>Quantidade:</strong> {String(order.quantidade ?? "-")}{" "}
                  {String(order.token ?? "")}
                </p>
                <p>
                  <strong>Valor:</strong> {String(order.valor ?? "-")} {String(order.moeda ?? "")}
                </p>
                <p>
                  <strong>Preço Unitário:</strong> {brl(order.preco)} {String(order.moeda ?? "")}
                </p>
                <p>
                  <strong>CPF/CNPJ:</strong> {documento || "Não informado"}
                </p>

                {onlyDigits(documento).length === 11 && getEndToEnd(order.endtoend) && (
                  <p>
                    <strong>EndToEnd:</strong> {getEndToEnd(order.endtoend)}
                  </p>
                )}

                {mensagens.length > 0 && <OrderMessages messages={mensagens} />}

                {isBybit(activeConfig) && (
                  <ChatBox orderId={String(order.id)} keyType={activeBybitKeyType} />
                )}

                {isBinance(activeConfig) && (
                  <BinanceChatBox
                    orderId={String(order.id)}
                    isPending={isChatBinancePending}
                    sendChatBinance={sendChatBinance}
                  />
                )}

                {isMexc(activeConfig) && (
                  <MexcChatBox
                    orderId={String(order.id)}
                    keyType={activeConfig.keyType === "pessoal" ? "pessoal" : "empresa"}
                  />
                )}

                {isCoinex(activeConfig) ? (
                  <Button disabled>Somente consulta</Button>
                ) : (
                  <Button
                    disabled={disabledAction}
                    onClick={() => openActionModal(order, isBuyOrder ? "markPaid" : "release")}
                  >
                    {statusLabel(activeConfig, order.status)}
                  </Button>
                )}

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
          text={`${
            modalAction === "release"
              ? `Está certo que deseja liberar para ${String(selectedOrder.comprador ?? "")} `
              : `Está certo que já fez o pagamento para ${String(selectedOrder.vendedor ?? "")} `
          }a quantidade de ${String(selectedOrder.quantidade ?? "")} ${String(
            selectedOrder.token ?? "",
          )} no valor de ${String(selectedOrder.valor ?? "")} ${String(selectedOrder.moeda ?? "")}?`}
          onConfirm={handleConfirm}
          onCancel={closeModal}
          showExtra={Boolean(getEndToEnd(selectedOrder.endtoend))}
          extra={
            getEndToEnd(selectedOrder.endtoend) ? (
              <StatementRedisPanel autoSelectEndToEnd={getEndToEnd(selectedOrder.endtoend)} />
            ) : undefined
          }
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
