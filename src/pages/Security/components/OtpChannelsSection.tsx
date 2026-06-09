import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { useSensitiveAction } from "../hooks/useSensitiveAction";
import { SensitiveActionModal } from "./SensitiveActionModal";

interface IOtpChannelsSection {
  profile: any;
  onReloadProfile: () => Promise<void>;
}

const StatusBadge = ({ ok, text }: { ok: boolean; text: string }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      ok ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
    }`}
  >
    {text}
  </span>
);

export const OtpChannelsSection = ({ profile, onReloadProfile }: IOtpChannelsSection) => {
  const [emailOtp, setEmailOtp] = useState(profile?.emailOtpAddress ?? "");
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [smsOtp, setSmsOtp] = useState(profile?.smsOtpPhone ?? "");
  const [smsOtpCode, setSmsOtpCode] = useState("");

  const [emailEnableLoading, setEmailEnableLoading] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [smsEnableLoading, setSmsEnableLoading] = useState(false);
  const [smsVerifyLoading, setSmsVerifyLoading] = useState(false);

  const [pendingAction, setPendingAction] = useState<null | "EMAIL" | "SMS">(null);
  const sensitive = useSensitiveAction();

  useEffect(() => {
    setEmailOtp(profile?.emailOtpAddress ?? "");
    setSmsOtp(profile?.smsOtpPhone ?? "");
  }, [profile?.emailOtpAddress, profile?.smsOtpPhone]);

  const saveEmail = async (actionTicketId?: string) => {
    setEmailEnableLoading(true);
    try {
      const res = await api().post(apiRoute.securityEmailOtpEnable, {
        email: emailOtp,
        actionTicketId,
      });
      responseSuccess(res?.data?.message ?? "Email OTP salvo com sucesso.");
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setEmailEnableLoading(false);
    }
  };

  const saveSms = async (actionTicketId?: string) => {
    setSmsEnableLoading(true);
    try {
      const res = await api().post(apiRoute.securitySmsOtpEnable, {
        phone: smsOtp,
        actionTicketId,
      });
      responseSuccess(res?.data?.message ?? "SMS OTP salvo com sucesso.");
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setSmsEnableLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    const ticket = await sensitive.start("MODIFY_EMAIL_OTP");
    if (ticket === undefined) {
      await saveEmail();
      return;
    }
    setPendingAction("EMAIL");
  };

  const handleSaveSms = async () => {
    const ticket = await sensitive.start("MODIFY_SMS_OTP");
    if (ticket === undefined) {
      await saveSms();
      return;
    }
    setPendingAction("SMS");
  };

  const handleVerifyEmailOtp = async () => {
    setEmailVerifyLoading(true);
    try {
      const res = await api().post(apiRoute.securityEmailOtpVerify, { code: emailOtpCode });
      responseSuccess(res?.data?.message ?? "Email OTP confirmado com sucesso.");
      setEmailOtpCode("");
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  const handleVerifySmsOtp = async () => {
    setSmsVerifyLoading(true);
    try {
      const res = await api().post(apiRoute.securitySmsOtpVerify, { code: smsOtpCode });
      responseSuccess(res?.data?.message ?? "SMS OTP confirmado com sucesso.");
      setSmsOtpCode("");
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setSmsVerifyLoading(false);
    }
  };

  return (
    <CardContainer full>
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Email OTP e SMS OTP</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">Email OTP</h3>
              {/* <StatusBadge
                ok={Boolean(profile?.emailOtpVerified)}
                text={profile?.emailOtpVerified ? "Confirmado" : "Pendente / Não confirmado"}
              /> */}
            </div>

            <div className="flex flex-col gap-3">
              <input
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="Seu email"
                className="rounded border px-3 py-2"
              />

              <Button onClick={handleSaveEmail} disabled={emailEnableLoading || !emailOtp.trim()}>
                {emailEnableLoading ? "Salvando..." : "Salvar email OTP"}
              </Button>

              <div className="text-sm text-gray-600">
                Email salvo: <strong>{profile?.emailOtpAddress ?? "-"}</strong>
              </div>
              {/* 
              <input
                value={emailOtpCode}
                onChange={(e) => setEmailOtpCode(e.target.value)}
                placeholder="Código recebido por email"
                className="rounded border px-3 py-2"
              />

              <Button
                onClick={handleVerifyEmailOtp}
                disabled={emailVerifyLoading || !emailOtpCode.trim()}
              >
                {emailVerifyLoading ? "Confirmando..." : "Confirmar email OTP"}
              </Button> */}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">SMS OTP</h3>
              {/* <StatusBadge
                ok={Boolean(profile?.smsOtpVerified)}
                text={profile?.smsOtpVerified ? "Confirmado" : "Pendente / Não confirmado"}
              /> */}
            </div>

            <div className="flex flex-col gap-3">
              <input
                value={smsOtp}
                onChange={(e) => setSmsOtp(e.target.value)}
                placeholder="Seu celular"
                className="rounded border px-3 py-2"
              />

              <Button onClick={handleSaveSms} disabled={smsEnableLoading || !smsOtp.trim()}>
                {smsEnableLoading ? "Salvando..." : "Salvar SMS OTP"}
              </Button>

              <div className="text-sm text-gray-600">
                Telefone salvo: <strong>{profile?.smsOtpPhone ?? "-"}</strong>
              </div>
              {/* 
              <input
                value={smsOtpCode}
                onChange={(e) => setSmsOtpCode(e.target.value)}
                placeholder="Código recebido por SMS"
                className="rounded border px-3 py-2"
              />

              <Button
                onClick={handleVerifySmsOtp}
                disabled={smsVerifyLoading || !smsOtpCode.trim()}
              >
                {smsVerifyLoading ? "Confirmando..." : "Confirmar SMS OTP"}
              </Button> */}
            </div>
          </div>
        </div>

        <SensitiveActionModal
          challenge={sensitive.challenge}
          onClose={() => {
            sensitive.clear();
            setPendingAction(null);
          }}
          onVerified={async (ticketId) => {
            if (pendingAction === "EMAIL") await saveEmail(ticketId);
            if (pendingAction === "SMS") await saveSms(ticketId);
            sensitive.clear();
            setPendingAction(null);
          }}
        />
      </div>
    </CardContainer>
  );
};
