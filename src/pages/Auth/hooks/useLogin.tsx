import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { app } from "src/routes/app";
import { useAccessControl } from "src/routes/context/AccessControl";
import { Regex } from "src/utils/Regex";
import Yup from "src/utils/yupValidation";

export interface ILoginDto {
  document: string;
  password: string;
}

type StepUpLoginResponse = {
  requiresStepUp: true;
  availableMethods: string[];
  loginTicket: string;
  deviceLimited: boolean;
  showSetupTotpBanner?: boolean;
};

type SuccessLoginResponse = {
  token: string;
  refreshToken?: string;
  document: string;
  requiresStepUp?: false;
  deviceLimited?: boolean;
  showSetupTotpBanner?: boolean;
};

type SignInResponse = StepUpLoginResponse | SuccessLoginResponse;

const getNavigatorVendor = (): string => {
  const vendor = Reflect.get(window.navigator, "vendor");
  return typeof vendor === "string" ? vendor : "";
};

export const useLogin = () => {
  const navigate = useNavigate();
  const { t: translator } = useTranslation();
  const { setAccessFromToken, acesso } = useAccessControl();

  const t = (key: string) => translator(`hooks.auth.${key}`);

  const { mutate, isPending } = useMutation({
    mutationFn: path,
    onSuccess: (data: SignInResponse) => {
      sessionStorage.removeItem("loginTicket");
      sessionStorage.removeItem("availableMethods");
      sessionStorage.removeItem("deviceLimited");

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

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

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

  async function path(data: Yup.InferType<typeof schema>): Promise<SignInResponse> {
    const result = await api().post(apiRoute.signin, data, {
      headers: {
        "x-device-platform": navigator.platform,
        "x-device-vendor": getNavigatorVendor(),
        "x-device-language": navigator.language,
        "x-device-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });

    return result.data as SignInResponse;
  }

  return { mutate, isPending, context };
};
