# 11. 품질 이슈 상세 Coverage 개발 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | First QA open issue / partial-pass result |
| 문서 상태 | Implemented |


## 발생 출처

- QA 결과: `../../../qa/qa-results/first_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/03_quality_issues_qa.md`
- 원인 ID: `QA-005`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/01_after_first_qa/11_quality_issue_detail_policy.md` | sample row 표시 범위, 이슈 유형, 마스킹 정책 확정 | 충족 |
| Publishing | `../../../publishing/feature/01_after_first_qa/04_quality_issue_detail_visual_policy.md` | drawer/table/overflow/badge 표현 기준 확정 | 충족 |
| Development | 현재 문서 | sample row table, issue type filter/grouping, masking 구현 | 충족 |
| QA | `../../../qa/feature/03_quality_issues_qa.md` | 모든 이슈 유형과 sample row 표시 재검증 | 부분 재검증 완료 |

## 원인

fixture에는 `sampleRows`와 여러 이슈 타입이 존재하지만, UI는 이슈 요약/영향/조치 안내와 상태 변경 흐름을 우선했다.

sample row table, issue type별 grouping/filter, 전체 이슈 유형 노출은 Phase 6의 화면 밀도 조정 범위에서 제외되었다.

## 영향 범위

| 파트 | 영향 |
| --- | --- |
| Planning | sample row 표시 범위와 민감 정보 마스킹 정책 필요 |
| Publishing | 상세 drawer/table 밀도와 overflow 스타일 확인 필요 |
| Development | sample row table, issue type filter/grouping 구현 필요 |
| QA | 모든 이슈 유형과 sample row 표시 재검증 필요 |

## 구현 TASK

- [x] 이슈 상세에 `sampleRows` table 추가
- [x] planning 마스킹 정책과 publishing table overflow 기준 적용
- [x] issue type filter 추가
- [x] issue type별 summary count 추가
- [x] 심각도/상태 badge 스타일 강화

## 구현 결과

| 항목 | 반영 내용 |
| --- | --- |
| 구현 일자 | 2026-07-09 |
| 대상 화면 | `projects/apc-monitoring-mvp/frontend/src/features/monitoring/pages/QualityIssuesPage.tsx` |
| 스타일 기준 | `projects/apc-monitoring-mvp/frontend/src/shared/styles/global.css` |
| Fixture | `projects/apc-monitoring-mvp/shared/fixtures/monitoring_fixture.json`에 MVP 기준 6개 이슈 유형 보강 |
| API 계약 테스트 | `projects/apc-monitoring-mvp/api/tests/test_monitoring_api.py`에 전체 이슈 유형 coverage 테스트 추가 |
| sample row | 상세 영역에서 rowId와 동적 컬럼 table 표시 |
| 마스킹 | 농가명, 담당자명 등 식별 가능 field는 화면 표시 단계에서 부분 마스킹 |
| issue type filter | 전체/유형별 segmented control과 count 표시 |
| badge | 상태/심각도 모두 텍스트 badge로 표시 |

## QA 재검증 메모

- QA-005는 두 번째 QA 문서에서 부분 재검증 대상으로 기록한다.
- 브라우저 시각 검증은 별도 QA 실행 시 drawer/table overflow를 확인한다.

## 완료 기준

- 이슈 상세에서 샘플 row를 확인할 수 있다.
- fixture에 있는 이슈 유형이 화면에서 누락되지 않는다.
