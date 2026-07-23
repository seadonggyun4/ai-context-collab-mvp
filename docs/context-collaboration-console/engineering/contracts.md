# Application Contracts

## 핵심 TypeScript 모델

```ts
type ChangeStatus =
  | "REQUESTED"
  | "ANALYZED"
  | "IN_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "IMPLEMENTING"
  | "VERIFYING"
  | "READY_TO_ACTIVATE"
  | "ACTIVATED"
  | "REJECTED";

type EvidenceResult =
  | "PASSED"
  | "FAILED"
  | "PARTIALLY_VERIFIED"
  | "NOT_EXECUTED"
  | "MANUAL_REQUIRED";

interface ChangeProposal {
  revision: number;
  summary: string;
  acceptanceCriteria: AcceptanceCriterion[];
  impacts: ImpactNode[];
  affectedFiles: AffectedFile[];
  risk: "LOW" | "MEDIUM" | "HIGH";
  confidence: "LOW" | "MEDIUM" | "HIGH";
  unknowns: string[];
  qaScenarios: QaScenario[];
}
```

## Fixture contract

- Project: `apc-monitoring-mvp`
- Change: `CR-DEMO-001`
- Raw request: 최근 정상 수신 시간과 24시간 경고 요청
- Initial state: `ANALYZED`
- Impact nodes: planning, publishing, API contract, ingestion table, fixture field, QA scenario
- Review revisions: 1개 initial proposal, 1개 수정 요청 시뮬레이션 가능
- Evidence: automated passed/failed toggle, manual required 1개

## Project dashboard read contract

`ProjectRepository.getProjectDashboard(projectId, signal)`은 `DomainResult<ProjectDashboard | null>`을 반환한다.

- `ProjectDashboard`: project header/metrics, active changes, attention queue, latest role artifacts, alignment evidence, recent QA
- fixture와 HTTP adapter는 같은 snake_case wire payload parser를 사용한다.
- `404`는 `null`, network/non-2xx/invalid schema는 서로 다른 안정적 error code다.
- `VITE_DATA_SOURCE=fixture|http`는 app composition root에서만 선택한다.
- HTTP 예상 경로는 `GET /api/v1/projects/{projectId}/dashboard`이며 backend 구현 전 기본값은 fixture다.
- HTTP 실패를 fixture로 자동 fallback하지 않는다.

## Analysis job contract

`AnalysisRepository`는 start, poll, retry, detail 네 연산을 제공한다.

- start/retry는 `Idempotency-Key`가 필수다.
- start key는 project ID, Context snapshot, 보존된 raw request에서 결정론적으로 생성한다.
- job은 `QUEUED | RUNNING | COMPLETED | FAILED`, 4개 stage, attempt, 고정 Context를 가진다.
- retry는 실패한 job에서만 attempt를 증가시키며 같은 retry key는 같은 attempt를 반환한다.
- fixture와 HTTP는 같은 snake_case job/outcome parser를 사용한다.
- HTTP 예상 경로는 start `POST /projects/{id}/change-analyses`, poll `GET /analysis-jobs/{id}`, retry `POST /analysis-jobs/{id}/retry`, detail `GET /projects/{id}/change-analyses/{changeId}`다.
- 실제 backend endpoint 구현 전 기본 data source는 fixture이며 network/HTTP/schema 오류를 성공으로 대체하지 않는다.

## Error contract

```ts
interface DomainError {
  code: string;
  title: string;
  detail: string;
  recovery?: { label: string; action: string };
  traceId?: string;
}
```

HTTP status나 stack trace를 사용자 제목으로 노출하지 않는다.

## Document editor API

```ts
interface DocumentDraftInput {
  content: string;
  baseRevision: string;
  clientDraftId: string;
}

interface DocumentDiagnostic {
  severity: "ERROR" | "WARNING" | "INFO";
  code: string;
  message: string;
  from: { line: number; column: number };
  to?: { line: number; column: number };
}
```

mutation은 `Idempotency-Key`와 authenticated actor를 요구한다. revision 충돌은 HTTP 409와 `DOCUMENT_REVISION_CONFLICT`, validation 차단은 422와 structured diagnostics를 반환한다.
