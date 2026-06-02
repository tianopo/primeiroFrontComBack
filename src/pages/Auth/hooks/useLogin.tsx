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
import { useAccessControl } from "src/routes/context/AccessControl";
import { Regex } from "src/utils/Regex";
import Yup from "src/utils/yupValidation";

export interface ILoginDto {
  document: string;
  password: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const { t: translator } = useTranslation();
  const { setAccessFromToken } = useAccessControl();

  const t = (t: string) => translator(`hooks.auth.${t}`);

  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: (data: any) => {
      if (data.requiresStepUp) {
        sessionStorage.setItem("loginTicket", data.loginTicket);
        sessionStorage.setItem("availableMethods", JSON.stringify(data.availableMethods ?? []));
        sessionStorage.setItem("deviceLimited", String(Boolean(data.deviceLimited)));
        navigate(app.authStepUp);
        return;
      }

      responseSuccess(t("userLogged"));
      queryClient.setQueryData(["token-data"], data.token);
      localStorage.setItem("token", data.token);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      setAccessFromToken(data.token);

      navigate(app.home);
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  const schema = Yup.object().shape({
    password: Yup.string().required().min(5).max(30).label("password"),
    document: Yup.string()
      .required()
      .matches(
        Regex.cpf_cnpj_mask,
        "Documento inválido, correto: XXX.XXX.XXX-XX ou XX.XXX.XXX/0001-XX",
      )
      .label("document"),
  });

  const context = useForm<ILoginDto>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  async function path(data: Yup.InferType<typeof schema>): Promise<IAuthModel> {
    const result = await api().post(apiRoute.signin, data, {
      headers: {
        "x-device-platform": navigator.platform,
        "x-device-vendor": (navigator as any).vendor ?? "",
        "x-device-language": navigator.language,
        "x-device-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
    return result.data;
  }

  return { mutate, isPending, context };
};
