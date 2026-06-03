import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { SensitiveActionModal } from "./SensitiveActionModal";
import { useSensitiveAction } from "../hooks/useSensitiveAction";

interface IAntiPhishingSection {
  profile: any;
  onReloadProfile: () => Promise<void>;
}

export const AntiPhishingSection = ({ profile, onReloadProfile }: IAntiPhishingSection) => {
  const [editing, setEditing] = useState(false);
  const [antiPhishingCode, setAntiPhishingCode] = useState(profile?.antiPhishingCode ?? "");
  const [loading, setLoading] = useState(false);
  const sensitive = useSensitiveAction();

  useEffect(() => {
    setAntiPhishingCode(profile?.antiPhishingCode ?? "");
  }, [profile?.antiPhishingCode]);

  const save = async (actionTicketId?: string) => {
    setLoading(true);
    try {
      const res = await api().patch(apiRoute.securityAntiPhishing, {
        antiPhishingCode,
        actionTicketId,
      });
      responseSuccess(res?.data?.message ?? "Código anti-phishing salvo com sucesso.");
      setEditing(false);
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const ticket = await sensitive.start("MODIFY_ANTI_PHISHING");
    if (ticket === undefined) {
      await save();
      return;
    }
  };

  return (
    <CardContainer full>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Anti-phishing</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              profile?.hasAntiPhishingCode
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {profile?.hasAntiPhishingCode ? "Salvo" : "Não salvo"}
          </span>
        </div>

        {!editing ? (
          <div className="flex flex-col gap-3">
            <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
              <strong>Código atual:</strong> {profile?.antiPhishingMasked || "-"}
            </div>

            <div>
              <Button onClick={() => setEditing(true)}>
                {profile?.hasAntiPhishingCode ? "Editar código" : "Cadastrar código"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              value={antiPhishingCode}
              onChange={(e) => setAntiPhishingCode(e.target.value)}
              placeholder="Código anti-phishing"
              className="rounded border px-3 py-2"
            />

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={loading || !antiPhishingCode.trim()}>
                {loading ? "Salvando..." : "Salvar código"}
              </Button>
              <Button
                onClick={() => {
                  setEditing(false);
                  setAntiPhishingCode(profile?.antiPhishingCode ?? "");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <SensitiveActionModal
          challenge={sensitive.challenge}
          onClose={sensitive.clear}
          onVerified={async (ticketId) => {
            await save(ticketId);
            sensitive.clear();
          }}
        />
      </div>
    </CardContainer>
  );
};
