# CR-2026-012 Phase 8 Git 반영·Context 활성화

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-012` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `ARCHIVE` |
| 요청일 | `2026-07-23` |
| 요청자 | 사용자 |
| 위험도 | 높음 |
| 승인 상태 | `APPROVED` |

## 요청 원문

> Phase 8 Git 반영·Context 활성화를 문서시스템에 따라 확장성 높고 유지보수성 높게 추상화해서 개발 진행해줘.

## Active Context snapshot

- 화면: `SCR-09`
- 요구사항: `REQ-VERIFY-003`, `REQ-BE-001`
- QA: `QA-VERIFY-03`, `QA-BE-01~02`, `QA-A11Y-01`, `QA-RESP-01`
- 정책: `workflow-policy.yaml`, `permissions.yaml`
- 선행 계약: Phase 7 `ReviewWorkspace`, current evidence gate, server actor registry, idempotent command와 audit

## 결정

- Git publication과 Context activation을 별도 command로 분리한다.
- Git publication은 `READY_TO_ACTIVATE`, 최신 approval scope, current implementation revision과 expected base commit이 모두 일치할 때만 허용한다.
- branch name과 commit message는 서버 정책으로 생성하며 요청자가 임의 경로·ref·command를 전달하지 않는다.
- publication 결과는 branch, commit SHA, PR projection, proposal/implementation revision을 고정한다.
- current evidence는 publication commit SHA에 연결하며 이전 implementation evidence는 재사용하지 않는다.
- activation은 admin만 수행하며 최신 publication과 commit-linked required evidence가 있어야 한다.
- 실제 Git write E2E는 임시 sandbox repository에서만 수행한다. 운영 remote PR은 provider port 뒤에 둔다.
- ContextVersion과 Project.activeContextVersion, workflow status, audit은 하나의 persistence transaction에서 갱신한다.

## 수용 기준

| ID | 조건 |
| --- | --- |
| AC-01 | 승인되지 않았거나 READY가 아닌 변경은 Git write를 시작하지 않는다 |
| AC-02 | stale base SHA, proposal revision, scope, implementation revision은 publication을 차단한다 |
| AC-03 | 서버가 branch·commit을 만들고 provider-neutral PR 결과를 반환한다 |
| AC-04 | required evidence가 publication commit SHA와 연결된다 |
| AC-05 | admin이 아니거나 publication이 없는 activation을 차단한다 |
| AC-06 | activation이 새 ContextVersion, actor/time/documents/source SHA와 audit을 남긴다 |
| AC-07 | SCR-09가 publication, Context version, evidence와 후속 경로를 명확히 표시한다 |
| AC-08 | sandbox Git E2E, backend/frontend contract, responsive·theme·keyboard QA가 통과한다 |

## 제외 범위

- GitHub/GitLab App 설치와 실제 remote PR API
- main branch merge·deploy 자동화
- 전자결재·다자 activation quorum
- 운영 OIDC/session과 secret rotation

## 완료 결과

- backend domain/application/API에 revision-locked Git publication과 admin-only activation command를 구현했다.
- 실제 Git side effect는 명시적 `GIT_WRITE_SANDBOX` 안에서만 동작하고 remote push는 수행하지 않는다.
- Alembic `20260723_0004`의 불변 `context_versions`와 Project 활성 버전 갱신을 같은 transaction에 연결했다.
- frontend FSD에 Activation entity·repository, action feature, SCR-09 widget/page/route를 추가했다.
- governance policy v2에 publication permission, activation guard와 금지 전이를 반영했다.
- frontend 81 tests, backend 42 tests와 sandbox Git E2E 2건, production build가 통과했다.
- 1265px light와 390px dark 브라우저에서 publication→activation, 결과 링크와 horizontal overflow 0건을 확인했다.

PostgreSQL 실통합 1건은 `TEST_DATABASE_URL`이 없는 현재 환경에서 skip되었으며 Render preview smoke는 Phase 9 배포 범위로 유지한다.

## 계획 대비 실제

| 계획 | 실제 |
| --- | --- |
| publication/activation을 workflow JSON에 저장 | 조회 snapshot은 JSON에 유지하고 활성 버전은 `context_versions` 불변 테이블에도 정규화 |
| sandbox에서 단일 Git publication 검증 | 원 ref 복귀와 동일 base의 연속 publication까지 검증 |
| 기존 governance 준수 | publication permission과 commit-linked activation 규칙이 빠져 있어 policy version 2로 보강 |
| SCR-09 결과 화면 | publication 전·후, evidence 연결, activated 결과와 후속 경로를 한 route에서 제공 |

## Self-Review

- Domain이 FastAPI·SQLAlchemy·subprocess를 import하지 않고 port 방향을 유지한다.
- branch, path, message와 actor role은 서버가 소유하며 요청 입력으로 shell command를 받지 않는다.
- actual remote push와 provider credential은 포함하지 않아 Phase 9 전까지 안전 기본값이 유지된다.
- light/dark와 desktop/mobile에서 같은 업무 정보와 action 순서를 제공한다.
- 미검증 범위는 실제 PostgreSQL transaction smoke와 remote provider PR 연동이며 제외 범위와 일치한다.
