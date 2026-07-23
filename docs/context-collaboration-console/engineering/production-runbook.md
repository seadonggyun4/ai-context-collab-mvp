# Production Operations Runbook

> 이 runbook은 향후 유료 production profile 전용이다. 현재 활성 Render Blueprint는 결제 없는 초기 시연 profile이며 `engineering/render-deployment.md`를 따른다. 무료 배포 결과를 아래 production·PITR 완료 증거로 사용하지 않는다.

## 목적과 적용 범위

이 문서는 `context-console-web`, `context-console-api`, `context-console-db`, `context-console-security`의 production release, 관찰, application rollback, PostgreSQL PITR, secret rotation 절차를 정의한다. 명령 실행 전 대상 workspace·service·deploy ID를 두 사람이 확인한다. application rollback은 database rollback을 포함하지 않는다.

## 책임과 승인

| 작업 | 실행 | 승인 | 필수 증거 |
| --- | --- | --- | --- |
| 일반 release | 개발 담당 | 서비스 책임자 | CI checks, Blueprint validate, smoke 출력 |
| OIDC/role mapping 변경 | 플랫폼 담당 | 보안 또는 서비스 책임자 | IdP 설정 diff, role 반례 test |
| application rollback | 온콜 개발자 | incident commander | 대상 deploy ID, health/smoke, incident timeline |
| PITR/backup restore | DB 운영자 | incident commander + 데이터 책임자 | recovery timestamp, 격리 DB 검증, 전환·복귀 기록 |
| secret rotation | secret owner | 서비스 책임자 | 변경 key 이름, 시각, 재시작·smoke 결과 |

비밀값, cookie, authorization code, provider token, 전체 connection string은 문서·채팅·로그·명령 출력에 기록하지 않는다.

## 목표와 환경 계약

- 복구 목표 초안: 서비스 RTO 60분, 데이터 RPO 15분. 운영 책임자가 요금제와 실제 drill 결과로 확정한다.
- production URL과 OIDC callback은 HTTPS exact value로 등록한다.
- production Postgres는 PITR 가능한 유료 plan, Key Value는 persistent `noeviction` plan을 사용한다.
- `APP_ENV=production`, Secure/HttpOnly session cookie, `checksPass` 자동 배포를 유지한다.
- `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ROLE_MAPPING`은 Render secret으로 주입하며 저장소에 literal을 두지 않는다.
- migration은 pre-deploy에서 `alembic upgrade head`만 수행한다. seed는 production pre-deploy에 포함하지 않는다.

## 최초 배포

1. Render CLI로 Blueprint syntax와 workspace semantic conflict를 검증한다.
2. Blueprint plan·region·service URL을 확인하고 생성 비용을 승인받는다.
3. IdP에 API callback exact URL을 등록하고 group→role mapping을 검토한다.
4. Render dashboard에서 `sync: false` secret을 입력한다. 입력 후 설정 화면 캡처에는 값이 보이지 않게 한다.
5. API pre-deploy migration과 `/health/ready` 성공 후 web을 공개한다.
6. 아래 read-only smoke를 실행하고 출력, deploy SHA, 실행자, 시각을 release evidence에 연결한다.

```bash
cd projects/context-collaboration-console-api
uv run python -m app.scripts.production_smoke \
  --web-url https://context-console-web.onrender.com \
  --api-url https://context-console-api.onrender.com
```

스모크는 web root, SPA rewrite, API liveness, DB migration·Key Value readiness, anonymous auth fail-closed를 검사하며 mutation을 호출하지 않는다. 이어서 최소 권한 viewer, reviewer, admin 계정으로 login/logout과 허용·금지 RBAC를 수동 확인한다.

## Release gate

1. frontend lint, typecheck, test, production build
2. backend Ruff, format, mypy, pytest, OpenAPI contract
3. migration upgrade와 backward compatibility 검토
4. Render Blueprint schema와 workspace validation
5. preview smoke와 OIDC test tenant login
6. production pre-deploy migration, read-only smoke, 역할별 수동 smoke
7. 15분간 5xx, latency, instance restart, DB/Key Value 상태 관찰

어느 단계든 실패하면 신규 트래픽 확대를 멈추고 아래 rollback 판단표를 사용한다.

## 관찰과 경보

