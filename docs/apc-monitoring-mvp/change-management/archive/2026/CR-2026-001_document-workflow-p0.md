# CR-2026-001 문서 기반 P0 작업 절차 도입

## 1. 변경 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-001` |
| 현재 상태 | `COMPLETED` |
| 요청일 | `2026-07-16` |
| 최종 갱신일 | `2026-07-16` |
| 요청자 | 사용자 |
| 수행 주체 | 단일 AI 에이전트 |
| 위험도 | 낮음 |
| 관련 QA Cycle | 기존 앱 QA Cycle과 독립적인 문서 시스템 개선 |

## 2. 요청 정의

### 요청 원문

> P0 — 문서 기반 작업 절차를 기준으로 문서 시스템을 정독한 후 확장성과 유지보수성이 높도록 철저하게 개선한다.

### 합의된 요청 요약

- 한 문장 요약: 기존 역할별 문서 체계를 유지하면서 변경 요청별 상태·근거·영향·검증·완료를 관리하는 문서 워크플로를 도입한다.
- 요청 목적: AI가 기준 문서 확인과 계획 없이 구현하거나, 증거 없이 완료를 선언하는 문제를 줄인다.
- 포함 범위: Change Manifest 템플릿, 상태 전환 규칙, 영향 분석, 테스트 증거, 실제 변경 비교, 완료 게이트, 기존 문서 연결.
- 제외 범위: CLI, Validator, 자동 상태 머신, 외부 플랫폼, 복수 에이전트, 서버·DB, 코드 기반 권한 통제.

### 수용 기준

| ID | 검증 가능한 완료 조건 | 검증 방법 | 상태 |
| --- | --- | --- | --- |
| AC-01 | 모든 신규 변경 요청이 사용할 공통 Manifest 템플릿이 존재한다 | 템플릿 섹션 정적 검토 | 충족 |
| AC-02 | 8단계 상태별 의미·진입 조건·산출물이 정의되어 있다 | 워크플로 표 검토 | 충족 |
| AC-03 | 구현 전 예상 영향과 테스트 계획을 기록할 수 있다 | 템플릿 섹션 검토 | 충족 |
| AC-04 | 구현 후 실제 변경과 계획 차이를 기록할 수 있다 | 템플릿 섹션 검토 | 충족 |
| AC-05 | 실행 결과·증거·미실행 항목을 구분한다 | 증거 상태 용어와 템플릿 검토 | 충족 |
| AC-06 | 완료 조건을 충족하기 전 완료 선언을 금지한다 | 완료 게이트와 상태 규칙 검토 | 충족 |
| AC-07 | 기존 Project Context, Role Feature, QA, Impact Analysis와 연결된다 | 상호 링크와 역할 경계 검토 | 충족 |
| AC-08 | 별도 프로그램이나 외부 플랫폼을 요구하지 않는다 | 생성·수정 파일과 규칙 검토 | 충족 |

## 3. Context Snapshot

### 적용 기준 문서

| 우선순위 | 문서 | 적용 범위 | 확인 결과 |
| --- | --- | --- | --- |
| 1 | `docs/organization-standards/*.md` | 역할별 문서 작성과 QA 원칙 | 확인 완료 |
| 2 | `Project_Context.md` | SSOT, 역할 구조, 사용자 수정 요청 처리 | 확인 완료 |
| 3 | `roles/Feature_Workflow.md` | 역할별 Feature 순서와 Development Ready | 확인 완료 |
| 4 | `impact-analysis/Impact_Analysis_Guide.md` | 변경 영향 기록 항목 | 확인 완료 |
| 5 | `roles/qa/QA.md` 및 QA Feature/Results | 기존 검증 구조 | 확인 완료 |

### 관련 역할·Feature·QA 문서

| 구분 | 문서 | 이번 변경과의 관계 |
| --- | --- | --- |
| Planning | `roles/planning/Planning.md` | 기존 기획 기준 유지 |
| Publishing | `roles/publishing/Publishing.md` | 기존 퍼블리싱 기준 유지 |
| Development | `roles/development/feature/04_after_fourth_qa/18_change_request_implementation_gate.md` | 구현 전 게이트를 Manifest로 확장 |
| QA | `roles/qa/feature/10_change_request_traceability_qa.md` | 변경 요청 추적성 검증의 기존 기준 |
| Impact Analysis | `impact-analysis/2026-07-09_change-request-documentation-engine.md` | 기존 문서 엔진 도입 이력 |

### 확인된 제약과 용어

- 제약: 단일 AI, 문서 규칙만 사용, 자동 강제 없음.
- 용어: Change Manifest는 기준 문서가 아니라 요청 전체를 연결하는 제어 문서다.
- 충돌 여부: 없음.
- 충돌 상세: 기존 QA Cycle은 역할별 후속 작업을 분류하고, 새 상태 모델은 개별 요청 전체의 진행 상태를 관리하므로 책임이 겹치지 않는다.

