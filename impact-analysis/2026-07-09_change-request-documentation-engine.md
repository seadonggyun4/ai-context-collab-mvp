# Change Request Documentation Engine

## 변경 요약

사용자가 화면을 보고 수정사항을 요청하는 경우에도 즉시 코드 수정으로 들어가지 않고, planning / publishing / development / qa 영향 분류와 역할별 feature 문서 생성을 먼저 수행하도록 문서 엔진 규칙을 보강했다.

## 생성 문서

- `roles/planning/feature/04_after_fourth_qa/14_change_request_triage_policy.md`
- `roles/publishing/feature/04_after_fourth_qa/07_change_request_visual_policy.md`
- `roles/development/feature/04_after_fourth_qa/18_change_request_implementation_gate.md`
- `roles/qa/feature/10_change_request_traceability_qa.md`

## 영향 범위

| 영역 | 영향 |
| --- | --- |
| Project Context | 사용자 수정 요청도 QA cycle 기반 feature 생성 흐름을 타도록 규칙 보강 |
| Planning | 수정 요청의 사용자 흐름/정책 영향 분류 책임 명확화 |
| Publishing | UI/상태/레이아웃/접근성 영향 분류 책임 명확화 |
| Development | 구현 전 문서 산출 게이트 추가 |
| QA | 수정 요청 추적성 체크표 추가 |

## 후속 기준

이후 사용자가 “수정해줘”라고 요청하면 AI는 다음 순서로 진행한다.

1. 요청을 요약한다.
2. planning / publishing / development / qa 영향으로 분류한다.
3. 최신 QA cycle의 다음 순번 feature 문서를 생성한다.
4. 필요한 경우 QA 체크표와 impact-analysis를 갱신한다.
5. 그 다음 구현을 진행한다.
