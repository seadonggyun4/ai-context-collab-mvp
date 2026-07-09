# Matrix Drill-down Implemented

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 생성 일자 | 2026-07-09 |
| 변경 유형 | QA follow-up implementation |
| 연결 QA ID | QA2-001 |
| 연결 개발 문서 | `../roles/development/feature/02_after_second_qa/13_matrix_drilldown_implementation.md` |
| 연결 기획 문서 | `../roles/planning/feature/01_after_first_qa/07_matrix_drilldown_flow.md` |
| 연결 QA 결과 | `../roles/qa/qa-results/second_qa_check.md` |

## 변경 배경

두 번째 QA에서 모니터링 홈 matrix cell이 button으로 렌더링되지만 상세 탭/필터 handoff가 구현되지 않은 문제가 잔여 이슈로 확인되었다.

이번 변경은 matrix 선택이 실제 상세 확인 흐름으로 이어지도록 독립 MVP의 shell 상태와 각 상세 화면의 API query를 연결한다.

## 구현 요약

| 영역 | 변경 내용 |
| --- | --- |
| Shell | `MatrixDrilldownContext`를 shared state로 추가하고 상태별 target tab 결정 |
| Monitoring Home | matrix cell click callback, selected feedback, `aria-pressed` 적용 |
| Ingestion Status | matrix 조건을 `GET /api/monitoring/ingestions` query로 전달 |
| Quality Issues | matrix 조건을 `GET /api/monitoring/issues` query로 전달 |
| Monitoring Rules | matrix 조건을 `GET /api/monitoring/rules` query로 전달 |
| UI | 선택 조건 chip과 조건 초기화 버튼 추가 |

## 영향 범위

| 역할 | 영향 |
| --- | --- |
| Planning | 1차 QA 이후 확정한 matrix drill-down 흐름이 구현됨 |
| Publishing | 선택 조건 chip과 selected matrix cell 표현이 JSX_STATS/Astryx 스타일 안에서 추가됨 |
| Development | 탭 간 상태 전달 패턴이 생겨 pipeline CTA 구현 때 재사용 가능 |
| QA | QA2-001은 다음 QA에서 재검증 대상에서 통과 확인 가능 |

## 브라우저 재검증

| 시나리오 | 결과 |
| --- | --- |
| 중문 감귤 선별 `ERROR` cell click | 데이터 품질 이슈 탭 이동, 중문/감귤/선별/오류 chip 표시 |
| 서귀 당근 입고 `MISSING` cell click | 수신 현황 탭 이동, 서귀/당근/입고/미수신 chip 표시 |
| 구좌 당근 선별 `UNDEFINED_RULE` cell click | 모니터링 기준 설정 탭 이동, 구좌/당근/선별/기준 미정 chip 표시 |

## 변경 파일

- `../app/frontend/src/features/monitoring/types/shell.ts`
- `../app/frontend/src/features/monitoring/components/AppliedFilterChips.tsx`
- `../app/frontend/src/features/monitoring/pages/ApcDataManagementShell.tsx`
- `../app/frontend/src/features/monitoring/pages/MonitoringHomePage.tsx`
- `../app/frontend/src/features/monitoring/components/MonitoringSummaryShell.tsx`
- `../app/frontend/src/features/monitoring/pages/IngestionStatusPage.tsx`
- `../app/frontend/src/features/monitoring/pages/QualityIssuesPage.tsx`
- `../app/frontend/src/features/monitoring/pages/MonitoringRulesPage.tsx`
- `../app/frontend/src/shared/styles/global.css`
- `../roles/development/feature/02_after_second_qa/13_matrix_drilldown_implementation.md`

## 남은 확인

- 다음 QA에서 전체 feature 체크표 기준으로 회귀 검증
- pipeline related CTA 구현 시 동일 context handoff 패턴 재사용