## 4. 영향 분석과 계획

### 역할별 영향

| 영역 | 영향 여부 | 변경 내용 또는 영향 없음의 근거 | 필요한 산출물 |
| --- | --- | --- | --- |
| Planning | 간접 영향 | 기획 산출물 형식은 유지하고 Manifest에서 참조 | 별도 Feature 불필요 |
| Publishing | 영향 없음 | UI와 시각 기준 변경이 없음 | 없음 |
| Development | 간접 영향 | 구현 착수 전에 Manifest의 Development Ready 확인 추가 | 워크플로 연결 |
| QA | 영향 있음 | 실행 증거 상태와 미실행 항목 기록 원칙 추가 | QA 표준 갱신 |
| Documentation | 영향 있음 | 변경 관리 디렉토리와 기존 진입 문서 연결 | 규칙·템플릿·Impact Analysis |

### 예상 변경 범위

| 예상 파일 또는 디렉토리 | 변경 목적 | 변경 유형 |
| --- | --- | --- |
| `change-management/` | 워크플로, 템플릿, 활성·보관 구조 | 생성 |
| `README.md` | 신규 문서 시스템 진입점 안내 | 수정 |
| `Project_Context.md` | SSOT와 변경 관리 연결 | 수정 |
| `roles/Feature_Workflow.md` | 요청 상태와 역할 Feature 경계 정의 | 수정 |
| `docs/organization-standards/qa-standards.md` | 증거·미실행·재검증 원칙 추가 | 수정 |
| `impact-analysis/Impact_Analysis_Guide.md` | Change ID와 예상·실제 비교 연결 | 수정 |
| `impact-analysis/2026-07-16_document-workflow-p0.md` | 이번 변경의 영향 기록 | 생성 |

### 위험과 대응

| 위험 | 가능성 | 영향 | 대응 또는 확인 방법 |
| --- | --- | --- | --- |
| 기존 Feature Workflow와 책임 중복 | 중간 | 문서가 늘고 진입점이 불명확해짐 | Manifest는 요청 제어, Feature는 역할 상세로 경계 명시 |
| 형식이 과도하게 복잡함 | 중간 | 작은 변경의 문서 부담 증가 | 해당 없음 근거 허용, 섹션은 하나의 템플릿에 통합 |
| 수동 상태가 실제 작업과 불일치 | 중간 | 근거 없는 완료 선언 | 상태 이력, Exit 조건, Self-Review, 완료 게이트를 동일 문서에서 대조 |
| 자동 강제가 없으므로 규칙 우회 가능 | 높음 | 절차 누락 | README와 Project Context에서 신규 요청의 필수 진입점으로 명시 |

### 구현 계획

1. 기존 SSOT, Role Feature, QA, Impact Analysis 구조와 책임을 정리한다.
2. Change Manifest의 디렉토리, 상태 모델, 전환·증거·완료 규칙을 정의한다.
3. 재사용 가능한 템플릿을 작성한다.
4. 기존 최상위 문서와 역할 워크플로에 진입점과 책임 경계를 연결한다.
5. 이번 요청을 첫 Manifest로 기록해 누락과 중복을 자체 검토한다.

### 테스트 계획

| ID | 검증 대상 | 방법 또는 명령 | 성공 기준 | 필수 여부 |
| --- | --- | --- | --- | --- |
| TEST-01 | 필수 상태명 일치 | 저장소 전체 상태명 검색 | 8단계 순서와 철자가 일치 | 필수 |
| TEST-02 | 문서 링크 유효성 | Markdown inline link와 backtick 경로를 파일 시스템에서 확인 | 내부 참조 경로 누락 없음 | 필수 |
| TEST-03 | 템플릿 완전성 | 요청 P0 항목과 템플릿 섹션 대조 | 모든 항목에 기록 위치 존재 | 필수 |
| TEST-04 | 기존 구조와 비충돌 | Project Context, Feature Workflow, QA/Impact 규칙 교차 검토 | 책임 경계와 우선순위 모순 없음 | 필수 |
| TEST-05 | 코드 구현 미포함 | 변경 파일 목록 검토 | 문서 파일만 변경 | 필수 |

## 5. Development Ready Gate

