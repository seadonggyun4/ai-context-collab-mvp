# CR-2026-002 단일 AI Phase 전환 체계 강화

## 변경 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-002` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `NONE` |
| 요청일 | `2026-07-16` |
| 최종 갱신일 | `2026-07-16` |
| 요청자 | 사용자 |
| 수행 주체 | 단일 AI 에이전트 |
| 위험도 | 낮음 |

## 요청 정의

### 요청 원문

> 단일 AI의 Context Reader → Planner → Implementer → Tester → Self-Reviewer → Reporter 역할 전환과 Phase Transition 선언을 확장성과 유지보수성이 높게 적용한다.

### 요청 요약

- 목적: 같은 AI가 역할을 바꿀 때 이전 단계의 결과, 다음 단계의 입력, 한계와 미검증 가정을 명시해 역할 혼합과 자기확증을 줄인다.
- 포함: Phase 정의, 상태와 Phase의 관계, 전환 계약, 재진입 규칙, Manifest 템플릿, 상위 문서 연결, 실제 적용 기록.
- 제외: 복수 에이전트, 자동화, CLI, 외부 플랫폼, 코드 기반 강제.

### 수용 기준

| ID | 완료 조건 | 상태 |
| --- | --- | --- |
| AC-01 | 6개 Phase의 책임, 입력, 출력, 진입·종료 조건이 정의된다 | 충족 |
| AC-02 | 모든 Phase 전환에 사용하는 단일 공통 선언 형식이 존재한다 | 충족 |
| AC-03 | 사용자 제시 필드 6개가 전환 선언에 필수로 포함된다 | 충족 |
| AC-04 | State와 Phase의 차이 및 기본 매핑이 정의된다 | 충족 |
| AC-05 | 요구사항·구현·테스트 변경 시 되돌림과 재진입 규칙이 정의된다 | 충족 |
| AC-06 | Phase 생략·병합·근거 없는 전환을 금지한다 | 충족 |
| AC-07 | Manifest 템플릿에서 현재 Phase와 전체 전환 이력을 추적할 수 있다 | 충족 |
| AC-08 | 기존 문서 체계와 첫 완료 Manifest의 역사성을 훼손하지 않는다 | 충족 |

## Context Snapshot

| 문서 | 확인 내용 | 결과 |
| --- | --- | --- |
| `change-management/README.md` | 6개 역할은 있으나 전환 선언 계약과 Phase 이력이 없음 | 보강 필요 |
| `change-management/templates/change-manifest-template.md` | 상태 이력만 있고 현재 Phase와 Phase 전환 이력이 없음 | 보강 필요 |
| `Project_Context.md` | 8단계 State만 최상위 규칙으로 연결됨 | State/Phase 이중축 설명 필요 |
| `roles/Feature_Workflow.md` | 역할별 제품 문서 흐름과 단일 AI 실행 Phase가 구분되지 않음 | 책임 경계 설명 필요 |
| `CR-2026-001` | 완료된 역사 문서 | 수정하지 않음 |

- 충돌 여부: 없음.
- 핵심 판단: State와 Phase를 같은 개념으로 합치면 재작업과 반복 검증을 표현하기 어렵기 때문에 독립 축으로 유지한다.

## 영향 분석과 계획

| 영역 | 영향 | 산출물 |
| --- | --- | --- |
| Change workflow | Phase 계약과 전환 규칙 추가 | `change-management/README.md` |
| Template | 현재 Phase, Phase Transition Log 추가 | Change Manifest 템플릿 |
| Reuse | 전환 선언 단독 템플릿 제공 | `phase-transition-template.md` |
| Project Context | State와 Phase 관계 연결 | `Project_Context.md` |
| Role Feature | 제품 역할과 실행 Phase 구분 | `roles/Feature_Workflow.md` |
| Impact Analysis | 이번 변경의 영향 기록 | 신규 Impact 문서 |
| Application code | 영향 없음 | 없음 |

### 위험과 대응

