# Backend Development Plan

## 기술 결정

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| Language/API | Python 3.12 + FastAPI | 문서·AI 생태계, type hint 기반 OpenAPI와 async API |
| Package/runtime | `uv` + Uvicorn | 재현 가능한 lock, 빠른 설치와 Render 실행 |
| Validation | Pydantic v2 + pydantic-settings | API/schema/environment 검증 |
| Persistence | PostgreSQL + SQLAlchemy 2 async | transaction, relation, audit, optimistic locking |
| Migration/driver | Alembic + asyncpg | schema version과 async DB access |
| Document | Phase 2 Git object reader; Phase 5 markdown-it-py + ruamel.yaml + jsonschema | 현재 raw read와 후속 구조화 validation 책임 분리 |
| HTTP/Git | argument-vector 기반 local Git CLI; 후속 httpx provider adapter | shell injection 없이 현재 commit blob을 읽고 provider 전환 경계 유지 |
| Testing | pytest, pytest-asyncio, httpx, disposable PostgreSQL | unit/API/실제 Postgres integration; CI에서는 isolated service container 사용 가능 |
| Quality | Ruff + mypy | formatting/lint와 strict static type gate |
| Observability | structlog + OpenTelemetry-ready boundary | request/audit correlation과 vendor 중립성 |

## 모듈 구조

```text
projects/context-collaboration-console-api/
├── app/
│   ├── api/v1/                 # routers와 DTO
│   ├── application/            # use case, port, transaction
│   ├── domain/                 # aggregate, policy, transition
│   ├── infrastructure/         # DB, Git, document, job adapter
│   ├── settings/               # environment와 secret contract
│   └── main.py                 # composition root
├── migrations/
├── tests/{unit,integration,contract}/
├── pyproject.toml
└── uv.lock
```

Domain은 FastAPI, SQLAlchemy, Render를 import하지 않는다. API DTO와 persistence model은 domain entity와 분리한다.

## API surface

```text
GET    /health/live
GET    /health/ready
GET    /api/v1/auth/callback
GET    /api/v1/auth/me
POST   /api/v1/auth/logout
GET    /api/v1/projects/{project_id}
GET    /api/v1/projects/{project_id}/documents
GET    /api/v1/documents/{document_id}
# 문서 mutation은 Phase 5 완료, change API는 후속 Phase에서 순차 구현
POST   /api/v1/documents/{document_id}/drafts
POST   /api/v1/documents/{document_id}/validate
POST   /api/v1/documents/{document_id}/proposals
POST   /api/v1/changes
GET    /api/v1/changes/{change_id}
POST   /api/v1/changes/{change_id}/reviews
POST   /api/v1/changes/{change_id}/verifications
GET    /api/v1/projects/{project_id}/changes/{change_id}/activation-workspace
POST   /api/v1/changes/{change_id}/git-publications
POST   /api/v1/changes/{change_id}/activations
GET    /api/v1/audit-events
```

## 개발 단계

| Phase | 범위 | 완료 증거 |
| --- | --- | --- |
| B0 ◐ | FastAPI scaffold, settings, health, DB, migration, tests | 로컬 PostgreSQL·Blueprint schema 완료, Render workspace smoke 대기 |
| B1 ✅ | Project/Document read model, Git read adapter, path policy | document list/raw/API/OpenAPI contract 통과 |
| B2 ✅ | Draft row, safe Markdown/YAML diagnostic, optimistic revision/409 API | migration single head, validator/API conflict tests 통과 |
| B3 ✅ | Change aggregate, transition, review/RBAC/audit | forbidden transition/permission tests |
| B4 | Proposal/impact deterministic job, evidence | idempotent job/evidence tests |
| B5 ✅ | Git branch/commit/PR projection adapter, activation gate, immutable ContextVersion | sandbox repository E2E와 승인 전 write 0건 |
| B6 ↗ | rate limit, observability, production smoke와 backup/runbook | OIDC·server session·identity RBAC는 CR-2026-017에 따라 route 비활성·후속 승인 대기 |

## 보안 규칙

- Git/API/DB secret은 Render secret environment variable에만 둔다.
- frontend에는 public API URL 외 secret을 전달하지 않는다.
- CORS allowlist는 production frontend origin으로 제한한다.
- path traversal, YAML unsafe tag, oversized payload, stored XSS를 차단한다.
- mutation은 RBAC, idempotency, revision, audit를 통과해야 한다.
- 현재 릴리스는 login/session route를 제공하지 않으며 preview actor는 workflow evidence를 위한 fixture 값이다.
- 향후 OIDC를 다시 도입할 경우 검증된 claim만 신뢰하고 provider token을 browser에 저장하지 않는 기존 security 설계를 재검토한다.
- Git mutation은 `GIT_WRITE_SANDBOX`에 명시된 repository만 쓰고 remote push나 main 직접 write를 수행하지 않는다.

## Phase 2 구현 세부

- domain entity, API DTO, SQLAlchemy row는 서로 다른 class다.
- application port는 Project/Document protocol만 알고 adapter 구현을 import하지 않는다.
- Git adapter는 `ls-tree -z`와 `cat-file blob`만 사용하고 worktree의 미커밋 값을 읽지 않는다.
- project document root는 `docs/{project_id}` 아래, Git ref는 환경에서 허용한 단일 ref로 제한한다.
- readiness의 기대 migration revision은 환경 변수가 아니라 코드 상수이며 Alembic single head와 계약 테스트한다.
- Render runtime의 DB URL은 `postgresql://`에서 `postgresql+asyncpg://`로 내부 정규화한다.
- API는 문서 draft 흐름에 필요한 `GET`/`POST`/`OPTIONS`만 CORS에 허용하며 credentials와 wildcard origin을 사용하지 않는다.
