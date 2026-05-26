import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { blockchainsOptions, estadoCivilOptions, walletOptions } from "src/utils/selectsOptions";
import * as Yup from "yup";

export type TDocumentType = "CPF" | "CNPJ";

export interface IUsuario {
  name: string;
  document: string;
}

export interface IService {
  usuario: IUsuario;
  tipoDocumento: TDocumentType;

  // Obrigatórios apenas quando a CONTRATANTE for pessoa jurídica.
  responsavelNome?: string;
  responsavelCpf?: string;
  responsavelEstadoCivil?: string;
  responsavelCargo?: string;

  // Destino fixo para operações em que a CONTRATANTE compra ativos.
  blockchain: string;
  enderecoCadastrado: string;
  wallet: string;

  // Endereço da pessoa física ou da sede da pessoa jurídica.
  cep: string;
  rua: string;
  cidade: string;
  numero: string;
  bairro: string;
  complemento?: string;
  estado: string;

  // Obrigatório apenas quando a CONTRATANTE for pessoa física.
  estadoCivil?: string;
}

export const cleanDocument = (value: string = "") => value.replace(/\D/g, "");

export const inferDocumentType = (document: string): TDocumentType | null => {
  const digits = cleanDocument(document);

  if (digits.length === 11) return "CPF";
  if (digits.length === 14) return "CNPJ";

  return null;
};

const hasRepeatedDigits = (document: string) => /^(\d)\1+$/.test(document);

const isValidCpf = (value?: string): boolean => {
  const cpf = cleanDocument(value);

  if (cpf.length !== 11 || hasRepeatedDigits(cpf)) return false;

  const calculateDigit = (length: number): number => {
    let sum = 0;

    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }

    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
};

const isValidCnpj = (value?: string): boolean => {
  const cnpj = cleanDocument(value);

  if (cnpj.length !== 14 || hasRepeatedDigits(cnpj)) return false;

  const calculateDigit = (base: string, weights: number[]): number => {
    const sum = base
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  const secondDigit = calculateDigit(
    `${cnpj.slice(0, 12)}${firstDigit}`,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
};

const schema = Yup.object({
  usuario: Yup.object({
    name: Yup.string().trim().required("Informe a CONTRATANTE."),
    document: Yup.string().trim().required("Informe o CPF ou CNPJ da CONTRATANTE."),
  }).required(),

  tipoDocumento: Yup.mixed<TDocumentType>()
    .oneOf(["CPF", "CNPJ"], "Selecione CPF ou CNPJ.")
    .required("Selecione o tipo de documento."),

  responsavelNome: Yup.string()
    .trim()
    .when("tipoDocumento", {
      is: "CNPJ",
      then: (field) => field.required("Informe o nome do responsável pela contratação."),
      otherwise: (field) => field.optional().strip(),
    }),

  responsavelCpf: Yup.string()
    .trim()
    .when("tipoDocumento", {
      is: "CNPJ",
      then: (field) =>
        field
          .required("Informe o CPF do responsável pela contratação.")
          .test("cpf-responsavel", "CPF do responsável inválido.", (value) => isValidCpf(value)),
      otherwise: (field) => field.optional().strip(),
    }),

  responsavelEstadoCivil: Yup.string().when("tipoDocumento", {
    is: "CNPJ",
    then: (field) =>
      field
        .oneOf(estadoCivilOptions, "Selecione um estado civil válido.")
        .required("Informe o estado civil do responsável."),
    otherwise: (field) => field.optional().strip(),
  }),

  responsavelCargo: Yup.string().trim().optional().max(100, "Máximo de 100 caracteres."),

  blockchain: Yup.string()
    .oneOf(blockchainsOptions, "Selecione uma rede válida.")
    .required("Selecione a rede vinculada."),

  enderecoCadastrado: Yup.string()
    .trim()
    .required("Informe o endereço cadastrado para recebimento de ativos.")
    .min(6, "Endereço inválido."),

  wallet: Yup.string()
    .oneOf(walletOptions, "Selecione uma carteira ou corretora válida.")
    .required("Selecione a carteira ou corretora."),

  estadoCivil: Yup.string().when("tipoDocumento", {
    is: "CPF",
    then: (field) =>
      field
        .oneOf(estadoCivilOptions, "Selecione um estado civil válido.")
        .required("Informe o estado civil da CONTRATANTE."),
    otherwise: (field) => field.optional().strip(),
  }),

  cep: Yup.string()
    .required("Informe o CEP.")
    .matches(/^\d{2}\.?\d{3}-?\d{3}$/, "CEP inválido."),

  rua: Yup.string().trim().required("Informe a rua.").max(255),
  cidade: Yup.string().trim().required("Informe a cidade.").max(255),
  numero: Yup.string().trim().required("Informe o número.").max(25),
  bairro: Yup.string().trim().required("Informe o bairro.").max(100),
  complemento: Yup.string().trim().optional().max(100),
  estado: Yup.string().trim().required("Informe o estado.").max(2, "Utilize a UF."),
}).test(
  "documento-contratante",
  "Documento inválido.",
  function validateContratanteDocument(values) {
    if (!values?.usuario?.document || !values?.tipoDocumento) return true;

    const isValid =
      values.tipoDocumento === "CPF"
        ? isValidCpf(values.usuario.document)
        : isValidCnpj(values.usuario.document);

    if (!isValid) {
      return this.createError({
        path: "usuario.document",
        message: `${values.tipoDocumento} da CONTRATANTE inválido.`,
      });
    }

    return true;
  },
) as Yup.ObjectSchema<IService>;

export const useService = () => {
  const context = useForm<IService>({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      usuario: { name: "", document: "" },
      tipoDocumento: "CPF",
      responsavelNome: "",
      responsavelCpf: "",
      responsavelEstadoCivil: "",
      responsavelCargo: "",
      blockchain: "",
      enderecoCadastrado: "",
      wallet: "",
      cep: "",
      rua: "",
      cidade: "",
      numero: "",
      bairro: "",
      complemento: "",
      estado: "",
      estadoCivil: "",
    },
  });

  return { context };
};
