# 04. 파이프라인 추적

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | QA 이전 초기 feature |
| QA Cycle | Initial planning before first QA |
| 참조 QA 결과 | None |
| 생성 근거 | `../../../../Project_Context.md`, role context document |
| 문서 상태 | Initial scope baseline |


## 참조 문서

- `../../Planning.md`
- `../../../../Project_Context.md`

## 목적

파이프라인 추적은 APC 데이터가 수집되어 화면에 표시되기까지 어느 단계에서 실패했는지 확인하는 화면이다.

운영자는 이 화면을 통해 문제를 개발자에게 전달하기 전에 최소한 다음을 확인할 수 있어야 한다.

- API 수신 자체가 실패했는가?
- 인증 또는 스키마 검증에서 실패했는가?
- 원천 저장은 되었지만 정제가 실패했는가?
- Airflow 적재 또는 snapshot 단계에서 실패했는가?
- 데이터는 존재하지만 화면 조회 API에서 실패했는가?

## 추적 단계

| 단계 | 화면 표시 기준 |
| --- | --- |
| APC API 수신 | APC에서 데이터 요청이 들어왔는지 |
| 인증/스키마 검증 | APC key 인증과 데이터 형식 검증 결과 |
| origin 저장 | 원천 JSON 저장 여부 |
| refined 저장 | 정제 Parquet 저장 여부 |
| Airflow snapshot 적재 | 관련 DAG run/task 상태 |
| Guidance API 조회 | 화면 조회 API 응답 가능 여부 |
| 화면 표시 | 사용자 화면에서 조회 가능한지 |

## 화면 구성

### Stepper 또는 timeline

기본 표현은 horizontal stepper 또는 vertical timeline이다. 화면 폭이 좁거나 상세 정보가 많은 경우 vertical timeline을 우선한다.

각 단계는 다음 상태 중 하나를 가진다.

- 성공
- 진행중
- 실패
- 건너뜀
- 기준 미정

### 실패 단계 상세

실패 단계에는 다음 정보를 표시한다.

- 실패 단계명
- 확인 시각
- 운영자용 오류 메시지
- 다음 조치 안내
- 관련 DAG run 또는 task 상태
- log preview

log preview는 원문 전체를 노출하기보다 원인 판단에 필요한 앞부분 또는 요약을 우선 표시한다.

## UX 정책

- 사용자는 이 화면에서 `어디까지 성공했고 어디서 멈췄는지`를 한눈에 알아야 한다.
- 단계명은 기술 시스템명이 아니라 업무 흐름 기준으로 표현한다.
- Airflow log는 개발자용 원문보다 운영자용 요약을 먼저 보여준다.
- 상세 로그는 접힘 영역으로 제공한다.
- 실패 단계에서 `관련 이슈 보기`, `운영 조치 작성` 진입점을 제공한다.

## JADX 근거

- APC 수집 흐름: `/Users/dgseo/Desktop/JADX/jadx-apc-api/CLAUDE.md`
- APC endpoint: `/Users/dgseo/Desktop/JADX/jadx-apc-api/app/routes.py`
- Airflow DAG: `/Users/dgseo/Desktop/JADX/jadx-sis/airflow/dags/apc_*`
- DAG run/log schema: `/Users/dgseo/Desktop/JADX/jadx-sis/fastapi/app/domains/datahub/schemas/airflow.py`
- DataHub dashboard/status: `/Users/dgseo/Desktop/JADX/jadx-sis/fastapi/app/domains/datahub/api/v0/routes/dashboard.py`

## MVP 범위

- 파이프라인 단계는 화면 정의와 상태 표현 중심으로 정의한다.
- 실제 DAG graph 전체 재현은 후속 범위다.
- MVP에서는 관련 DAG run, task 상태, log preview 연결을 기획 범위로 둔다.
