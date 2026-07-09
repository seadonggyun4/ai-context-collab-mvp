# Remove Mock Write Features

## 변경 요청

운영 조치 내역은 DB가 있어야 자연스러운 기능인데, 현재 MVP는 fixture/process memory 기반으로만 동작한다. 문서 기반 AI 엔진 시범 목적에는 반쪽짜리 write/settings 기능이 불필요하므로 유사 기능을 제거한다.

## 확인 결과

- `POST /api/monitoring/issues/{issue_id}/actions`: process memory append
- `PUT /api/monitoring/rules/{rule_id}`: process memory update
- `GET /api/monitoring/actions`, `GET /api/monitoring/rules`: fixture 조회

## 영향 범위

| 영역 | 영향 |
| --- | --- |
| Planning | MVP 메뉴를 읽기 중심으로 축소 |
| Publishing | write/settings UI 제거 |
| Development | frontend tabs/pages/API client와 backend endpoints/tests 제거 |
| QA | mock write 제거 및 읽기 기능 회귀 검증 |

## 생성 문서

- `roles/planning/feature/04_after_fourth_qa/17_reduce_mock_write_features.md`
- `roles/publishing/feature/04_after_fourth_qa/10_read_only_monitoring_visual_policy.md`
- `roles/development/feature/04_after_fourth_qa/21_remove_mock_write_features.md`
- `roles/qa/feature/13_mock_write_feature_removal_qa.md`
- `roles/qa/qa-results/seventh_qa_check.md`

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| Frontend typecheck | 통과 |
| Frontend production build | 통과 |
| Backend pytest | 통과, 16 passed |
| API contract 확인 | action/rule write endpoint 제거 확인 |
