export const apiRoute = {
  /* AUTENTICAÇÃO */
  signin: "/auth/signin",
  signup: "/auth/signup",
  logout: (token: string) => `/auth/logout/${token}`,
  token: (token: string) => `/user/${token}`,
  changePassword: "/auth/change-password",
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
  complianceUpdate: `/compliance/document`,
  complianceEvidenceUpload: (document: string) =>
    `/compliance/document/${encodeURIComponent(document)}/evidence`,
  complianceEvidenceReview: (evidenceId: string) => `/compliance/evidence/${evidenceId}/status`,
  complianceCreateMed: (document: string) =>
    `/compliance/document/${encodeURIComponent(document)}/med`,
  complianceDeleteMed: (eventId: string) => `/compliance/med/${eventId}/delete`,
  /* DESKDATA */
  deskdataSync: "/deskdata/sync",
  /* USER */
  user: "user",
  account: "user/account",
  userId: (id: string) => `user/account/${id}`,
  /* BYBIT */
  sendChatMessageBybit: "bybit/send-chat-message",
  releaseAssets: "bybit/release-assets",
  uploadChatMessage: "bybit/upload-chat-message",
  bybitMarkOrderAsPaid: "bybit/mark-paid-auto",
  /* BINANCE */
  binanceOrdersWithChats: "binance/order/detail-with-messages",
  referencePrice: "binance/reference-price",
  sendChatMessageBinance: "binance/chat/send",
  binanceCheckAndReleaseCoin: "/binance/order/check-and-release-coin",
  binanceMarkOrderAsPaid: "binance/order/mark-paid-auto",
  /* EXCHANGES */
  pendingOrders: "exchanges/pending-orders",
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
    dictLookup: (pixKey: string) => `/corpx/pix/${encodeURIComponent(pixKey)}`,
    refund: `/corpx/refund`,
    transactionStatus: `/corpx/transactions/status`,
    qrcodes: `/corpx/qrcodes`,
    qrcode: `/corpx/qrcode`,
    qrcodeDynamic: `/corpx/qrcode/dynamic`,
    meds: `/corpx/med`,
    respondMed: (medId: string) => `/corpx/med/${medId}/response`,
  },
  /* GOWD */
  gowd: {
    balance: "/gowd/balance",
    statement: "/gowd/statement",
    refund: "/gowd/refund",
    pixOut: "/gowd/payouts/brazil/pix",
    statementRedis: `/gowd/statement/redis`,
    statementRedisVerificationBulk: "/gowd/statement/redis/verification/bulk",
  },
};
