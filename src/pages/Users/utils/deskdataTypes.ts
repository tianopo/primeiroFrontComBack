export type DeskdataDataset =
  | "basic"
  | "phones"
  | "addresses"
  | "emails"
  | "relationships"
  | "relationships_phones"
  | "relationships_addresses"
  | "relationships_emails"
  | "lawsuits";

export type DeskdataKind = "CPF" | "CNPJ";
export type DeskdataStrategy = "auto" | "missing_only" | "refresh_union";

export interface DeskdataStoredDataset {
  firstFetchedAt: string;
  lastFetchedAt: string;
  requestCount: number;
  data: unknown;
}

export interface DeskdataSummary {
  version: 1;
  subject: {
    document: string;
    normalizedDocument: string;
    kind: DeskdataKind;
    type: "persons" | "companies";
    key_type: "cpf" | "cnpj";
    key_value: string;
  };
  datasets: Partial<Record<DeskdataDataset, DeskdataStoredDataset>>;
  lastRequest: {
    requested: DeskdataDataset[];
    fetchedNow: DeskdataDataset[];
    reusedFromCache: DeskdataDataset[];
    strategy: DeskdataStrategy;
    executedAt: string;
  } | null;
}

export interface SyncDeskdataPayload {
  documento: string;
  datasets: DeskdataDataset[];
  strategy?: DeskdataStrategy;
}

export interface SyncDeskdataResponse {
  summary: DeskdataSummary;
  fetchedNow: DeskdataDataset[];
  reusedFromCache: DeskdataDataset[];
  mergedResponse: {
    status: {
      code: number;
      message: string;
      details: string;
    };
    data: Record<string, unknown>;
  };
}

export const resolveDeskdataKind = (documento: string): DeskdataKind | null => {
  const normalized = String(documento ?? "").replace(/\D/g, "");

  if (normalized.length === 11) return "CPF";
  if (normalized.length === 14) return "CNPJ";
  return null;
};
