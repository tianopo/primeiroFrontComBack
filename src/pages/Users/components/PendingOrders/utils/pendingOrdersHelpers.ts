import { CRYPTOTECH_NAME } from "./pendingOrdersConfig";
import { TabConfig, TabKey, OrderLike } from "./pendingOrdersTypes";

export const onlyDigits = (v?: string) => String(v ?? "").replace(/\D/g, "");
export const isCpfCnpj = (v?: string) => [11, 14].includes(onlyDigits(v).length);
export const brl = (v: unknown) => String(v ?? "").replace(".", ",");
export const isBybit = (config: TabConfig) => config.exchangeName === "Bybit";
export const isBinance = (config: TabConfig) => config.exchangeName === "Binance";

export const getEndToEnd = (value: unknown) => {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";

  const data = value as {
    originalEndToEnd?: unknown;
    endToEndId?: unknown;
    endToEnd?: unknown;
  };

  return String(data.originalEndToEnd ?? data.endToEndId ?? data.endToEnd ?? "").trim();
};

export const getOrdersByTab = (data: unknown, tab: TabKey) => {
  const value = (data as Record<string, unknown> | null)?.[tab];

  if (Array.isArray(value)) return value as OrderLike[];
  if (value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: OrderLike[] }).items;
  }

  return [];
};

export const isBotCancel = (m: unknown) =>
  [
    "You have a new appeal. Please negotiate and communicate with the other party within the valid period.",
    "anular ordem",
    "CRYPTOTECH: anular ordem",
    "CRYPTOTECH: Anular ordem",
  ].includes(
    String(
      (m as { mensagem?: unknown; message?: unknown })?.mensagem ??
        (m as { message?: unknown })?.message ??
        "",
    ),
  );

export const legacyOrder = (o: OrderLike, exchangeName: string) => ({
  ...o,
  exchange: exchangeName,
  amount: o.valor,
  currencyId: o.moeda,
  tokenId: o.token,
  price: o.preco,
  notifyTokenQuantity: o.quantidade,
  targetNickName: o.apelido,
  targetUserId: o.uid,
  sellerRealName: o.vendedor,
  buyerRealName: o.comprador,
  formattedDate: o.data,
  document: o.documento,
  paymentTerms: o.pagamento ?? [],
  pixInStatement: o.endtoend,
  messages: o.mensagens ?? [],
});

export const getSavedTab = (): TabKey => {
  if (typeof window === "undefined") return "bybitCryptotech";

  const stored = window.localStorage.getItem("pendingOrdersActiveTab");

  if (stored === "bybitPessoal" || stored === "pessoal") return "bybitPessoal";
  if (stored === "binance") return "binance";

  return "bybitCryptotech";
};

export const complianceState = (c: unknown) => {
  const compliance = c as { status?: unknown; blocked?: unknown } | null;
  const status = String(compliance?.status ?? "").toUpperCase();

  if (compliance?.blocked || status === "BLOCKED")
    return [
      "bg-red-50 border-red-300 shadow-red-100",
      "bg-red-100 text-red-800 border border-red-300",
      "Compliance bloqueado",
    ];

  if (status === "RESTRICTED")
    return [
      "bg-amber-50 border-amber-300 shadow-amber-100",
      "bg-amber-100 text-amber-800 border border-amber-300",
      "Compliance restrito",
    ];

  if (["PENDING", "ENHANCED_DUE_DILIGENCE"].includes(status))
    return [
      "bg-yellow-50 border-yellow-300 shadow-yellow-100",
      "bg-yellow-100 text-yellow-800 border border-yellow-300",
      "Compliance pendente",
    ];

  if (status === "MONITORING")
    return [
      "bg-blue-50 border-blue-300 shadow-blue-100",
      "bg-blue-100 text-blue-800 border border-blue-300",
      "Compliance monitorado",
    ];

  if (status === "APPROVED")
    return [
      "bg-green-50 border-green-300 shadow-green-100",
      "bg-green-100 text-green-800 border border-green-300",
      "Compliance aprovado",
    ];

  return ["bg-white border-gray-200 shadow", "", ""];
};

export const statusLabel = (config: TabConfig, status: unknown) => {
  const n = Number(status);

  if (isBinance(config)) {
    if (n === 1) return "Aguardando pagamento";
    if (n === 2) return "Pago / Aguardando liberação";
    if (n === 3) return "Processando / Disputa";
    if (n === 4) return "Concluída";
    return String(status ?? "N/A");
  }

  if (n === 10) return "Pendente";
  if (n === 20) return "Pago / Aguardando liberação";
  if (n === 30) return "Apelando";

  return "À liberar";
};

export const canActByStatus = (config: TabConfig, order: OrderLike, isBuyOrder: boolean) => {
  const status = Number(order.status);

  if (isBinance(config)) return isBuyOrder ? status === 1 : status === 2;

  return isBuyOrder ? status === 10 : status > 10 && status < 30;
};

export const buildBinanceOrderContext = (order: OrderLike) => ({
  orderNumber: String(order.id ?? ""),
  asset: String(order.token ?? ""),
  fiat: String(order.moeda ?? ""),
  amount: String(order.quantidade ?? ""),
  totalPrice: String(order.valor ?? ""),
  unitPrice: String(order.preco ?? ""),
  tradeType: Number(order.side) === 1 ? "SELL" : "BUY",
  buyerNickname: Number(order.side) === 1 ? String(order.apelido ?? "") : CRYPTOTECH_NAME,
  sellerNickname: Number(order.side) === 0 ? String(order.apelido ?? "") : CRYPTOTECH_NAME,
  counterpartyName:
    Number(order.side) === 1 ? String(order.comprador ?? "") : String(order.vendedor ?? ""),
});
