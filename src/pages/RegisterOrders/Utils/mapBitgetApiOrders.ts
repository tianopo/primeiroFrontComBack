import { BitgetP2POrder } from "../hooks/Bitget/bitgetOrders.types";

const pad = (value: number) => String(value).padStart(2, "0");

const formatTimestamp = (timestamp: string): string => {
  const milliseconds = Number(timestamp);

  if (!Number.isFinite(milliseconds)) {
    return "";
  }

  const date = new Date(milliseconds);

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    " ",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds()),
  ].join("");
};

const decimalString = (value: unknown, decimals = 2): string => {
  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".");

  const number = Number(normalized);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toFixed(decimals).replace(".", ",");
};

export const mapBitgetApiOrders = (orders: BitgetP2POrder[]) => {
  return orders
    .filter((order) => String(order.status).toLowerCase() === "completed")
    .map((order) => {
      const nome = String(order.counterparty ?? "").trim();

      return {
        numeroOrdem: String(order.orderId).trim(),

        /*
         * A data usada será a última atualização da ordem,
         * que normalmente representa sua conclusão.
         */
        dataHora: formatTimestamp(order.updatedTime || order.createdTime),

        exchange: "Bitget https://www.bitget.com/ SC",

        ativo: String(order.token ?? "USDT")
          .trim()
          .toUpperCase(),

        tipo: String(order.side).toLowerCase() === "buy" ? "compras" : "vendas",

        /*
         * Get All Orders retorna counterparty, mas não
         * retorna obrigatoriamente o nome civil.
         */
        nome,
        apelido: "",

        quantidade: decimalString(order.quantity, 8),

        valor: decimalString(order.amount, 2),

        valorToken: decimalString(order.price, 8),

        taxa: decimalString(order.fee, 8),
      };
    })
    .filter((order) => order.numeroOrdem && order.dataHora && order.nome);
};
