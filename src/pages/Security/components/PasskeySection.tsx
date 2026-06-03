import { startRegistration } from "@simplewebauthn/browser";
import { AxiosError } from "axios";
import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { useSensitiveAction } from "../hooks/useSensitiveAction";
import { SensitiveActionModal } from "./SensitiveActionModal";

interface IPasskeySection {
  passkeys?: any[];
  onReloadProfile: () => Promise<void>;
}

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 py-2 last:border-b-0">
    <span className="text-xs font-semibold text-gray-600">{label}</span>
    <span className="break-all text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

export const PasskeySection = ({ passkeys = [], onReloadProfile }: IPasskeySection) => {
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    passkeyId?: string;
    deviceName?: string;
  }>({ open: false });

  const [pendingDelete, setPendingDelete] = useState<{
    passkeyId?: string;
    deviceName?: string;
  } | null>(null);

  const sensitive = useSensitiveAction();

  const handleRegisterPasskey = async () => {
    setLoadingRegister(true);
    try {
      const optionsRes = await api().post(apiRoute.securityPasskeyRegisterOptions, {
        deviceName: navigator.userAgent,
      });

      const registrationResponse = await startRegistration(optionsRes.data);

      await api().post(apiRoute.securityPasskeyRegisterVerify, {
        registrationResponse,
        deviceName: navigator.userAgent,
      });

      responseSuccess("Chave de acesso cadastrada com sucesso.");
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoadingRegister(false);
    }
  };

  const deletePasskey = async (passkeyId: string, actionTicketId?: string) => {
    setLoadingDeleteId(passkeyId);
    try {
      const res = await api().delete(apiRoute.securityPasskeyDelete(passkeyId), {
        data: { actionTicketId },
      });

      responseSuccess(res?.data?.message ?? "Chave de acesso removida com sucesso.");
      setConfirmDelete({ open: false });
      setPendingDelete(null);
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const handleProtectedDelete = async () => {
    if (!confirmDelete.passkeyId) return;

    const ticket = await sensitive.start("DELETE_PASSKEY");

    if (ticket === undefined) {
      await deletePasskey(confirmDelete.passkeyId);
      return;
    }

    setPendingDelete({
      passkeyId: confirmDelete.passkeyId,
      deviceName: confirmDelete.deviceName,
    });
    setConfirmDelete({ open: false });
  };

  return (
    <CardContainer full>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Chaves de acesso</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              passkeys.length > 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {passkeys.length > 0 ? `${passkeys.length} cadastrada(s)` : "Nenhuma cadastrada"}
          </span>
        </div>

        <div className="text-sm text-gray-700">
          Use a chave de acesso para entrar sem precisar digitar código manual do autenticador.
        </div>

        <div>
          <Button onClick={handleRegisterPasskey} disabled={loadingRegister}>
            {loadingRegister ? "Cadastrando..." : "Adicionar chave de acesso"}
          </Button>
        </div>

        <div className="mt-2 space-y-3">
          {passkeys.length === 0 ? (
            <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              Nenhuma chave de acesso cadastrada.
            </div>
          ) : (
            passkeys.map((item: any) => (
              <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                <div className="mb-2 text-sm font-semibold text-gray-900">
                  {item.deviceName ?? "Dispositivo sem nome"}
                </div>

                <div className="flex flex-col">
                  <Row label="Backed up" value={item.backedUp ? "Sim" : "Não"} />
                  <Row label="Criado em" value={item.createdIn ?? "-"} />
                  <Row label="Último uso" value={item.lastUsedAt ?? "-"} />
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={() =>
                      setConfirmDelete({
                        open: true,
                        passkeyId: item.id,
                        deviceName: item.deviceName ?? "este dispositivo",
                      })
                    }
                    disabled={loadingDeleteId === item.id}
                  >
                    {loadingDeleteId === item.id ? "Removendo..." : "Excluir chave"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {confirmDelete.open && (
          <ConfirmationModalButton
            text={`Tem certeza que deseja excluir a chave de acesso de ${confirmDelete.deviceName ?? "este dispositivo"}?`}
            onCancel={() => setConfirmDelete({ open: false })}
            onConfirm={handleProtectedDelete}
            confirmDisabled={Boolean(loadingDeleteId)}
          />
        )}

        <SensitiveActionModal
          challenge={sensitive.challenge}
          onClose={() => {
            sensitive.clear();
            setPendingDelete(null);
          }}
          onVerified={async (ticketId) => {
            if (pendingDelete?.passkeyId) {
              await deletePasskey(pendingDelete.passkeyId, ticketId);
            }

            sensitive.clear();
            setPendingDelete(null);
          }}
        />
      </div>
    </CardContainer>
  );
};
