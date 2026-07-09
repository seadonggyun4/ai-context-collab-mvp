# Remove Nonfunctional Global Controls

## 변경 요청

사용자가 화면 검수 중 다음 UI를 실제 기능이 없거나 중복되는 요소로 판단해 제거를 요청했다.

1. 기준일/APC/품목/입고·선별/상태 전역 필터 panel
2. 헤더 우측 현재 역할 selector, 역할 chip, 품질 이슈 버튼, Excel 다운로드 버튼

## 역할 영향

| 역할 | 영향 |
| --- | --- |
| Planning | 전역 컨트롤 제거, 기능 탭 내부 흐름 유지 |
| Publishing | 헤더와 상단 레이아웃 단순화 |
| Development | shell markup/import/CSS 제거 |
| QA | 제거 대상과 유지 대상 회귀 검증 |

## 생성 문서

- `roles/planning/feature/04_after_fourth_qa/16_remove_nonfunctional_global_controls.md`
- `roles/publishing/feature/04_after_fourth_qa/09_header_simplification_visual_policy.md`
- `roles/development/feature/04_after_fourth_qa/20_remove_nonfunctional_global_controls.md`
- `roles/qa/feature/12_global_controls_removal_qa.md`

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| Frontend typecheck | 통과 |
| Frontend production build | 통과 |
| Backend pytest | 통과, `19 passed` |
| 소스 기준 제거 대상 확인 | 통과 |

## QA 결과

- `roles/qa/qa-results/sixth_qa_check.md`
