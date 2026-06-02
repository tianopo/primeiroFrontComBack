import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { useAccessControl } from "src/routes/context/AccessControl";
import { PasskeySection } from "./components/PasskeySection";
import { PasswordSection } from "./components/PasswordSection";
import { TotpSection } from "./components/TotpSection";

export const SecurityPage = () => {
  const { acesso } = useAccessControl();
  const [profile, setProfile] = useState<any>(null);

  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [smsOtp, setSmsOtp] = useState("");
  const [smsOtpCode, setSmsOtpCode] = useState("");
  const [antiPhishingCode, setAntiPhishingCode] = useState("");

  const [emailEnableLoading, setEmailEnableLoading] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [smsEnableLoading, setSmsEnableLoading] = useState(false);
  const [smsVerifyLoading, setSmsVerifyLoading] = useState(false);
  const [antiPhishingLoading, setAntiPhishingLoading] = useState(false);
  const [recoveryCodesLoading, setRecoveryCodesLoading] = useState(false);
  const [approvingDeviceId, setApprovingDeviceId] = useState<string | null>(null);

  const loadProfile = async () => {
    const res = await api().get(apiRoute.securityProfile);
    setProfile(res.data);
    setAntiPhishingCode(res.data?.antiPhishingCode ?? "");
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEnableEmailOtp = async () => {
    setEmailEnableLoading(true);
    try {
      await api().post(apiRoute.securityEmailOtpEnable, { email: emailOtp });
      responseSuccess("Email OTP ativado com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setEmailEnableLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setEmailVerifyLoading(true);
    try {
      await api().post(apiRoute.securityEmailOtpVerify, { code: emailOtpCode });
      responseSuccess("Código de email confirmado com sucesso.");
      setEmailOtpCode("");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  const handleEnableSmsOtp = async () => {
    setSmsEnableLoading(true);
    try {
      await api().post(apiRoute.securitySmsOtpEnable, { phone: smsOtp });
      responseSuccess("SMS OTP ativado com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setSmsEnableLoading(false);
    }
  };

  const handleVerifySmsOtp = async () => {
    setSmsVerifyLoading(true);
    try {
      await api().post(apiRoute.securitySmsOtpVerify, { code: smsOtpCode });
      responseSuccess("Código SMS confirmado com sucesso.");
      setSmsOtpCode("");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setSmsVerifyLoading(false);
    }
  };

  const handleSetAntiPhishing = async () => {
    setAntiPhishingLoading(true);
    try {
      await api().patch(apiRoute.securityAntiPhishing, { antiPhishingCode });
      responseSuccess("Código anti-phishing salvo com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setAntiPhishingLoading(false);
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    setRecoveryCodesLoading(true);
    try {
      const res = await api().post(apiRoute.securityRecoveryCodesRegenerate);
      responseSuccess("Códigos de recuperação gerados com sucesso.");
      alert(`Guarde estes códigos com segurança:\n\n${res.data.codes.join("\n")}`);
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setRecoveryCodesLoading(false);
    }
  };

  const handleApproveDevice = async (deviceId: string) => {
    setApprovingDeviceId(deviceId);
    try {
      await api().post(apiRoute.securityDeviceApprove, { deviceId });
      responseSuccess("Dispositivo aprovado com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setApprovingDeviceId(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 p-4">
      <h1 className="text-3xl font-bold">Segurança</h1>

      <TotpSection enabled={Boolean(profile?.hasTotp)} onReloadProfile={loadProfile} />

      <PasskeySection passkeys={profile?.passkeys ?? []} onReloadProfile={loadProfile} />

      <PasswordSection
        hasAlternativePassword={Boolean(profile?.hasAlternativePassword)}
        hasThirdPassword={Boolean(profile?.hasThirdPassword)}
        canUseThirdPassword={acesso === "Master"}
        onReloadProfile={loadProfile}
      />

      <CardContainer full>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Email OTP</h2>

          <input
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value)}
            placeholder="Seu email"
            className="rounded border px-3 py-2"
          />
          <Button onClick={handleEnableEmailOtp} disabled={emailEnableLoading || !emailOtp.trim()}>
            {emailEnableLoading ? "Ativando..." : "Ativar Email OTP"}
          </Button>

          <input
            value={emailOtpCode}
            onChange={(e) => setEmailOtpCode(e.target.value)}
            placeholder="Código recebido"
            className="rounded border px-3 py-2"
          />
          <Button
            onClick={handleVerifyEmailOtp}
            disabled={emailVerifyLoading || !emailOtpCode.trim()}
          >
            {emailVerifyLoading ? "Confirmando..." : "Confirmar Email OTP"}
          </Button>
        </div>
      </CardContainer>

      <CardContainer full>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">SMS OTP</h2>

          <input
            value={smsOtp}
            onChange={(e) => setSmsOtp(e.target.value)}
            placeholder="Seu celular"
            className="rounded border px-3 py-2"
          />
          <Button onClick={handleEnableSmsOtp} disabled={smsEnableLoading || !smsOtp.trim()}>
            {smsEnableLoading ? "Ativando..." : "Ativar SMS OTP"}
          </Button>

          <input
            value={smsOtpCode}
            onChange={(e) => setSmsOtpCode(e.target.value)}
            placeholder="Código recebido"
            className="rounded border px-3 py-2"
          />
          <Button onClick={handleVerifySmsOtp} disabled={smsVerifyLoading || !smsOtpCode.trim()}>
            {smsVerifyLoading ? "Confirmando..." : "Confirmar SMS OTP"}
          </Button>
        </div>
      </CardContainer>

      <CardContainer full>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Anti-phishing</h2>

          <input
            value={antiPhishingCode}
            onChange={(e) => setAntiPhishingCode(e.target.value)}
            placeholder="Código anti-phishing"
            className="rounded border px-3 py-2"
          />
          <Button
            onClick={handleSetAntiPhishing}
            disabled={antiPhishingLoading || !antiPhishingCode.trim()}
          >
            {antiPhishingLoading ? "Salvando..." : "Salvar código"}
          </Button>
        </div>
      </CardContainer>

      <CardContainer full>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Códigos de recuperação</h2>
          <Button onClick={handleRegenerateRecoveryCodes} disabled={recoveryCodesLoading}>
            {recoveryCodesLoading ? "Gerando..." : "Regenerar códigos"}
          </Button>
        </div>
      </CardContainer>

      <CardContainer full>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Dispositivos</h2>

          <div className="space-y-2">
            {(profile?.devices ?? []).map((device: any) => (
              <div key={device.id} className="rounded border p-3">
                <div>
                  <strong>Status:</strong> {device.status}
                </div>
                <div>
                  <strong>Aprovado:</strong> {device.approved ? "Sim" : "Não"}
                </div>
                <div>
                  <strong>Criado em:</strong> {device.createdIn}
                </div>

                {!device.approved && (
                  <Button
                    onClick={() => handleApproveDevice(device.id)}
                    disabled={approvingDeviceId === device.id}
                  >
                    {approvingDeviceId === device.id ? "Aprovando..." : "Aprovar dispositivo"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContainer>

      <CardContainer full>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Logs</h2>

          <div className="space-y-2">
            {(profile?.logs ?? []).map((log: any) => (
              <div key={log.id} className="rounded border p-3 text-sm">
                <div>
                  <strong>Evento:</strong> {log.eventType}
                </div>
                <div>
                  <strong>Descrição:</strong> {log.description ?? "-"}
                </div>
                <div>
                  <strong>IP:</strong> {log.ip ?? "-"}
                </div>
                <div>
                  <strong>Dispositivo:</strong> {log.userAgent ?? "-"}
                </div>
                <div>
                  <strong>Localização:</strong>{" "}
                  {[log.country, log.region, log.city].filter(Boolean).join(" / ") || "-"}
                </div>
                <div>
                  <strong>Data:</strong> {log.createdIn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContainer>
    </div>
  );
};
