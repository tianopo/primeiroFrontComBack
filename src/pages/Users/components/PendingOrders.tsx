import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { ConfirmationDelete } from "src/components/Modal/ConfirmationDelete";
import { generateSingleReceipt } from "src/pages/Home/config/handleReceipt";
import { useAccessControl } from "src/routes/context/AccessControl";
import { useListPendingOrders } from "../hooks/useListPendingOrders";
import { useReleaseAssets } from "../hooks/useReleaseAssets";
import { useSendChatMessage } from "../hooks/useSendChatMessage";
import { ChatBox } from "./ChatBox";

export type KeyType = "empresa" | "pessoal";

export const PendingOrders = () => {
  const { data, isLoading, error } = useListPendingOrders();
  const { mutate: sendChatMessage } = useSendChatMessage();
  const { mutate: releaseAssets } = useReleaseAssets();
  const { acesso } = useAccessControl();

  const [showModal, setShowModal] = useState(false);
  const [orderToRelease, setOrderToRelease] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<KeyType>("empresa");

  const handleSendReceipt = (order: any) => {
    setOrderToRelease(order);
    setShowModal(true);
  };

  const handleConfirmRelease = async () => {
    if (!orderToRelease) return;

    const base64Image = await generateSingleReceipt(orderToRelease);
    if (!base64Image) return;

    sendChatMessage(
      { message: base64Image, contentType: "pic", orderId: orderToRelease.id, keyType: activeTab },
      { onSuccess: () => releaseAssets({ orderId: orderToRelease.id, keyType: activeTab }) },
    );

    setShowModal(false);
    setOrderToRelease(null);
  };

  if (isLoading) return <p>Carregando ordens...</p>;
  if (error) return <p>Erro ao carregar ordens.</p>;
  if (!data) return <p>Sem ordens pendentes.</p>;

  const orders = data[activeTab as keyof typeof data] || [];

  return (
    <div className="flex h-fit w-full flex-col gap-4 rounded-16 bg-white p-4 shadow-2xl">
      <h3 className="text-28 font-bold">Ordens Pendentes</h3>
      {/* Tabs */}
      <div className="flex gap-2">
        {["empresa", "pessoal"].map((tab) => {
          const hasOrders = (data[tab as keyof typeof data] || []).length > 0;

          return (
            <div key={tab} className="relative">
              <Button
                onClick={() => setActiveTab(tab as KeyType)}
                className={`rounded-6 p-2 ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                {tab === "empresa" ? "Bybit E" : "Bybit P"}
              </Button>

              {/* Bolinha vermelha de notificação */}
              {hasOrders && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Lista de ordens */}
      {orders.length === 0 ? (
        <p>Sem ordens em {activeTab}.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="flex w-fit flex-col gap-0.5 rounded-xl border border-gray-200 p-4 shadow"
            >
              <p>
                <strong>ID da Ordem:</strong> {order.id}
              </p>
              <p>
                <strong>Data:</strong> {order.formattedDate || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {order.status === 10 ? "Pendente" : "À liberar"}
              </p>
              <p>
                <strong>Apelido:</strong> {order.targetNickName || "Não informado"}
              </p>
              <p>
                <strong>Nome:</strong> {order.buyerRealName || "Não informado"}
              </p>
              <p>
                <strong>Ativo:</strong> {order.tokenId}
              </p>
              <p>
                <strong>Tipo:</strong> {order.side === 0 ? "compras" : "vendas"}
              </p>
              <p>
                <strong>Quantidade:</strong> {order.notifyTokenQuantity}
              </p>
              <p>
                <strong>Valor:</strong> R$ {order.amount}
              </p>
              <p>
                <strong>Preço Unitário:</strong> R$ {order.price?.replace(".", ",")}
              </p>
              <p>
                <strong>CPF/CNPJ:</strong> {order.document || "Não informado"}
              </p>

              {order.messages?.length > 0 && (
                <div className="mt-2 max-h-40 max-w-[600px] overflow-y-auto rounded-md border bg-gray-50 p-2">
                  <p className="mb-1 text-sm font-semibold">Mensagens:</p>
                  <div className="flex flex-col gap-1">
                    {order.messages.map((msg: any, i: number) => (
                      <div
                        key={i}
                        className={`rounded p-2 text-sm shadow-inner ${
                          ["crypto tech dev", "crypto tech dv"].includes(msg.nickName)
                            ? "bg-gray-100"
                            : "bg-red-100"
                        }`}
                      >
                        {msg.contentType === "pic" ? (
                          <img
                            src={msg.message}
                            alt={`Imagem ${i + 1}`}
                            className="max-w-xs rounded-md"
                          />
                        ) : (
                          <p>{msg.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Caixa de envio de mensagem */}
              <ChatBox orderId={order.id} keyType={activeTab} />

              <Button
                disabled={order.status === 10 || order.side === 0 || acesso !== "Master"}
                onClick={() => handleSendReceipt(order)}
              >
                Enviar Recibo
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && orderToRelease && (
        <ConfirmationDelete
          text={`Você tem certeza que deseja liberar para ${orderToRelease.buyerRealName} o valor de ${orderToRelease.amount}?`}
          onConfirm={handleConfirmRelease}
          onCancel={() => {
            setShowModal(false);
            setOrderToRelease(null);
          }}
        />
      )}
    </div>
  );
};
