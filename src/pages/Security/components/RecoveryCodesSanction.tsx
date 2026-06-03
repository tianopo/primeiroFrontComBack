import { AxiosError } from "axios";
import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { SensitiveActionModal } from "./SensitiveActionModal";
import { useSensitiveAction } from "../hooks/useSensitiveAction";

export const RecoveryCodesSection = () => {
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const sensitive = useSensitiveAction();

  const generate = async (actionTicketId?: string) => {
    setLoading(true);
    try {
      const res = await api().post(apiRoute.securityRecoveryCodesRegenerate, {
        actionTicketId,
      });
      setCodes(res.data.codes ?? []);
      responseSuccess(res?.data?.message ?? "Códigos de recuperação gerados com sucesso.");
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const ticket = await sensitive.start("REGENERATE_RECOVERY_CODES");
    if (ticket === undefined) {
      await generate();
      return;
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      responseSuccess("Código copiado com sucesso.");
    } catch {
      responseError({
        response: {
          data: {
            message: "Não foi possível copiar o código.",
          },
        },
      } as any);
    }
  };

  return (
    <CardContainer full>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Códigos de recuperação</h2>

        <div>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Gerando..." : "Gerar novos códigos"}
          </Button>
        </div>

        {codes.length > 0 && (
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 text-sm text-gray-700">
              Guarde estes códigos em local seguro. Cada código pode ser usado como recuperação.
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {codes.map((code) => (
                <div
                  key={code}
                  className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <span className="font-mono text-sm">{code}</span>
                  <Button onClick={() => copyCode(code)}>Copiar</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <SensitiveActionModal
          challenge={sensitive.challenge}
          onClose={sensitive.clear}
          onVerified={async (ticketId) => {
            await generate(ticketId);
            sensitive.clear();
          }}
        />
      </div>
    </CardContainer>
  );
};
