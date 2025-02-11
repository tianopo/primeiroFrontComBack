export const apiRoute = {
  signin: "/auth/signin",
  signup: "/auth/signup",
  logout: (token: string) => `/auth/logout/${token}`,
  token: (token: string) => `/user/${token}`,

  multa: "send/multa",

  transactions: "transactions",
  tax: "transactions/tax",
  comercial: "transactions/comercial",

  compliance: "compliance",
  operation: "compliance/operation",
  operationId: (id: string) => `compliance/operation/delete/${id}`,

  buyer: "buyer",
};
