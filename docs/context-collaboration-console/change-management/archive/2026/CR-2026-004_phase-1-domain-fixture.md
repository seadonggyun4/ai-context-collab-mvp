# CR-2026-004 Phase 1 도메인·Fixture 구축

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-004` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `ARCHIVIST` |
| 요청일 | `2026-07-22` |
| 요청자 | 사용자 |
| 위험도 | 중간 |
| 승인 상태 | `APPROVED` |

## 요청 원문

> Phase 1 도메인·Fixture 구축을 문서 시스템에 따라 확장성 높고 유지보수성 높게 추상화해서 개발 진행해줘.

## 결정

- FSD `entities` layer에 Project, ChangeRequest, Proposal, Document, Impact, Review, Evidence와 활성화 이력 모델을 독립 slice로 둔다.
- 상태 전이와 권한 판정은 UI·React·저장소에 의존하지 않는 순수 함수로 구현한다.
- YAML 정책 파일은 운영 기준이며 TypeScript 정책 상수와의 동기화를 계약 테스트로 강제한다.
- Fixture는 화면별 mock이 아니라 하나의 결정론적 APC change aggregate와 행위 함수로 제공한다.
- 승인 scope는 proposal revision과 fingerprint로 고정하고 구현 revision이 바뀌면 기존 evidence를 재사용하지 않는다.

## 수용 기준

| ID | 조건 |
| --- | --- |
| AC-01 | 7개 핵심 도메인 모델과 ContextVersion/AuditEvent가 FSD Public API로 제공된다 |
| AC-02 | YAML workflow state·transition 및 role permission이 TypeScript 계약과 일치한다 |
| AC-03 | 정상 P0 흐름 `ANALYZED → IN_REVIEW → APPROVED → IMPLEMENTING → VERIFYING → READY_TO_ACTIVATE → ACTIVATED`가 통과한다 |
| AC-04 | self approval, 미권한 승인, high-risk 비관리자 승인, stale review/evidence, evidence 실패·미실행·manual 미해결, 비관리자 활성화가 차단된다 |
| AC-05 | 활성화 시 새 ContextVersion과 AuditEvent가 원자적으로 생성된다 |
| AC-06 | typecheck, lint, architecture test, domain test, production build가 통과한다 |

## 영향

- `entities/project`의 기존 dashboard read model은 유지하면서 핵심 Project 계약을 확장한다.
- 이후 backend는 동일한 status, permission, error code와 aggregate 규칙을 서버 정책 엔진에 이식한다.
- Phase 3 이후 UI는 fixture 객체를 임의 변형하지 않고 command 결과와 selector만 사용한다.

## 구현 전 Gate

- `governance/workflow-policy.yaml`, `permissions.yaml`, `document-schema.yaml`을 원본 계약으로 사용한다.
- 상위 FSD layer 의존과 entity slice private import를 만들지 않는다.
- transition guard를 테스트용 setter로 우회하지 않는다.

## 구현 결과

- Project 기존 read model을 보존하면서 core Project 계약을 확장했다.
- ChangeRequest aggregate와 Proposal, Document, Impact, Review, Evidence, ContextVersion, AuditEvent를 독립 FSD entity slice로 구현했다.
- `DomainResult` 기반의 proposal revision, review, evidence, transition command와 current proposal/review/evidence selector를 구현했다.
- YAML state·transition·guard·forbidden, role·permission·constraint, document required field·enum·relation을 TypeScript 계약과 비교한다.
- 승인 fingerprint가 수용 기준·영향·파일·위험·QA 내용 전체를 포함하도록 해 같은 ID의 내용 변경도 stale scope로 판정한다.
- 구현 revision이 증가하면 이전 evidence가 자동으로 현재 완료 판정에서 제외된다.
- APC demo fixture가 문서·영향 관계·aggregate를 매 호출마다 독립적인 결정론적 값으로 제공한다.
- 활성화가 성공하면 새 ContextVersion과 actor AuditEvent를 같은 immutable 결과에 기록한다.

## QA 결과

| 검증 | 결과 |
| --- | --- |
| TypeScript | 오류 0 |
| ESLint | 오류·경고 0 |
| Vitest | 8 files, 31 tests 통과 |
| Workflow P0 | 정상 승인·검증·활성화 흐름 통과 |
| 권한·Guard 반례 | self/high-risk/stale/evidence/activation/terminal 우회 차단 |
| YAML 계약 | workflow/permission/document schema 동기화 통과 |
| FSD architecture | 역방향·private import 0건 |
| Production build | Vite build 성공, 1930 modules transformed |

## Self-Review

- 화면·React·repository에 의존하지 않는 순수 도메인 계약이다.
- entity 외부 소비는 slice Public API를 사용하고 architecture test가 경계를 강제한다.
- demo self approval 예외는 `apc-monitoring-mvp/CR-DEMO-001`에만 적용된다.
- client 정책은 UX와 fixture 재현용이며 운영 권한의 source of truth로 표현하지 않는다.
- 실제 인증·transaction·idempotency·server audit는 Phase 2 이후 별도 완료 gate로 남긴다.
