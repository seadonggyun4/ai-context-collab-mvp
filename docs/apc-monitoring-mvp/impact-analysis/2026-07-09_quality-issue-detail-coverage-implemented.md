# Quality Issue Detail Coverage Implemented

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 생성 일자 | 2026-07-09 |
| 변경 유형 | QA follow-up implementation |
| 연결 QA ID | QA-005 |
| 연결 개발 문서 | `../roles/development/feature/01_after_first_qa/11_quality_issue_detail_coverage.md` |
| 연결 기획 문서 | `../roles/planning/feature/01_after_first_qa/11_quality_issue_detail_policy.md` |
| 연결 퍼블리싱 문서 | `../roles/publishing/feature/01_after_first_qa/04_quality_issue_detail_visual_policy.md` |

## 변경 배경

첫 번째 QA에서 품질 이슈 상세 화면이 요약/조치 중심으로만 구성되어,
운영자가 실제 영향을 받은 샘플 row를 확인하기 어렵다는 문제가 확인되었다.

또한 MVP fixture에 일부 이슈 유형만 존재해 `Planning.md`에서 정의한 품질 이슈 유형이
화면에서 모두 검증되지 않는 문제가 있었다.

## 구현 요약

| 영역 | 변경 내용 |
| --- | --- |
| Frontend | 품질 이슈 유형 필터, 유형별 count, 상태/심각도 badge, sample row table, 민감 field 마스킹 추가 |
| Styling | segmented filter, badge, sample row table overflow, empty state 스타일 추가 |
| Fixture | REQUIRED_FIELD_MISSING, INVALID_FORMAT, DUPLICATE_SUSPECTED, OUTLIER_QUANTITY_WEIGHT, UNSUPPORTED_APC_CROP, REFINED_FAILED 6개 유형 보강 |
| Backend Test | `/api/monitoring/issues`가 MVP 기준 전체 이슈 유형을 제공하는지 테스트 추가 |
| QA | `second_qa_check.md`에 QA-005 부분 재검증 결과 기록 |

## 영향 범위

| 역할 | 영향 |
| --- | --- |
| Planning | 품질 이슈 유형 정책과 sample row 표시 범위가 실제 화면에서 검증 가능해짐 |
| Publishing | drawer/table overflow, badge, 마스킹 안내 스타일이 실제 UI에 반영됨 |
| Development | `sampleRows`와 `issueType` 계약을 화면에서 직접 사용하고 테스트로 고정함 |
| QA | QA-005는 자동 검증 일부 통과, 브라우저 시각 검증은 후속 QA에서 확인 필요 |

## 변경 파일

- `projects/apc-monitoring-mvp/frontend/src/features/monitoring/pages/QualityIssuesPage.tsx`
- `projects/apc-monitoring-mvp/frontend/src/shared/styles/global.css`
- `projects/apc-monitoring-mvp/shared/fixtures/monitoring_fixture.json`
- `projects/apc-monitoring-mvp/api/tests/test_monitoring_api.py`
- `../roles/development/feature/01_after_first_qa/11_quality_issue_detail_coverage.md`
- `../roles/qa/qa-results/second_qa_check.md`

## 남은 확인

- 브라우저에서 데스크톱/모바일 sample row table overflow 시각 검증
- 실제 운영 데이터 연동 시 민감 field key 목록 확정
