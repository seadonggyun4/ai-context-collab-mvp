# Remove Flow Rail And Scope Matrix Filter

## 변경 요청

사용자가 배포 화면 검수 중 다음 UX 문제를 지적했다.

1. 상단 탭이 이미 있는데 `JADX 메뉴 흐름 시나리오` 영역이 중복 UI로 보인다.
2. `Matrix 선택 조건`이 모든 탭 상단에 노출되는 것은 불필요하며, 수신 현황 탭에서만 selectbox로 조건을 선택하는 것이 더 적합하다.

## 역할 영향

| 역할 | 영향 |
| --- | --- |
| Planning | 탭을 주 내비게이션으로 고정하고 중복 flow UI 제거, Matrix 조건은 수신 현황 전용으로 제한 |
| Publishing | flow rail 제거, selectbox 기반 필터 control bar 정의 |
| Development | shell render 제거, 수신 현황 전용 filter state/API query 구현 |
| QA | 중복 UI 제거와 수신 현황 필터 동작 회귀 검증 |

## 생성 문서

- `roles/planning/feature/04_after_fourth_qa/15_remove_redundant_flow_and_scope_matrix_filters.md`
- `roles/publishing/feature/04_after_fourth_qa/08_matrix_filter_visual_policy.md`
- `roles/development/feature/04_after_fourth_qa/19_remove_flow_rail_and_matrix_filter_controls.md`
- `roles/qa/feature/11_matrix_filter_scope_qa.md`

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| Frontend typecheck | 통과 |
| Frontend production build | 통과 |
| Backend pytest | 통과, `19 passed` |
| 소스 기준 중복 UI 제거 확인 | 통과 |

## QA 결과

- `roles/qa/qa-results/fifth_qa_check.md`
