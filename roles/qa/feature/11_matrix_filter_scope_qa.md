# Matrix Filter Scope QA

## 참조 문서

- `../../../Project_Context.md`
- `../../Feature_Workflow.md`
- `../../planning/feature/04_after_fourth_qa/15_remove_redundant_flow_and_scope_matrix_filters.md`
- `../../publishing/feature/04_after_fourth_qa/08_matrix_filter_visual_policy.md`
- `../../development/feature/04_after_fourth_qa/19_remove_flow_rail_and_matrix_filter_controls.md`

## QA 목적

중복 flow UI가 제거되고 Matrix 선택 조건이 수신 현황 탭에서만 selectbox로 동작하는지 검증한다.

## 체크표

| 체크 항목 | 확인 |
| --- | --- |
| `JADX 메뉴 흐름 시나리오` 영역이 화면에서 제거되었는가 | [ ] |
| 상단 탭이 유일한 APC 데이터 관리 내비게이션으로 유지되는가 | [ ] |
| Matrix 선택 조건이 모든 탭 상단에 반복 노출되지 않는가 | [ ] |
| Matrix 선택 조건이 수신 현황 탭 내부에서만 보이는가 | [ ] |
| 수신 현황 조건이 chip이 아닌 selectbox로 조정 가능한가 | [ ] |
| Matrix cell 선택 시 수신 현황 selectbox 초기값이 맞게 세팅되는가 | [ ] |
| selectbox 변경 시 수신 현황 목록이 갱신되는가 | [ ] |
| 조건 초기화 후 전체 목록으로 복귀하는가 | [ ] |
| 품질 이슈/기준 설정 탭의 기존 상세 흐름이 깨지지 않는가 | [ ] |

## 실패 시 후속 처리

실패 항목은 다음 QA cycle의 planning/publishing/development feature로 이월한다.
