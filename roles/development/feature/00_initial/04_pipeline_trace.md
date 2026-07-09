# 04. 파이프라인 추적 개발 문서

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
- `../../../planning/feature/00_initial/04_pipeline_trace.md`
- `../../../publishing/Publishing.md`

## 구현 목표

APC API 수신부터 화면 표시까지의 단계별 상태를 timeline으로 보여주고, 실패 단계의 메시지, DAG/task 상태, log preview, 다음 조치 안내를 제공한다.

## API

사용 endpoint:

- `GET /api/monitoring/pipeline/{trace_id}`

Response 주요 필드:

- `traceId`
- `apc`
- `crop`
- `snpSe`
- `status`
- `startedAt`
- `endedAt`
- `steps`
- `relatedIssueIds`
- `recommendedAction`

step 주요 필드:

- `stepKey`
- `stepLabel`
- `status`
- `checkedAt`
- `message`
- `dagId`
- `taskId`
- `logPreview`
- `nextAction`

## Pipeline Step

| stepKey | label |
| --- | --- |
| `API_RECEIVED` | APC API 수신 |
| `AUTH_SCHEMA_VALIDATED` | 인증/스키마 검증 |
| `ORIGIN_SAVED` | origin 저장 |
| `REFINED_SAVED` | refined 저장 |
| `AIRFLOW_SNAPSHOT_LOADED` | Airflow snapshot 적재 |
| `GUIDANCE_API_AVAILABLE` | Guidance API 조회 |
| `SCREEN_RENDERED` | 화면 표시 |

## 화면 연동 지점

| 영역 | 구현 기준 |
| --- | --- |
| 요약 header | trace summary와 현재 상태 표시 |
| timeline | `steps` 배열을 단계별 상태로 매핑 |
| log preview | `logPreview` 표시와 상세 접힘 상태 관리 |
| CTA | 관련 이슈 보기, 운영 조치 작성 |
| 상세 접힘 | 단계별 상세 open/close state 관리 |

## 구현 TASK

- [x] `PipelineTraceResponse` TypeScript type 정의
- [x] Pydantic `PipelineTraceResponse` schema 정의
- [x] pipeline step enum 정의
- [x] fixture repository에 trace 데이터 추가
- [x] `GET /api/monitoring/pipeline/{trace_id}` route 구현
- [x] 존재하지 않는 `trace_id`에 대한 404 응답 정의
- [ ] React API client `getPipelineTrace` 구현
- [ ] vertical timeline 컴포넌트 구현
- [ ] step status badge 구현
- [ ] 실패 단계 강조 스타일 구현
- [ ] Airflow DAG/task/log preview placeholder 구현
- [ ] 관련 이슈 보기 CTA 연결
- [ ] 운영 조치 작성 CTA 연결
- [ ] loading/empty/error state 구현

## 수용 기준

- 사용자가 어느 단계까지 성공했고 어디서 실패했는지 한눈에 알 수 있다.
- 실패 단계에는 운영자용 메시지와 다음 조치가 표시된다.
- Airflow DAG/task/log preview는 개발 로그 원문보다 요약을 우선한다.
- 관련 이슈와 운영 조치 작성 화면으로 이동할 수 있다.
