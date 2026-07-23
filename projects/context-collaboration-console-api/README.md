# Context Collaboration Console API

Python 3.12, FastAPI, SQLAlchemy async와 PostgreSQL 기반 API다. 승인된 문서는 Git이, 프로젝트·workflow·audit·idempotency metadata는 PostgreSQL이 소유한다.

## Local

```bash
uv sync --frozen
uv run alembic upgrade head
uv run python -m app.scripts.seed
uv run uvicorn app.main:app --reload
```

필수 환경 변수는 `.env.example`, production 배포·복구 명령은 `docs/context-collaboration-console/engineering/production-runbook.md`를 따른다.

## Production authentication

- `GET /api/v1/auth/login`, `GET /api/v1/auth/callback`: OIDC Authorization Code + PKCE S256
- `GET /api/v1/auth/me`: server session과 CSRF token 조회
- `POST /api/v1/auth/logout`: session revoke

Production은 OIDC·shared security store·HTTPS origin이 없으면 시작하지 않는다. browser에는 HttpOnly session cookie만 제공하고 provider token은 노출하지 않는다. `/health/ready`는 database, migration, security store를 분리해 보고한다.

## Review workflow API

- `GET /api/v1/projects/{projectId}/changes/{changeId}/review-workspace`
- `POST /api/v1/changes/{changeId}/reviews`
- `POST /api/v1/changes/{changeId}/verifications`
- `POST /api/v1/changes/{changeId}/transitions`

Mutation은 `Idempotency-Key`와 session-bound CSRF가 필요하다. Production identity/role은 검증된 OIDC claim만 사용하며 `X-Actor-Id`는 preview/test adapter에서만 허용한다. aggregate 변경, audit append, command receipt는 한 transaction으로 저장한다.

## Git publication and Context activation API

- `GET /api/v1/projects/{projectId}/changes/{changeId}/activation-workspace`
- `POST /api/v1/changes/{changeId}/git-publications`
- `POST /api/v1/changes/{changeId}/activations`

Git write는 `GIT_WRITE_SANDBOX`가 명시된 격리 repository에서만 활성화된다. API는 branch/path/commit message를 서버 정책으로 생성하며 remote push는 수행하지 않는다. activation은 admin, READY 상태, current publication과 publication commit에 연결된 required evidence를 요구한다.

## Quality gate

```bash
uv run ruff check app tests
uv run ruff format --check app tests
uv run mypy app
uv run pytest
```

Production read-only smoke는 `uv run python -m app.scripts.production_smoke --web-url ... --api-url ...`로 실행한다.
