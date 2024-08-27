import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { IAuthModel } from "src/interfaces/models";
import { apiRoute } from "src/routes/api";
import { app } from "src/routes/app";
import { Regex } from "src/utils/Regex";
import Yup from "src/utils/yupValidation";

export interface ILoginDto {
  email: string;
  password: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const { t: translator } = useTranslation();
  const t = (t: string) => translator(`hooks.auth.${t}`);

  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: (data: IAuthModel) => {
      responseSuccess(t("userLogged"));
      queryClient.setQueryData(["token-data"], data.token);
      localStorage.setItem("token", data.token);
      setTimeout(
        () => {
          localStorage.removeItem("token");
        },
        24 * 60 * 60 * 1000,
      );

      navigate(app.home);
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const schema = Yup.object().shape({
    password: Yup.string()
      .required()
      .min(8)
      .max(30)
      .matches(Regex.uppercase, t("passwordUpper"))
      .matches(Regex.lowcase, t("passwordLower"))
      .matches(Regex.number, t("passwordNumber"))
      .matches(Regex.special_character, t("passwordSpecial"))
      .label("password"),
    email: Yup.string().required().email().matches(Regex.email, t("InvalidEmail")).label("email"),
  });

  const context = useForm<ILoginDto>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: Yup.InferType<typeof schema>): Promise<IAuthModel> {
    const result = await api().post(apiRoute.signin, data);
    return result.data;
  }

  return { mutate, isPending, context };
};
