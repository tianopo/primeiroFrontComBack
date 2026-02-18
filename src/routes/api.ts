export const apiRoute = {
  /* AUTENTICAÇÃO */
  signin: "/auth/signin",
  signup: "/auth/signup",
  logout: (token: string) => `/auth/logout/${token}`,
  token: (token: string) => `/user/${token}`,
  changePassword: "/auth/change-password",

  multa: "send/multa",
  /* ORDENS */
  orders: "orders",
  tax: "orders/tax",
  comercial: "orders/comercial",
  qrCode: "orders/qrCode",
  changeStatus: (orderId: string) => `/orders/${orderId}/status/advance`,
  /* COMPLIANCE */
  compliance: "compliance",
  operation: "compliance/operation",
  operationId: (id: string) => `compliance/operation/delete/${id}`,
  /* USER */
  user: "user",
  account: "user/account",
  userId: (id: string) => `user/account/${id}`,
  /* BYBIT */
  sendChatMessageBybit: "bybit/send-chat-message",
  releaseAssets: "bybit/release-assets",
  uploadChatMessage: "bybit/upload-chat-message",
  pendingOrders: "bybit/pending-orders",
  /* BINANCE */
  binanceOrdersWithChats: "binance/order/detail-with-messages",
  referencePrice: "binance/reference-price",
  sendChatMessageBinance: "binance/chat/send",
  /* WHATSAPP */
  notifyWhatsapp: "whatsapp/notify",
  /* API */
  exchangeOffsets: "api/exchange-offsets",
  /* CORPX */
  corpxPix: {
    balance: `/corpx/balance`,
    statement: `/corpx/accounts/statement`,
    limits: `/corpx/limits`,
    pixOut: `/corpx/out`,
    refund: `/corpx/refund`,
    transactionStatus: `/corpx/transactions/status`,
    qrcodes: `/corpx/qrcodes`,
    qrcode: `/corpx/qrcode`,
    qrcodeDynamic: `/corpx/qrcode/dynamic`,
    meds: `/corpx/med`,
    respondMed: (medId: string) => `/corpx/med/${medId}/response`,
  },
};
