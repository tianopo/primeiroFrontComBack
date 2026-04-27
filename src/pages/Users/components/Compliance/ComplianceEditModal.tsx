import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { useUpdateCompliance } from "../../hooks/useUpdateCompliance";
import { ComplianceProfileResponse } from "../../utils/complianceProfileTypes";
import { CnpjTab } from "./CnpjTab";
import { PortalDaTransparenciaTab } from "./PortalDaTransparenciaTab";
import { SanctionsTab } from "./SanctionsTab";
import { DeskdataTab } from "./DeskdataTab";

interface IComplianceEditModal {
  open: boolean;
  onClose: () => void;
  data: ComplianceProfileResponse | null;
  onSaved?: (data: ComplianceProfileResponse) => void;
}

type ComplianceEditForm = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";
  status:
    | "PENDING"
    | "APPROVED"
    | "MONITORING"
    | "ENHANCED_DUE_DILIGENCE"
    | "RESTRICTED"
    | "BLOCKED";
  beneficialOwnerName: string;
  beneficialOwnerDocument: string;
  riskScore: number;
  riskSummary: string;
  blockedReason: string;
  internalNotes: string;
  temporaryRestrictionUntil: string;
  temporaryRestrictionReason: string;
  monthlyLimitBrl: string;
  maxSingleOrderBrl: string;
  capacityEstimateBrl: string;
  capacitySource: string;
  nextRescreenAt: string;

  requiresDocument: boolean;
  requiresSelfieDocument: boolean;
  requiresAddressProof: boolean;
  requiresIncomeProof: boolean;
  requiresBankStatement: boolean;
  requiresCorporateDocs: boolean;
  requiresResponsibilityTerm: boolean;
  requiresEnhancedKyc: boolean;
  requiresPldForm: boolean;
  requiresManualReview: boolean;
};

type EditTabKey =
  | "analysis"
  | "limits"
  | "documents"
  | "portal"
  | "cnpj"
  | "sanctions"
  | "deskdata"
  | "summaries";

const toDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export const ComplianceEditModal = ({ open, onClose, data, onSaved }: IComplianceEditModal) => {
  const [activeTab, setActiveTab] = useState<EditTabKey>("analysis");

  const methods = useForm<ComplianceEditForm>({
    defaultValues: {
      riskLevel: "MEDIUM",
      status: "PENDING",
      riskScore: 0,
      beneficialOwnerName: "",
      beneficialOwnerDocument: "",
      riskSummary: "",
      blockedReason: "",
      internalNotes: "",
      temporaryRestrictionUntil: "",
      temporaryRestrictionReason: "",
      monthlyLimitBrl: "",
      maxSingleOrderBrl: "",
      capacityEstimateBrl: "",
      capacitySource: "",
      nextRescreenAt: "",
      requiresDocument: false,
      requiresSelfieDocument: false,
      requiresAddressProof: false,
      requiresIncomeProof: false,
      requiresBankStatement: false,
      requiresCorporateDocs: false,
      requiresResponsibilityTerm: false,
      requiresEnhancedKyc: false,
      requiresPldForm: false,
      requiresManualReview: false,
    },
  });

  const { register, reset, handleSubmit } = methods;
  const { mutateAsync, isPending } = useUpdateCompliance();

  useEffect(() => {
    if (!data || !open) return;

    setActiveTab("analysis");

    reset({
      riskLevel: data.compliance.riskLevel,
      status: data.compliance.status,
      riskScore: data.compliance.riskScore,
      internalNotes: data.compliance.internalNotes ?? "",
      temporaryRestrictionUntil: toDateInput(data.compliance.temporaryRestrictionUntil),
      temporaryRestrictionReason: data.compliance.temporaryRestrictionReason ?? "",
      monthlyLimitBrl: String(data.compliance.limits.monthlyLimitBrl ?? ""),
      maxSingleOrderBrl: String(data.compliance.limits.maxSingleOrderBrl ?? ""),
      capacityEstimateBrl:
        data.compliance.limits.capacityEstimateBrl !== null
          ? String(data.compliance.limits.capacityEstimateBrl)
          : "",
      capacitySource: data.compliance.limits.capacitySource ?? "",
      nextRescreenAt: toDateInput(data.compliance.persistence.nextRescreenAt),
      beneficialOwnerName: data.compliance.sources.beneficialOwnerName ?? "",
      beneficialOwnerDocument: data.compliance.sources.beneficialOwnerDocument ?? "",
      requiresDocument: data.compliance.flags.requiresDocument,
      requiresSelfieDocument: data.compliance.flags.requiresSelfieDocument,
      requiresAddressProof: data.compliance.flags.requiresAddressProof,
      requiresIncomeProof: data.compliance.flags.requiresIncomeProof,
      requiresBankStatement: data.compliance.flags.requiresBankStatement,
      requiresCorporateDocs: data.compliance.flags.requiresCorporateDocs,
      requiresResponsibilityTerm: data.compliance.flags.requiresResponsibilityTerm,
      requiresEnhancedKyc: data.compliance.flags.requiresEnhancedKyc,
      requiresPldForm: data.compliance.flags.requiresPldForm,
      requiresManualReview: data.compliance.flags.requiresManualReview,
    });
  }, [data, open, reset]);

  const onSubmit = async (form: ComplianceEditForm) => {
    if (!data) return;

    const result = await mutateAsync({
      documento: data.input.rawDocument,
      riskLevel: form.riskLevel,
      beneficialOwnerName: form.beneficialOwnerName?.trim() || null,
      beneficialOwnerDocument: form.beneficialOwnerDocument?.trim() || null,
      status: form.status,
      riskScore: Number(form.riskScore),
      internalNotes: form.internalNotes?.trim() || null,
      temporaryRestrictionUntil: form.temporaryRestrictionUntil || null,
      temporaryRestrictionReason: form.temporaryRestrictionReason?.trim() || null,
      monthlyLimitBrl: form.monthlyLimitBrl || "0",
      maxSingleOrderBrl: form.maxSingleOrderBrl || "0",
      capacityEstimateBrl: form.capacityEstimateBrl || null,
      capacitySource: form.capacitySource?.trim() || null,
      nextRescreenAt: form.nextRescreenAt || null,
      requiresDocument: form.requiresDocument,
      requiresSelfieDocument: form.requiresSelfieDocument,
      requiresAddressProof: form.requiresAddressProof,
      requiresIncomeProof: form.requiresIncomeProof,
      requiresBankStatement: form.requiresBankStatement,
      requiresCorporateDocs: form.requiresCorporateDocs,
      requiresResponsibilityTerm: form.requiresResponsibilityTerm,
      requiresEnhancedKyc: form.requiresEnhancedKyc,
      requiresPldForm: form.requiresPldForm,
      requiresManualReview: form.requiresManualReview,
    });

    onSaved?.(result);
    onClose();
  };

  if (!open || !data) return null;

  if (!open || !data || !data.input || !data.user || !data.compliance) return null;

  const userObj = data.user as Record<string, unknown>;
  const hasFullUser = "id" in userObj;

  const userName =
    hasFullUser && typeof userObj.name === "string"
      ? userObj.name
      : ((data.user as any)?.name ?? "Sem nome");

  const userDocument =
    hasFullUser && typeof userObj.document === "string" ? userObj.document : data.input.rawDocument;

  const tabBtnClass = (tab: EditTabKey) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      activeTab === tab
        ? "bg-black text-white"
        : "border border-gray-300 bg-white text-black hover:bg-gray-100"
    }`;

  const formatSourceLabel = (value: string) => value.replace(/_/g, " ");

  return (
    <Modal onClose={onClose} title="Editar compliance">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
            <button
              type="button"
              className={tabBtnClass("analysis")}
              onClick={() => setActiveTab("analysis")}
            >
              Análise
            </button>
            <button
              type="button"
              className={tabBtnClass("limits")}
              onClick={() => setActiveTab("limits")}
            >
              Limites
            </button>
            <button
              type="button"
              className={tabBtnClass("documents")}
              onClick={() => setActiveTab("documents")}
            >
              Documentos
            </button>
            <button
              type="button"
              className={tabBtnClass("portal")}
              onClick={() => setActiveTab("portal")}
            >
              Portal da Transparência
            </button>

            {data.input.documentType === "CNPJ" && (
              <button
                type="button"
                className={tabBtnClass("cnpj")}
                onClick={() => setActiveTab("cnpj")}
              >
                CNPJ
              </button>
            )}
            <button
              type="button"
              className={tabBtnClass("sanctions")}
              onClick={() => setActiveTab("sanctions")}
            >
              Sanções
            </button>
            <button
              type="button"
              className={tabBtnClass("deskdata")}
              onClick={() => setActiveTab("deskdata")}
            >
              Deskdata
            </button>
            <button
              type="button"
              className={tabBtnClass("summaries")}
              onClick={() => setActiveTab("summaries")}
            >
              Resumos
            </button>
          </div>

          {activeTab === "analysis" && (
            <div className="flex flex-col gap-4">
              <section className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Identificação</h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Nome</label>
                    <input value={userName} disabled className="w-full rounded border p-2" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Documento</label>
                    <input value={userDocument} disabled className="w-full rounded border p-2" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Tipo</label>
                    <input
                      value={data.input.documentType}
                      disabled
                      className="w-full rounded border p-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Nome de screening</label>
                    <input
                      value={data.compliance.sources.screeningName ?? ""}
                      disabled
                      className="w-full rounded border p-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      Beneficiário responsável
                    </label>
                    <input
                      {...register("beneficialOwnerName")}
                      className="w-full rounded border p-2"
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      Documento do responsável
                    </label>
                    <input
                      {...register("beneficialOwnerDocument")}
                      className="w-full rounded border p-2"
                      placeholder="CPF/CNPJ do responsável"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Resultado da análise</h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Risk Level</label>
                    <select {...register("riskLevel")} className="w-full rounded border p-2">
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Status</label>
                    <select {...register("status")} className="w-full rounded border p-2">
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="MONITORING">MONITORING</option>
                      <option value="ENHANCED_DUE_DILIGENCE">ENHANCED_DUE_DILIGENCE</option>
                      <option value="RESTRICTED">RESTRICTED</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Risk Score</label>
                    <input
                      type="number"
                      {...register("riskScore")}
                      className="w-full rounded border p-2"
                    />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Resumo</label>
                    <textarea
                      value={data.compliance.summary ?? ""}
                      disabled
                      className="min-h-[90px] w-full rounded border bg-gray-100 p-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Motivo do bloqueio</label>
                    <input
                      value={data.compliance.blockedReason ?? ""}
                      disabled
                      className="w-full rounded border bg-gray-100 p-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Observações internas</label>
                    <textarea
                      {...register("internalNotes")}
                      className="min-h-[90px] w-full rounded border p-2"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded border p-3">
                    <strong>Motivos atuais</strong>
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      {data.compliance.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded border p-3">
                    <strong>Eventos recentes</strong>
                    <div className="mt-2 max-h-44 overflow-y-auto text-sm">
                      {data.compliance.events.length === 0 ? (
                        <p>Nenhum evento encontrado.</p>
                      ) : (
                        data.compliance.events.slice(0, 5).map((event) => (
                          <div key={event.id} className="mb-2 rounded border p-2">
                            <div className="font-semibold">{event.title}</div>
                            <div>{event.description ?? "-"}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Fontes consultadas</h4>

                {Array.isArray(data.compliance.sources.sourceSummary) &&
                data.compliance.sources.sourceSummary.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.compliance.sources.sourceSummary.map((item, index) => (
                      <span
                        key={`${String(item)}-${index}`}
                        className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm"
                      >
                        {formatSourceLabel(String(item))}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma fonte registrada.</p>
                )}
              </section>
            </div>
          )}

          {activeTab === "limits" && (
            <div className="flex flex-col gap-4">
              <section className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Restrições e reprocessamento</h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Restrição até</label>
                    <input
                      type="date"
                      {...register("temporaryRestrictionUntil")}
                      className="w-full rounded border p-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold">Motivo da restrição</label>
                    <input
                      {...register("temporaryRestrictionReason")}
                      className="w-full rounded border p-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Próximo rescreen</label>
                    <input
                      type="date"
                      {...register("nextRescreenAt")}
                      className="w-full rounded border p-2"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Limites e capacidade</h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Limite mensal (BRL)</label>
                    <input {...register("monthlyLimitBrl")} className="w-full rounded border p-2" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      Limite por ordem (BRL)
                    </label>
                    <input
                      {...register("maxSingleOrderBrl")}
                      className="w-full rounded border p-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Capacidade estimada</label>
                    <input
                      {...register("capacityEstimateBrl")}
                      className="w-full rounded border p-2"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm font-semibold">Origem da capacidade</label>
                    <input {...register("capacitySource")} className="w-full rounded border p-2" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded border p-3">
                    <strong>Comportamento</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>Total de ordens: {data.compliance.behavior.totalOrders}</li>
                      <li>Idade da conta: {data.compliance.behavior.accountAgeDays} dias</li>
                      <li>Ordens altas em 1 dia: {data.compliance.behavior.highValueOrders1d}</li>
                      <li>
                        Ordens altas em 30 dias: {data.compliance.behavior.highValueOrders30d}
                      </li>
                    </ul>
                  </div>

                  <div className="rounded border p-3">
                    <strong>MED</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>Total: {data.compliance.med.total}</li>
                      <li>Últimos 90 dias: {data.compliance.med.last90d}</li>
                      <li>
                        Último registro:{" "}
                        {data.compliance.med.lastAt
                          ? new Date(data.compliance.med.lastAt).toLocaleString()
                          : "-"}
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="flex flex-col gap-4">
              <section className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Documentos e exigências</h4>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {[
                    ["requiresDocument", "Exige documentos"],
                    ["requiresSelfieDocument", "Exige selfie com documento"],
                    ["requiresAddressProof", "Exige comprovante de endereço"],
                    ["requiresIncomeProof", "Exige comprovante de renda"],
                    ["requiresBankStatement", "Exige extrato bancário"],
                    ["requiresCorporateDocs", "Exige documentos societários"],
                    ["requiresResponsibilityTerm", "Exige termo de responsabilidade"],
                    ["requiresEnhancedKyc", "Exige KYC reforçado"],
                    ["requiresPldForm", "Exige formulário PLD"],
                    ["requiresManualReview", "Exige revisão manual"],
                  ].map(([field, label]) => (
                    <label key={field} className="flex items-center gap-2 rounded border p-2">
                      <input type="checkbox" {...register(field as keyof ComplianceEditForm)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Documentos exigidos agora</h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded border p-3">
                    <strong>Required Now</strong>
                    {data.compliance.evidence.requiredNow.length === 0 ? (
                      <p className="mt-2 text-sm">Nenhum documento exigido no momento.</p>
                    ) : (
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {data.compliance.evidence.requiredNow.map((item) => (
                          <li key={`${item.type}-${item.label}`}>
                            {item.label} — {item.reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded border p-3">
                    <strong>Documentos armazenados</strong>
                    {data.compliance.evidence.stored.length === 0 ? (
                      <p className="mt-2 text-sm">Nenhum documento armazenado.</p>
                    ) : (
                      <div className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
                        {data.compliance.evidence.stored.map((item) => (
                          <div key={item.id} className="rounded border p-2">
                            <div className="font-semibold">{item.label}</div>
                            <div>Tipo: {item.type}</div>
                            <div>Status: {item.status}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "sanctions" && (
            <SanctionsTab
              sanctionsSummary={
                data.compliance.sources.sanctionsSummary as
                  | Record<string, unknown>
                  | null
                  | undefined
              }
              sanctions={data.compliance.sources.sanctions}
            />
          )}

          {activeTab === "deskdata" && (
            <DeskdataTab summary={data.compliance.sources.deskdataSummary} />
          )}

          {activeTab === "summaries" && (
            <div className="flex flex-col gap-4">
              <section className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Resumos persistidos</h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Resumo Deskdata</label>
                    <textarea
                      disabled
                      value={JSON.stringify(
                        data.compliance.sources.deskdataSummary ?? null,
                        null,
                        2,
                      )}
                      className="min-h-[240px] w-full rounded border p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Resumo Sanções</label>
                    <textarea
                      disabled
                      value={JSON.stringify(
                        data.compliance.sources.sanctionsSummary ?? null,
                        null,
                        2,
                      )}
                      className="min-h-[240px] w-full rounded border p-2 text-xs"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Resumo de fontes</h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Source Summary</label>
                    <textarea
                      disabled
                      value={JSON.stringify(data.compliance.sources.sourceSummary ?? null, null, 2)}
                      className="min-h-[200px] w-full rounded border p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      Portal da Transparência
                    </label>
                    <textarea
                      disabled
                      value={JSON.stringify(data.compliance.sources.pdt ?? null, null, 2)}
                      className="min-h-[200px] w-full rounded border p-2 text-xs"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
          {activeTab === "portal" && (
            <PortalDaTransparenciaTab portalData={data.compliance.sources.pdt} />
          )}

          {activeTab === "cnpj" && (
            <CnpjTab responseData={data.compliance.sources.pdt?.cnpj ?? null} />
          )}

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button disabled={isPending}>Salvar compliance</Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
