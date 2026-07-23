# Domain Model

| Entity | 핵심 필드 | 관계 |
| --- | --- | --- |
| Project | id, name, repository, activeContextVersion, health | Changes, Documents |
| ChangeRequest | id, title, rawRequest, status, risk, requester, contextSnapshot | Proposal, Reviews, Evidence |
| Proposal | summary, acceptanceCriteria, impacts, files, confidence, unknowns | ChangeRequest revision |
| Document | id, path, role, status, version, metadata, source | Relations, Diff |
| ImpactNode | id, kind, label, status, sourcePath | ImpactEdge |
| Review | reviewer, decision, scope, comment, decidedAt | Proposal revision |
| Evidence | testId, type, result, command, artifact, verifiedAt | ChangeRequest |
| ContextVersion | version, documents, activatedBy, activatedAt | Project |
| DocumentDraft | id, documentId, content, baseRevision, status, diagnostics, savedAt | Document, ChangeRequest |
| AuditEvent | actor, action, target, before, after, requestId, occurredAt | 모든 mutation |

## 상태 분리

- Change status와 AI execution phase를 하나로 합치지 않는다.
- Document status와 Change status를 합치지 않는다.
- Verification result와 completion decision을 합치지 않는다.
- UI badge는 이 분리된 상태를 임의로 하나의 `정상/오류`로 축약하지 않는다.
