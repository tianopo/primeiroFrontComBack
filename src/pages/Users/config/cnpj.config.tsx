export const cnpjFieldsConfig = [
  { label: "CNPJ", path: "cnpj" },
  { label: "Nome", path: "nome" },
  { label: "Nome Fantasia", path: "fantasia" },
  { label: "Abertura", path: "abertura" },
  { label: "Situação", path: "situacao" },
  { label: "Tipo", path: "tipo" },
  { label: "Porte", path: "porte" },
  { label: "Natureza Jurídica", path: "natureza_juridica" },
  {
    label: "Atividade Principal",
    render: (item: any) =>
      item?.atividade_principal?.map((v: any) => `${v.code} - ${v.text}`).join(", ") ??
      "Não informado",
  },
  {
    label: "Atividades Secundárias",
    render: (item: any) =>
      item?.atividades_secundarias?.map((v: any) => `${v.code} - ${v.text}`).join(", ") ??
      "Não informado",
  },
  {
    label: "QSA",
    render: (item: any) =>
      item?.qsa?.map((v: any) => `${v.nome} - ${v.qual}`).join(" / ") ?? "Não informado",
  },
  {
    label: "Endereço",
    render: (item: any) =>
      `${item?.logradouro ?? ""}, ${item?.numero ?? ""} - ${item?.bairro ?? ""}, ${
        item?.municipio ?? ""
      } - ${item?.uf ?? ""}, CEP: ${item?.cep ?? ""}`,
  },
  { label: "Email", path: "email" },
  { label: "Telefone", path: "telefone" },
  { label: "Capital Social", path: "capital_social" },
  { label: "Status", path: "status" },
];
