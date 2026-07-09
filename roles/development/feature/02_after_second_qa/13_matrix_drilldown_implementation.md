# 13. Matrix Drill-down 구현 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 두 번째 QA 이후 feature |
| QA Cycle | After second QA |
| 참조 QA 결과 | `../../../qa/qa-results/second_qa_check.md` |
| 생성 근거 | Second QA residual issue |
| 문서 상태 | Implemented |

## 발생 출처

- QA 결과: `../../../qa/qa-results/second_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/01_monitoring_home_qa.md`
- 원인 ID: `QA2-001`
- 기존 1차 QA 원인 ID: `QA-002`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/01_after_first_qa/07_matrix_drilldown_flow.md` | 상태별 이동 대상과 전달 조건 확정 | 충족 |
| Publishing | `../../../publishing/Publishing.md` | 선택 조건 표시, 상태 label, tab UI가 기존 스타일과 충돌하지 않음 | 충족 |
| Development | 현재 문서 | shared filter state, tab handoff, selected cell feedback 구현 | 충족 |
| QA | `../../../qa/feature/01_monitoring_home_qa.md` | matrix cell 선택 후 상세 흐름 재검증 | 부분 재검증 완료 |

## 원인

`MonitoringSummaryShell`의 matrix cell은 button으로 렌더링되지만 click handler가 없고, `ApcDataManagementShell`에는 탭 간 공유 filter state가 없다.

따라서 사용자가 matrix에서 `ERROR`, `MISSING`, `DELAYED`, `UNDEFINED_RULE`, `NORMAL` 상태를 선택해도 수신 현황, 품질 이슈, 파이프라인, 기준 설정 화면으로 조건이 전달되지 않는다.

## 구현 TASK

- [x] `ApcDataManagementShell`에 shared monitoring filter state 추가
- [x] `MonitoringHomePage`와 `MonitoringSummaryShell`에 `onMatrixCellSelect` callback 전달
- [x] 상태별 이동 대상 구현
  - [x] `ERROR`: 데이터 품질 이슈 탭으로 이동, `apc/crop/snpSe` 조건 적용
  - [x] `MISSING`, `DELAYED`, `NORMAL`: 수신 현황 탭으로 이동, `apc/crop/snpSe/status` 조건 적용
  - [x] `UNDEFINED_RULE`: 모니터링 기준 설정 탭으로 이동, `apc/crop/snpSe` 조건 적용
- [x] 이동 후 적용된 조건을 화면 상단 filter chip으로 표시
- [x] 탭 전환 후에도 선택 조건을 유지하거나 초기화하는 정책을 코드로 고정
- [x] QA용 테스트/브라우저 검증 항목 추가

## 구현 결과

| 항목 | 반영 내용 |
| --- | --- |
| 구현 일자 | 2026-07-09 |
| 공통 타입 | `app/frontend/src/features/monitoring/types/shell.ts` |
| Shell 상태 | `ApcDataManagementShell`에 `MatrixDrilldownContext` 추가 |
| 공통 UI | `AppliedFilterChips`로 선택 조건 표시 |
| 모니터링 홈 | matrix cell click callback과 `aria-pressed` 선택 피드백 추가 |
| 수신 현황 | `apc/crop/snpSe/status` query 적용, trace 선택 보정 |
| 품질 이슈 | `apc/crop/snpSe` query 적용, issue 선택 보정 |
| 기준 설정 | `apc/crop/snpSe` query 적용 |

## QA 재검증 메모

| 상태 | 기대 이동 | 브라우저 확인 |
| --- | --- | --- |
| `ERROR` | 데이터 품질 이슈 | 중문 감귤 선별 click 후 품질 이슈 탭과 chip 확인 |
| `MISSING` | 수신 현황 | 서귀 당근 입고 click 후 수신 현황 탭과 chip 확인 |
| `UNDEFINED_RULE` | 모니터링 기준 설정 | 구좌 당근 선별 click 후 기준 설정 탭과 chip 확인 |

## 완료 기준

- matrix cell을 클릭하면 관련 상세 화면으로 이동한다.
- 이동한 화면에서 적용된 `APC/품목/입고선별/상태` 조건을 사용자가 볼 수 있다.
- 조건 전달은 독립 MVP 안에서만 동작하며 운영 JADX 직접 수정으로 오해되지 않는다.
