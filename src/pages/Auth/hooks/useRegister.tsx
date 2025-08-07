import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { TOKEN_EXPIRE_TIME } from "src/hooks/API/useToken";
import { IAuthModel } from "src/interfaces/models";
import { apiRoute } from "src/routes/api";
import { app } from "src/routes/app";
import { Regex } from "src/utils/Regex";
import Yup from "src/utils/yupValidation";

export interface IRegisterDto {
  name: string;
  password: string;
  confirmPassword: string;
  document: string;
}

export const useRegister = () => {
  const navigate = useNavigate();
  const { t: translator } = useTranslation();
  const t = (t: string) => translator(`hooks.auth.${t}`);

  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: (data: IAuthModel) => {
      responseSuccess(t("userRegistered"));
      queryClient.setQueryData(["token-data"], data.token);
      localStorage.setItem("token", data.token);
      setTimeout(() => {
        localStorage.removeItem("token");
      }, TOKEN_EXPIRE_TIME);

      navigate(app.home);
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const schema = Yup.object().shape({
    name: Yup.string().required().min(1).label("name"),
    password: Yup.string()
      .required()
      .min(8)
      .max(30)
      .matches(Regex.uppercase, t("passwordUpper"))
      .matches(Regex.lowcase, t("passwordLower"))
      .matches(Regex.number, t("passwordNumber"))
      .matches(Regex.special_character, t("passwordSpecial"))
      .label("password"),
    confirmPassword: Yup.string()
      .required()
      .oneOf([Yup.ref("password")], t("passwordMatch"))
      .label("Confirm Password"),
    document: Yup.string()
      .required()
      .matches(
        Regex.cpf_cnpj_mask,
        "Documento inválido, correto: XXX.XXX.XXX-XX ou XX.XXX.XXX/0001-XX",
      )
      .label("document"),
  });

  const context = useForm<IRegisterDto>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: Yup.InferType<typeof schema>): Promise<IAuthModel> {
    const result = await api().post(`${apiRoute.signup}`, data);
    return result.data;
  }

  return { mutate, isPending, context };
};
