# CR-2026-013 Phase 9 인증·운영·Production 배포

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-013` |
| 현재 상태 | `SUPERSEDED / DEFERRED` |
| 현재 Phase | `REFERENCE_ONLY` |
| 요청일 | `2026-07-23` |
| 요청자 | 사용자 |
| 위험도 | 높음 |
| 승인 상태 | `APPROVED` |

> `CR-2026-017`이 현재 인증 범위를 대체한다. 이 문서의 OIDC, session, identity RBAC, 로그인 UI 결정은 현재 릴리스에서 활성화하지 않으며 별도 변경 승인 전까지 참고 구현으로만 보존한다.

## 요청 원문

> Phase 9 인증·운영·Production 배포를 문서시스템에 따라 확장성 높고 유지보수성 높게 추상화해서 개발 진행해줘.

## Active Context snapshot

- 선행 상태: Phase 8 완료, migration head `20260723_0004`
- 요구사항: `REQ-BE-001`, `REQ-DEPLOY-001`, `REQ-AUTH-001~002`, `REQ-OPS-001~002`, `REQ-RECOVERY-001`
- 정책: `permissions.yaml` v2, `workflow-policy.yaml` v2
- 운영 기준: `engineering/render-deployment.md`, Render Blueprint/PITR/rollback 공식 계약

## 결정

- Production 인증은 OIDC Authorization Code + PKCE S256, state, nonce와 exact callback/return allowlist를 사용한다.
- 브라우저에는 provider token을 보존하지 않고 server-side session ID만 HttpOnly cookie로 제공한다.
- session, OIDC one-time flow와 분산 rate limit은 공용 Key Value port 뒤에서 관리한다.
- production `/api/v1`은 인증을 기본 거부하며 mutation은 session-bound CSRF token을 추가로 요구한다.
- IdP group/claim→내부 role mapping은 서버 환경 계약이며 클라이언트 actor header를 신뢰하지 않는다.
- Preview/test의 header identity는 명시적인 비운영 adapter로만 유지한다.
- request ID, actor, path, status, duration, rate-limit 결과를 구조화 log로 남기고 query/secret/token/body는 기록하지 않는다.
- production Blueprint는 preview와 별도 resource, `checksPass`, paid Postgres PITR, persistent Key Value, secret `sync: false`를 사용한다.
- migration은 pre-deploy에서 실행하며 rollback은 application artifact와 database recovery를 분리한다.

## 수용 기준

| ID | 조건 |
| --- | --- |
| AC-01 | production 설정이 OIDC·session secret·Key Value·HTTPS origin 누락 시 시작을 거부한다 |
| AC-02 | login/callback이 PKCE S256·state·nonce·exact return allowlist를 강제한다 |
| AC-03 | session cookie는 HttpOnly·Secure이고 logout/revocation 및 TTL을 갖는다 |
| AC-04 | production API는 미인증 401, 권한 부족 403, CSRF 불일치 403을 반환한다 |
| AC-05 | rate limit이 instance 간 공유되고 429·Retry-After를 제공한다 |
| AC-06 | access log가 request/actor/status/duration을 연결하고 민감정보를 제외한다 |
| AC-07 | production Blueprint가 web/api/db/key-value, secret/environment 분리와 checks gate를 정의한다 |
| AC-08 | backup/PITR, deploy rollback, migration rollback decision과 smoke 절차가 runbook에 있다 |
| AC-09 | frontend가 session loading/authenticated/unauthenticated/expired 상태와 재로그인을 제공한다 |
| AC-10 | security·Blueprint·smoke·rollback contract tests와 production build가 통과한다 |

## 제외 범위

- 실제 IdP application 등록과 운영 사용자/group provisioning
- Render workspace resource 생성·과금 승인·custom domain DNS 변경
- 실제 production database PITR 실행과 실제 deploy rollback 실행
- 외부 SIEM/APM vendor 계정 생성
