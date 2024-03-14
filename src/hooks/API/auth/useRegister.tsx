import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api, auth } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { IAuthModel } from "src/interfaces/models";
import { Regex } from "src/utils/Regex";
import Yup from "src/utils/yupValidation";

export interface IRegisterDto {
  name: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export const useRegister = () => {
  const navigate = useNavigate();
  const { t: translator } = useTranslation();
  const t = (t: string) => translator(`hooks.auth.${t}`);

  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: (data: IAuthModel) => {
      responseSuccess(t("userRegistered"));
      localStorage.setItem("token", data.token);
      setTimeout(
        () => {
          localStorage.removeItem("token");
        },
        24 * 60 * 60 * 1000,
      );

      navigate("/perfil");
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
    email: Yup.string().required().email().matches(Regex.email, t("InvalidEmail")).label("email"),
  });

  const context = useForm<IRegisterDto>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: Yup.InferType<typeof schema>): Promise<IAuthModel> {
    const result = await api().post(`${auth}/signup`, data);
    return result.data;
  }

  return { mutate, isPending, context };
};