| 확인 항목 | 상태 | 근거 |
| --- | --- | --- |
| 요청과 제외 범위가 명확하다 | 충족 | 요청 정의에 문서 기반 범위와 코드 구현 제외 명시 |
| 활성 기준 문서를 확인했다 | 충족 | Context Snapshot의 적용 문서 정독 |
| 역할별 영향 판단을 기록했다 | 충족 | 역할별 영향 표 작성 |
| 필요한 역할별 문서를 연결했다 | 충족 | 기존 Feature/QA 문서 참조, 별도 앱 Feature 불필요 판단 |
| 예상 변경 범위와 위험을 기록했다 | 충족 | 예상 변경 범위와 위험 표 작성 |
| 테스트 계획과 완료 조건을 기록했다 | 충족 | TEST-01~05 및 AC-01~08 정의 |
| 사용자 확인이 필요한 blocker가 없다 | 충족 | 요청 범위가 명시적이며 기존 기준과 충돌 없음 |

## 6. 구현 기록

### 실제 변경 파일

| 실제 변경 파일 | 변경 요약 | 계획 여부 |
| --- | --- | --- |
| `change-management/README.md` | 상태 모델, 전환 규칙, 단일 AI 절차, 증거·완료 게이트 | 계획됨 |
| `change-management/templates/change-manifest-template.md` | 재사용 가능한 변경 요청 템플릿 | 계획됨 |
| `change-management/active/README.md` | 활성 요청 관리 규칙 | 계획됨 |
| `change-management/archive/README.md` | 완료·취소 요청 보관 규칙 | 계획됨 |
| `change-management/archive/2026/CR-2026-001_document-workflow-p0.md` | 이번 변경의 실제 적용 기록 | 계획됨 |
| `README.md` | 최상위 문서 진입점 추가 | 계획됨 |
| `Project_Context.md` | SSOT와 상태 워크플로 연결 | 계획됨 |
| `roles/Feature_Workflow.md` | 요청 제어와 역할 산출물 경계 연결 | 계획됨 |
| `docs/organization-standards/qa-standards.md` | 증거 상태와 재검증 원칙 추가 | 계획됨 |
| `impact-analysis/Impact_Analysis_Guide.md` | Change ID와 예상·실제 비교 항목 추가 | 계획됨 |
| `impact-analysis/2026-07-16_document-workflow-p0.md` | 변경 영향 기록 | 계획됨 |

### 계획 대비 차이

- 예상했지만 변경하지 않은 파일: 없음.
- 계획에 없었지만 변경한 파일: 없음.
- 차이의 원인과 영향: 차이 없음.
- 계획 또는 테스트 수정 여부: 없음.

## 7. QA 실행 증거

| Test ID | 대상 | 실행 방법 또는 명령 | 결과 상태 | 결과 요약 | 증거 위치 | 미검증 범위 |
| --- | --- | --- | --- | --- | --- | --- |
| TEST-01 | 상태명 | `rg`로 8단계 전체 순서와 상태별 정의 검색 | `PASSED` | Project Context의 순서와 워크플로의 상태 정의가 일치 | `Project_Context.md`, `change-management/README.md` | 없음 |
| TEST-02 | 내부 참조 | Manifest와 갱신 문서의 참조 대상에 `test -e` 수행 | `PASSED` | 검사한 내부 파일·디렉토리 모두 존재 | 명령 실행 결과 exit 0 | 동적 예시 경로는 생성 전 형식이므로 제외 |
| TEST-03 | 템플릿 | 필수 섹션 제목을 `rg`로 검색하고 AC-01~08과 대조 | `PASSED` | 요청, Context, 계획, 게이트, 실제 변경, QA, Self-Review, 완료, 이력, 미해결 섹션 존재 | `change-management/templates/change-manifest-template.md` | 없음 |
| TEST-04 | 문서 일관성 | 최상위 진입 문서와 역할·QA·Impact 규칙의 diff 교차 검토 | `PASSED` | Manifest는 요청 제어, 기존 문서는 역할별 상세와 증거라는 책임 경계가 일치 | `README.md`, `Project_Context.md`, `roles/Feature_Workflow.md` | 자동 의미 검증은 없음 |
| TEST-05 | 변경 범위 | `git status --short`, `find change-management`, `git diff --check` | `PASSED` | 문서 파일만 변경되었고 whitespace 오류 없음 | 명령 실행 결과 exit 0 | 없음 |

### 실패와 미실행 항목

- 실패: 없음.
- 미실행: 없음.
- 사용자 수용이 필요한 사항: 없음.

## 8. Self-Review

