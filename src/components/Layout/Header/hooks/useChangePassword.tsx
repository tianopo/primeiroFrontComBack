import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { useLogout } from "src/hooks/API/useLogout";
import { apiRoute } from "src/routes/api";
import { Regex } from "src/utils/Regex";
import Yup from "src/utils/yupValidation";

export interface IChangePassword {
  senhaAntiga: string;
  novaSenha: string;
  confirmarSenha: string;
}

export const useChangePassword = () => {
  const { t: translator } = useTranslation();
  const t = (t: string) => translator(`hooks.auth.${t}`);
  const { mutate: mutateLogout } = useLogout();

  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: () => {
      responseSuccess("Senha alterada");
      mutateLogout();
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const schema = Yup.object().shape({
    senhaAntiga: Yup.string().required().label("Senha Antiga"),
    novaSenha: Yup.string()
      .required()
      .min(5)
      .max(30)
      .matches(Regex.uppercase, t("passwordUpper"))
      .matches(Regex.lowcase, t("passwordLower"))
      .matches(Regex.number, t("passwordNumber"))
      .matches(Regex.special_character, t("passwordSpecial"))
      .label("Nova Senha"),
    confirmarSenha: Yup.string()
      .required()
      .oneOf([Yup.ref("novaSenha")], t("passwordMatch"))
      .label("Confirmar Senha"),
  });

  const context = useForm<IChangePassword>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: Yup.InferType<typeof schema>): Promise<void> {
    await api().put(`${apiRoute.changePassword}`, data);
  }

  return { mutate, isPending, context };
};
