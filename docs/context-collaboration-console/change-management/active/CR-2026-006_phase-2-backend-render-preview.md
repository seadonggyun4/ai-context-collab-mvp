# CR-2026-006 Phase 2 Backend 기반·Render Preview

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-006` |
| 상위 결정 | `CR-2026-003` |
| 현재 상태 | `QA_COMPLETED` |
| 현재 Phase | `RELEASE_GATE` |
| 요청일 | `2026-07-22` |
| 요청자 | 사용자 |
| 위험도 | 높음 |
| 승인 상태 | `APPROVED` |

## 요청 원문

> Phase 2 Backend 기반·Render Preview를 문서시스템에 따라 확장성 높고 유지보수성 높게 추상화해서 개발 진행해줘.

## 범위

- Python 3.12, FastAPI, Pydantic Settings 기반 API composition root
- PostgreSQL, SQLAlchemy 2 async, asyncpg persistence와 Alembic migration
- liveness/readiness, request ID, 구조화 오류, CORS allowlist
- Project read API와 Git-backed Document list/detail read API
- local Git worktree read adapter와 path allowlist
- root `render.yaml`의 React Static Site, FastAPI Web Service, PostgreSQL, preview environment
- migration, seed, health, CORS, OpenAPI/API contract, 실제 PostgreSQL integration 검증

## 제외 범위

- Document draft/write/editor, AI 분석, review mutation, Context activation
- OIDC와 운영 RBAC, Git branch/commit/PR write
- production 비용·backup/PITR·custom domain 확정

## 수용 기준

| ID | 조건 |
| --- | --- |
| AC-01 | domain/application/infrastructure/API/settings 계층이 역방향 의존 없이 분리된다 |
| AC-02 | SQLAlchemy model과 domain model이 분리되고 Alembic upgrade/downgrade가 실제 PostgreSQL에서 통과한다 |
| AC-03 | `/health/live`와 migration-aware `/health/ready`가 정상·DB/migration 실패를 구분한다 |
| AC-04 | Project 조회와 Document 목록·상세가 구조화 error contract와 안정적인 OpenAPI를 제공한다 |
| AC-05 | Git adapter가 허용 project/path/ref만 읽고 traversal, binary, size 초과, 미존재를 구분한다 |
| AC-06 | CORS가 명시된 origin만 허용하고 credential·method·header 범위를 제한한다 |
| AC-07 | root Render Blueprint가 web/api/db, migration, seed, health, SPA rewrite, preview expiry를 정의하고 schema 검증된다 |
| AC-08 | Ruff, mypy, pytest, migration, PostgreSQL integration, frontend regression build가 통과한다 |

## 구현 원칙

- domain과 application은 FastAPI, SQLAlchemy, Render, subprocess를 import하지 않는다.
- API DTO, persistence row, domain entity를 같은 class로 재사용하지 않는다.
- read adapter는 protocol 뒤에 두고 fixture와 Git 구현을 교체할 수 있게 한다.
- shell command string을 조합하지 않고 argument vector와 validated relative path만 Git에 전달한다.
- readiness는 liveness와 분리하고 DB 연결 및 Alembic head 일치를 검사한다.
- Render API service는 문서 repository에 접근해야 하므로 repository root를 runtime 범위로 유지하고 build filter로 재배포 범위를 제한한다.

## 구현 결과

- Python 3.12와 uv lock 기반 backend project를 신설했다.
- domain/application/infrastructure/API/settings/composition root를 분리하고 AST dependency test를 추가했다.
- PostgreSQL projects read model, SQLAlchemy async repository, Alembic initial migration과 idempotent seed를 구현했다.
- liveness와 DB/migration-aware readiness, request ID, 구조화 error, strict CORS를 구현했다.
- Project read, Document list/detail와 OpenAPI 계약을 구현했다.
- Git object adapter가 commit tree/blob만 읽고 worktree 변경, 잘못된 ref/path, oversize를 차단한다.
- root Render Blueprint에 React Static Site, FastAPI Web Service, Postgres, pre-deploy migration/seed, SPA rewrite, 3일 preview expiry를 정의했다.
- Render API root를 repository root로 수정해 `docs/` 접근을 보존하고 build filter로 재배포 scope를 제한했다.

## QA 결과

| 검증 | 결과 |
| --- | --- |
| Ruff format/lint | 오류 0 |
| strict mypy | 37 source files, 오류 0 |
| pytest | 27 tests 통과 |
| PostgreSQL | 14.20 disposable DB integration 통과 |
| Alembic | downgrade/upgrade/head 계약 통과 |
| Readiness | DB current/stale migration 분기 통과 |
| Git adapter | commit blob 정상/권한·경로·크기 반례 통과 |
| API/OpenAPI/CORS | contract 통과 |
| Render Blueprint | 공식 JSON Schema validation 통과 |
| Frontend regression | typecheck/lint, 31 tests, production build 통과 |

Render CLI `blueprints validate`는 설치·호출했으나 active workspace가 없어 semantic/conflict validation 단계에서 중단됐다. 외부 resource는 생성하지 않았다.

## Self-Review

- domain/application은 FastAPI, SQLAlchemy, Git subprocess를 import하지 않는다.
- API DTO와 persistence row를 domain entity로 재사용하지 않는다.
- expected migration head는 환경 변수로 바꿀 수 없다.
- CORS와 Git path/ref 정책은 정상 사례보다 반례를 우선 검증했다.
- local PostgreSQL 검증 성공을 Render 배포 성공으로 표현하지 않는다.
- 완료 전 남은 Gate는 Render workspace 선택·resource 생성 승인과 preview URL smoke다.

## Release Gate

- Render workspace와 preview resource 비용 정책 승인
- `render blueprints validate render.yaml --workspace <workspace-id>` 통과
- Blueprint sync 후 migration·health·SPA rewrite·CORS·web→API smoke
- 위 증거가 기록되면 `SELF_REVIEWED → COMPLETED`로 전환하고 archive한다.
