import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import Yup from "src/utils/yupValidation";

export type BankAccountHolderType = "INDIVIDUAL" | "ORGANIZATION";
export type BankAccountDocumentType = "CPF" | "CNPJ";

export interface IBankAccountCreateSchema {
  userId: string;
  country: string;
  holderType: BankAccountHolderType;
  fullName: string;
  email: string;
  phone: string;
  birthdate: string;
  document: {
    type: BankAccountDocumentType;
    number: string;
  };
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
  };
}

interface IUseBankAccountCreateForm {
  userId: string;
  userName: string;
  userDocument: string;
}

const onlyDigits = (value: string) => String(value ?? "").replace(/\D/g, "");

const getDocumentType = (document: string): BankAccountDocumentType => {
  return onlyDigits(document).length > 11 ? "CNPJ" : "CPF";
};

const getHolderType = (document: string): BankAccountHolderType => {
  return onlyDigits(document).length > 11 ? "ORGANIZATION" : "INDIVIDUAL";
};

export const useBankAccountCreateForm = ({
  userId,
  userName,
  userDocument,
}: IUseBankAccountCreateForm) => {
  const Schema = Yup.object().shape({
    userId: Yup.string().required().label("usuário"),
    country: Yup.string().required().min(3).label("país"),
    holderType: Yup.string()
      .oneOf(["INDIVIDUAL", "ORGANIZATION"])
      .required()
      .label("tipo de titular"),
    fullName: Yup.string().required().min(3).label("nome completo"),
    email: Yup.string().email().required().label("email"),
    phone: Yup.string().required().label("telefone"),
    birthdate: Yup.string()
      .required()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
      .label("data de nascimento"),
    document: Yup.object().shape({
      type: Yup.string().oneOf(["CPF", "CNPJ"]).required().label("tipo de documento"),
      number: Yup.string().required().label("documento"),
    }),
    address: Yup.object().shape({
      street: Yup.string().required().min(3).label("rua"),
      neighborhood: Yup.string().required().min(2).label("bairro"),
      city: Yup.string().required().min(2).label("cidade"),
      state: Yup.string().required().length(2).label("estado"),
      zipCode: Yup.string()
        .required()
        .matches(/^\d{8}$/, "CEP deve conter 8 dígitos")
        .label("CEP"),
      complement: Yup.string().optional().label("complemento"),
    }),
  });

  const defaultValues = useMemo<IBankAccountCreateSchema>(() => {
    return {
      userId,
      country: "BRA",
      holderType: getHolderType(userDocument),
      fullName: userName || "",
      email: "",
      phone: "",
      birthdate: "",
      document: {
        type: getDocumentType(userDocument),
        number: onlyDigits(userDocument),
      },
      address: {
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        complement: "",
      },
    };
  }, [userId, userName, userDocument]);

  const context = useForm<IBankAccountCreateSchema>({
    resolver: yupResolver(Schema),
    reValidateMode: "onChange",
    defaultValues,
  });

  const { reset } = context;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return { context };
};
