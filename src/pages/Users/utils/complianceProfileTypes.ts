export type ComplianceRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";
export type ComplianceStatus =
  | "PENDING"
  | "APPROVED"
  | "MONITORING"
  | "ENHANCED_DUE_DILIGENCE"
  | "RESTRICTED"
  | "BLOCKED";

export interface ComplianceProfileResponse {
  persisted: boolean;
  generatedAt: string;
  input: {
    rawDocument: string;
    normalizedDocument: string;
    documentType: "CPF" | "CNPJ";
  };
  user:
    | {
        id: string;
        name: string;
        document: string;
        blocked: boolean;
        createdIn: string | Date;
        updated: string | Date;
        accounts: Array<{
          id: string;
          exchange: string;
          counterparty: string;
        }>;
      }
    | {
        exists: boolean;
        name: string | null;
      };
  compliance: {
    id: string | null;
    status: ComplianceStatus;
    riskLevel: ComplianceRiskLevel;
    riskScore: number;
    reasons: string[];
    summary: string;
    blockedReason: string | null;
    internalNotes: string | null;
    temporaryRestrictionUntil: string | Date | null;
    temporaryRestrictionReason: string | null;
    limits: {
      monthlyLimitBrl: number;
      maxSingleOrderBrl: number;
      capacityEstimateBrl: number | null;
      capacitySource: string | null;
    };
    flags: {
      pep: boolean;
      slave: boolean;
      ofacHit: boolean;
      europaHit: boolean;
      csnuHit: boolean;
      palestinaHit: boolean;
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
      sanctionsMaxSimilarity: number;
    };
    med: {
      total: number;
      last90d: number;
      lastAt: string | Date | null;
      reasons: string[];
    };
    behavior: {
      totalOrders: number;
      accountAgeDays: number;
      highValueOrders1d: number;
      highValueOrders30d: number;
      dailyVolumeBrl: number;
      monthlyVolumeBrl: number;
      lifetimeVolumeBrl: number;
      highestOrder1d: number;
      highestOrder30d: number;
      firstApprovedOrderAt: string | Date | null;
      lastOrderAt: string | Date | null;
      exchanges: string[];
    };
    evidence: {
      operationalEvidence: Array<{
        type: string;
        label: string;
        reason: string;
      }>;
      requiredNow: Array<{
        type: string;
        label: string;
        reason: string;
      }>;
      thresholdPolicy: Record<string, any>;
      stored: Array<{
        id: string;
        type: string;
        status: string;
        label: string;
        description: string | null;
        storageKey: string | null;
        exchange: string | null;
        externalOrderNumber: string | null;
        createdIn: string | Date;
        updated: string | Date;
        validatedBy: string | null;
        metadata: any;
      }>;
    };
    sources: {
      sourceSummary: any;
      screeningName: string;
      beneficialOwnerName: string | null;
      beneficialOwnerDocument: string | null;
      sanctionsSummary: any;
      deskdataSummary: any;
      pdt: any;
      sanctions: {
        maxSimilarity: number;
        severeCrimeKeywords: string[];
        ofac: any[];
        europa: any[];
        csnu: any[];
        palestinaCouncil: any[];
      };
      slaveDetails: any;
      deskdata: any;
    };
    events: Array<{
      id: string;
      type: string;
      title: string;
      description: string | null;
      createdBy: string | null;
      createdIn: string | Date;
      updated: string | Date;
      orderId: string | null;
      metadata: any;
    }>;
    persistence: {
      updated: string | Date | null;
      nextRescreenAt: string | Date | null;
    };
  };
}