| 위험 | 대응 |
| --- | --- |
| State와 Phase 용어 혼동 | 목적, 값, 전환 조건을 별도 표로 정의 |
| 전환 기록이 반복 문구가 됨 | 공통 템플릿 하나를 원본으로 사용하고 Manifest에는 인스턴스만 기록 |
| 작은 변경에서 Phase 생략 | `NOT_APPLICABLE` 근거는 허용하되 Phase 전환 자체는 기록 |
| 재작업 시 선형 순서가 깨짐 | 허용된 역방향 전환과 상태 회귀 규칙 정의 |
| Reporter가 검증 결과를 과장 | 완료·미완료·미검증·한계를 별도 출력으로 고정 |

### 예상 변경 파일

- `change-management/README.md`
- `change-management/templates/change-manifest-template.md`
- `change-management/templates/phase-transition-template.md`
- `Project_Context.md`
- `roles/Feature_Workflow.md`
- `README.md`
- `impact-analysis/2026-07-16_single-ai-phase-transitions.md`
- 현재 Manifest

### 테스트 계획

| ID | 검증 대상 | 성공 기준 |
| --- | --- | --- |
| TEST-01 | Phase 명칭 | 6개 표준 Phase가 모든 규칙에서 같은 철자로 사용됨 |
| TEST-02 | 필수 전환 필드 | 사용자 제시 6개 필드와 추가 제어 필드가 두 템플릿에 존재 |
| TEST-03 | State/Phase 매핑 | 8개 State와 6개 Phase의 기본 관계 및 반복 규칙이 모순 없음 |
| TEST-04 | 기존 체계 연결 | Project Context, Feature Workflow, README에서 책임 경계가 일치 |
| TEST-05 | 변경 범위 | 문서 파일만 변경되고 `git diff --check` 통과 |
| TEST-06 | Phase 종결 | 정상 완료와 취소 시 `NONE`으로 닫히고 현재 Phase가 종결됨 |

## Development Ready Gate

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| 요청·포함·제외 범위 명확 | 충족 | 요청 정의 |
| 기존 기준 확인 | 충족 | Context Snapshot |
| 책임과 영향 분석 | 충족 | 영향 분석 표 |
| 예상 파일·위험·테스트 정의 | 충족 | 계획 섹션 |
| 사용자 결정 필요 사항 없음 | 충족 | 기존 규칙의 누락 보완으로 해석 분기 없음 |

## Phase Transition Log

### Phase 진행 현황

| Phase | 상태 | 시작 Transition | 종료 Transition | 핵심 산출물 |
| --- | --- | --- | --- | --- |
| `CONTEXT_READER` | 완료 | PT-001 | PT-002 | Context Snapshot과 구조적 누락 |
| `PLANNER` | 완료 | PT-002 | PT-003 | 수용 기준, 영향, 위험, 테스트 계획 |
| `IMPLEMENTER` | 완료 | PT-003, PT-006 | PT-004, PT-007 | Phase 계약과 terminal 종료 규칙 |
| `TESTER` | 완료 | PT-004, PT-007 | PT-005, PT-008 | 최초·재검증 TEST-01~05 통과 |
| `SELF_REVIEWER` | 완료 | PT-005, PT-008 | PT-006, PT-009 | 최초 누락 발견 후 최종 검토 통과 |
| `REPORTER` | 완료 | PT-009 | PT-010 | 완료·미완료·미검증·한계 보고 확정 |

### PT-001

- Previous phase: `NONE`
- Next phase: `CONTEXT_READER`
- State before transition: `REQUESTED`
- Transition trigger: 사용자 요청 접수
- Files changed: `change-management/active/CR-2026-002_single-ai-phase-transitions.md` 생성
- Tests executed: 없음
- Known limitations: 문서 규칙은 기술적 강제력이 없음
- Unverified assumptions: 기존 완료 Manifest는 역사 문서로 유지한다는 원칙
- Inputs carried forward: 사용자 요청 원문
- Required output of next phase: 관련 기준 문서와 구조적 누락 확인
- Entry gate: 요청 원문과 작업 범위 기록 완료

### PT-002

