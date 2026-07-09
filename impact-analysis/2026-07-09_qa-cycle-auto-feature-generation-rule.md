# QA Cycle 자동 Feature 생성 규칙 보강 영향 분석

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 생성 일자 | 2026-07-09 |
| 변경 유형 | Documentation engine rule update |
| 참조 QA | `roles/qa/qa-results/third_qa_check.md` |
| 영향 범위 | Project Context, Feature Workflow, role feature directories |

## 변경 배경

세 번째 QA 결과에서 QA3-001이 남았지만, 기존 문서 판단은 `03_after_third_qa/` feature를 생성하지 않고 이전 cycle의 development feature를 계속 참조하도록 되어 있었다.

이는 QA가 늘어날 때마다 각 역할의 최신 cycle 디렉토리에 feature가 자동 생성되어야 한다는 협업 엔진 목적과 충돌한다.

## 변경 내용

- `Project_Context.md`에 QA cycle 자동 생성 규칙을 명시했다.
- `roles/Feature_Workflow.md`에 실패/부분 통과/정책 확정 후 구현 대기/carry-forward 항목의 자동 feature 생성 규칙을 추가했다.
- `roles/planning/feature/03_after_third_qa/`를 생성했다.
- `roles/publishing/feature/03_after_third_qa/`를 생성했다.
- `roles/development/feature/03_after_third_qa/`를 생성했다.
- `third_qa_check.md`의 후속 문서 링크를 최신 cycle feature로 갱신했다.

## 생성된 Feature

| 역할 | Feature |
| --- | --- |
| Planning | `roles/planning/feature/03_after_third_qa/13_operation_action_entry_handoff_policy.md` |
| Publishing | `roles/publishing/feature/03_after_third_qa/06_operation_action_entry_visual_followup.md` |
| Development | `roles/development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md` |

## 이후 동작 규칙

새 QA 결과가 생성되면 AI는 다음을 자동으로 수행해야 한다.

1. QA 결과 문서 작성
2. 해당 QA cycle의 role feature 디렉토리 생성
3. 미완료 항목을 역할별 feature로 생성 또는 carry-forward
4. QA 결과 문서의 후속 링크를 최신 cycle feature로 갱신
5. impact-analysis와 Project Context 변경 이력 갱신

## 기대 효과

- 각 역할 담당자는 최신 QA cycle 디렉토리만 확인해도 현재 남은 일을 알 수 있다.
- 이전 cycle 문서는 히스토리로 남고, 최신 cycle 문서는 작업 진입점이 된다.
- QA가 반복될수록 문서가 흩어지지 않고 역할별/cycle별로 자동 정렬된다.
