# 02. 수신 현황 개발 문서

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
- `../../../planning/feature/00_initial/02_ingestion_status.md`
- `../../../publishing/Publishing.md`

## 구현 목표

APC별 데이터 수신 시각, 기대 수신 주기, 지연 시간, origin/refined 저장 여부를 목록과 상세 timeline으로 표시한다.

## API

사용 endpoint:

- `GET /api/monitoring/ingestions`
- `GET /api/monitoring/pipeline/{trace_id}` 상세 진입 시 사용

Query:

- `startDate`
- `endDate`
- `apc`
- `crop`
- `snpSe`
- `status`

목록 item 주요 필드:

- `ingestionId`
- `traceId`
- `apc`
- `crop`
- `snpSe`
- `lastReceivedAt`
- `expectedIntervalMinutes`
- `baseTime`
- `delayMinutes`
- `originSaved`
- `refinedSaved`
- `status`

## 화면 연동 지점

| 영역 | 구현 기준 |
| --- | --- |
| 필터 | 기간, APC, 품목, 입고/선별, 상태 query state 관리 |
| 목록 | 수신 현황 item을 row 데이터로 매핑 |
| 상세 | row expansion 또는 side panel |
| timeline | pipeline step 또는 수신 이력 데이터를 단계별로 매핑 |
| 경로 표시 | 권한이 있을 때만 origin/refined path 표시 |

## 정렬 정책

기본 정렬 우선순위:

1. `ERROR`
2. `MISSING`
3. `DELAYED`
4. `UNDEFINED_RULE`
5. `NORMAL`

동일 상태 안에서는 `delayMinutes`가 큰 순서로 정렬한다.

## 권한 정책

- MVP에서는 fixture user role을 기준으로 `operator`와 `viewer`를 구분한다.
- `viewer`는 origin/refined 상세 path를 볼 수 없다.
- 권한이 없으면 path 대신 `권한 필요` label을 표시한다.

## 구현 TASK

- [x] `IngestionStatusItem` TypeScript type 정의
- [x] Pydantic `IngestionStatusItem` schema 정의
- [x] fixture repository에 수신 현황 데이터 추가
- [x] `GET /api/monitoring/ingestions` route 구현
- [x] filter query validation 구현
- [x] status 우선 정렬 함수 구현
- [ ] React API client `getIngestions` 구현
- [ ] 수신 현황 필터 컴포넌트 구현
- [ ] 수신 현황 table 컬럼 구성
- [ ] row detail panel 구현
- [ ] origin/refined 저장 여부 badge 구현
- [ ] 권한별 path 표시 정책 구현
- [ ] pipeline trace 화면으로 이동 가능한 `traceId` 연결
- [ ] loading/empty/error state 구현

## 수용 기준

- 지연/미수신/오류 row가 상단에 표시된다.
- 최근 수신 시각과 기준 시각이 함께 표시된다.
- row 상세에서 수신부터 정제까지의 흐름을 timeline으로 확인할 수 있다.
- 권한이 없는 사용자는 원천/정제 상세 경로를 볼 수 없다.
