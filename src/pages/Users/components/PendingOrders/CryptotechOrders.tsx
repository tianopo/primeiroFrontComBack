import { Copy } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { ConfirmationDelete } from "src/components/Modal/ConfirmationDelete";
import { generateSingleReceipt } from "src/pages/Home/config/handleReceipt";
import { useAccessControl } from "src/routes/context/AccessControl";

type KeyType = "empresa" | "pessoal" | "cryptotech";

interface ICryptotechOrder {
  id: string;
  numeroOrdem: string;
  dataHora: string;
  exchange: string;
  ativo: string;
  quantidade: string;
  valor: string;
  valorToken?: string;
  taxa?: string;
  tipo: "compras" | "vendas";
  status: "Pending" | "Paid" | string;
  User: { name: string; document: string };
}

interface ICryptotechOrders {
  orders: ICryptotechOrder[];
  activeTab: KeyType;
  setForm: (x: boolean) => void;
  setInitialRegisterData: (x: { apelido: string; nome: string; exchange: string }) => void;
}

const statusLabel = (s?: string) =>
  s === "Pending" ? "Pendente" : s === "Paid" ? "Pago" : s || "N/A";

export const CryptotechOrders = ({
  orders,
  activeTab,
  setForm,
  setInitialRegisterData,
}: ICryptotechOrders) => {
  const { acesso } = useAccessControl();
  const [showModal, setShowModal] = useState(false);
  const [orderToRelease, setOrderToRelease] = useState<ICryptotechOrder | null>(null);

  const handleSendCoin = async (order: ICryptotechOrder) => {
    setShowModal(true);
  };

  const handleConfirmRelease = async () => {
    if (!orderToRelease) return;
    const base64Image = await generateSingleReceipt(orderToRelease as any);
    if (!base64Image) return;

    setShowModal(false);
    setOrderToRelease(null);
  };

  if (!orders || orders.length === 0) return <p>Sem ordens em Cryptotech.</p>;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {orders.map((order: ICryptotechOrder) => {
          const nome = order.User?.name || "";
          const doc = order.User?.document || "Não informado";
          const apelido = nome;
          console.log(order);
          return (
            <div
              key={order.id || order.numeroOrdem}
              className="relative flex w-fit flex-col gap-0.5 rounded-xl border border-gray-200 p-4 shadow"
            >
              <button
                className="absolute right-2 top-8 rounded-6 border border-gray-200 bg-white p-2 hover:bg-gray-100 hover:opacity-80"
                onClick={() => {
                  setInitialRegisterData({
                    apelido,
                    nome,
                    exchange: "CRYPTOTECH https://www.cryptotechdev.com/ BR",
                  });
                  setForm(true);
                  if (nome) navigator.clipboard.writeText(nome.trim());
                }}
              >
                <Copy width={20} height={20} weight="duotone" />
              </button>
              <div className=" mb-1 flex flex-col gap-0.5">
                <p>
                  <strong>ID/Ordem:</strong> {order.numeroOrdem || order.id}
                </p>
                <p>
                  <strong>Data/Hora:</strong> {order.dataHora || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {statusLabel(order.status)}
                </p>
                <p>
                  <strong>Nome:</strong> {nome || "Não informado"}
                </p>
                <p>
                  <strong>Ativo:</strong> {order.ativo}
                </p>
                <p>
                  <strong>Tipo:</strong> {order.tipo}
                </p>
                <p>
                  <strong>Quantidade:</strong> {order.quantidade}
                </p>
                <p>
                  <strong>Valor:</strong> {order.valor}
                </p>
                <p>
                  <strong>Valor Token:</strong> {order.valorToken || "-"}
                </p>
                <p>
                  <strong>CPF/CNPJ:</strong> {doc}
                </p>
              </div>
              <Button
                disabled={acesso !== "Master" || !doc || doc === "documento não disponível"}
                onClick={() => handleSendCoin(order)}
              >
                Enviar Moedas
              </Button>
            </div>
          );
        })}
      </div>

      {showModal && orderToRelease && (
        <ConfirmationDelete
          text={`Você tem certeza que deseja liberar para ${orderToRelease?.User?.name || "o cliente"} o valor de ${orderToRelease?.valor || "R$ 0,00"}?`}
          onConfirm={handleConfirmRelease}
          onCancel={() => {
            setShowModal(false);
            setOrderToRelease(null);
          }}
        />
      )}
    </>
  );
};
