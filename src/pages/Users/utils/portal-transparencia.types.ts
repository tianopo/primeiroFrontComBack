export type PortalItem = Record<string, unknown>;

export interface PortalDaTransparenciaResponse {
  viagens: PortalItem[] | null;
  pep: PortalItem[] | null;
  sdc: PortalItem[] | null;
  safra: PortalItem[] | null;
  peti: PortalItem[] | null;
  bpc: PortalItem[] | null;
  ae: PortalItem[] | null;
  cnep: PortalItem[] | null;
  ceis: PortalItem[] | null;
  ceaf: PortalItem[] | null;
  cepim: PortalItem[] | null;
  cnpj: Record<string, unknown> | null;
}

export type PortalArraySectionKey = Exclude<keyof PortalDaTransparenciaResponse, "cnpj">;

export interface PortalFieldConfig {
  label: string;
  path?: string;
  render?: (item: PortalItem) => React.ReactNode;
}

export interface PortalSectionConfig {
  key: PortalArraySectionKey;
  title: string;
  fields: PortalFieldConfig[];
}
