# 12. JADX 메뉴 연계 시나리오 개발 문서

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
- 관련 QA 체크: `../../../qa/feature/07_data_lookup_integration_qa.md`, `../../../qa/feature/08_visualization_integration_qa.md`
- 원인 ID: `QA-006`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/00_initial/01_monitoring_home.md`, `../../../planning/feature/00_initial/03_quality_issues.md` | 모니터링 상태와 품질 경고 정책 확인 | 충족 |
| Publishing | `../../../publishing/Publishing.md` | 기존 메뉴에 품질 경고를 섞되 Astryx/JADX_STATS 스타일 기준 유지 | 충족 |
| Development | 현재 문서 | 독립 MVP에서 JADX 데이터 조회/시각화 흐름을 가정한 품질 경고 시나리오 정의 | 충족 |
| QA | `../../../qa/feature/07_data_lookup_integration_qa.md`, `../../../qa/feature/08_visualization_integration_qa.md` | 기존 메뉴 회귀와 monitoring warning 재검증 | 부분 재검증 완료 |

## 원인

현재 `app/`은 문서 시연용 독립 MVP이며 실제 `/Users/dgseo/Desktop/JADX/...` 코드베이스를 수정하지 않는다.

Phase 7은 JADX의 기존 `데이터 조회`, `시각화` 메뉴 흐름을 근거로 독립 MVP 안에서 품질 경고 연계 시나리오를 구현했다. 운영 JADX 코드에 직접 붙이는 작업은 이번 MVP 범위가 아니며, 필요한 경우 별도 의사결정과 영향 분석이 필요하다.

## 영향 범위

| 파트 | 영향 |
| --- | --- |
| Planning | MVP 시연 범위와 운영 서비스 반영 범위를 명확히 분리해야 함 |
| Development | 독립 MVP에서 기존 JADX 메뉴 흐름을 가정한 warning/confirm 동작 유지 |
| QA | 독립 MVP 기준의 연계 시나리오와 운영 반영 시 영향 범위를 분리해 검증 |

## 구현 TASK

- [x] 독립 MVP의 데이터 조회 화면에서 JADX `DataLookup.tsx` 흐름을 가정한 품질 warning 유지
- [x] 독립 MVP의 Excel 다운로드 시나리오에서 품질 confirm 흐름 유지
- [x] 독립 MVP의 시각화 화면에서 신뢰도 warning 유지
- [x] 운영 JADX에 반영할 경우 필요한 영향 지점을 문서로 식별
- [x] 운영 반영은 이번 MVP 범위가 아님을 QA 결과와 impact-analysis에 명시

## 구현 결과

| 항목 | 반영 내용 |
| --- | --- |
| 구현 일자 | 2026-07-09 |
| 메뉴 shell | `app/frontend/src/features/monitoring/pages/ApcDataManagementShell.tsx` |
| 데이터 조회 | `app/frontend/src/features/data-lookup-integration/DataLookupIntegrationPage.tsx` |
| 시각화 | `app/frontend/src/features/visualization-integration/VisualizationIntegrationPage.tsx` |
| 스타일 기준 | `app/frontend/src/shared/styles/global.css` |
| 시나리오 레일 | `모니터링 → 데이터 품질 이슈 → 데이터 조회 → 시각화` 4단계 흐름 추가 |
| 데이터 조회 경고 | 품질 warning, Excel 다운로드 confirm, 독립 MVP 범위 안내 유지 |
| 시각화 경고 | 차트 해석 전 품질 warning과 영향 차트 요약 표시 |
| 운영 반영 범위 | 운영 JADX 직접 수정은 제외하고 별도 의사결정/영향 분석 대상으로 명시 |

## 운영 JADX 반영 시 영향 지점

| 운영 메뉴/영역 | 확인 필요 사항 |
| --- | --- |
| APC 데이터 관리 shell | 모니터링 탭 또는 경고 레일을 실제 메뉴 구조에 추가할지 결정 |
| DataLookup.tsx | 기존 필터, pagination, Excel 다운로드 API 호출 전 품질 warning/confirm 삽입 지점 확인 |
| Visualization.tsx | 기존 차트 데이터와 모니터링 품질 상태를 직접 섞지 않고 warning layer로 분리할지 확인 |
| apcApi.ts | 기존 조회/다운로드 API와 모니터링 API의 query mapping 기준 확정 |
| 권한/운영 정책 | viewer/operator/admin별 경고 확인, 다운로드 진행 가능 범위 확정 |

## QA 재검증 메모

- QA-006은 두 번째 QA 문서에서 부분 재검증 대상으로 기록한다.
- 브라우저 시각 검증은 별도 QA 실행 시 메뉴 레일과 confirm 흐름을 확인한다.

## 완료 기준

- 독립 MVP 앱에서 JADX 데이터 조회 흐름을 가정한 품질 경고 시나리오가 동작한다.
- 독립 MVP 앱에서 Excel 다운로드 전 품질 confirm 시나리오가 동작한다.
- 독립 MVP 앱에서 시각화 신뢰도 warning 연계 방식을 시연한다.
- 운영 JADX 반영은 별도 후속 의사결정 사항으로 남긴다.
