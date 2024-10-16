export const apiRoute = {
  signin: "/auth/signin",
  signup: "/auth/signup",
  logout: (token: string) => `/auth/logout/${token}`,
  token: (token: string) => `/user/${token}`,

  multa: "send/multa",
  transactions: "send/transactions",
  order: "send/transactions/order",

  compliance: "compliance",
  operation: "compliance/operation",
};
