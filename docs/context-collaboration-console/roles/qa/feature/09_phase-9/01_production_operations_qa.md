# QF-010 Production authentication and operations QA

## P0 matrix

| 항목 | 기대 | 현재 증거 |
| --- | --- | --- |
| production fail-closed | OIDC·shared store·HTTPS·role mapping 누락 시 시작 거부 | Settings 반례 test 통과 |
| OIDC | PKCE S256, one-time state, nonce, issuer/audience/expiry, exact return | fake orchestration + signed RSA/JWKS transport test 통과 |
| session/CSRF/RBAC | anonymous 401, CSRF 403, logout/expiry, client actor 불신 | production ASGI contract와 기존 review/activation 반례 통과 |
| rate limit/dependency failure | shared 429/Retry-After, store 장애 API 503, health 진단 유지 | memory port contract 통과; 실제 Key Value 대기 |
| observability | 정상·거부 request ID/actor/status/duration, 민감정보 제외 | middleware payload allowlist와 header contract 통과 |
| frontend auth | loading/authenticated/unauthenticated/error/expired, login/logout | repository/fetch/AuthBoundary test와 browser QA 통과 |
| Blueprint/CI | paid DB, persistent Key Value, secrets, checksPass, CI gate | contract test + 현재 공식 JSON Schema 오류 0건 |
| smoke/recovery | Web→API→DB/Key Value read-only smoke, rollback/PITR | smoke contract·runbook 완료; production/drill 증거 대기 |

## 로컬 실행 결과 — 2026-07-23

- frontend: ESLint·TypeScript·Vitest·production build 통과, 29 files / 88 tests.
- backend: Ruff·format·mypy 통과, 53 source files 검사.
- backend pytest: 기본 gate 52 passed, PostgreSQL 환경 의존 1건은 격리 임시 DB에서 별도 실행해 1 passed. 총 53건을 검증했고 임시 cluster는 종료·삭제했다.
- Render JSON Schema: `https://render.com/schema/render.yaml.json` 기준 오류 0건.
- frontend production dependency audit: high 이상 취약점 0건(`npm audit --omit=dev`).
- Render CLI semantic validation: CLI 설치 확인. workspace가 지정되지 않아 외부 gate로 유지하며 임의 workspace 선택은 하지 않았다.
- browser: 1280×900 light, 390×844 dark에서 session avatar·logout 노출, 수평 overflow 0, console error 0.
- recovery: destructive action 없는 runbook/dry-run contract만 검증. 실제 deploy rollback/PITR은 수행하지 않았다.

## 미완료 외부 gate

1. Render workspace를 승인된 production 대상으로 지정하고 Blueprint semantic/conflict validation 실행
2. IdP application/callback/group 등록과 test tenant 역할별 login
3. paid Postgres/Key Value 생성 및 preview→production read-only smoke
4. 이전 artifact rollback drill과 격리 PostgreSQL PITR drill
5. 실제 RTO/RPO·담당자·증거 기록 후 `CR-2026-013`을 `QA_COMPLETED`로 전환
