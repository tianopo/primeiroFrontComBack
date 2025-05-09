import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { ConfirmationDelete } from "src/components/Modal/ConfirmationDelete";
import { generateSingleReceipt } from "src/pages/Documents/config/handleReceipt";
import { useListPendingOrders } from "../hooks/useListPendingOrders";
import { useReleaseAssets } from "../hooks/useReleaseAssets";
import { useSendChatMessage } from "../hooks/useSendChatMessage";

export const PendingOrders = () => {
  const { data, isLoading, error } = useListPendingOrders();
  const { mutate: sendChatMessage, isPending } = useSendChatMessage();
  const { mutate: releaseAssets } = useReleaseAssets();

  const [showModal, setShowModal] = useState(false);
  const [orderToRelease, setOrderToRelease] = useState<string | null>(null);
  const [orderName, setOrderName] = useState<string>("");

  const handleSendReceipt = async (order: any) => {
    const base64Image = await generateSingleReceipt(order);
    if (!base64Image) return;

    sendChatMessage(
      {
        message: base64Image,
        contentType: "pic",
        orderId: order.id,
      },
      {
        onSuccess: () => {
          setOrderName(order.buyerRealName);
          setOrderToRelease(order.id);
          setShowModal(true);
        },
      },
    );
  };

  const handleConfirmRelease = () => {
    if (orderToRelease) {
      releaseAssets({ orderId: orderToRelease });
    }
    setShowModal(false);
    setOrderToRelease(null);
  };

  const handleCancelRelease = () => {
    setShowModal(false);
    setOrderToRelease(null);
  };

  if (isLoading) return <p>Carregando ordens...</p>;
  if (error) return <p>Erro ao carregar ordens.</p>;
  if (!data || data.length === 0) return <p>Sem ordens pendentes.</p>;

  return (
    <div className="flex h-fit w-full flex-col flex-wrap gap-2 rounded-16 bg-white p-4 shadow-2xl md:flex-row">
      <h3 className="mb-4 w-full text-28 font-bold">Ordens Pendentes</h3>

      {data.map((order: any) => {
        return (
          <div key={order.id} className="mb-4 w-fit rounded-xl border border-gray-200 p-4 shadow">
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
              <strong>Tipo:</strong> {order.side === 0 ? "Compra" : "Venda"}
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

            <Button className="mt-3" onClick={() => handleSendReceipt(order)}>
              Enviar Recibo
            </Button>
          </div>
        );
      })}
      {/* Modal de confirmação de liberação */}
      {showModal && (
        <ConfirmationDelete
          text={`Você tem certeza que deseja liberar para ${orderName}?`}
          onConfirm={handleConfirmRelease}
          onCancel={handleCancelRelease}
        />
      )}
    </div>
  );
};
