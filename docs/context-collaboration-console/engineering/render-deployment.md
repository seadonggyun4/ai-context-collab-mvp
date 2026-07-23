# Render Deployment Architecture

## 활성 배포 프로필: zero-cost initial demonstration

repository root의 `render.yaml`은 `imugi` workspace에 결제 수단 없이 초기 시연 환경을 생성하는 단일 Blueprint다. 이 프로필은 deterministic fixture로 제품 전체 흐름을 시연하고 API→DB 기반을 별도 smoke하는 비운영 환경이며 Phase 9의 유료 production topology나 완전한 HTTP integration을 대체하지 않는다.

```mermaid
flowchart LR
    USER["Browser"] --> WEB["Render Static Site\nReact + Vite · free"]
    WEB --> API["Render Web Service\nFastAPI · free"]
    API --> DB["Render PostgreSQL\n1 GB · 30-day free"]
    API --> KV["Render Key Value\nin-memory free"]
    API --> GIT["Git object read adapter"]
```

| Resource | 활성 plan | 책임 | 무료 제약 |
| --- | --- | --- | --- |
| `context-console-web` | Static Site free | SPA, security headers, API origin | 포함 bandwidth·pipeline 한도 |
| `context-console-api` | Web Service `free` | HTTP API, migration, Git/docs read | 15분 idle 후 spin-down·cold start |
| `context-console-db` | PostgreSQL `free` | application/audit state | 1 GB, 30일 만료, backup/PITR 없음 |
| `context-console-security` | Key Value `free` | shared transient state | disk persistence 없음, restart 시 소실 |

API는 `docs/`를 Git object로 읽기 때문에 repository root를 Render `rootDir`로 유지하고 명령에서 API directory로 이동한다. frontend는 자체 project root에서 build한다. React Router는 `/* → /index.html`, API health check는 `/health/ready`를 사용한다.

## 과금 차단 규칙

- Blueprint의 모든 instance `plan`은 `free`이며 Static Site도 free다.
- Blueprint Environment Preview와 개별 Service Preview를 비활성화한다. `previewPlan`을 선언하지 않는다.
- 결제 수단을 등록하지 않는다. 포함 사용량 초과 시 Render는 추가 과금 대신 service 또는 build를 중지한다.
- Blueprint sync 전에 Render CLI workspace validation 결과가 `valid: true`인지 확인한다.
- plan 변경, paid disk, paid pipeline, preview 활성화는 별도 비용 승인과 Change Manifest 없이는 금지한다.

## 초기 시연 런타임

- frontend는 `VITE_DATA_SOURCE=fixture`로 시연 흐름을 결정론적으로 제공한다. 현재 릴리스에는 frontend login/session build flag가 없다. Dashboard·analysis·impact HTTP endpoint가 모두 준비되기 전에는 `http`로 전환하지 않는다.
- API는 `APP_ENV=preview`를 사용하며 workflow evidence용 비운영 actor adapter를 사용한다. 이 actor는 로그인 사용자를 의미하지 않는다.
- 무료 Web Service는 `preDeployCommand`를 지원하지 않는다. 단일 free instance의 `startCommand`에서 `alembic upgrade head` → idempotent APC demo seed → Uvicorn 순서로 시작한다.
- seed는 `APP_ENV=preview` 무료 시연 profile에만 포함한다. 향후 production start/pre-deploy에는 seed를 포함하지 않는다.
- Web Service filesystem은 ephemeral이다. 문서 수정의 remote push는 수행하지 않으며 DB/KV 상태는 무료 플랜 제약을 따른다.

| Key | 초기 시연 계약 | Secret |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Render API HTTPS origin | 아니오 |
| `VITE_DATA_SOURCE` | `fixture` | 아니오 |
| `APP_ENV`, `LOG_LEVEL` | `preview`, `INFO` | 아니오 |
| `DATABASE_URL` | Blueprint free Postgres connection reference | 예, 자동 연결 |
| `SECURITY_STORE_URL` | Blueprint free Key Value connection reference | 예, 자동 연결 |
| `CORS_ALLOWED_ORIGINS`, `FRONTEND_ORIGINS` | frontend Render HTTPS origin | 아니오 |

## Validation gate

1. local frontend/backend quality gate
2. JSON Schema validation of `render.yaml`
3. `imugi` workspace validation: `render blueprints validate render.yaml -w tea-d9gnd7jtqb8s73drjjlg -o json`
4. Blueprint 비용 검토: paid plan·preview·disk·paid pre-deploy 0건
5. initial deploy 후 SPA fixture 렌더링, migration, `/health/live`, `/health/ready`, Project/Document read API, CORS, SPA rewrite smoke
6. 무료 DB 만료일과 시연 데이터 폐기 계획 기록

Schema 검증은 문법·필드 형태만 확인한다. Render CLI workspace 검증은 현재 workspace의 플랜·권한·필드 조합을 확인하며 실제 자원은 생성하지 않는다. Blueprint 생성은 별도의 외부 상태 변경 단계다.

## Production 전환 경계

조직 OIDC·identity RBAC를 도입하거나 persistent state, backup/PITR, pre-deploy migration, 무중단 운영이 필요해지면 별도 Change Manifest와 `production-runbook.md`의 유료 profile로 전환한다. 무료 초기 배포를 production 완료 증거로 사용하지 않는다.

## 공식 참고

- [Render free instances](https://render.com/docs/free)
- [Render Blueprint specification](https://render.com/docs/blueprint-spec)
- [Render deploy and pre-deploy commands](https://render.com/docs/deploys)
- [Render CLI Blueprint validation](https://render.com/docs/cli-reference)
