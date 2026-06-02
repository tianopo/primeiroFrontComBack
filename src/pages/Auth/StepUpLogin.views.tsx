import { startAuthentication } from "@simplewebauthn/browser";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "src/components/Buttons/Button";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { app } from "src/routes/app";
import { useAccessControl } from "src/routes/context/AccessControl";

type StepUpMethod = "PASSKEY" | "TOTP" | null;

export const StepUpLogin = () => {
  const navigate = useNavigate();
  const { setAccessFromToken } = useAccessControl();

  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<StepUpMethod>(null);

  const loginTicket = sessionStorage.getItem("loginTicket") ?? "";

  const availableMethods = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("availableMethods") ?? "[]") as string[];
    } catch {
      return [];
    }
  }, []);

  const hasPasskey = availableMethods.includes("PASSKEY");
  const hasTotp = availableMethods.includes("TOTP");
  const hasBoth = hasPasskey && hasTotp;

  const finishSession = (data: any) => {
    localStorage.setItem("token", data.token);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

    setAccessFromToken(data.token);

    sessionStorage.removeItem("loginTicket");
    sessionStorage.removeItem("availableMethods");
    sessionStorage.removeItem("deviceLimited");

    responseSuccess("Login realizado com sucesso");
    navigate(app.home);
  };

  const handleTotpCodeChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 6);
    setTotpCode(onlyNumbers);
  };

  const handleTotpLogin = async () => {
    setLoading(true);
    try {
      const res = await api().post(apiRoute.completeTotpLogin, {
        loginTicket,
        code: totpCode,
      });

      finishSession(res.data);
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    try {
      const optionsRes = await api().post(apiRoute.passkeyLoginOptions, { loginTicket });

      const authenticationResponse = await startAuthentication(optionsRes.data.options);

      const verifyRes = await api().post(apiRoute.passkeyLoginVerify, {
        loginTicket,
        authenticationResponse,
      });

      finishSession(verifyRes.data);
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const renderMethodContent = () => {
    if (hasBoth && !selectedMethod) {
      return (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-700">Escolha como deseja concluir o login:</div>

          <Button onClick={() => setSelectedMethod("PASSKEY")} disabled={loading}>
            Entrar com chave de acesso
          </Button>

          <Button onClick={() => setSelectedMethod("TOTP")} disabled={loading}>
            Entrar com Google Authenticator
          </Button>
        </div>
      );
    }

    if (selectedMethod === "PASSKEY" || (hasPasskey && !hasTotp)) {
      return (
        <div className="flex flex-col gap-3">
          {hasBoth && (
            <button
              type="button"
              onClick={() => setSelectedMethod(null)}
              className="self-start text-sm font-semibold text-blue-600 hover:underline"
            >
              Voltar
            </button>
          )}

          <div className="text-sm text-gray-700">
            Use sua chave de acesso para concluir a autenticação.
          </div>

          <Button onClick={handlePasskeyLogin} disabled={loading}>
            {loading ? "Validando..." : "Entrar com chave de acesso"}
          </Button>
        </div>
      );
    }

    if (selectedMethod === "TOTP" || (!hasPasskey && hasTotp)) {
      return (
        <div className="flex flex-col gap-3">
          {hasBoth && (
            <button
              type="button"
              onClick={() => setSelectedMethod(null)}
              className="self-start text-sm font-semibold text-blue-600 hover:underline"
            >
              Voltar
            </button>
          )}

          <div className="text-sm text-gray-700">
            Digite o código de 6 números do Google Authenticator.
          </div>

          <input
            value={totpCode}
            onChange={(e) => handleTotpCodeChange(e.target.value)}
            placeholder="Código de 6 dígitos"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            className="rounded border px-3 py-2"
          />

          <Button onClick={handleTotpLogin} disabled={loading || !/^\d{6}$/.test(totpCode)}>
            {loading ? "Validando..." : "Validar código"}
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
        Entre e depois cadastre Google Authenticator ou chave de acesso na página de segurança.
      </div>
    );
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-r from-yellow-600 to-yellow-200 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold">Verificação adicional</h2>

        <div className="flex flex-col gap-3">{renderMethodContent()}</div>
      </div>
    </section>
  );
};