- Previous phase: `CONTEXT_READER`
- Next phase: `PLANNER`
- State before transition: `CONTEXT_CONFIRMED`
- Transition trigger: 관련 기준 문서 정독 및 누락 확인 완료
- Files changed: 현재 Manifest의 Context Snapshot
- Tests executed: 기존 규칙과 템플릿 정적 검토
- Known limitations: Phase 전환 강제 자동화는 범위 밖
- Unverified assumptions: 없음
- Inputs carried forward: State/Phase 분리 필요성, 기존 문서별 책임
- Required output of next phase: Phase 계약, 재진입 규칙, 변경·테스트 계획
- Entry gate: 문서 충돌 없음, 구조적 누락 명확

### PT-003

- Previous phase: `PLANNER`
- Next phase: `IMPLEMENTER`
- State before transition: `DEVELOPMENT_READY`
- Transition trigger: 수용 기준, 영향, 위험, 예상 파일, 테스트 계획 확정
- Files changed: 현재 Manifest의 계획과 Development Ready Gate
- Tests executed: 계획과 요청 항목 대조
- Known limitations: 문서 기반 수동 준수 모델 유지
- Unverified assumptions: 없음
- Inputs carried forward: 6개 Phase 계약과 공통 전환 선언 설계
- Required output of next phase: 워크플로·템플릿·상위 문서 통합
- Entry gate: Development Ready Gate 전 항목 충족

### PT-004

- Previous phase: `IMPLEMENTER`
- Next phase: `TESTER`
- State before transition: `IMPLEMENTED`
- Transition trigger: Phase 계약, 공통 템플릿, 상위 문서 통합과 실제 변경 대조 완료
- Files changed: `change-management/README.md`, `change-management/templates/change-manifest-template.md`, `change-management/templates/phase-transition-template.md`, `Project_Context.md`, `roles/Feature_Workflow.md`, `README.md`, `impact-analysis/2026-07-16_single-ai-phase-transitions.md`, 현재 Manifest
- Tests executed: 없음
- Known limitations: 문서 규칙은 Phase 전환 생략을 기술적으로 차단하지 못함
- Unverified assumptions: 없음
- Inputs carried forward: 6개 Phase 정의, State/Phase 매핑, 전환·회귀 규칙, 실제 변경 파일
- Required output of next phase: TEST-01~05 실행 결과와 실패·미실행 항목
- Entry gate: 계획된 문서 변경 완료, 계획 밖 코드 변경 없음

### PT-005

- Previous phase: `TESTER`
- Next phase: `SELF_REVIEWER`
- State before transition: `QA_COMPLETED`
- Transition trigger: TEST-01~05가 모두 통과하고 실패·미실행 항목 없음
- Files changed: 테스트 결과를 현재 Manifest에 기록
- Tests executed: Phase 명칭, 필수 전환 필드, State/Phase 매핑, 기존 문서 연결, Markdown 전용 변경 검사 모두 통과
- Known limitations: 문서 의미의 자동 검증과 실행 강제는 없음
- Unverified assumptions: 없음
- Inputs carried forward: 원 요청, AC-01~08, 실제 변경 목록, TEST-01~05 결과
- Required output of next phase: 수용 기준 재판정, 반례, 잔여 위험, 회귀 필요 여부
- Entry gate: 모든 테스트에 결과 상태와 근거가 존재

### PT-006

- Previous phase: `SELF_REVIEWER`
- Next phase: `IMPLEMENTER`
- State before transition: `QA_COMPLETED`
- Transition trigger: 완료 후 Reporter Phase를 닫는 terminal transition이 없어 현재 Phase와 종료 근거가 모호함을 발견
- Files changed: 없음
- Tests executed: 원 요청, Phase 진행표, 공통 전환 템플릿, 완료 조건 역대조
- Known limitations: `REPORTER → NONE`과 취소 시 terminal 전환이 정의되지 않음
- Unverified assumptions: 없음
- Inputs carried forward: SELF_REVIEWER 발견 사항과 기존 TEST-01~05 결과
- Required output of next phase: terminal Phase 규칙, 템플릿의 `NONE` 허용 범위, 완료·취소 종료 계약
- Entry gate: 누락 원인과 수정 범위가 명확하고 기존 Phase 계약 안에서 해결 가능

### PT-007

