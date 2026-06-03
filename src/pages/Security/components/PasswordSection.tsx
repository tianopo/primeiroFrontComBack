import { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { useSensitiveAction } from "../hooks/useSensitiveAction";
import { SensitiveActionModal } from "./SensitiveActionModal";

interface IPasswordSection {
  hasAlternativePassword?: boolean;
  hasThirdPassword?: boolean;
  canUseThirdPassword?: boolean;
  onReloadProfile: () => Promise<void>;
}

type ModeType = "create" | "edit";

const FieldError = ({ text }: { text?: string }) => {
  if (!text) return null;
  return <span className="text-sm font-medium text-red-600">{text}</span>;
};

export const PasswordSection = ({
  hasAlternativePassword,
  hasThirdPassword,
  canUseThirdPassword,
  onReloadProfile,
}: IPasswordSection) => {
  const [alternativePassword, setAlternativePassword] = useState("");
  const [confirmAlternativePassword, setConfirmAlternativePassword] = useState("");
  const [currentAlternativePassword, setCurrentAlternativePassword] = useState("");

  const [thirdPassword, setThirdPassword] = useState("");
  const [confirmThirdPassword, setConfirmThirdPassword] = useState("");
  const [currentThirdPassword, setCurrentThirdPassword] = useState("");

  const [alternativeMode, setAlternativeMode] = useState<ModeType>("create");
  const [thirdMode, setThirdMode] = useState<ModeType>("create");

  const [savingAlternative, setSavingAlternative] = useState(false);
  const [savingThird, setSavingThird] = useState(false);
  const [deletingAlternative, setDeletingAlternative] = useState(false);
  const [deletingThird, setDeletingThird] = useState(false);

  const [confirmDeleteAlternative, setConfirmDeleteAlternative] = useState(false);
  const [confirmDeleteThird, setConfirmDeleteThird] = useState(false);

  const [pendingAction, setPendingAction] = useState<
    null | "SAVE_ALT" | "DELETE_ALT" | "SAVE_THIRD" | "DELETE_THIRD"
  >(null);

  const sensitive = useSensitiveAction();

  const alternativeError = useMemo(() => {
    if (!alternativePassword && !confirmAlternativePassword) return "";
    if (alternativePassword.length < 7) return "A senha alternativa deve ter mais de 6 caracteres.";
    if (alternativePassword !== confirmAlternativePassword)
      return "A confirmação da senha alternativa não confere.";
    return "";
  }, [alternativePassword, confirmAlternativePassword]);

  const thirdError = useMemo(() => {
    if (!thirdPassword && !confirmThirdPassword) return "";
    if (thirdPassword.length < 7) return "A terceira senha deve ter mais de 6 caracteres.";
    if (thirdPassword !== confirmThirdPassword)
      return "A confirmação da terceira senha não confere.";
    return "";
  }, [thirdPassword, confirmThirdPassword]);

  const resetAlternativeFields = () => {
    setAlternativePassword("");
    setConfirmAlternativePassword("");
    setCurrentAlternativePassword("");
    setAlternativeMode("create");
  };

  const resetThirdFields = () => {
    setThirdPassword("");
    setConfirmThirdPassword("");
    setCurrentThirdPassword("");
    setThirdMode("create");
  };

  const saveAlternative = async (actionTicketId?: string) => {
    setSavingAlternative(true);
    try {
      const res = await api().patch(apiRoute.securityAlternativePassword, {
        alternativePassword,
        currentAlternativePassword,
        actionTicketId,
      });

      responseSuccess(
        res?.data?.message ??
          (hasAlternativePassword
            ? "Senha alternativa atualizada com sucesso."
            : "Senha alternativa cadastrada com sucesso."),
      );

      resetAlternativeFields();
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setSavingAlternative(false);
    }
  };

  const deleteAlternative = async (actionTicketId?: string) => {
    setDeletingAlternative(true);
    try {
      const res = await api().delete(apiRoute.securityAlternativePasswordDelete, {
        data: { actionTicketId },
      });

      responseSuccess(res?.data?.message ?? "Senha alternativa excluída com sucesso.");

      setConfirmDeleteAlternative(false);
      resetAlternativeFields();
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setDeletingAlternative(false);
    }
  };

  const saveThird = async (actionTicketId?: string) => {
    setSavingThird(true);
    try {
      const res = await api().patch(apiRoute.securityThirdPassword, {
        thirdPassword,
        currentThirdPassword,
        actionTicketId,
      });

      responseSuccess(
        res?.data?.message ??
          (hasThirdPassword
            ? "Terceira senha atualizada com sucesso."
            : "Terceira senha cadastrada com sucesso."),
      );

      resetThirdFields();
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setSavingThird(false);
    }
  };

  const deleteThird = async (actionTicketId?: string) => {
    setDeletingThird(true);
    try {
      const res = await api().delete(apiRoute.securityThirdPasswordDelete, {
        data: { actionTicketId },
      });

      responseSuccess(res?.data?.message ?? "Terceira senha excluída com sucesso.");

      setConfirmDeleteThird(false);
      resetThirdFields();
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setDeletingThird(false);
    }
  };

  const protect = async (action: string, pending: typeof pendingAction) => {
    const ticket = await sensitive.start(action);
    if (ticket === undefined) return true;
    setPendingAction(pending);
    return false;
  };

  return (
    <CardContainer full>
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Senhas de segurança</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">Senha alternativa</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  hasAlternativePassword
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {hasAlternativePassword ? "Cadastrada" : "Não cadastrada"}
              </span>
            </div>

            {hasAlternativePassword && alternativeMode === "create" ? (
              <div className="flex flex-col gap-3">
                <div className="text-sm text-gray-700">
                  Já existe uma senha alternativa cadastrada. Você pode modificá-la ou excluí-la.
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setAlternativeMode("edit")}>
                    Modificar senha alternativa
                  </Button>
                  <Button onClick={() => setConfirmDeleteAlternative(true)}>
                    Excluir senha alternativa
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {hasAlternativePassword && (
                  <input
                    value={currentAlternativePassword}
                    onChange={(e) => setCurrentAlternativePassword(e.target.value)}
                    type="password"
                    placeholder="Senha alternativa atual"
                    className="rounded border px-3 py-2"
                  />
                )}

                <input
                  value={alternativePassword}
                  onChange={(e) => setAlternativePassword(e.target.value)}
                  type="password"
                  placeholder="Nova senha alternativa"
                  className="rounded border px-3 py-2"
                />

                <input
                  value={confirmAlternativePassword}
                  onChange={(e) => setConfirmAlternativePassword(e.target.value)}
                  type="password"
                  placeholder="Confirmar nova senha alternativa"
                  className="rounded border px-3 py-2"
                />

                <FieldError text={alternativeError} />

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={async () => {
                      if (alternativeError || !alternativePassword.trim()) return;
                      const proceed = await protect("MODIFY_ALTERNATIVE_PASSWORD", "SAVE_ALT");
                      if (proceed) await saveAlternative();
                    }}
                    disabled={
                      savingAlternative ||
                      !alternativePassword.trim() ||
                      Boolean(alternativeError) ||
                      (hasAlternativePassword && !currentAlternativePassword.trim())
                    }
                  >
                    {savingAlternative
                      ? "Salvando..."
                      : hasAlternativePassword
                        ? "Salvar nova senha alternativa"
                        : "Cadastrar senha alternativa"}
                  </Button>

                  {hasAlternativePassword && (
                    <Button onClick={resetAlternativeFields}>Cancelar edição</Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {canUseThirdPassword && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Terceira senha</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    hasThirdPassword
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {hasThirdPassword ? "Cadastrada" : "Não cadastrada"}
                </span>
              </div>

              {hasThirdPassword && thirdMode === "create" ? (
                <div className="flex flex-col gap-3">
                  <div className="text-sm text-gray-700">
                    Já existe uma terceira senha cadastrada. Você pode modificá-la ou excluí-la.
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setThirdMode("edit")}>Modificar terceira senha</Button>
                    <Button onClick={() => setConfirmDeleteThird(true)}>
                      Excluir terceira senha
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {hasThirdPassword && (
                    <input
                      value={currentThirdPassword}
                      onChange={(e) => setCurrentThirdPassword(e.target.value)}
                      type="password"
                      placeholder="Terceira senha atual"
                      className="rounded border px-3 py-2"
                    />
                  )}

                  <input
                    value={thirdPassword}
                    onChange={(e) => setThirdPassword(e.target.value)}
                    type="password"
                    placeholder="Nova terceira senha"
                    className="rounded border px-3 py-2"
                  />

                  <input
                    value={confirmThirdPassword}
                    onChange={(e) => setConfirmThirdPassword(e.target.value)}
                    type="password"
                    placeholder="Confirmar nova terceira senha"
                    className="rounded border px-3 py-2"
                  />

                  <FieldError text={thirdError} />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={async () => {
                        if (thirdError || !thirdPassword.trim()) return;
                        const proceed = await protect("MODIFY_THIRD_PASSWORD", "SAVE_THIRD");
                        if (proceed) await saveThird();
                      }}
                      disabled={
                        savingThird ||
                        !thirdPassword.trim() ||
                        Boolean(thirdError) ||
                        (hasThirdPassword && !currentThirdPassword.trim())
                      }
                    >
                      {savingThird
                        ? "Salvando..."
                        : hasThirdPassword
                          ? "Salvar nova terceira senha"
                          : "Cadastrar terceira senha"}
                    </Button>

                    {hasThirdPassword && (
                      <Button onClick={resetThirdFields}>Cancelar edição</Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {confirmDeleteAlternative && (
          <ConfirmationModalButton
            text="Tem certeza que deseja excluir a senha alternativa?"
            onCancel={() => setConfirmDeleteAlternative(false)}
            onConfirm={async () => {
              const proceed = await protect("DELETE_ALTERNATIVE_PASSWORD", "DELETE_ALT");
              if (proceed) await deleteAlternative();
            }}
            confirmDisabled={deletingAlternative}
          />
        )}

        {confirmDeleteThird && (
          <ConfirmationModalButton
            text="Tem certeza que deseja excluir a terceira senha?"
            onCancel={() => setConfirmDeleteThird(false)}
            onConfirm={async () => {
              const proceed = await protect("DELETE_THIRD_PASSWORD", "DELETE_THIRD");
              if (proceed) await deleteThird();
            }}
            confirmDisabled={deletingThird}
          />
        )}

        <SensitiveActionModal
          challenge={sensitive.challenge}
          onClose={() => {
            sensitive.clear();
            setPendingAction(null);
          }}
          onVerified={async (ticketId) => {
            if (pendingAction === "SAVE_ALT") await saveAlternative(ticketId);
            if (pendingAction === "DELETE_ALT") await deleteAlternative(ticketId);
            if (pendingAction === "SAVE_THIRD") await saveThird(ticketId);
            if (pendingAction === "DELETE_THIRD") await deleteThird(ticketId);

            sensitive.clear();
            setPendingAction(null);
          }}
        />
      </div>
    </CardContainer>
  );
};
