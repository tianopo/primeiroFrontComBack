import {
  startAuthentication,
  type PublicKeyCredentialRequestOptionsJSON as BrowserPublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { app } from "src/routes/app";
import { useAccessControl } from "src/routes/context/AccessControl";

type StepUpResponse = {
  requiresStepUp: true;
  availableMethods: string[];
  loginTicket: string;
  deviceLimited: boolean;
};

type FinalSessionResponse = {
  token: string;
  refreshToken?: string;
  document: string;
  requiresStepUp?: false;
  deviceLimited?: boolean;
};

type StepUpApiResponse = StepUpResponse | FinalSessionResponse;

type RawAllowCredential = {
  id: string;
  type: string;
  transports?: string[];
};

type RawPasskeyAuthenticationOptions = Omit<
  BrowserPublicKeyCredentialRequestOptionsJSON,
  "allowCredentials"
> & {
  allowCredentials?: RawAllowCredential[];
};

type PasskeyLoginOptionsResponse = {
  options: RawPasskeyAuthenticationOptions;
};

type StrongMethod = "PASSKEY" | "TOTP";

const readStoredMethods = (): string[] => {
  try {
    const raw = sessionStorage.getItem("availableMethods") ?? "[]";
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
};

const isStepUpResponse = (data: StepUpApiResponse): data is StepUpResponse => {
  return data.requiresStepUp === true;
};

const toBrowserAuthenticationOptions = (
  options: RawPasskeyAuthenticationOptions,
): BrowserPublicKeyCredentialRequestOptionsJSON => {
  return {
    ...options,
    allowCredentials: options.allowCredentials?.map((credential) => ({
      id: credential.id,
      type: "public-key" as const,
    })),
  };
};

export const StepUpLogin = () => {
  const navigate = useNavigate();
  const { setAccessFromToken } = useAccessControl();

  const [loginTicket, setLoginTicket] = useState<string>(
    () => sessionStorage.getItem("loginTicket") ?? "",
  );
  const [availableMethods, setAvailableMethods] = useState<string[]>(() => readStoredMethods());

  const [selectedStrongMethod, setSelectedStrongMethod] = useState<StrongMethod | null>(null);

  const [totpCode, setTotpCode] = useState("");
  const [thirdPassword, setThirdPassword] = useState("");
  const [alternativePassword, setAlternativePassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loginTicket) {
      navigate(app.auth);
    }
  }, [loginTicket, navigate]);

  const hasPasskey = useMemo(() => availableMethods.includes("PASSKEY"), [availableMethods]);
  const hasTotp = useMemo(() => availableMethods.includes("TOTP"), [availableMethods]);
  const hasThirdPassword = useMemo(
    () => availableMethods.includes("THIRD_PASSWORD"),
    [availableMethods],
  );
  const hasAlternativePassword = useMemo(
    () => availableMethods.includes("ALTERNATIVE_PASSWORD"),
    [availableMethods],
  );
  const hasRecoveryCode = useMemo(
    () => availableMethods.includes("RECOVERY_CODE"),
    [availableMethods],
  );

  const strongMethods = useMemo(() => {
    const methods: StrongMethod[] = [];
    if (hasPasskey) methods.push("PASSKEY");
    if (hasTotp) methods.push("TOTP");
    return methods;
  }, [hasPasskey, hasTotp]);

  const requiresStrongFactor = strongMethods.length > 0;
  const requiresSecondaryFactor = hasThirdPassword || hasAlternativePassword || hasRecoveryCode;

  useEffect(() => {
    if (strongMethods.length === 0) {
      setSelectedStrongMethod(null);
      return;
    }

    if (strongMethods.length === 1) {
      setSelectedStrongMethod(strongMethods[0]);
      return;
    }

    setSelectedStrongMethod((prev) => {
      if (prev && strongMethods.includes(prev)) {
        return prev;
      }
      return null;
    });
  }, [strongMethods]);

  const moveToNextStep = (data: StepUpResponse) => {
    sessionStorage.setItem("loginTicket", data.loginTicket);
    sessionStorage.setItem("availableMethods", JSON.stringify(data.availableMethods ?? []));
    sessionStorage.setItem("deviceLimited", String(Boolean(data.deviceLimited)));

    setLoginTicket(data.loginTicket);
    setAvailableMethods(data.availableMethods ?? []);
    setTotpCode("");
  };

  const finishSession = (data: FinalSessionResponse) => {
    // if (data.deviceLimited) {
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("refreshToken");
    //   sessionStorage.removeItem("loginTicket");
    //   sessionStorage.removeItem("availableMethods");
    //   sessionStorage.removeItem("deviceLimited");

    //   toast.warning(
    //     "Mais de 2 dispositivos conectados. Este dispositivo precisa de confirmação por outro dispositivo já aprovado na página de Segurança.",
    //   );

    //   navigate(app.auth);
    //   return;
    // }

    localStorage.setItem("token", data.token);

    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }

    setAccessFromToken(data.token);

    sessionStorage.removeItem("loginTicket");
    sessionStorage.removeItem("availableMethods");
    sessionStorage.removeItem("deviceLimited");

    responseSuccess("Login realizado com sucesso");
    navigate(app.home);
  };

  const completeSecondary = async (ticketId: string): Promise<StepUpApiResponse> => {
    const response = await api().post<StepUpApiResponse>(apiRoute.completeSecondaryLogin, {
      loginTicket: ticketId,
      thirdPassword: hasThirdPassword ? thirdPassword : undefined,
      alternativePassword: hasAlternativePassword ? alternativePassword : undefined,
      recoveryCode: hasRecoveryCode ? recoveryCode : undefined,
    });

    return response.data;
  };

  const handleStrongResult = async (data: StepUpApiResponse) => {
    if (!isStepUpResponse(data)) {
      finishSession(data);
      return;
    }

    moveToNextStep(data);
  };

  const handlePasskeyFlow = async () => {
    setLoading(true);
    try {
      const optionsRes = await api().post<PasskeyLoginOptionsResponse>(
        apiRoute.passkeyLoginOptions,
        { loginTicket },
      );

      const authenticationResponse = await startAuthentication({
        optionsJSON: toBrowserAuthenticationOptions(optionsRes.data.options),
      });

      const verifyRes = await api().post<StepUpApiResponse>(apiRoute.passkeyLoginVerify, {
        loginTicket,
        authenticationResponse,
      });

      await handleStrongResult(verifyRes.data);
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const handleTotpFlow = async () => {
    setLoading(true);
    try {
      const res = await api().post<StepUpApiResponse>(apiRoute.completeTotpLogin, {
        loginTicket,
        code: totpCode,
      });

      await handleStrongResult(res.data);
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlySecondaryFlow = async () => {
    setLoading(true);
    try {
      const response = await completeSecondary(loginTicket);

      if (isStepUpResponse(response)) {
        moveToNextStep(response);
        return;
      }

      finishSession(response);
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const canSubmitSecondary =
    (!hasThirdPassword || thirdPassword.trim().length > 0) &&
    (!hasAlternativePassword || alternativePassword.trim().length > 0) &&
    (!hasRecoveryCode || recoveryCode.trim().length > 0);

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-r from-yellow-600 to-yellow-200 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold">Verificação adicional</h2>

        <div className="flex flex-col gap-3">
          {requiresStrongFactor && (
            <>
              {strongMethods.length > 1 && (
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-gray-700">
                    Escolha como deseja fazer a autenticação:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {hasPasskey && (
                      <Button
                        onClick={() => setSelectedStrongMethod("PASSKEY")}
                        className={
                          selectedStrongMethod === "PASSKEY" ? "border-2 border-black" : undefined
                        }
                      >
                        Chave de acesso
                      </Button>
                    )}

                    {hasTotp && (
                      <Button
                        onClick={() => setSelectedStrongMethod("TOTP")}
                        className={
                          selectedStrongMethod === "TOTP" ? "border-2 border-black" : undefined
                        }
                      >
                        Google Authenticator
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {selectedStrongMethod === "PASSKEY" && (
                <>
                  <div className="text-sm text-gray-700">Use a chave de acesso para continuar.</div>

                  <Button onClick={handlePasskeyFlow} disabled={loading}>
                    {loading ? "Validando..." : "Entrar com chave de acesso"}
                  </Button>
                </>
              )}

              {selectedStrongMethod === "TOTP" && (
                <>
                  <div className="text-sm text-gray-700">
                    Digite o código do Google Authenticator para continuar.
                  </div>

                  <input
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Código de 6 dígitos"
                    inputMode="numeric"
                    maxLength={6}
                    className="rounded border px-3 py-2"
                  />

                  <Button onClick={handleTotpFlow} disabled={loading || totpCode.length !== 6}>
                    {loading ? "Validando..." : "Validar código"}
                  </Button>
                </>
              )}
            </>
          )}

          {!requiresStrongFactor && requiresSecondaryFactor && (
            <>
              {hasThirdPassword && (
                <input
                  value={thirdPassword}
                  onChange={(e) => setThirdPassword(e.target.value)}
                  type="password"
                  placeholder="Terceira senha"
                  className="rounded border px-3 py-2"
                />
              )}

              {hasAlternativePassword && (
                <input
                  value={alternativePassword}
                  onChange={(e) => setAlternativePassword(e.target.value)}
                  type="password"
                  placeholder="Senha alternativa"
                  className="rounded border px-3 py-2"
                />
              )}

              {hasRecoveryCode && (
                <input
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="Código de recuperação"
                  className="rounded border px-3 py-2"
                />
              )}

              <Button onClick={handleOnlySecondaryFlow} disabled={loading || !canSubmitSecondary}>
                {loading ? "Validando..." : "Concluir login"}
              </Button>
            </>
          )}

          {!requiresStrongFactor && !requiresSecondaryFactor && (
            <div className="text-sm text-gray-700">Nenhum fator adicional disponível.</div>
          )}
        </div>
      </div>
    </section>
  );
};
