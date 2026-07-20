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
  representatives?: Array<{
    country?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    birthdate?: string;
    documentNumber?: string;
  }>;
  onboardingDocuments?: {
    tradingName?: string;
    businessName?: string;
    contactNumber?: string;
    site?: string;
    socialContract?: string;
    cnpjCard?: string;
    proofAddress?: string;
    proofBankAddress?: string;
    partnerProofAddress?: string;
    documentRepresentative?: string;
    selfieRepresentative?: string;
    ir?: string;
    kyc?: string;
  };
}

interface IUseBankAccountCreateForm {
  userId: string;
  userName: string;
  userDocument: string;
}

const onlyDigits = (value?: string | null) => String(value ?? "").replace(/\D/g, "");

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
    representatives: Yup.array()
      .of(
        Yup.object().shape({
          country: Yup.string().optional(),
          fullName: Yup.string().optional(),
          email: Yup.string().optional(),
          phone: Yup.string().optional(),
          birthdate: Yup.string().optional(),
          documentNumber: Yup.string().optional(),
        }),
      )
      .optional(),
    onboardingDocuments: Yup.object()
      .shape({
        tradingName: Yup.string().optional(),
        businessName: Yup.string().optional(),
        contactNumber: Yup.string().optional(),
        site: Yup.string().optional(),
        socialContract: Yup.string().optional(),
        cnpjCard: Yup.string().optional(),
        proofAddress: Yup.string().optional(),
        proofBankAddress: Yup.string().optional(),
        partnerProofAddress: Yup.string().optional(),
        documentRepresentative: Yup.string().optional(),
        selfieRepresentative: Yup.string().optional(),
        ir: Yup.string().optional(),
        kyc: Yup.string().optional(),
      })
      .optional(),
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
      representatives: [
        {
          country: "BRA",
          fullName: "",
          email: "",
          phone: "",
          birthdate: "",
          documentNumber: "",
        },
      ],
      onboardingDocuments: {
        tradingName: "",
        businessName: "",
        contactNumber: "",
        site: "",
        socialContract: "",
        cnpjCard: "",
        proofAddress: "",
        proofBankAddress: "",
        partnerProofAddress: "",
        documentRepresentative: "",
        selfieRepresentative: "",
        ir: "",
        kyc: "",
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
