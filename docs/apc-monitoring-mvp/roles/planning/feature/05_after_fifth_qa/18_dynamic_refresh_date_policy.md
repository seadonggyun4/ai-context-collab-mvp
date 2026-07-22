# 18. Dynamic Refresh Date Policy

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 사용자 수정 요청 |
| QA Cycle | After fifth QA |
| 생성 근거 | 화면의 마지막 갱신일과 조회 기준일이 `2026-07-09`로 고정되어 시연 시점과 어긋남 |
| 문서 상태 | Implemented |

## 기획 결정

MVP는 실제 운영 DB에 연결하지 않지만, 시연 화면의 날짜는 현재 시연일 기준으로 표시되어야 한다.

운영자가 보는 `마지막 갱신`, 수신 현황 조회 기준일, 품질 이슈 조회 기준일은 고정 fixture 생성일이 아니라 오늘 날짜를 기준으로 한다.

## 정책

- 헤더의 `마지막 갱신`은 화면 렌더링 시점의 KST 날짜/시간으로 표시한다.
- API 응답의 fixture 날짜는 원본 fixture 기준일과 오늘 사이의 차이만큼 보정한다.
- 시간대는 서비스 맥락에 맞춰 `Asia/Seoul` 기준으로 고정한다.
- 날짜 보정은 fixture 데이터를 직접 수정하지 않고 runtime adapter에서 수행한다.
- 문서 이력에 남는 과거 QA/impact-analysis 작성일은 히스토리이므로 보정 대상이 아니다.

## Acceptance Criteria

- [x] 화면 헤더가 `2026-07-09` 고정값을 표시하지 않는다.
- [x] 수신/품질 이슈 API 기본 조회일이 오늘 날짜를 사용한다.
- [x] FastAPI 응답의 `generatedAt`, `lastReceivedAt`, `lastOccurredAt`, pipeline step 날짜가 오늘 기준으로 보정된다.
- [x] fixture 원본 파일은 deterministic sample data로 유지한다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | 현재 문서 | 오늘 기준 날짜 정책 확정 | 충족 |
| Publishing | `../../../publishing/feature/05_after_fifth_qa/11_dynamic_refresh_date_visual_policy.md` | 헤더 표현 정책 | 충족 |
| Development | `../../../development/feature/05_after_fifth_qa/22_dynamic_fixture_date_implementation.md` | 날짜 보정 구현 | 충족 |
| QA | `../../../qa/feature/14_dynamic_refresh_date_qa.md` | 회귀 검증 기준 | 연결 |
