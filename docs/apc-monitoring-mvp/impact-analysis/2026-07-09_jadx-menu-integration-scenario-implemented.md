# JADX Menu Integration Scenario Implemented

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 생성 일자 | 2026-07-09 |
| 변경 유형 | QA follow-up implementation |
| 연결 QA ID | QA-006 |
| 연결 개발 문서 | `../roles/development/feature/01_after_first_qa/12_jadx_menu_integration_scenario.md` |
| 연결 기획 문서 | `../roles/planning/feature/00_initial/01_monitoring_home.md`, `../roles/planning/feature/00_initial/03_quality_issues.md` |
| 연결 퍼블리싱 문서 | `../roles/publishing/Publishing.md` |

## 변경 배경

첫 번째 QA에서 데이터 조회/시각화 연계가 실제 운영 JADX 메뉴에 직접 연결된 것처럼
오해될 수 있다는 문제가 확인되었다.

이번 변경은 운영 JADX 코드베이스를 수정하지 않고, 독립 MVP 안에서 기존 APC 데이터 관리
흐름을 가정한 품질 경고 시나리오를 명확히 시연하도록 보완한다.

## 구현 요약

| 영역 | 변경 내용 |
| --- | --- |
| Menu Shell | `모니터링 → 데이터 품질 이슈 → 데이터 조회 → 시각화` 4단계 시나리오 레일 추가 |
| Data Lookup | 독립 MVP 범위 안내, 조회 조건 이슈 수, Excel 위험 수, 품질 warning/confirm 흐름 유지 |
| Visualization | 차트 해석 전 품질 warning, 영향 차트 요약, 높은 심각도 count 표시 |
| Styling | JSX_STATS/Astryx 기준의 flat console 스타일, 5px radius, responsive scenario rail 추가 |
| QA | `second_qa_check.md`에 QA-006 부분 재검증 결과 기록 |

## 영향 범위

| 역할 | 영향 |
| --- | --- |
| Planning | 모니터링 홈에서 상태를 판단하고 품질 이슈로 drill-down하는 흐름이 메뉴 레벨에서 드러남 |
| Publishing | 기존 JSX_STATS 업무형 콘솔 스타일 안에서 시나리오 레일과 warning layer가 추가됨 |
| Development | 운영 JADX 직접 수정 없이 독립 MVP에서 메뉴 흐름을 재현하는 경계가 명확해짐 |
| QA | 독립 MVP 시나리오와 운영 반영 범위를 분리해 검증해야 함 |

## 운영 JADX 반영 시 별도 확인 지점

| 영역 | 확인 필요 사항 |
| --- | --- |
| APC 데이터 관리 메뉴 | 모니터링 탭을 실제 메뉴에 추가할지, 별도 서비스로 둘지 결정 |
| 데이터 조회 | Excel 다운로드 전 품질 confirm 삽입 위치와 기존 다운로드 API 회귀 테스트 |
| 시각화 | 차트 데이터와 품질 warning의 query mapping 기준 |
| 권한 | viewer/operator/admin별 경고 확인 및 다운로드 진행 가능 정책 |
| 배포 | 독립 MVP와 운영 JADX 배포 파이프라인 분리 여부 |

## 변경 파일

- `projects/apc-monitoring-mvp/frontend/src/features/monitoring/pages/ApcDataManagementShell.tsx`
- `projects/apc-monitoring-mvp/frontend/src/features/data-lookup-integration/DataLookupIntegrationPage.tsx`
- `projects/apc-monitoring-mvp/frontend/src/features/visualization-integration/VisualizationIntegrationPage.tsx`
- `projects/apc-monitoring-mvp/frontend/src/shared/styles/global.css`
- `../roles/development/feature/01_after_first_qa/12_jadx_menu_integration_scenario.md`
- `../roles/qa/qa-results/second_qa_check.md`

## 남은 확인

- 브라우저에서 데스크톱/모바일 메뉴 레일 시각 검증
- Excel 다운로드 confirm 버튼 흐름 수동 확인
- 운영 JADX 반영 여부에 대한 별도 의사결정
