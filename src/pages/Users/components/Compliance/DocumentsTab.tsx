import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { useReviewComplianceEvidence } from "../../hooks/Compliance/useReviewComplianceEvidence";
import { useUploadComplianceEvidence } from "../../hooks/Compliance/useUploadComplianceEvidence";

interface IDocumentsTab {
  data: any;
  onSaved?: (data: any) => void;
}

type RequirementConfig = {
  key: string;
  label: string;
  type: string;
};

const REQUIREMENT_CONFIGS: RequirementConfig[] = [
  {
    key: "requiresSelfieDocument",
    label: "Exige selfie com documento",
    type: "SELFIE_WITH_DOCUMENT",
  },
  {
    key: "requiresAddressProof",
    label: "Exige comprovante de endereço",
    type: "ADDRESS_PROOF",
  },
  {
    key: "requiresIncomeProof",
    label: "Exige comprovante de renda",
    type: "PAYSLIP",
  },
  {
    key: "requiresBankStatement",
    label: "Exige extrato bancário",
    type: "BANK_STATEMENT",
  },
  {
    key: "requiresCorporateDocs",
    label: "Exige documentos societários",
    type: "CORPORATE_ARTICLES",
  },
  {
    key: "requiresResponsibilityTerm",
    label: "Exige termo de responsabilidade",
    type: "RESPONSIBILITY_TERM",
  },
  {
    key: "requiresEnhancedKyc",
    label: "Exige KYC reforçado",
    type: "KYC_FORM",
  },
  {
    key: "requiresPldForm",
    label: "Exige formulário PLD",
    type: "PLD_FORM",
  },
];

export const DocumentsTab = ({ data, onSaved }: IDocumentsTab) => {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { mutateAsync: uploadEvidence, isPending: isUploading } = useUploadComplianceEvidence();
  const { mutateAsync: reviewEvidence, isPending: isReviewing } = useReviewComplianceEvidence();

  const activeRequirements = useMemo(() => {
    return data?.compliance?.evidence?.requiredNow ?? [];
  }, [data]);

  const storedEvidence = data?.compliance?.evidence?.stored ?? [];

  const getEvidenceByType = (type: string) =>
    storedEvidence.find((item: any) => item.type === type);

  const handleUpload = async (type: string) => {
    const file = files[type];
    if (!file) return;

    const result = await uploadEvidence({
      document: data?.input?.rawDocument,
      type,
      file,
      description: notes[type] ?? "",
    });

    onSaved?.(result);
  };

  const handleApprove = async (evidenceId: string) => {
    const result = await reviewEvidence({
      evidenceId,
      status: "APPROVED",
      validatedBy: "Master",
    });

    onSaved?.(result);
  };

  const handleReject = async (evidenceId: string) => {
    const result = await reviewEvidence({
      evidenceId,
      status: "REJECTED",
      validatedBy: "Master",
    });

    onSaved?.(result);
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-3 text-lg font-bold">Documentos e exigências</h4>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {REQUIREMENT_CONFIGS.map((item) => {
            const evidence = getEvidenceByType(item.type);
            const active = activeRequirements.some((req: any) => req.type === item.type);

            return (
              <div key={item.type} className="rounded border p-3">
                <div className="font-semibold">{item.label}</div>
                <div className="mt-1 text-sm">{active ? "Pendente / exigido" : "Não exigido"}</div>

                {evidence && (
                  <div className="mt-2 rounded border bg-gray-50 p-2 text-sm">
                    <div>
                      <strong>Status:</strong> {evidence.status}
                    </div>
                    <div>
                      <strong>Arquivo:</strong> {evidence.label}
                    </div>
                    <div>
                      <strong>Descrição:</strong> {evidence.description || "-"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {activeRequirements.length > 0 && (
        <section className="rounded-md border border-gray-200 p-4">
          <h4 className="mb-3 text-lg font-bold">Enviar documentos exigidos</h4>

          <div className="flex flex-col gap-4">
            {activeRequirements.map((item: any) => {
              const evidence = getEvidenceByType(item.type);

              return (
                <div key={item.type} className="rounded border p-4">
                  <div className="mb-2 font-semibold">{item.label}</div>

                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setFiles((prev) => ({ ...prev, [item.type]: file }));
                    }}
                  />

                  <textarea
                    className="mt-2 min-h-[80px] w-full rounded border p-2"
                    placeholder="Observação sobre este documento"
                    value={notes[item.type] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [item.type]: e.target.value }))}
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={!files[item.type] || isUploading}
                      onClick={() => handleUpload(item.type)}
                    >
                      {evidence ? "Atualizar documento" : "Enviar documento"}
                    </Button>

                    {evidence && (
                      <>
                        <Button
                          type="button"
                          disabled={isReviewing}
                          onClick={() => handleApprove(evidence.id)}
                        >
                          Aprovar
                        </Button>

                        <Button
                          type="button"
                          disabled={isReviewing}
                          onClick={() => handleReject(evidence.id)}
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
