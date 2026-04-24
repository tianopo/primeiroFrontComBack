import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, queryClient } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface IUpdateCompliancePayload {
  documento: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";
  status?:
    | "PENDING"
    | "APPROVED"
    | "MONITORING"
    | "ENHANCED_DUE_DILIGENCE"
    | "RESTRICTED"
    | "BLOCKED";
  riskScore?: number;
  riskReasons?: string[];
  riskSummary?: string | null;
  blockedReason?: string | null;
  internalNotes?: string | null;
  temporaryRestrictionUntil?: string | null;
  temporaryRestrictionReason?: string | null;
  monthlyLimitBrl?: string | number;
  maxSingleOrderBrl?: string | number;
  capacityEstimateBrl?: string | number | null;
  capacitySource?: string | null;
  requiresDocument?: boolean;
  requiresSelfieDocument?: boolean;
  requiresAddressProof?: boolean;
  requiresIncomeProof?: boolean;
  requiresBankStatement?: boolean;
  requiresCorporateDocs?: boolean;
  requiresResponsibilityTerm?: boolean;
  requiresEnhancedKyc?: boolean;
  requiresPldForm?: boolean;
  requiresManualReview?: boolean;
  nextRescreenAt?: string | null;
}

export const useUpdateCompliance = () => {
  const mutation = useMutation({
    mutationFn: async ({ documento, ...body }: IUpdateCompliancePayload) => {
      const result = await api().patch(apiRoute.complianceUpdate(documento), body);
      return result.data;
    },
    onSuccess: () => {
      responseSuccess("Compliance atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["compliance-data"] });
    },
    onError: (erro: AxiosError) => responseError(erro),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
