import { useState } from "react";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { useCompliance } from "../../hooks/Compliance/useCompliance";
import { ComplianceEditModal } from "../Compliance/ComplianceEditModal";

interface ICompliancePopover {
  data: any;
  documento: string;
  onClose: () => void;
  title?: string;
}

const onlyDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

const isValidCpfOrCnpj = (value: unknown) => {
  const digits = onlyDigits(value);
  return digits.length === 11 || digits.length === 14;
};

export const CompliancePopover = ({
  data,
  documento,
  onClose,
  title = "Compliance",
}: ICompliancePopover) => {
  const [responseData, setResponseData] = useState<any>(data ?? null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const { mutate, isPending } = useCompliance();

  if (!data) return null;

  const validDocument = isValidCpfOrCnpj(documento);

  const handleOpenComplianceEdit = () => {
    if (!validDocument) return;

    mutate(
      {
        documento: formatCPFOrCNPJ(documento),
      },
      {
        onSuccess: (response) => {
          setResponseData(response);
          setOpenEditModal(true);
        },
      },
    );
  };

  return (
    <>
      <div className="relative z-50 w-[380px] rounded-lg border bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="font-bold">{title}</h4>

          <div className="flex items-center gap-2">
            {validDocument && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleOpenComplianceEdit}
                className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
              >
                {isPending ? "Abrindo..." : "Editar"}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs hover:bg-gray-100"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <strong>Resumo:</strong> {data.summary || "-"}
          </div>

          <div>
            <strong>Status:</strong> {data.status || "-"}
          </div>

          <div>
            <strong>Bloqueado:</strong> {data.blocked ? "Sim" : "Não"}
          </div>

          <div>
            <strong>Motivo do bloqueio:</strong> {data.blockedReason || "-"}
          </div>

          <div>
            <strong>Limite mensal:</strong> {data.monthlyLimitBrl ?? "-"}
          </div>

          <div>
            <strong>Limite por ordem:</strong> {data.maxSingleOrderBrl ?? "-"}
          </div>

          <div>
            <strong>Restrição até:</strong> {data.temporaryRestrictionUntil || "-"}
          </div>

          <div>
            <strong>Motivo da restrição:</strong> {data.temporaryRestrictionReason || "-"}
          </div>

          <div>
            <strong>Soma ordens 30 dias:</strong> {data.behavior?.monthlyVolumeBrl ?? 0}
          </div>

          <div>
            <strong>Ordens altas em 30 dias:</strong> {data.behavior?.highValueOrders30d ?? 0}
          </div>

          <div>
            <strong>Ordens altas em 1 dia:</strong> {data.behavior?.highValueOrders1d ?? 0}
          </div>

          <div>
            <strong>Idade da conta:</strong> {data.behavior?.accountAgeDays ?? 0} dias
          </div>

          <div className="pt-2">
            <strong>Documentos pendentes</strong>

            {data.pendingDocuments?.length ? (
              <ul className="mt-1 list-disc pl-5">
                {data.pendingDocuments.map((item: any) => (
                  <li key={item.type}>
                    {item.label} - status: {item.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma pendência.</p>
            )}
          </div>

          <div className="pt-2">
            <strong>Eventos recentes</strong>

            {data.recentEvents?.length ? (
              <div className="mt-1 space-y-2">
                {data.recentEvents.map((event: any) => (
                  <div key={event.id} className="rounded border p-2">
                    <div className="font-semibold">{event.title}</div>
                    <div>{event.description || "-"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum evento.</p>
            )}
          </div>
        </div>
      </div>

      <ComplianceEditModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        data={responseData}
        onSaved={setResponseData}
      />
    </>
  );
};
