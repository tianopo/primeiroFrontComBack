import { Button } from "src/components/Buttons/Button";
import { generateSingleReceipt } from "src/pages/Documents/config/handleReceipt";
import { useListPendingOrders } from "../hooks/useListPendingOrders";

export const PendingOrders = () => {
  const { data, isLoading, error } = useListPendingOrders();

  if (isLoading) return <p>Carregando ordens...</p>;
  if (error) return <p>Erro ao carregar ordens.</p>;
  if (!data || data.length === 0) return <p>Sem ordens pendentes.</p>;
  console.log(data);
  return (
    <div className="flex h-fit w-full flex-col rounded-16 bg-white p-4 shadow-2xl">
      <h3 className="mb-4 text-28 font-bold">Ordens Pendentes</h3>

      {data.map((order: any) => {
        return (
          <div key={order.id} className="mb-4 rounded-xl border border-gray-200 p-4 shadow">
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

            <Button
              className="mt-3"
              onClick={() => generateSingleReceipt({ ...order, numeroOrdem: order.id })}
            >
              Gerar Comprovante
            </Button>
          </div>
        );
      })}
    </div>
  );
};