- Previous phase: `IMPLEMENTER`
- Next phase: `TESTER`
- State before transition: `IMPLEMENTED`
- Transition trigger: `REPORTER → NONE` terminal transition과 완료·취소 종료 규칙 보완 완료
- Files changed: `change-management/README.md`, `change-management/templates/change-manifest-template.md`, `change-management/templates/phase-transition-template.md`, 현재 Manifest
- Tests executed: 없음
- Known limitations: terminal transition도 문서 규칙으로만 강제됨
- Unverified assumptions: 없음
- Inputs carried forward: 수정된 terminal 규칙과 최초 TEST-01~05 결과
- Required output of next phase: 전체 회귀 검사와 terminal 규칙 검사 결과
- Entry gate: Self-Review 발견 사항이 템플릿과 원본 규칙에 모두 반영됨

### PT-008

- Previous phase: `TESTER`
- Next phase: `SELF_REVIEWER`
- State before transition: `QA_COMPLETED`
- Transition trigger: 전체 회귀 검사와 terminal transition 검사가 통과함
- Files changed: 현재 Manifest의 재검증 결과
- Tests executed: TEST-01~05 재실행 및 `REPORTER → NONE`, `현재 Phase: NONE` 규칙 추가 검사 통과
- Known limitations: 자동 의미 검증과 기술적 강제 없음
- Unverified assumptions: 없음
- Inputs carried forward: 보완된 규칙, 전체 테스트 통과 결과, 최초 Self-Review 실패 이력
- Required output of next phase: 최종 수용 기준 판정, 반례, 잔여 위험, Reporter 진입 여부
- Entry gate: 실패·미실행 테스트 없음, 이전 발견 사항 해결 확인

### PT-009

- Previous phase: `SELF_REVIEWER`
- Next phase: `REPORTER`
- State before transition: `SELF_REVIEWED`
- Transition trigger: AC-01~08 재판정, terminal 보완 확인, 반례·잔여 위험 검토 완료
- Files changed: 현재 Manifest의 최종 Self-Review 판정
- Tests executed: 전체 TEST-01~06 결과와 실제 변경 범위 재대조
- Known limitations: 문서 기반 규칙은 기술적으로 Phase 준수를 강제하지 못함
- Unverified assumptions: 없음
- Inputs carried forward: 최종 수용 기준 판정, 검증 결과, 최초 회귀 이력, 잔여 한계
- Required output of next phase: 완료·미완료·미검증·한계·후속 작업이 분리된 최종 보고와 terminal transition
- Entry gate: 회귀 필요 사항 없음, 완료 게이트 충족 가능

### PT-010

- Previous phase: `REPORTER`
- Next phase: `NONE`
- State before transition: `COMPLETED`
- Transition trigger: 최종 보고 항목과 완료 게이트 확정, 활성 작업 Phase 종료
- Files changed: 현재 Manifest의 완료 판정, 최종 보고, terminal transition
- Tests executed: Reporter가 새로운 구현·검증을 수행하지 않았고 Self-Review 결과만 보고하는지 확인
- Known limitations: 문서 규칙의 기술적 강제력 없음
- Unverified assumptions: 없음
- Inputs carried forward: 사용자에게 전달할 완료 결과, 한계, 후속 운영 기준
- Required output of next phase: `NOT_APPLICABLE` — terminal transition으로 다음 Phase 없음
- Entry gate: 완료 조건 충족, 미완료·미검증·한계 공개, 새 작업 없음

## 구현 기록

| 실제 변경 파일 | 변경 내용 | 계획 여부 |
| --- | --- | --- |
| `change-management/README.md` | Phase 정의, 매핑, 전환 계약, 진입·종료·회귀 규칙 | 계획됨 |
| `change-management/templates/change-manifest-template.md` | 현재 Phase, 진행 현황, 전환 Log, 완료 조건 | 계획됨 |
| `change-management/templates/phase-transition-template.md` | 공통 전환 선언 원본 | 계획됨 |
| `Project_Context.md` | State와 Phase 이중축 연결 | 계획됨 |
| `roles/Feature_Workflow.md` | 제품 역할과 실행 Phase 경계 | 계획됨 |
| `README.md` | 전환 템플릿 진입점 | 계획됨 |
| `impact-analysis/2026-07-16_single-ai-phase-transitions.md` | 변경 영향 기록 | 계획됨 |
| 현재 Manifest | 전 Phase 실제 적용 기록 | 계획됨 |

