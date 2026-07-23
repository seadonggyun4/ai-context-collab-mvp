# Phase 8 Git 반영·Context 활성화 영향 분석

- Change ID: `CR-2026-012`
- 상태: 구현·검증 완료

| 노드 | 예상 영향 |
| --- | --- |
| Backend domain | GitPublication, ContextVersion, activation guard, commit-linked evidence |
| Backend application | Git publisher port, publication/activation orchestration와 idempotency |
| Backend infrastructure | sandbox Git adapter, workflow/context persistence와 migration |
| Backend API | activation workspace, publication, activation mutation |
| Frontend entity | ActivationWorkspace와 fixture/HTTP repository |
| Feature/Widget/Page | publish·activate command, SCR-09 result와 blocked states |
| QA | stale revision, 미승인 write, 비관리자 activation, sandbox Git E2E |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| production repository 오염 | write root를 명시적 sandbox로 제한하고 source repository adapter와 분리 |
| 승인 뒤 범위 확장 | proposal revision+scope fingerprint+implementation revision lock |
| evidence와 배포 commit 불일치 | publication 시 current evidence에 commit SHA를 원자적으로 연결 |
| 중복 branch/commit/activation | idempotency receipt와 Context version uniqueness |
| PR provider 종속 | `GitPublisher` port와 provider-neutral `GitPublication` projection |
| Project/Context 불일치 | workflow, ContextVersion, Project.activeContextVersion 단일 transaction |

## 실제 반영

- Domain: `GitPublication`, `ContextVersionRecord`, publication/activation 순수 guard와 commit-linked evidence.
- Application: `GitPublisher` port, server-owned branch/path/message, idempotent publish/activate command.
- Infrastructure: `SandboxGitPublisher`, Alembic `20260723_0004`, immutable `context_versions` row와 Project 갱신 transaction.
- API: activation workspace 조회, Git publication, Context activation endpoint와 strict projection.
- Frontend: Activation entity의 fixture/HTTP adapter, action feature, responsive SCR-09 result.
- Policy: workflow/permission YAML과 TypeScript mirror를 policy version 2로 동기화.

## 검증 결과

- 승인 전 Git adapter 호출 0건과 stale base/ref/path escape 반례 통과.
- frontend ESLint·TypeScript·FSD contract, 26 files/81 tests와 production build 통과.
- backend Ruff·mypy, 42 tests 통과, PostgreSQL 환경 의존 1건 skip.
- 1265px light, 390px dark에서 end-to-end fixture flow와 overflow 0건 확인.
