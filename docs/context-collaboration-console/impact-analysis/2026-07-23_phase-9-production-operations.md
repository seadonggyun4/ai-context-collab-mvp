# Phase 9 인증·운영·Production 배포 영향 분석

- Change ID: `CR-2026-013`
- 상태: 로컬 구현·검증 완료, 외부 운영 gate 대기

| 노드 | 예상 영향 |
| --- | --- |
| Backend domain/application | authenticated principal, OIDC flow, server session, security store port |
| Backend infrastructure | OIDC HTTP/JWT adapter, Redis-compatible store, distributed rate limiter |
| Backend API | auth routes, production auth/CSRF middleware, readiness·security headers |
| Frontend app/shared | session provider, credentialed fetch, auth gate와 expired UX |
| Render | preview/production resources, Key Value, paid Postgres, secret contract, checksPass |
| Operations | smoke, deploy rollback, PITR/backup, incident and secret rotation runbook |
| QA | configuration fail-closed, OIDC replay/redirect/nonce, session/CSRF/RBAC, 429, log redaction |
| CI | frontend/backend/PostgreSQL integration/Blueprint schema quality-gate |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| actor header spoofing | production에서 header identity 비활성화, OIDC claim만 role로 변환 |
| code/session 탈취 | PKCE S256, one-time state, nonce, HttpOnly/Secure cookie, TTL과 revocation |
| open redirect | frontend origin 기반 exact return URL allowlist |
| CSRF | SameSite cookie와 mutation 전용 session-bound CSRF header |
| 단일 instance rate limit | Key Value atomic counter port로 공유 |
| secret 유출 | Blueprint `sync: false`, log redaction, frontend secret 0개 |
| migration 후 artifact rollback | expand-compatible migration 원칙과 DB 복구를 별도 승인 절차로 분리 |
| backup을 검증하지 않음 | 격리 복구 DB에서 validation 후 connection 전환하는 drill 정의 |
