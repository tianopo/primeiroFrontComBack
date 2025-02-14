import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Regex } from "src/utils/Regex";
import * as Yup from "yup";

export interface IContactForm {
  nome: string;
  telefone: string;
  email: string;
}

export const useContactForm = () => {
  const { t: translator } = useTranslation();
  const t = (t: string) => translator(`form.${t}`);

  const schema = Yup.object({
    nome: Yup.string().required().label("Nome"),
    telefone: Yup.string()
      .required()
      .matches(Regex.phone_mask, t("invalidPhone"))
      .label("Telefone"),
    email: Yup.string().required().matches(Regex.email, t("invalidEmail")).label("Email"),
  });

  const context = useForm<IContactForm>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  return { context };
};
