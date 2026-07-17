import { startAuthentication } from "@simplewebauthn/browser";
import { AxiosError } from "axios";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Modal } from "src/components/Modal/Modal";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { useChangePassword } from "../hooks/useChangePassword";

type ConfirmationMethod = "TOTP" | "RECOVERY_CODE" | "PASSKEY";

interface IModalPassword {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalPassword = ({ isOpen, onClose }: IModalPassword) => {
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [confirmationMethod, setConfirmationMethod] = useState<ConfirmationMethod>("TOTP");
  const [totpCode, setTotpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [actionTicketId, setActionTicketId] = useState("");
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isConfirmingSecurity, setIsConfirmingSecurity] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPasswords, setShowNewPasswords] = useState(false);

  const { context, mutate, isPending } = useChangePassword();

  const {
    formState: { errors },
  } = context;

  if (!isOpen) return null;

  const canRequestSecurityConfirmation =
    senhaAntiga.length > 0 && novaSenha.length > 0 && confirmarSenha.length > 0;

  const startSensitiveAction = async () => {
    const response = await api().post(apiRoute.securitySensitiveActionStart, {
      action: "CHANGE_PASSWORD",
      method: confirmationMethod,
    });

    return response.data as {
      required: boolean;
      method: ConfirmationMethod | "NONE";
      ticketId?: string;
    };
  };

  const confirmSecurity = async () => {
    if (!canRequestSecurityConfirmation) {
      responseError({
        response: {
          data: {
            message: "Preencha a senha antiga, a nova senha e a confirmação antes da validação.",
          },
        },
      } as AxiosError);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      responseError({
        response: {
          data: {
            message: "As senhas não conferem.",
          },
        },
      } as AxiosError);
      return;
    }

    setIsConfirmingSecurity(true);

    try {
      const ticket = await startSensitiveAction();

      if (!ticket.required || ticket.method === "NONE") {
        setActionTicketId("");
        context.setValue("actionTicketId", "");
        setSecurityVerified(true);
        responseSuccess("Confirmação de segurança não necessária para este usuário.");
        return;
      }

      if (!ticket.ticketId) {
        throw new Error("Ticket de segurança não retornado.");
      }

      if (ticket.method === "TOTP") {
        await api().post(apiRoute.securitySensitiveVerifyTotp, {
          ticketId: ticket.ticketId,
          code: totpCode,
        });
      }

      if (ticket.method === "RECOVERY_CODE") {
        await api().post(apiRoute.securitySensitiveVerifyRecoveryCode, {
          ticketId: ticket.ticketId,
          code: recoveryCode,
        });
      }

      if (ticket.method === "PASSKEY") {
        const optionsResponse = await api().post(apiRoute.securitySensitivePasskeyOptions, {
          ticketId: ticket.ticketId,
        });

        const authenticationResponse = await startAuthentication(optionsResponse.data);

        await api().post(apiRoute.securitySensitivePasskeyVerify, {
          ticketId: ticket.ticketId,
          authenticationResponse,
        });
      }

      setActionTicketId(ticket.ticketId);
      context.setValue("actionTicketId", ticket.ticketId);
      setSecurityVerified(true);
      responseSuccess("Confirmação de segurança realizada.");
    } catch (error) {
      setActionTicketId("");
      context.setValue("actionTicketId", "");
      setSecurityVerified(false);
      responseError(error as AxiosError);
    } finally {
      setIsConfirmingSecurity(false);
    }
  };

  const onSubmit = () => {
    if (!novaSenha || !confirmarSenha) return;
    if (novaSenha !== confirmarSenha) return;

    mutate({
      senhaAntiga,
      novaSenha,
      confirmarSenha,
      actionTicketId,
    });
  };

  return (
    <Modal onClose={onClose} fit>
      <h2 className="mb-4 text-xl font-bold">Alterar senha</h2>

      <FormProvider {...context}>
        <FormX onSubmit={onSubmit} className="flex flex-col gap-3">
          <InputX
            title="Senha Antiga"
            typ={showOldPassword ? "text" : "password"}
            placeholder="Senha Antiga"
            value={senhaAntiga}
            onChange={(e) => {
              setSenhaAntiga(e.target.value);
              context.setValue("senhaAntiga", e.target.value);
              setSecurityVerified(false);
            }}
          />

          <label className="flex w-11/12 flex-row items-center gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={showOldPassword}
              onChange={() => setShowOldPassword(!showOldPassword)}
              className="h-4 w-4 appearance-none rounded-6 bg-primary outline-none checked:bg-slate-800 focus:outline-none"
            />
            {showOldPassword ? "Ocultar" : "Mostrar"} Senha Antiga
          </label>

          <InputX
            title="Nova Senha"
            typ={showNewPasswords ? "text" : "password"}
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => {
              setNovaSenha(e.target.value);
              context.setValue("novaSenha", e.target.value);
              setSecurityVerified(false);
            }}
          />

          <InputX
            title="Confirmar Senha"
            typ={showNewPasswords ? "text" : "password"}
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => {
              setConfirmarSenha(e.target.value);
              context.setValue("confirmarSenha", e.target.value);
              setSecurityVerified(false);
            }}
          />

          <label className="flex w-11/12 flex-row items-center gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={showNewPasswords}
              onChange={() => setShowNewPasswords(!showNewPasswords)}
              className="h-4 w-4 appearance-none rounded-6 bg-primary outline-none checked:bg-slate-800 focus:outline-none"
            />
            {showNewPasswords ? "Ocultar" : "Mostrar"} Nova Senha
          </label>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-sm font-bold text-black">Confirmação de segurança</p>

            <select
              value={confirmationMethod}
              onChange={(e) => {
                setConfirmationMethod(e.target.value as ConfirmationMethod);
                setSecurityVerified(false);
                setActionTicketId("");
                context.setValue("actionTicketId", "");
              }}
              className="mb-3 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="TOTP">Google Authenticator</option>
              <option value="RECOVERY_CODE">Código de recuperação</option>
              <option value="PASSKEY">Chave de acesso</option>
            </select>

            {confirmationMethod === "TOTP" && (
              <InputX
                title="Código Google Authenticator"
                placeholder="Digite o código de 6 dígitos"
                value={totpCode}
                onChange={(e) => {
                  setTotpCode(e.target.value);
                  setSecurityVerified(false);
                }}
              />
            )}

            {confirmationMethod === "RECOVERY_CODE" && (
              <InputX
                title="Código de recuperação"
                placeholder="Digite o código de recuperação"
                value={recoveryCode}
                onChange={(e) => {
                  setRecoveryCode(e.target.value);
                  setSecurityVerified(false);
                }}
              />
            )}

            <button
              type="button"
              onClick={confirmSecurity}
              disabled={isConfirmingSecurity}
              className="mt-2 w-full rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {securityVerified
                ? "Segurança confirmada"
                : isConfirmingSecurity
                  ? "Confirmando..."
                  : "Confirmar segurança"}
            </button>
          </div>

          <button
            disabled={
              senhaAntiga.length === 0 ||
              novaSenha.length === 0 ||
              confirmarSenha.length === 0 ||
              isPending ||
              Object.keys(errors).length > 0 ||
              !securityVerified
            }
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending ? "Alterando..." : "Alterar Senha"}
          </button>
        </FormX>
      </FormProvider>
    </Modal>
  );
};
