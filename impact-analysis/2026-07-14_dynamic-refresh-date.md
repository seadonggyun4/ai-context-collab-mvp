# Dynamic Refresh Date

## 변경 요청

화면의 데이터 갱신일자가 `2026-07-09`로 하드코딩되어 있어 시연 시점과 어긋난다. 마지막 일자 또는 오늘 날짜 기준으로 자동 표시되도록 개선한다.

## 영향 범위

| 영역 | 영향 |
| --- | --- |
| Planning | 시연 날짜 기준으로 보정하는 정책 추가 |
| Publishing | 헤더 마지막 갱신 표시값은 기존 형식을 유지하되 동적으로 표시 |
| Development | frontend date util, API 기본 query, backend fixture date normalization 추가 |
| QA | 날짜 하드코딩 회귀 검증 추가 |

## 생성 문서

- `roles/planning/feature/05_after_fifth_qa/18_dynamic_refresh_date_policy.md`
- `roles/publishing/feature/05_after_fifth_qa/11_dynamic_refresh_date_visual_policy.md`
- `roles/development/feature/05_after_fifth_qa/22_dynamic_fixture_date_implementation.md`
- `roles/qa/feature/14_dynamic_refresh_date_qa.md`

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| Frontend typecheck | 통과 |
| Frontend production build | 통과 |
| Backend pytest | 통과, 16 passed |
| API 응답 날짜 확인 | `generatedAt`, `lastReceivedAt`, pipeline `startedAt` 모두 `2026-07-14` 기준 응답 확인 |
