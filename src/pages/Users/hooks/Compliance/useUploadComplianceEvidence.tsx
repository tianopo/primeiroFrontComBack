import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiUpload } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface IUploadComplianceEvidencePayload {
  document: string;
  type: string;
  file: File;
  description?: string;
  exchange?: string;
  externalOrderNumber?: string;
  orderId?: string;
}

export const useUploadComplianceEvidence = () => {
  const mutation = useMutation({
    mutationFn: async (payload: IUploadComplianceEvidencePayload) => {
      const formData = new FormData();
      formData.append("type", payload.type);
      formData.append("file", payload.file);

      if (payload.description) formData.append("description", payload.description);
      if (payload.exchange) formData.append("exchange", payload.exchange);
      if (payload.externalOrderNumber) {
        formData.append("externalOrderNumber", payload.externalOrderNumber);
      }
      if (payload.orderId) formData.append("orderId", payload.orderId);

      const result = await apiUpload().post(
        apiRoute.complianceEvidenceUpload(payload.document),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          transformRequest: [(data) => data],
        },
      );

      return result.data;
    },
    onSuccess: () => responseSuccess("Documento enviado com sucesso."),
    onError: (erro: AxiosError) => responseError(erro),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
