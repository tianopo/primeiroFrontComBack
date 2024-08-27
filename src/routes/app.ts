export const app = {
  // Before Login
  register: "/cadastro",
  login: "/login",
  forgotPassword: "/esqueceu-senha",
  recoverPassword: (token: string) => `/recuperar-senha/${token}`,
  membership: (token: string) => `/formulario-adesao/${token}`,

  // After Login
  auth: "/",
  home: "/inicio",
  schedule: "/agenda",
  projects: "/projetos",
  financial: "/financeiro",
  management: "/administracao",
  user: "/usuario",
  userUpdate: (id: string) => `/usuario/${id}`,
};
