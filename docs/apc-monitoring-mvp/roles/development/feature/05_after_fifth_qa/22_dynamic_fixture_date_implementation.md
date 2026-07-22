# 22. Dynamic Fixture Date Implementation

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 사용자 수정 요청 |
| QA Cycle | After fifth QA |
| 생성 근거 | frontend/API fixture 날짜가 `2026-07-09`로 고정됨 |
| 문서 상태 | Implemented |

## 구현 범위

- Frontend 기본 날짜 query를 KST 오늘 날짜로 변경한다.
- Header `마지막 갱신`을 KST 현재 시각으로 표시한다.
- Backend fixture repository에서 fixture 날짜를 KST 오늘 날짜로 runtime shift한다.
- Test는 고정 날짜 assert 대신 KST 오늘 날짜를 기준으로 검증한다.

## 구현 TASK

- [x] frontend date utility 생성
- [x] `monitoringApi` 기본 `startDate/endDate`를 오늘 날짜로 변경
- [x] `ApcDataManagementShell`의 hardcoded `shellGeneratedAt` 제거
- [x] repository fixture load 시 날짜 문자열 runtime 보정
- [x] backend test 갱신
- [x] typecheck/build/pytest 검증

## 비범위

- 과거 QA 결과 문서나 impact-analysis 작성일은 변경하지 않는다.
- fixture 원본 JSON의 기준일은 deterministic sample 기준으로 유지한다.
- 실제 운영 DB 연동은 포함하지 않는다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/05_after_fifth_qa/18_dynamic_refresh_date_policy.md` | 날짜 정책 확정 | 충족 |
| Publishing | `../../../publishing/feature/05_after_fifth_qa/11_dynamic_refresh_date_visual_policy.md` | 헤더 표시 기준 | 충족 |
| Development | 현재 문서 | frontend/backend 날짜 보정 구현 | 충족 |
| QA | `../../../qa/feature/14_dynamic_refresh_date_qa.md` | 회귀 검증 기준 | 연결 |
