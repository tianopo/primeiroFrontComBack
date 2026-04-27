import { DeskdataDataset, DeskdataKind } from "../utils/deskdataTypes";

export interface DeskdataOption {
  value: DeskdataDataset;
  label: string;
  description: string;
}

export const DESKDATA_OPTIONS_BY_KIND: Record<DeskdataKind, DeskdataOption[]> = {
  CPF: [
    {
      value: "basic",
      label: "Dados básicos",
      description: "Nome, documentos, estado civil e dados cadastrais.",
    },
    { value: "phones", label: "Telefones", description: "Telefones associados ao CPF." },
    { value: "addresses", label: "Endereços", description: "Endereços associados ao CPF." },
    { value: "emails", label: "E-mails", description: "E-mails associados ao CPF." },
    {
      value: "relationships",
      label: "Relacionamentos",
      description: "Relacionamentos pessoais e profissionais.",
    },
    {
      value: "relationships_phones",
      label: "Telefones de relacionamentos",
      description: "Telefones das pessoas relacionadas.",
    },
    {
      value: "relationships_addresses",
      label: "Endereços de relacionamentos",
      description: "Endereços das pessoas relacionadas.",
    },
    {
      value: "relationships_emails",
      label: "E-mails de relacionamentos",
      description: "E-mails das pessoas relacionadas.",
    },
    {
      value: "lawsuits",
      label: "Processos",
      description: "Processos judiciais associados ao CPF.",
    },
  ],
  CNPJ: [
    { value: "phones", label: "Telefones", description: "Telefones associados ao CNPJ." },
    { value: "addresses", label: "Endereços", description: "Endereços associados ao CNPJ." },
    { value: "emails", label: "E-mails", description: "E-mails associados ao CNPJ." },
    {
      value: "relationships",
      label: "Relacionamentos",
      description: "QSA, empregados e outros relacionamentos da empresa.",
    },
    {
      value: "relationships_phones",
      label: "Telefones de relacionamentos",
      description: "Telefones das entidades relacionadas.",
    },
    {
      value: "relationships_addresses",
      label: "Endereços de relacionamentos",
      description: "Endereços das entidades relacionadas.",
    },
    {
      value: "relationships_emails",
      label: "E-mails de relacionamentos",
      description: "E-mails das entidades relacionadas.",
    },
  ],
};

export const DESKDATA_LABELS: Record<DeskdataDataset, string> = {
  basic: "Dados básicos",
  phones: "Telefones",
  addresses: "Endereços",
  emails: "E-mails",
  relationships: "Relacionamentos",
  relationships_phones: "Telefones de relacionamentos",
  relationships_addresses: "Endereços de relacionamentos",
  relationships_emails: "E-mails de relacionamentos",
  lawsuits: "Processos",
};
