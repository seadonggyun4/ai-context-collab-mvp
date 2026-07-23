export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  targetType: "CHANGE_REQUEST" | "REVIEW" | "EVIDENCE" | "CONTEXT_VERSION";
  targetId: string;
  before: Readonly<Record<string, unknown>>;
  after: Readonly<Record<string, unknown>>;
  requestId: string;
  occurredAt: string;
}