- 예상했지만 변경하지 않은 파일: 없음.
- 계획에 없었지만 변경한 파일: 없음.
- 앱 코드 변경: 없음.

## QA 실행 증거

| Test ID | 실행 방법 | 결과 | 근거 | 미검증 범위 |
| --- | --- | --- | --- | --- |
| TEST-01 | 6개 식별자를 관련 문서 전체에서 `rg` 검색 | `PASSED` | 워크플로, 두 템플릿, Project Context, Feature Workflow에 동일 식별자 존재 | 없음 |
| TEST-02 | 11개 필수 필드를 워크플로와 전환 원본 템플릿에서 개별 검색 | `PASSED` | 사용자 제시 6개 필드와 제어 필드 모두 존재 | 없음 |
| TEST-03 | State/Phase 매핑, 정상·역방향 전환 표 정적 검토 | `PASSED` | 기본 매핑과 6개 회귀 조건이 정의됨 | 자동 의미 검증 없음 |
| TEST-04 | Project Context, Feature Workflow, README의 정의 교차 검토 | `PASSED` | 요청 State, AI 실행 Phase, 제품 역할의 책임이 구분됨 | 없음 |
| TEST-05 | `git diff --check`, 비 Markdown 파일 검색, `git status --short` | `PASSED` | whitespace 오류와 문서 외 신규 파일 없음 | 기존 앱 테스트는 문서 전용 변경이므로 `NOT_APPLICABLE` |
| TEST-06 | terminal transition 관련 문구 검색 및 템플릿 교차 검토 | `PASSED` | `REPORTER → NONE`, 취소→`NONE`, 종료 후 현재 Phase `NONE` 모두 정의 | 없음 |

- 실패: 없음.
- 미실행: 없음.
- 알려진 검증 한계: 문서 의미와 향후 AI 준수를 자동으로 보증하지 않는다.

## Self-Review

- 1차 Self-Review 결과: 회귀 필요.
- 발견 사항: `REPORTER` 진입은 정의되어 있으나 완료 후 Phase 종료를 표현할 terminal transition이 없다.
- 처리: PT-006으로 `IMPLEMENTER`에 회귀하여 보완 후 Tester와 Self-Reviewer를 다시 수행한다.

### 최종 Self-Review 판정

| 질문 | 판정 | 근거 |
| --- | --- | --- |
| 6개 역할이 순서와 독립 책임을 갖는가 | 충족 | 각 Phase의 입력, 출력, 종료 조건과 금지 규칙 정의 |
| 사용자 제시 전환 필드가 모두 필수인가 | 충족 | 두 템플릿에 6개 필드와 추가 제어 필드 존재 |
| Phase 변경 전에 선언하도록 규정했는가 | 충족 | Manifest 기록과 사용자 진행 알림을 다음 실질 작업보다 먼저 수행 |
| State와 Phase가 혼동되지 않는가 | 충족 | 정의, 질문, 기록 위치, 기본 매핑, 제품 역할 경계 명시 |
| 실패와 요구사항 변경 시 재진입할 수 있는가 | 충족 | 6개 조건별 회귀 Phase, State, 증거 처리 정의 |
| 완료·취소 시 Phase가 명확히 종료되는가 | 충족 | terminal transition과 현재 Phase `NONE` 규칙 추가 |
| 기존 완료 기록을 훼손했는가 | 아니오 | `CR-2026-001`은 변경하지 않고 역사 문서로 유지 |
| 계획 밖 코드 또는 외부 시스템을 추가했는가 | 아니오 | 변경은 Markdown 문서에 한정 |

### 반례 검토

- 작은 변경이라 Tester나 Self-Reviewer를 생략하는 경우: 생략 금지, 작업 없음은 `NOT_APPLICABLE` 근거와 전환 기록으로 처리한다.
- 검증 실패 뒤 기록을 통과로 덮는 경우: 실패 증거 보존과 역방향 Transition을 의무화했다.
- Reporter가 새 수정을 수행하는 경우: Reporter의 새 구현·검증을 금지하고 책임 Phase 회귀를 요구한다.
- 완료 후 Reporter가 계속 활성로 남는 경우: `REPORTER → NONE` terminal transition으로 해결했다.

