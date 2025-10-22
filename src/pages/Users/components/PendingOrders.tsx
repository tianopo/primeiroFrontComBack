// ...imports já existentes
import { Copy } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { ConfirmationDelete } from "src/components/Modal/ConfirmationDelete";
import { generateSingleReceipt } from "src/pages/Home/config/handleReceipt";
import { useAccessControl } from "src/routes/context/AccessControl";
import { useListPendingOrders } from "../hooks/useListPendingOrders";
import { useReleaseAssets } from "../hooks/useReleaseAssets";
import { useSendChatMessage } from "../hooks/useSendChatMessage";
import { ChatBox } from "./ChatBox";
import { OrderMessages } from "./OrderMessages";
import { CryptotechOrders } from "./PendingOrders/CryptotechOrders";

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

export type KeyType = "empresa" | "pessoal" | "cryptotech";

export const PendingOrders = ({ setForm, setInitialRegisterData }: IPendingOrders) => {
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

  const orders = (data[activeTab as keyof typeof data] as any[]) || [];
  return (
    <CardContainer full>
      <h3 className="text-28 font-bold">ORDENS PENDENTES</h3>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "empresa", label: "Bybit E" },
          { key: "pessoal", label: "Bybit P" },
          { key: "cryptotech", label: "Cryptotech" },
        ].map(({ key, label }) => {
          const hasOrders = ((data as any)[key] || []).length > 0;
          return (
            <div key={key} className="relative">
              <Button
                onClick={() => setActiveTab(key as KeyType)}
                className={`rounded-6 p-2 ${activeTab === key ? "bg-blue-500 text-white" : "bg-gray-200"}`}
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
      ) : (
        <div className="flex flex-wrap gap-2">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="relative flex w-fit flex-col gap-0.5 rounded-xl border border-gray-200 p-4 shadow"
            >
              <button
                className="absolute right-2 top-2 rounded-6 border border-gray-200 bg-white p-2 hover:bg-gray-100 hover:opacity-80"
                onClick={() => {
                  setInitialRegisterData({
                    apelido: order.targetNickName || "",
                    nome: order.buyerRealName || "",
                    exchange:
                      activeTab === "empresa"
                        ? "Bybit https://www.bybit.com/ SG"
                        : "Bybit https://www.bybit.com/ SG",
                  });
                  setForm(true);
                  navigator.clipboard.writeText((order.buyerRealName || "").trim());
                }}
              >
                <Copy width={20} height={20} weight="duotone" />
              </button>

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

              <OrderMessages messages={order.messages} />
              <ChatBox orderId={order.id} keyType={activeTab} />

              <Button
                disabled={
                  order.status <= 10 ||
                  order.side === 0 ||
                  acesso !== "Master" ||
                  order.document === "documento não disponível" ||
                  order.messages.length === 0 ||
                  order.messages
                    ?.slice(0)
                    .reverse()
                    .slice(-10)
                    .some((msg: any) =>
                      [
                        "You have a new appeal. Please negotiate and communicate with the other party within the valid period.",
                        "anular ordem",
                        "CRYPTOTECH: anular ordem",
                        "usuário de risco inegociável, não podemos fazer a transação, contraparte cancele",
                      ].includes(msg.message),
                    )
                }
                onClick={() => handleSendReceipt(order)}
              >
                {order.status === 8
                  ? "Aceite a ordem"
                  : order.status === 10
                    ? "Confirmação da Contraparte"
                    : "Enviar Recibo"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Bybit E/P (permanece aqui para esses tabs) */}
      {showModal && orderToRelease && activeTab !== "cryptotech" && (
        <ConfirmationDelete
          text={`Você tem certeza que deseja liberar para ${orderToRelease.buyerRealName} o valor de ${orderToRelease.amount}?`}
          onConfirm={handleConfirmRelease}
          onCancel={() => {
            setShowModal(false);
            setOrderToRelease(null);
          }}
        />
      )}
    </CardContainer>
  );
};