| 신호 | 기준 초안 | 즉시 확인 |
| --- | --- | --- |
| `/health/ready` | 연속 2회 실패 | DB, migration head, Key Value 연결 |
| HTTP 5xx | 5분간 2% 초과 | deploy SHA, request ID별 structured log |
| p95 latency | 10분간 1.5초 초과 | DB latency, rate-limit, instance CPU/memory |
| 401 급증 | 직전 1시간 대비 3배 | OIDC metadata/JWKS, cookie domain/SameSite |
| 429 급증 | 5분간 정상치 3배 | actor/IP hash bucket, automation retry 폭주 |
| DB storage/connection | 80% 초과 | long query, connection pool, plan capacity |

access log는 `request_id`, `actor_id`, `method`, `path`, `status`, `duration_ms`만 연결한다. query/body/header/cookie/token은 기록하지 않는다. 조사 시 사용자에게 받은 request ID로 범위를 좁힌다.

## Application rollback

사용 조건: 새 artifact의 회귀이며 DB schema가 이전 artifact와 backward compatible하다.

1. incident를 선언하고 auto-deploy를 일시 중지한다.
2. 현재 deploy ID/SHA, 직전 정상 deploy ID/SHA, migration head를 기록한다.
3. DB migration이 destructive하거나 이전 artifact가 현재 schema를 읽을 수 없으면 즉시 rollback하지 말고 hotfix 또는 PITR 판단으로 전환한다.
4. Render의 이전 정상 deploy를 선택해 rollback한다. 현재 환경변수와 현재 database가 사용된다는 점을 재확인한다.
5. `/health/live`, `/health/ready`, production smoke, 역할별 login을 실행한다.
6. 지표가 15분 안정된 뒤 auto-deploy 재개 여부를 승인받는다.

금지: application rollback 절차에서 `alembic downgrade`, DB 삭제, connection string 교체를 자동 실행하지 않는다.

## PostgreSQL backup/PITR 복구

사용 조건: 데이터 손상·삭제 또는 schema/data를 함께 특정 시점으로 복원해야 한다. Render PITR은 기존 DB를 덮지 않고 새 DB로 복구하는 방식으로 운용한다.

1. mutation 트래픽을 중단하고 사고 발생 시각, 정상으로 판단되는 recovery timestamp, timezone을 기록한다.
2. backup/PITR 보존 범위와 선택 timestamp를 확인한다. 최신 쓰기가 복구 대상이면 최소 허용 지연도 고려한다.
3. 원본을 유지한 채 같은 region의 새 격리 Postgres로 복구한다.
4. 격리된 검증 작업에서 migration head, 핵심 row count, audit 연속성, 최신 정상 ContextVersion, 승인/evidence/commit SHA 관계를 확인한다.
5. 데이터 책임자 승인 후 API의 `DATABASE_URL`만 새 DB로 변경하고 재배포한다.
6. readiness와 production smoke, 인증 계정의 read-only 업무 smoke를 수행한다.
7. 원본 DB는 보존 정책 동안 유지한다. 정리 작업은 이 runbook과 별도의 파괴적 변경 승인을 받는다.

복구 drill은 분기 1회 비운영 격리 DB에서 수행하고 실제 RTO/RPO, 누락 데이터 범위, 담당자·증거 링크를 기록한다.

## Secret과 OIDC key rotation

1. 새 credential을 IdP/secret manager에서 생성하되 기존 값을 즉시 폐기하지 않는다.
2. Render secret을 교체하고 API를 재배포한다.
3. readiness, 새 로그인, 기존 session 정책, logout, reviewer/admin 권한 반례를 확인한다.
4. 정상 확인 후 이전 credential을 폐기하고 폐기 시각을 기록한다.
5. 유출 의심 시 security store namespace/session을 무효화해 전체 재로그인을 강제하고 incident 절차를 병행한다.

## Drill 기록 템플릿

| 항목 | 기록 |
| --- | --- |
| 일시/환경 |  |
| 실행자/승인자 |  |
| source deploy SHA / migration head |  |
| rollback deploy 또는 PITR timestamp |  |
| 예상/실제 RTO·RPO |  |
| smoke 결과와 request ID |  |
| 데이터 검증 |  |
| 복귀/후속 조치 |  |

## 공식 운영 기준

- [Render Blueprint specification](https://render.com/docs/blueprint-spec)
- [Render deploy checks](https://render.com/docs/deploys)
- [Render health checks](https://render.com/docs/health-checks)
- [Render PostgreSQL backups and recovery](https://render.com/docs/postgresql-backups)
- [Render deploy rollbacks](https://render.com/docs/rollbacks)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/rfc9700)
