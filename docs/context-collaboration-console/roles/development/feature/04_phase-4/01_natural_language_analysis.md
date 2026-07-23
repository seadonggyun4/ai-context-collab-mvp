# DF-005 Natural Language Analysis

## 구현 계약

- `entities/analysis`가 job/outcome/repository/parser/fixture/HTTP adapter를 소유한다.
- `features/submit-change-analysis`가 raw draft, start, poll, retry와 navigation handoff를 소유한다.
- `widgets/change-proposal`은 완료된 outcome projection만 표현한다.
- page는 project route scope와 shell, feature/widget 조합만 담당한다.

## Job 계약

```text
QUEUED
  → CHECKING_CONTEXT
  → STRUCTURING_REQUEST
  → DISCOVERING_IMPACTS
  → GENERATING_VERIFICATION
  → COMPLETED | FAILED
```

- start: `POST /api/v1/projects/{projectId}/change-analyses`
- poll: `GET /api/v1/analysis-jobs/{jobId}`
- retry: `POST /api/v1/analysis-jobs/{jobId}/retry`
- detail: `GET /api/v1/projects/{projectId}/change-analyses/{changeId}`
- start/retry는 `Idempotency-Key`를 요구한다.
- job은 attempt와 Context snapshot을 고정한다.

## 완료 증거

- Change: `CR-2026-008`
- Impact: `impact-analysis/2026-07-22_phase-4-natural-language-analysis.md`
- QA: `roles/qa/feature/04_phase-4/01_natural_language_analysis_qa.md`
- 구현: `entities/analysis`, `features/submit-change-analysis`, `widgets/change-proposal`, 두 route page
- 검증: typecheck/lint, Vitest 45 tests, production build, browser success/failure/retry/reload
