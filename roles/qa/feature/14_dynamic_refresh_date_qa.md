# 14. Dynamic Refresh Date QA

## 참조 문서

- `../../../Project_Context.md`
- `../../planning/feature/05_after_fifth_qa/18_dynamic_refresh_date_policy.md`
- `../../publishing/feature/05_after_fifth_qa/11_dynamic_refresh_date_visual_policy.md`
- `../../development/feature/05_after_fifth_qa/22_dynamic_fixture_date_implementation.md`

## QA 목적

MVP 화면과 API 응답이 `2026-07-09` 고정 날짜를 노출하지 않고, 시연 당일 기준 날짜로 보정되는지 검증한다.

## 체크표

| 체크 항목 | 확인 |
| --- | --- |
| 헤더 `마지막 갱신`이 오늘 날짜로 표시되는가 | [x] |
| frontend 기본 조회일이 오늘 날짜인가 | [x] |
| summary `generatedAt`이 오늘 날짜인가 | [x] |
| ingestion `lastReceivedAt/baseTime`이 오늘 날짜로 보정되는가 | [x] |
| issue `lastOccurredAt`이 오늘 날짜로 보정되는가 | [x] |
| pipeline step 날짜가 오늘 날짜로 보정되는가 | [x] |
| fixture 원본 JSON은 deterministic 기준일을 유지하는가 | [x] |
| typecheck/build/backend test가 통과하는가 | [x] |
