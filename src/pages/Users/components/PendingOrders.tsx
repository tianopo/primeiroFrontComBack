import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { ConfirmationDelete } from "src/components/Modal/ConfirmationDelete";
import { generateSingleReceipt } from "src/pages/Home/config/handleReceipt";
import { useListPendingOrders } from "../hooks/useListPendingOrders";
import { useReleaseAssets } from "../hooks/useReleaseAssets";
import { useSendChatMessage } from "../hooks/useSendChatMessage";

export const PendingOrders = () => {
  const { data, isLoading, error } = useListPendingOrders();
  const { mutate: sendChatMessage } = useSendChatMessage();
  const { mutate: releaseAssets } = useReleaseAssets();

  const [showModal, setShowModal] = useState(false);
  const [orderToRelease, setOrderToRelease] = useState<any>(null); // agora guarda o objeto completo

  const handleSendReceipt = (order: any) => {
    setOrderToRelease(order);
    setShowModal(true);
  };

  const handleConfirmRelease = async () => {
    if (!orderToRelease) return;

    const base64Image = await generateSingleReceipt(orderToRelease);
    if (!base64Image) return;

    sendChatMessage(
      {
        message: base64Image,
        contentType: "pic",
        orderId: orderToRelease.id,
      },
      {
        onSuccess: () => {
          releaseAssets({ orderId: orderToRelease.id });
        },
      },
    );

    setShowModal(false);
    setOrderToRelease(null);
  };

  const handleCancelRelease = () => {
    setShowModal(false);
    setOrderToRelease(null);
  };

  if (isLoading) return <p>Carregando ordens...</p>;
  if (!data || data.length === 0) return <p>Sem ordens pendentes.</p>;
  if (error) return <p>Erro ao carregar ordens.</p>;

  return (
    <div className="flex h-fit w-full flex-col flex-wrap gap-2 rounded-16 bg-white p-4 shadow-2xl md:flex-row">
      <h3 className="mb-4 w-full text-28 font-bold">Ordens Pendentes</h3>

      {data.map((order: any) => (
        <div
          key={order.id}
          className="flex w-fit flex-col gap-0.5 rounded-xl border border-gray-200 p-4 shadow"
        >
          <p>
            <strong>ID da Ordem:</strong> {order.id}
          </p>
          <p>
            <strong>Data da Ordem:</strong> {order.formattedDate || "N/A"}
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
            <strong>Preço Unitário:</strong> R$ {order.price.replace(".", ",")}
          </p>
          <p>
            <strong>CPF/CNPJ:</strong> {order.document || "Não informado"}
          </p>
          {order.messages && (
            <div className="mt-2 max-h-40 max-w-[600px] overflow-y-auto rounded-md border border-gray-300 bg-gray-50 p-2">
              <p className="mb-1 text-sm font-semibold">Mensagens:</p>
              <div className="flex flex-col gap-1">
                {order.messages.map((msg: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className={`rounded p-2 text-sm shadow-inner ${msg.nickName === "crypto tech dev" ? "bg-gray-100" : "bg-red-100"}`}
                    >
                      {msg.contentType === "pic" ? (
                        <img
                          src={msg.message}
                          alt={`Imagem ${index + 1}`}
                          className="max-w-xs rounded-md"
                        />
                      ) : (
                        <p>{msg.message}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <Button
            disabled={order.status === 10 || order.side === 0}
            onClick={() => handleSendReceipt(order)}
          >
            Enviar Recibo
          </Button>
        </div>
      ))}

      {/* Modal de confirmação */}
      {showModal && orderToRelease && (
        <ConfirmationDelete
          text={`Você tem certeza que deseja liberar para ${orderToRelease.buyerRealName} o valor de ${orderToRelease.amount}?`}
          onConfirm={handleConfirmRelease}
          onCancel={handleCancelRelease}
        />
      )}
    </div>
  );
};
