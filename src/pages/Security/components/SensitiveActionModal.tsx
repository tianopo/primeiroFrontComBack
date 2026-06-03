import { startAuthentication } from "@simplewebauthn/browser";
import { AxiosError } from "axios";
import { useState } from "react";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

interface ISensitiveActionModal {
  challenge: {
    required: boolean;
    method: string;
    ticketId?: string;
  } | null;
  onClose: () => void;
  onVerified: (ticketId?: string) => Promise<void>;
}

export const SensitiveActionModal = ({ challenge, onClose, onVerified }: ISensitiveActionModal) => {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!challenge || !challenge.required || !challenge.ticketId) return null;

  const verify = async () => {
    setLoading(true);
    try {
      if (challenge.method === "TOTP") {
        await api().post(apiRoute.securitySensitiveVerifyTotp, {
          ticketId: challenge.ticketId,
          code,
        });
      } else if (challenge.method === "ALTERNATIVE_PASSWORD") {
        await api().post(apiRoute.securitySensitiveVerifyAlternativePassword, {
          ticketId: challenge.ticketId,
          password,
        });
      } else if (challenge.method === "RECOVERY_CODE") {
        await api().post(apiRoute.securitySensitiveVerifyRecoveryCode, {
          ticketId: challenge.ticketId,
          code,
        });
      } else if (challenge.method === "PASSKEY") {
        const optionsRes = await api().post(apiRoute.securitySensitivePasskeyOptions, {
          ticketId: challenge.ticketId,
        });

        const authenticationResponse = await startAuthentication(optionsRes.data);

        await api().post(apiRoute.securitySensitivePasskeyVerify, {
          ticketId: challenge.ticketId,
          authenticationResponse,
        });
      }

      await onVerified(challenge.ticketId);
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="flex flex-col gap-3">
      {challenge.method === "TOTP" && (
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Código do Google Authenticator"
          className="rounded border px-3 py-2"
        />
      )}

      {challenge.method === "RECOVERY_CODE" && (
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de recuperação"
          className="rounded border px-3 py-2"
        />
      )}

      {challenge.method === "ALTERNATIVE_PASSWORD" && (
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Senha alternativa"
          className="rounded border px-3 py-2"
        />
      )}

      {challenge.method === "PASSKEY" && (
        <div className="text-sm text-gray-700">
          Será aberta a autenticação com sua chave de acesso.
        </div>
      )}
    </div>
  );

  return (
    <ConfirmationModalButton
      text="Confirme esta alteração com um fator de segurança."
      onCancel={onClose}
      onConfirm={verify}
      confirmDisabled={
        loading ||
        (challenge.method === "TOTP" && code.length !== 6) ||
        (challenge.method === "RECOVERY_CODE" && !code.trim()) ||
        (challenge.method === "ALTERNATIVE_PASSWORD" && !password.trim())
      }
      showExtra
      extra={content}
    />
  );
};