### 잔여 위험과 한계

- 기술적 강제가 없으므로 AI가 Manifest 자체를 생략하면 차단할 수 없다.
- 전환 기록의 사실성은 사용자와 AI의 문서 준수에 의존한다.
- 단순 요청에도 최소 6개 Phase 기록이 필요해 문서 비용이 증가한다.
- 이 비용은 Phase 병합이 아니라 `NOT_APPLICABLE` 근거를 간결하게 기록하는 방식으로만 줄인다.

## 완료 판정과 보고

| 완료 조건 | 상태 | 근거 |
| --- | --- | --- |
| AC-01~08에 판정과 근거가 있다 | 충족 | 최종 Self-Review 표 |
| 6개 Phase를 모두 수행했다 | 충족 | PT-001~010과 Phase 진행 현황 |
| 모든 Phase 전환 필드가 기록되었다 | 충족 | 각 Transition 선언 |
| 회귀와 실패 이력이 보존되었다 | 충족 | PT-006 및 1차 Self-Review 기록 유지 |
| TEST-01~06에 결과가 있다 | 충족 | 모두 `PASSED` |
| Reporter가 새로운 구현·검증을 수행하지 않았다 | 충족 | 기존 Self-Review 결과만 보고에 사용 |
| terminal transition이 존재한다 | 충족 | PT-010 `REPORTER → NONE` |
| 미완료·미검증·한계가 공개되었다 | 충족 | 아래 최종 보고 |

### 최종 보고

- 완료: 6개 Phase의 책임·입력·출력·종료 조건, State 매핑, 전환 계약, 회귀 규칙, terminal 규칙을 문서 시스템에 통합했다.
- 미완료: 없음.
- 미검증: 향후 AI가 모든 요청에서 규칙을 실제 준수하는지는 이번 문서 변경만으로 검증할 수 없다.
- 알려진 한계: 별도 프로그램을 사용하지 않으므로 Phase 생략이나 허위 기록을 기술적으로 차단할 수 없다.
- 후속 작업: 다음 요청부터 새 Manifest 템플릿과 Phase Transition 템플릿을 실제 운영 기준으로 사용한다.

## 상태 이력

| 일시 | 이전 상태 | 다음 상태 | 근거 |
| --- | --- | --- | --- |
| 2026-07-16 | 없음 | `REQUESTED` | 요청 접수와 Manifest 생성 |
| 2026-07-16 | `REQUESTED` | `CONTEXT_CONFIRMED` | 관련 문서 정독과 누락 확인 |
| 2026-07-16 | `CONTEXT_CONFIRMED` | `PLANNED` | 수용 기준, 영향, 위험, 테스트 계획 확정 |
| 2026-07-16 | `PLANNED` | `DEVELOPMENT_READY` | 구현 전 게이트 충족 |
| 2026-07-16 | `DEVELOPMENT_READY` | `IMPLEMENTED` | 계획된 Phase 문서 체계 구현 완료 |
| 2026-07-16 | `IMPLEMENTED` | `QA_COMPLETED` | TEST-01~05 통과, 실패·미실행 없음 |
| 2026-07-16 | `QA_COMPLETED` | `DEVELOPMENT_READY` | Self-Review에서 terminal Phase 종료 계약 누락 발견 |
| 2026-07-16 | `DEVELOPMENT_READY` | `IMPLEMENTED` | terminal Phase 종료 계약 보완 완료 |
| 2026-07-16 | `IMPLEMENTED` | `QA_COMPLETED` | 전체 회귀 검사와 terminal 규칙 검사 통과 |
| 2026-07-16 | `QA_COMPLETED` | `SELF_REVIEWED` | 최종 수용 기준, 반례, 잔여 위험 검토 완료 |
| 2026-07-16 | `SELF_REVIEWED` | `COMPLETED` | Reporter 최종 보고와 완료 게이트 확정, PT-010으로 Phase 종료 |

## 미해결 사항

현재 작업을 차단하는 미해결 사항은 없다.
