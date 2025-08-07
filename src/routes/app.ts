export const app = {
  /* Before Login */
  first: "/",
  register: "/cadastro",
  login: "/login",
  forgotPassword: "/esqueceu-senha",
  recoverPassword: (token: string) => `/recuperar-senha/${token}`,
  membership: (token: string) => `/formulario-adesao/${token}`,
  unauthorized: "/unauthorized",

  /* After Login */
  auth: "/auth",
  home: "/inicio",
  kyc: "kyc",
  pld: "pld",
  //  CryptoTech
  registerOrders: "/register-orders",
  users: "/users",
  documentsGenerator: "/generator-documents",
  closing: "/closing",
};
