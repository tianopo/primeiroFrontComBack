import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface IReviewComplianceEvidencePayload {
  evidenceId: string;
  status: "PENDING" | "RECEIVED" | "APPROVED" | "REJECTED" | "EXPIRED" | "WAIVED";
  validatedBy?: string;
  description?: string;
}

export const useReviewComplianceEvidence = () => {
  const mutation = useMutation({
    mutationFn: async (payload: IReviewComplianceEvidencePayload) => {
      const result = await api().patch(apiRoute.complianceEvidenceReview(payload.evidenceId), {
        status: payload.status,
        validatedBy: payload.validatedBy,
        description: payload.description,
      });

      return result.data;
    },
    onSuccess: () => responseSuccess("Status do documento atualizado."),
    onError: (erro: AxiosError) => responseError(erro),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
