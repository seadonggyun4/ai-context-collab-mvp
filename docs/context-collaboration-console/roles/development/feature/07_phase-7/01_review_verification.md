# DF-008 Review and Verification

## 구현 경계

- Backend `domain`: framework-independent actor/RBAC, aggregate command, blocker/result.
- Backend `application`: actor resolution, idempotency, transaction과 audit orchestration.
- Backend `infrastructure`: PostgreSQL aggregate/command receipt/audit repository.
- Backend `api`: identity header dependency와 versioned DTO만 소유한다.
- Frontend `entities/review-workspace`: projection, capability, repository와 parser.
- Frontend `features/review-change`: decision/evidence/gate command state.
- Frontend `widgets/review-workspace`: diff/decision/evidence/audit composition.
- Frontend `pages/review-verification`: route, shell과 loading/error/stale composition.

## API 후보 계약

- `GET /api/v1/projects/{projectId}/changes/{changeId}/review-workspace`
- `POST /api/v1/changes/{changeId}/reviews`
- `POST /api/v1/changes/{changeId}/verifications`
- `POST /api/v1/changes/{changeId}/transitions`
- mutation headers: `X-Actor-Id`, `Idempotency-Key`

## 불변 조건

- role은 request body/header에서 신뢰하지 않고 server registry에서 resolve한다.
- review는 현재 IN_REVIEW와 current proposal revision/scope에서만 기록한다.
- decision comment는 blank일 수 없고 reject/request changes는 이유를 명시한다.
- current evidence는 current implementation revision과 approved QA scenario가 일치해야 한다.
- audit event와 aggregate mutation은 같은 transaction에서 저장한다.
- 거부된 command는 aggregate revision과 receipt를 만들지 않고 별도 append-only `command.denied` 감사 이벤트를 남긴다.
- gate 결과가 blocked이면 READY_TO_ACTIVATE transition을 생성하지 않는다.

## 완료 증거

- Change: `CR-2026-011`
- Impact: `impact-analysis/2026-07-23_phase-7-review-verification.md`
- QA: `roles/qa/feature/07_phase-7/01_review_verification_qa.md`
- Backend: `review_workflow.py`, `review_commands.py`, SQLAlchemy workflow repository, Alembic `20260723_0003`
- Frontend: `entities/review-workspace`, `features/review-change`, `widgets/review-workspace`, `pages/review-verification`
- API: workspace GET, review/evidence/transition POST와 server-resolved actor/RBAC
- 자동 검증: frontend 74 tests, backend 38 tests, lint/type/build 모두 통과
