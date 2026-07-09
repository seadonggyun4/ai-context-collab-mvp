# Change Request Triage Policy

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 네 번째 QA 이후 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/fourth_qa_check.md` |
| 생성 근거 | 사용자 수정 요청 시 문서 산출 및 히스토리 추적 누락 방지 |
| 문서 상태 | Follow-up scope |

## 목적

사용자가 화면을 보고 수정사항을 요청하면, AI는 즉시 코드 수정으로 들어가지 않고 먼저 수정 요청을 기획 관점에서 분류한다.

기획 문서는 다음 질문에 답해야 한다.

- 이 수정은 사용자 흐름을 바꾸는가?
- 메뉴, 탭, 필터, 상세 진입, CTA, 경고, 문구 정책을 바꾸는가?
- 기존 Planning feature의 완료 기준을 변경하는가?
- QA에서 재검증해야 할 사용자 행동이 생기는가?

## 분류 기준

| 수정 유형 | Planning feature 생성 필요 여부 |
| --- | --- |
| 메뉴/탭/화면 흐름 변경 | 필요 |
| 버튼, CTA, 필터, 선택 흐름 변경 | 필요 |
| 상태 문구, 경고 문구, empty/error 문구 변경 | 필요 |
| 권한별 사용자 행동 변경 | 필요 |
| 단순 오탈자 수정 | 영향 범위 판단 후 필요 시 생성 |
| 내부 구현만 변경되고 사용자 행동이 불변 | Development feature로 넘기되 Planning 영향 없음으로 기록 |

## 산출 규칙

사용자 수정 요청이 들어오면 AI는 현재 최신 cycle 다음 또는 현재 진행 cycle에 다음 순번 planning feature를 생성한다.

현재 기준 다음 생성 위치:

```text
roles/planning/feature/04_after_fourth_qa/
```

문서명은 다음 형식을 따른다.

```text
{next_number}_{short_change_request_name}.md
```

## Planning 완료 기준

- 사용자 요청 원문 또는 요약이 기록되어 있다.
- 화면/업무 흐름 영향 여부가 기록되어 있다.
- Publishing으로 넘겨야 할 UI 조건이 명시되어 있다.
- Development가 구현해야 할 행동 기준이 acceptance criteria로 정리되어 있다.
- QA가 검증해야 할 시나리오가 연결되어 있다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | 현재 문서 | 수정 요청의 사용자 흐름 영향 분류 | 충족 |
| Publishing | `roles/publishing/feature/04_after_fourth_qa/07_change_request_visual_policy.md` | UI/상태/레이아웃 영향 분류 | 연결 필요 |
| Development | `roles/development/feature/04_after_fourth_qa/18_change_request_implementation_gate.md` | 구현 전 문서 게이트 적용 | 연결 필요 |
| QA | `roles/qa/feature/10_change_request_traceability_qa.md` | 수정 요청별 문서/구현/검증 추적 | 연결 필요 |
