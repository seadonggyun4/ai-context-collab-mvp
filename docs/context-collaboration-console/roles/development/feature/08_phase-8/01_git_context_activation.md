# DF-009 Git publication and Context activation

## 구현 경계

- Domain은 publication/activation 불변 조건과 결과 entity를 소유한다.
- Application은 actor, idempotency, Git port 호출과 persistence 순서를 조정한다.
- Infrastructure Git adapter만 subprocess와 sandbox filesystem을 사용한다.
- API는 provider-neutral DTO와 identity/idempotency header만 노출한다.
- Frontend entity repository는 fixture/HTTP를 동일 contract로 제공한다.
- Feature는 publish/activate pending·error를, widget/page는 SCR-09 composition을 소유한다.

## API 계약

- `GET /api/v1/projects/{projectId}/changes/{changeId}/activation-workspace`
- `POST /api/v1/changes/{changeId}/git-publications`
- `POST /api/v1/changes/{changeId}/activations`
- mutation headers: `X-Actor-Id`, `Idempotency-Key`

## 불변 조건

- Git publisher는 READY와 revision lock 검증 전에 호출하지 않는다.
- branch/ref/path는 서버 생성·allowlist를 사용한다.
- activation은 admin, current publication, commit-linked evidence를 요구한다.
- Git side effect 성공 뒤 persistence 실패는 재조회 가능한 publication identity로 복구한다.
- fixture는 UX 재현용이며 운영 Git 권한의 source of truth가 아니다.

## 완료 증거

- Change: `CR-2026-012`
- Impact: `impact-analysis/2026-07-23_phase-8-git-context-activation.md`
- QA: `roles/qa/feature/08_phase-8/01_git_context_activation_qa.md`
- Persistence: Alembic `20260723_0004`, `context_versions` immutable row와 Project active version transaction
- Backend: 42 tests와 sandbox Git E2E 통과
- Frontend: 81 tests, FSD/policy contract와 production build 통과
