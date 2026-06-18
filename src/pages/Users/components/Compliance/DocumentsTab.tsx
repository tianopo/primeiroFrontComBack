import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { publicFileUrl } from "src/config/api";
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
  appliesTo?: Array<"CPF" | "CNPJ">;
};

const REQUIREMENT_CONFIGS: RequirementConfig[] = [
  {
    key: "requiresDocument",
    label: "documento aberto",
    type: "ID_FRONT_BACK",
  },
  {
    key: "requiresSelfieDocument",
    label: "selfie com documento",
    type: "SELFIE_WITH_DOCUMENT",
  },
  {
    key: "requiresAddressProof",
    label: "comprovante de endereço",
    type: "ADDRESS_PROOF",
  },
  {
    key: "requiresIncomeProof",
    label: "comprovante de renda",
    type: "PAYSLIP",
  },
  {
    key: "requiresBankStatement",
    label: "extrato bancário",
    type: "BANK_STATEMENT",
  },
  {
    key: "requiresCorporateDocs",
    label: "contrato social",
    type: "CORPORATE_ARTICLES",
    appliesTo: ["CNPJ"],
  },
  {
    key: "requiresResponsibilityTerm",
    label: "termo de responsabilidade",
    type: "RESPONSIBILITY_TERM",
  },
  {
    key: "requiresEnhancedKyc",
    label: "KYC reforçado",
    type: "KYC_FORM",
    appliesTo: ["CNPJ"],
  },
  {
    key: "requiresPldForm",
    label: "formulário PLD",
    type: "PLD_FORM",
    appliesTo: ["CNPJ"],
  },
];

export const DocumentsTab = ({ data, onSaved }: IDocumentsTab) => {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const documentType = String(data?.input?.documentType ?? "").toUpperCase();
  const normalizedDocumentType = documentType === "CNPJ" ? "CNPJ" : "CPF";

  const requiredTypes = new Set(requiredNow.map((item: { type: string }) => item.type));

  const requiredByType = new Map<string, any>(
    requiredNow.map((item: any) => [String(item.type), item]),
  );

  const allowedRequirementConfigs = REQUIREMENT_CONFIGS.filter((item) => {
    if (!item.appliesTo?.length) return true;
    return item.appliesTo.includes(normalizedDocumentType);
  });

  const evidenceIsStored = (evidence: any) => {
    if (!evidence) return false;

    const status = String(evidence.status ?? "");

    if (status === "WAIVED") {
      return false;
    }

    if (status === "EXPIRED") {
      return false;
    }

    if (status === "REJECTED") {
      return false;
    }

    if (status === "PENDING") {
      return false;
    }

    if (evidence.storageKey || evidence.fileHash) {
      return true;
    }

    return ["RECEIVED", "APPROVED"].includes(status);
  };

  const formatRequirementLabel = (label: string, active: boolean) => {
    const cleanLabel = String(label ?? "")
      .replace(/^exige\s+/i, "")
      .replace(/^não exige\s+/i, "")
      .trim();

    return `${active ? "Exige" : "Não exige"} ${cleanLabel}`;
  };

  const displayRequirements = useMemo(() => {
    const baseItems = allowedRequirementConfigs.map((config) => {
      const required = requiredByType.get(config.type);
      const active = requiredTypes.has(config.type);

      return {
        ...config,
        active,
        originalLabel: required?.label ?? config.label,
        label: formatRequirementLabel(required?.label ?? config.label, active),
        reason: required?.reason ?? (active ? "Documento exigido." : "Documento não exigido."),
      };
    });

    const extraRequiredItems = requiredNow
      .filter((item: any) => {
        return !baseItems.some((base) => base.type === item.type);
      })
      .map((item: any) => ({
        key: item.type,
        type: item.type,
        active: true,
        originalLabel: item.label,
        label: formatRequirementLabel(item.label, true),
        reason: item.reason ?? "Documento exigido.",
      }));

    return [...baseItems, ...extraRequiredItems];
  }, [allowedRequirementConfigs, requiredNow, requiredTypes, requiredByType]);

  const displayTypes = new Set(displayRequirements.map((item) => item.type));

  const visibleStoredEvidence = storedEvidence.filter((item: { type: string; status: string }) => {
    return (
      displayTypes.has(item.type) ||
      requiredTypes.has(item.type) ||
      item.status === "APPROVED" ||
      item.status === "WAIVED" ||
      item.status === "RECEIVED"
    );
  });

  const uploadRequirements = useMemo(() => {
    return displayRequirements.filter((item) => {
      const evidence = storedEvidence.find((doc: any) => doc.type === item.type);

      return !evidenceIsStored(evidence);
    });
  }, [displayRequirements, storedEvidence]);

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

  if (displayRequirements.length === 0 && visibleStoredEvidence.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
        Nenhum documento disponível para este perfil.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-3 text-lg font-bold">Documentos e exigências</h4>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {displayRequirements.map((item) => {
            const evidence = getEvidenceByType(item.type);
            const active = item.active;

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
                              Expirar
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

      {uploadRequirements.length > 0 && (
        <section className="rounded-md border border-gray-200 p-4">
          <h4 className="mb-3 text-lg font-bold">Enviar documentos</h4>

          <div className="flex flex-col gap-4">
            {uploadRequirements.map((item: any) => {
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
