# 01. 모니터링 홈 개발 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | QA 이전 초기 feature |
| QA Cycle | Initial planning before first QA |
| 참조 QA 결과 | None |
| 생성 근거 | `../../../../Project_Context.md`, role context document |
| 문서 상태 | Initial scope baseline |


## 참조 문서

- `../../Development.md`
- `../../../../Project_Context.md`
- `../../../planning/feature/00_initial/01_monitoring_home.md`
- `../../../publishing/Publishing.md`

## 구현 목표

APC 데이터 관리의 `모니터링` 탭 진입 시 첫 화면으로 표시한다. 사용자는 KPI, APC status matrix, 최근 이슈, 상태 분포 차트를 통해 오늘 데이터가 신뢰 가능한지 판단한다.

## API

사용 endpoint:

- `GET /api/monitoring/summary`

Query:

- `date`
- `apc`
- `crop`
- `snpSe`
- `status`

주요 response 필드:

- `generatedAt`
- `kpis`
- `matrix`
- `recentIssues`
- `statusDistribution`

## 화면 연동 지점

| 영역 | 구현 기준 |
| --- | --- |
| 상단 필터 | 기준일, APC, 품목, 입고/선별, 상태 query state 관리 |
| KPI 카드 | summary API의 `kpis` 값을 화면 카드 데이터로 매핑 |
| 상태 분포 | ECharts donut 또는 horizontal bar |
| APC matrix | `matrix` 데이터를 APC/품목/구분 cell 단위로 매핑 |
| 최근 이슈 | `recentIssues` 목록과 상세 이동 이벤트 연결 |
| 상태 안내 | 상태 코드와 라벨 매핑 |

## ECharts 사용 범위

- 상태 분포 donut 또는 horizontal bar만 사용한다.
- APC matrix를 차트로 구현하지 않는다.
- 차트의 시각 스타일은 `../../../publishing/Publishing.md`를 따른다.

## 상태/예외 처리

- loading: KPI, matrix, issue table 각각 skeleton 또는 loading 영역 표시
- empty: 조건에 맞는 APC 상태가 없을 때 empty state 표시
- error: API 실패 시 화면 전체를 숨기지 않고 오류 banner와 retry 버튼 표시
- stale: `generatedAt`이 오래된 경우 마지막 갱신 시각을 강조

## 구현 TASK

- [x] `MonitoringSummaryResponse` TypeScript type 정의
- [x] Pydantic `MonitoringSummaryResponse` schema 정의
- [x] fixture repository에 KPI, matrix, recentIssues, statusDistribution 데이터 추가
- [x] `GET /api/monitoring/summary` route 구현
- [ ] React API client `getMonitoringSummary` 구현
- [ ] 공통 status token map 구현
- [ ] KPI card 컴포넌트 구현
- [ ] APC matrix 컴포넌트 구현
- [ ] matrix cell click 시 `apc/crop/snpSe/status` 필터 상태 갱신
- [ ] 최근 이슈 table 구현
- [ ] 상태 분포 ECharts 옵션 구현
- [ ] loading/empty/error state 구현
- [ ] 퍼블리싱 기준 적용 여부 QA 체크 항목 연결

## 수용 기준

- 기본 진입 시 당일 기준 summary가 표시된다.
- 오류/미수신 상태가 정상보다 시각적으로 먼저 인지된다.
- matrix cell을 선택하면 관련 이슈와 수신 현황 필터에 사용할 수 있는 상태가 남는다.
- 화면 구현 결과가 `../../../publishing/Publishing.md` 기준과 충돌하지 않는다.
