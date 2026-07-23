export const EVIDENCE_RESULTS = [
  "PASSED",
  "FAILED",
  "PARTIALLY_VERIFIED",
  "NOT_EXECUTED",
  "MANUAL_REQUIRED",
] as const;

export type EvidenceResult = (typeof EVIDENCE_RESULTS)[number];
export type EvidenceType = "AUTOMATED" | "MANUAL";

export interface Evidence {
  id: string;
  changeRequestId: string;
  testId: string;
  type: EvidenceType;
  result: EvidenceResult;
  required: boolean;
  command: string | null;
  artifact: string | null;
  implementationRevision: number;
  verifiedBy: string;
  verifiedAt: string;
}
