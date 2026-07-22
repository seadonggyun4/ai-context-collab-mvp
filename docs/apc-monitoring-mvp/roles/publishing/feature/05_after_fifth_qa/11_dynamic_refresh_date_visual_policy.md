# 11. Dynamic Refresh Date Visual Policy

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 사용자 수정 요청 |
| QA Cycle | After fifth QA |
| 생성 근거 | 마지막 갱신일 하드코딩 제거 |
| 문서 상태 | Implemented |

## UI 정책

- 헤더의 `마지막 갱신`은 `YYYY-MM-DD HH:mm` 형식으로 유지한다.
- 날짜는 KST 기준으로 표시한다.
- 별도의 배지나 강조색을 추가하지 않고 기존 헤더 정보 밀도를 유지한다.
- `마지막 갱신`은 실제 저장 시간처럼 과장하지 않고, MVP fixture가 오늘 기준으로 보정된 표시값임을 문서에서만 설명한다.

## Acceptance Criteria

- [x] 헤더에서 `2026-07-09` 고정 노출이 사라진다.
- [x] 기존 typography, spacing, max-width, tab layout은 변하지 않는다.
- [x] 날짜 포맷은 기존 화면과 동일한 길이로 유지된다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/05_after_fifth_qa/18_dynamic_refresh_date_policy.md` | 오늘 기준 날짜 정책 | 충족 |
| Publishing | 현재 문서 | 헤더 날짜 표현 기준 | 충족 |
| Development | `../../../development/feature/05_after_fifth_qa/22_dynamic_fixture_date_implementation.md` | UI 날짜 util 적용 | 충족 |
| QA | `../../../qa/feature/14_dynamic_refresh_date_qa.md` | 시각 회귀 검증 | 연결 |
