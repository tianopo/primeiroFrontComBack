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
  /* COMPLIANCE */
  compliance: "compliance",
  operation: "compliance/operation",
  operationId: (id: string) => `compliance/operation/delete/${id}`,
  /* USER */
  user: "user",
  account: "user/account",
  userId: (id: string) => `user/account/${id}`,
  /* BYBIT */
  pendingOrders: "bybit/pending-orders",
  sendChatMessage: "bybit/send-chat-message",
  releaseAssets: "bybit/release-assets",
  uploadChatMessage: "bybit/upload-chat-message",
  /* FIDUCIA */
  consultarExtrato: (di: string, df: string) => `fiducia/conta/extrato/${di}/${df}/DESC/10`,
  extrato: "fiducia/pix/spi/extrato",
  balance: "fiducia/conta/saldo",
};
