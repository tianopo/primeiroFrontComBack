import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { useUpdateCompliance } from "../../hooks/useUpdateCompliance";
import { ComplianceProfileResponse } from "../../utils/complianceProfileTypes";

interface IComplianceEditModal {
  open: boolean;
  onClose: () => void;
  data: ComplianceProfileResponse | null;
  onSaved?: (data: any) => void;
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

const toDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export const ComplianceEditModal = ({ open, onClose, data, onSaved }: IComplianceEditModal) => {
  const methods = useForm<ComplianceEditForm>({
    defaultValues: {
      riskLevel: "MEDIUM",
      status: "PENDING",
      riskScore: 0,
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

    reset({
      riskLevel: data.compliance.riskLevel,
      status: data.compliance.status,
      riskScore: data.compliance.riskScore,
      riskSummary: data.compliance.summary ?? "",
      blockedReason: data.compliance.blockedReason ?? "",
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
      status: form.status,
      riskScore: Number(form.riskScore),
      riskSummary: form.riskSummary || null,
      blockedReason: form.blockedReason || null,
      internalNotes: form.internalNotes || null,
      temporaryRestrictionUntil: form.temporaryRestrictionUntil || null,
      temporaryRestrictionReason: form.temporaryRestrictionReason || null,
      monthlyLimitBrl: form.monthlyLimitBrl || "0",
      maxSingleOrderBrl: form.maxSingleOrderBrl || "0",
      capacityEstimateBrl: form.capacityEstimateBrl || null,
      capacitySource: form.capacitySource || null,
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

  const userName = "id" in data.user ? data.user.name : (data.user.name ?? "Sem nome");
  const userDocument = "id" in data.user ? data.user.document : data.input.rawDocument;

  return (
    <Modal onClose={onClose} title="Editar compliance">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
                  {...register("riskSummary")}
                  className="min-h-[90px] w-full rounded border p-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Motivo do bloqueio</label>
                <input {...register("blockedReason")} className="w-full rounded border p-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Observações internas</label>
                <textarea
                  {...register("internalNotes")}
                  className="min-h-[90px] w-full rounded border p-2"
                />
              </div>
            </div>
          </section>

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
                <label className="mb-1 block text-sm font-semibold">Limite por ordem (BRL)</label>
                <input {...register("maxSingleOrderBrl")} className="w-full rounded border p-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Capacidade estimada</label>
                <input {...register("capacityEstimateBrl")} className="w-full rounded border p-2" />
              </div>
              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-semibold">Origem da capacidade</label>
                <input {...register("capacitySource")} className="w-full rounded border p-2" />
              </div>
            </div>
          </section>

          <section className="rounded-md border border-gray-200 p-4">
            <h4 className="mb-3 text-lg font-bold">Documentos e exigências</h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {[
                ["requiresDocument", "Documentos"],
                ["requiresSelfieDocument", "Selfie com documento"],
                ["requiresAddressProof", "Comprovante de endereço"],
                ["requiresIncomeProof", "Comprovante de renda"],
                ["requiresBankStatement", "Extrato bancário"],
                ["requiresCorporateDocs", "Docs societários"],
                ["requiresResponsibilityTerm", "Termo de responsabilidade"],
                ["requiresEnhancedKyc", "KYC reforçado"],
                ["requiresPldForm", "Formulário PLD"],
                ["requiresManualReview", "Revisão manual"],
              ].map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 rounded border p-2">
                  <input type="checkbox" {...register(field as keyof ComplianceEditForm)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-gray-200 p-4">
            <h4 className="mb-3 text-lg font-bold">Resumos persistidos</h4>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold">Resumo Deskdata</label>
                <textarea
                  disabled
                  value={JSON.stringify(data.compliance.sources.deskdataSummary ?? null, null, 2)}
                  className="min-h-[220px] w-full rounded border p-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Resumo Sanções</label>
                <textarea
                  disabled
                  value={JSON.stringify(data.compliance.sources.sanctionsSummary ?? null, null, 2)}
                  className="min-h-[220px] w-full rounded border p-2 text-xs"
                />
              </div>

              <div className="rounded border p-3">
                <strong>Fontes consultadas</strong>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                  {JSON.stringify(data.compliance.sources.sourceSummary, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2">
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