| 질문 | 판정 | 근거 |
| --- | --- | --- |
| 원 요청의 모든 조건이 구현되었는가 | 충족 | P0의 7개 절차와 8단계 상태를 규칙·템플릿에 모두 반영 |
| 실제 변경이 계획 범위를 벗어났는가 | 아니오 | 실제 변경 파일이 예상 목록과 일치 |
| 변경하지 말아야 할 동작이나 기준이 바뀌었는가 | 아니오 | 앱 코드와 역할별 제품 기준은 변경하지 않음 |
| 테스트 결과가 현재 변경 상태를 검증하는가 | 예 | 최종 문서 변경 후 상태명, 참조, 섹션, diff를 검사 |
| 실행하지 않은 검증이 명시되어 있는가 | 예 | 자동 의미 검증이 없다는 한계를 TEST-04에 명시 |
| 성공 판정을 반박하는 증거나 반례가 없는가 | 예 | 기존 Feature Workflow 중복 위험을 검토하고 책임을 분리 |
| 사용자 판단이 필요한 사항이 남아 있는가 | 아니오 | 요청 범위가 명확하고 코드·외부 시스템을 포함하지 않음 |
| 관련 문서 링크와 상태가 서로 일치하는가 | 예 | 참조 대상 존재 확인 및 진입 문서 교차 검토 완료 |

### 반례 검토

- 가장 가능성 높은 실패 시나리오: AI가 작은 요청이라는 이유로 Manifest 생성을 생략하거나 기존 Feature Workflow와 중복 작성한다.
- 확인 방법: README, Project Context, Feature Workflow에서 신규 요청의 첫 진입점과 문서별 책임을 비교했다.
- 결과: 세 문서 모두 Manifest를 첫 진입점으로 지정하고, Manifest는 요청 전체 제어, Feature는 역할별 상세로 구분한다.

### 잔여 위험과 한계

- 잔여 위험: 문서 규칙이므로 단일 AI 또는 사용자가 절차를 의도적으로 생략하는 것을 기술적으로 차단하지 못한다.
- 검증 한계: 문서 의미와 준수 여부를 자동 검사하지 않는다.
- 후속 권장 사항: 실제 변경 요청에서 템플릿을 반복 사용하며 과도하거나 누락된 필드를 문서 규칙으로 조정한다.

## 9. 완료 판정

| 완료 조건 | 상태 | 근거 |
| --- | --- | --- |
| 모든 수용 기준에 판정과 근거가 있다 | 충족 | AC-01~08 모두 충족 |
| 기준 문서와 결과 사이에 알려진 충돌이 없다 | 충족 | 책임 경계 교차 검토 완료 |
| 계획 대비 실제 변경 차이를 설명했다 | 충족 | 차이 없음 기록 |
| 모든 테스트 계획에 실행 상태가 있다 | 충족 | TEST-01~05 모두 `PASSED` |
| 실패·미실행·한계를 공개했다 | 충족 | 실패·미실행 없음, 수동 규칙 한계 명시 |
| Self-Review를 완료했다 | 충족 | 8개 질문과 반례 검토 완료 |
| 관련 문서 링크와 상태가 일치한다 | 충족 | 경로 존재 검사 통과 |

### 최종 결과

- 완료 요약: 변경 요청 단위의 문서 상태, 영향, 증거, 자체 검토, 완료 게이트를 기존 역할별 문서 시스템에 연결했다.
- 미완료 또는 제외 항목: 자동 검증, CLI, 외부 플랫폼, 복수 에이전트는 요청에 따라 제외했다.
- 후속 작업: 다음 변경 요청부터 새 템플릿을 사용하며 운영 피드백을 축적한다.

## 10. 상태 이력

| 일시 | 이전 상태 | 다음 상태 | 전환 근거 |
| --- | --- | --- | --- |
| 2026-07-16 09:12 KST | 없음 | `REQUESTED` | 사용자 요청 접수 및 기존 문서 조사 시작 |
| 2026-07-16 09:16 KST | `REQUESTED` | `CONTEXT_CONFIRMED` | Project Context, 역할 문서, 표준, QA, Impact Analysis 정독 및 충돌 없음 확인 |
| 2026-07-16 09:17 KST | `CONTEXT_CONFIRMED` | `PLANNED` | 역할 영향, 예상 파일, 위험, 수용 기준, 테스트 계획 확정 |
| 2026-07-16 09:18 KST | `PLANNED` | `DEVELOPMENT_READY` | 문서 전용 범위와 기존 체계 연결 방식 확정, blocker 없음 |
| 2026-07-16 09:19 KST | `DEVELOPMENT_READY` | `IMPLEMENTED` | 워크플로·템플릿 생성 및 기존 진입 문서 연결 완료 |
| 2026-07-16 09:20 KST | `IMPLEMENTED` | `QA_COMPLETED` | TEST-01~05 실행 및 모두 통과 |
| 2026-07-16 09:20 KST | `QA_COMPLETED` | `SELF_REVIEWED` | 원 요청 재대조, 반례와 잔여 위험 검토 완료 |
| 2026-07-16 09:20 KST | `SELF_REVIEWED` | `COMPLETED` | AC-01~08 및 완료 게이트 전 항목 충족 |

## 11. 미해결 사항

현재 작업을 차단하는 미해결 사항은 없다.
