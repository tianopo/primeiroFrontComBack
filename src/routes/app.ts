export const app = {
  /* Before Login */
  first: "/",
  register: "/cadastro",
  login: "/login",
  forgotPassword: "/esqueceu-senha",
  recoverPassword: (token: string) => `/recuperar-senha/${token}`,
  membership: (token: string) => `/formulario-adesao/${token}`,

  /* After Login */
  auth: "/auth",
  home: "/inicio",
  //  CryptoTech
  registerOrders: "/register-orders",
  users: "/users",
  tax: "/tax",
  documentsGenerator: "/generator-documents",
  closing: "/closing",
};
