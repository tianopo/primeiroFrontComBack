export type BitgetOrderStatus =
  | "pending_payment"
  | "pending_release"
  | "completed"
  | "cancelled"
  | "in_appeal";

export type BitgetSide = "buy" | "sell";

export type BitgetP2POrder = {
  orderId: string;
  side: BitgetSide;
  token: string;
  fiat: string;
  price: string;
  amount: string;
  quantity: string;
  fee: string;
  counterparty: string;
  status: BitgetOrderStatus;
  createdTime: string;
  updatedTime: string;
};

export type BitgetOrdersPage = {
  items: BitgetP2POrder[];
  nextId?: string;
};

export type BitgetApiResponse<T> = {
  code: string;
  msg: string;
  requestTime: number;
  data: T;
};
