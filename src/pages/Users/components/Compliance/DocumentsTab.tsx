import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { publicFileUrl } from "src/config/api";
import { useAccessControl } from "src/routes/context/AccessControl";
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
    key: "requiresDocument",
    label: "Exige documento frente e verso",
    type: "ID_FRONT_BACK",
  },
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { acesso } = useAccessControl();

  const { mutateAsync: uploadEvidence, isPending: isUploading } = useUploadComplianceEvidence();
  const { mutateAsync: reviewEvidence, isPending: isReviewing } = useReviewComplianceEvidence();

  const isImageFile = (mimeType?: string | null, storageKey?: string | null) => {
    if (mimeType?.startsWith("image/")) return true;
    return /\.(png|jpg|jpeg|webp|gif|bmp|svg)$/i.test(String(storageKey ?? ""));
  };

  const isPdfFile = (mimeType?: string | null, storageKey?: string | null) => {
    return mimeType === "application/pdf" || /\.pdf$/i.test(String(storageKey ?? ""));
  };

  const requiredNow = data?.compliance?.evidence?.requiredNow ?? [];
  const storedEvidence = data?.compliance?.evidence?.stored ?? [];

  const requiredTypes = new Set(requiredNow.map((item: { type: string }) => item.type));

  const visibleStoredEvidence = storedEvidence.filter((item: { type: string }) =>
    requiredTypes.has(item.type),
  );

  const activeRequirements = useMemo(() => {
    return requiredNow.filter((item: { type: string }) => {
      const existing = visibleStoredEvidence.find(
        (doc: { type: string; status: string }) => doc.type === item.type,
      );

      if (!existing) return true;

      return existing.status !== "APPROVED";
    });
  }, [requiredNow, visibleStoredEvidence]);

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

  if (requiredNow.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
        Nenhum documento exigido no momento.
      </div>
    );
  }

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
                <div className="mt-1 text-sm">
                  {evidence && evidence.status === "APPROVED"
                    ? ""
                    : active
                      ? "Pendente / exigido"
                      : "Não exigido"}
                </div>

                {evidence &&
                  (() => {
                    const fileUrl = publicFileUrl(evidence.storageKey);

                    return (
                      <div className="mt-2 rounded border bg-gray-50 p-2 text-sm">
                        <div className="flex items-center gap-2">
                          <strong>Status:</strong>
                          <span>{evidence.status}</span>

                          {evidence.status === "APPROVED" && (
                            <button
                              type="button"
                              disabled={isReviewing}
                              className="rounded bg-gray-500 px-2 py-0.5 text-white hover:bg-gray-600 disabled:opacity-50"
                              onClick={async () => {
                                const result = await reviewEvidence({
                                  evidenceId: evidence.id,
                                  status: "WAIVED",
                                  validatedBy: "Master",
                                });

                                onSaved?.(result);
                              }}
                            >
                              Expirado
                            </button>
                          )}
                        </div>

                        <div>
                          <strong>Arquivo:</strong> {evidence.label}
                        </div>
                        <div>
                          <strong>Descrição:</strong> {evidence.description || "-"}
                        </div>

                        {isImageFile(evidence.mimeType, evidence.storageKey) && fileUrl && (
                          <div className="mt-2">
                            <img
                              src={fileUrl}
                              alt={evidence.label}
                              className="h-20 w-20 cursor-pointer rounded border object-cover"
                              onClick={() => setPreviewUrl(fileUrl)}
                            />
                          </div>
                        )}

                        {isPdfFile(evidence.mimeType, evidence.storageKey) && fileUrl && (
                          <div className="mt-2">
                            <button
                              type="button"
                              className="rounded border px-3 py-1 text-sm"
                              onClick={() => setPreviewUrl(fileUrl)}
                            >
                              Visualizar PDF
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
          {previewUrl && (
            <Modal onClose={() => setPreviewUrl(null)}>
              <div className="flex h-full w-full flex-col gap-3">
                {/\.pdf(\?|#|$)/i.test(previewUrl) ? (
                  <iframe
                    src={previewUrl}
                    title="Preview PDF"
                    className="h-[75vh] w-full rounded border"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview documento"
                    className="max-h-[75vh] w-full rounded border object-contain"
                    onError={() => {
                      console.error("Erro ao carregar preview:", previewUrl);
                    }}
                  />
                )}
              </div>
            </Modal>
          )}
        </section>
      )}
    </div>
  );
};
