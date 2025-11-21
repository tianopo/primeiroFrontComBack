// src/pages/PendingOrders/PendingOrders/CoinexOrders.tsx
import { Copy } from "@phosphor-icons/react";
import { Button } from "src/components/Buttons/Button";

type CoinexOrder = {
  order_id: number | string;
  order_num: string;
  ad_id: string;
  status: string; // FINISHED, CREATED, CONFIRMED, PAID, etc.
  created_at?: number; // epoch ms
  finished_at?: number; // epoch ms
  confirm_due_at?: number; // epoch ms
  payment_due_at?: number; // epoch ms
  order_side: "buy" | "sell";
  price: string; // ex.: "200000"
  base_ccy: string; // ex.: "BTC"
  base_ccy_amount: string; // ex.: "0.1"
  quote_ccy: string; // ex.: "BRL"
  quote_ccy_amount: string; // ex.: "20000"
  cancel_type?: string;
};

const formatDate = (ts?: number) => (ts ? new Date(ts).toLocaleString("pt-BR") : "N/A");

const labelStatus = (s?: string) => s ?? "N/A";
const labelSide = (s?: string) => (s === "buy" ? "compras" : s === "sell" ? "vendas" : "N/A");
const brl = (v?: string | number) => (v != null ? `R$ ${String(v).replace(".", ",")}` : "N/A");

export const CoinexOrders = ({ orders, title }: { orders: CoinexOrder[]; title?: string }) => {
  if (!orders || orders.length === 0) {
    return <p>Sem ordens em coinex</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {title && <h4 className="text-lg font-semibold">{title}</h4>}

      <div className="flex flex-wrap gap-2">
        {orders.map((order) => (
          <div
            key={`${order.order_id}-${order.order_num}`}
            className="relative flex w-fit flex-col gap-0.5 rounded-xl border border-gray-200 p-4 shadow"
          >
            <button
              className="absolute right-2 top-2 rounded-6 border border-gray-200 bg-white p-2 hover:bg-gray-100 hover:opacity-80"
              onClick={() => navigator.clipboard.writeText(order.order_num)}
              title="Copiar número da ordem"
            >
              <Copy width={20} height={20} weight="duotone" />
            </button>

            <p>
              <strong>ID:</strong> {order.order_id}
            </p>
            <p>
              <strong>Nº:</strong> {order.order_num}
            </p>
            <p>
              <strong>Status:</strong> {labelStatus(order.status)}
            </p>
            <p>
              <strong>Data Criação:</strong> {formatDate(order.created_at)}
            </p>
            {order.finished_at ? (
              <p>
                <strong>Data Finalização:</strong> {formatDate(order.finished_at)}
              </p>
            ) : null}
            <p>
              <strong>Tipo:</strong> {labelSide(order.order_side)}
            </p>

            <p>
              <strong>Ativo:</strong> {order.base_ccy}
            </p>
            <p>
              <strong>Quantidade:</strong> {order.base_ccy_amount}
            </p>

            <p>
              <strong>Moeda:</strong> {order.quote_ccy}
            </p>
            <p>
              <strong>Valor:</strong> {order.quote_ccy_amount}
            </p>

            <p>
              <strong>Preço:</strong> {brl(order.price)}
            </p>
            <p>
              <strong>Anúncio ID:</strong> {order.ad_id}
            </p>

            {order.cancel_type ? (
              <p>
                <strong>Motivo cancelamento:</strong> {order.cancel_type}
              </p>
            ) : null}

            {/* Coinex: sem chat, sem mensagens, sem modal de recibo */}
            <div className="mt-2 flex gap-2">
              <Button
                onClick={() =>
                  navigator.clipboard.writeText(
                    [
                      `ORDEM: ${order.order_num}`,
                      `QUANTIDADE: ${order.base_ccy_amount}`,
                      `VALOR: ${order.quote_ccy_amount}`,
                      `STATUS: ${labelStatus(order.status)}`,
                      `TIPO: ${labelSide(order.order_side)}`,
                      `ATIVO: ${order.base_ccy_amount} ${order.base_ccy}`,
                      `MOEDA: ${order.quote_ccy_amount} ${order.quote_ccy}`,
                      `PREÇO: ${order.price}`,
                    ].join(" | "),
                  )
                }
                className="rounded-6 bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200"
              >
                Copiar resumo
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
