# Development.md

## 참조 문서

- `../../Project_Context.md`
- `../../organization-standards/development-standards.md`
- `../planning/Planning.md`
- `../publishing/Publishing.md`

## 개발 목표

APC(농산물산지유통센터) 모니터링 서비스 MVP는 기존 JADX의 APC 데이터 조회/시각화 흐름 앞단에 데이터 신뢰도 판단 기능을 추가하기 위한 구현 기준을 정의한다.

이 문서는 실제 앱 구현자가 다음 결정을 다시 하지 않도록 API 계약, 데이터 타입, 백엔드 구조, 배포 기준, 테스트 정책, feature별 개발 문서 연결을 고정한다. UI 컴포넌트, 색상, 폰트, 간격, radius 같은 퍼블리싱 판단은 `../publishing/Publishing.md`를 따른다.

## 기술 스택

| 영역 | 선택 | 기준 |
| --- | --- | --- |
| Frontend | React.js + TypeScript + Vite | 빠른 MVP 구성, 정적 빌드, Vercel 배포 용이성 |
| Chart | Apache ECharts + React wrapper | 운영 대시보드에 적합한 차트 타입, Canvas/SVG 렌더링, 반응형, 접근성 지원 |
| Backend | Python FastAPI + Pydantic | 기존 JADX 백엔드 흐름과 맞고 OpenAPI/검증/테스트가 간결함 |
| Deploy | Vercel | React static build + Vercel Python Runtime 기반 FastAPI |
| MVP Data | deterministic fixture/mock repository | 실제 운영 DB/Object Storage/Airflow 쓰기 없이 시연 가능 |

## 기술 선정 근거

### Apache ECharts

Apache ECharts는 20개 이상의 차트 타입, Canvas/SVG 렌더링, 데이터셋/transform, 반응형 설정, 접근성 설명 기능을 제공한다.

APC 모니터링 서비스에서는 chart를 다음 용도로만 사용한다.

- 상태 분포 donut/bar
- 수신 지연 trend
- 품질 이슈 유형별 분포
- 기존 시각화 메뉴의 당산도, 등급 분포, 총 선별 중량

APC 상태 matrix, 수신 목록, 품질 이슈 목록은 차트가 아니라 table/grid로 구현한다.

### FastAPI

FastAPI는 Pydantic 기반 검증, OpenAPI 자동 문서화, dependency injection, 테스트 클라이언트를 제공한다.

MVP에서는 복잡한 배치 서버나 별도 worker를 두지 않고, FastAPI router와 fixture repository만 사용한다.

### Vercel

Vercel Python Runtime은 ASGI/WSGI 앱을 지원한다. MVP는 Vercel 단일 프로젝트 안에서 React 정적 앱과 Python API를 함께 배포하는 구조로 정의한다.

## 전체 아키텍처

```text
React/Vite App
  ├─ ECharts visualizations
  └─ monitoring API client

Vercel Python Runtime
  └─ FastAPI app
      ├─ monitoring router
      ├─ Pydantic schemas
      ├─ fixture repository
      └─ future adapters
          ├─ JadxApcApiAdapter
          └─ DatahubAirflowAdapter
```

## MVP 범위

- 실제 운영 DB에 쓰지 않는다.
- Object Storage에 쓰지 않는다.
- Airflow DAG를 실행하지 않는다.
- 실제 APC API를 호출하지 않는다.
- deterministic fixture/mock repository로 동일한 시연 데이터를 반환한다.
- 운영 시스템 반영은 adapter 경계와 TODO로만 남기며, 이번 MVP는 독립 시연 범위로 제한한다.

## 공통 타입

프론트 TypeScript와 백엔드 Pydantic schema에서 동일한 의미로 사용한다.

| 타입 | 값 |
| --- | --- |
| `ApcName` | `NAMWON`, `WIMI`, `SEOGWI`, `JUNGMUN`, `GUJWA` |
| `CropType` | `CITRUS`, `CARROT` |
| `SnpSe` | `WRHS`, `CLSFY` |
| `MonitoringStatus` | `NORMAL`, `DELAYED`, `ERROR`, `MISSING`, `UNDEFINED_RULE` |
| `IssueStatus` | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `IGNORED` |
| `IssueSeverity` | `HIGH`, `MEDIUM`, `LOW` |
| `PipelineStepStatus` | `SUCCESS`, `RUNNING`, `FAILED`, `SKIPPED`, `UNDEFINED` |
| `UserRole` | `ADMIN`, `OPERATOR`, `VIEWER` |

## 라벨 정책

| 코드 | 화면 라벨 |
| --- | --- |
| `NAMWON` | 남원 |
| `WIMI` | 위미 |
| `SEOGWI` | 서귀 |
| `JUNGMUN` | 중문 |
| `GUJWA` | 구좌 |
| `CITRUS` | 감귤 |
| `CARROT` | 당근 |
| `WRHS` | 입고 |
| `CLSFY` | 선별 |
| `NORMAL` | 정상 |
| `DELAYED` | 지연 |
| `ERROR` | 오류 |
| `MISSING` | 미수신 |
| `UNDEFINED_RULE` | 기준 미정 |

## API 계약

### `GET /api/monitoring/summary`

모니터링 홈의 KPI, APC status matrix, 최근 이슈, 상태 분포 차트를 반환한다.

Query:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `date` | N | 기준일. 없으면 서버 기준 당일 |
| `apc` | N | APC 코드 |
| `crop` | N | 품목 코드 |
| `snpSe` | N | 입고/선별 코드 |
| `status` | N | 상태 코드 |

Response:

```json
{
  "generatedAt": "2026-07-09T09:30:00+09:00",
  "kpis": {
    "totalApcCount": 5,
    "normalApcCount": 2,
    "delayedApcCount": 1,
    "errorApcCount": 1,
    "missingApcCount": 1
  },
  "matrix": [],
  "recentIssues": [],
  "statusDistribution": []
}
```

### `GET /api/monitoring/ingestions`

수신 현황 목록과 APC별 timeline 상세 진입에 필요한 `traceId`를 반환한다.

Query:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `startDate` | Y | 조회 시작일 |
| `endDate` | Y | 조회 종료일 |
| `apc` | N | APC 코드 |
| `crop` | N | 품목 코드 |
| `snpSe` | N | 입고/선별 코드 |
| `status` | N | 상태 코드 |

### `GET /api/monitoring/issues`

품질 이슈 목록과 상세 drawer에 필요한 요약 정보를 반환한다.

### `GET /api/monitoring/pipeline/{trace_id}`

특정 수신/이슈의 pipeline step, DAG/log preview, 다음 조치 안내를 반환한다.

### 제외된 write/settings API

네 번째 QA 이후 `운영 조치 작성/내역`과 `모니터링 기준 수정`은 MVP API 계약에서 제거한다. 해당 기능은 DB, 감사 이력, 권한 정책, 동시성 처리가 함께 있어야 설득력 있는 기능이므로 fixture/process memory 기반으로 제공하지 않는다.

제거된 endpoint:

| Endpoint | 제거 사유 |
| --- | --- |
| `GET /api/monitoring/actions` | fixture 조회만 제공되어 실제 운영 이력으로 오해될 수 있음 |
| `POST /api/monitoring/issues/{issue_id}/actions` | process memory append라 새로고침/배포 환경에서 영속성 없음 |
| `GET /api/monitoring/rules` | mock 기준 조회가 실제 설정 관리로 오해될 수 있음 |
| `PUT /api/monitoring/rules/{rule_id}` | process memory update라 감사/승인/권한 이력이 보장되지 않음 |

## 프론트 연동 기준

- 프론트엔드는 React.js + TypeScript + Vite로 구현한다.
- 화면 컴포넌트와 스타일 기준은 `../publishing/Publishing.md`를 따른다.
- 개발 문서는 화면 구현의 데이터 흐름, API 호출, 상태 관리, 예외 처리, 테스트 기준만 정의한다.
- loading, empty, error state는 모든 목록/detail/chart 데이터 영역에서 처리한다.

## 차트 구현 기준

- 차트 라이브러리는 Apache ECharts + React wrapper로 고정한다.
- chart 영역은 운영 판단을 보조하는 용도로만 사용한다.
- matrix와 주요 목록은 chart가 아니라 table/grid로 구현한다.
- 차트 tooltip에는 상태 라벨, 수치, 기준일을 함께 표시한다.

## 백엔드 구현 기준

- FastAPI router는 monitoring domain 중심으로 구성한다.
- Pydantic response model을 먼저 정의하고 fixture data가 해당 model을 통과하도록 한다.
- fixture repository는 deterministic 데이터를 반환한다.
- 현재 시각에 따라 결과가 흔들리지 않도록 fixture 기준 시각을 고정하거나 query `date`를 우선한다.
- adapter 경계는 남기되 실제 JADX 호출은 후속 범위로 둔다.

후속 adapter:

- `JadxApcApiAdapter`: `/Users/dgseo/Desktop/JADX/jadx-apc-api`의 수신/정제 흐름 연계
- `DatahubAirflowAdapter`: `/Users/dgseo/Desktop/JADX/jadx-sis`의 DAG run/log/status 연계
- `JadxGuidanceApiAdapter`: 기존 APC 조회/시각화 API 연계

## 배포 기준

- Vercel 단일 프로젝트로 배포한다.
- React app은 정적 build 산출물을 배포한다.
- Python API는 Vercel Python Runtime이 인식하는 entrypoint에 FastAPI `app`을 둔다.
- Python dependency는 최소화한다.

필수 Python dependency:

- `fastapi`
- `pydantic`

프론트 필수 dependency:

- `react`
- `react-dom`
- `typescript`
- `vite`
- `echarts`
- React ECharts wrapper

## 관련 JADX 시스템

| 영역 | 실제 코드 |
| --- | --- |
| APC 수신 API | `/Users/dgseo/Desktop/JADX/jadx-apc-api/app/routes.py` |
| APC 수집/정제 문서 | `/Users/dgseo/Desktop/JADX/jadx-apc-api/CLAUDE.md` |
| APC 적재 DAG | `/Users/dgseo/Desktop/JADX/jadx-sis/airflow/dags/apc_*_snapshot_dag.py` |
| Airflow schema | `/Users/dgseo/Desktop/JADX/jadx-sis/fastapi/app/domains/datahub/schemas/airflow.py` |
| DataHub dashboard/status | `/Users/dgseo/Desktop/JADX/jadx-sis/fastapi/app/domains/datahub/api/v0/routes/dashboard.py` |
| APC 조회 API | `/Users/dgseo/Desktop/JADX/jadx-sis/fastapi/app/domains/guidance/api/v0/routes/apc.py` |
| APC 화면 | `/Users/dgseo/Desktop/JADX/jadx-fe/apps/jadx-tg/src/pages/ApcDataManagement` |

## Feature 문서

| 기능 | 개발 문서 |
| --- | --- |
| 모니터링 홈 | `feature/00_initial/01_monitoring_home.md` |
| 수신 현황 | `feature/00_initial/02_ingestion_status.md` |
| 데이터 품질 이슈 | `feature/00_initial/03_quality_issues.md` |
| 파이프라인 추적 | `feature/00_initial/04_pipeline_trace.md` |
| 데이터 조회 연계 | `feature/00_initial/07_data_lookup_integration.md` |
| 시각화 연계 | `feature/00_initial/08_visualization_integration.md` |
| Mock write 기능 제거 | `feature/04_after_fourth_qa/21_remove_mock_write_features.md` |

## Feature Lifecycle

개발 feature는 QA cycle 기준으로 관리한다.

| Cycle | 디렉토리 | 관리 범위 |
| --- | --- | --- |
| Initial | `feature/00_initial/` | 첫 QA 이전에 정의한 API, 타입, 화면 구현, 테스트 TASK |
| After first QA | `feature/01_after_first_qa/` | 첫 QA에서 실패/부분 통과한 개발 구현 보완 TASK |
| After second QA | `feature/02_after_second_qa/` | 두 번째 QA 이후 추가될 개발 보완 TASK |

첫 QA 이후 생성된 개발 보완 feature:

| QA ID | 문서 | 목적 |
| --- | --- | --- |
| QA-001 | `feature/01_after_first_qa/09_role_permission_policy.md` | viewer/admin 권한 정책과 path/rule 수정 제한 구현 |
| QA-003 | `feature/01_after_first_qa/10_rule_diff_and_admin_state.md` | 기준 변경 전/후 diff UI와 admin-only disabled state 구현 |
| QA-005 | `feature/01_after_first_qa/11_quality_issue_detail_coverage.md` | 품질 이슈 sample row table과 전체 이슈 유형 표시 보강 |
| QA-006 | `feature/01_after_first_qa/12_jadx_menu_integration_scenario.md` | 독립 MVP에서 JADX 데이터 조회/시각화 흐름을 가정한 품질 경고 시나리오 정의 |

## 구현 착수 게이트

개발 feature는 기획/퍼블리싱 조건을 모두 확인한 뒤 구현한다.

| 게이트 | 기준 |
| --- | --- |
| Planning 충족 | 관련 planning feature 또는 initial planning 문서의 사용자 흐름/정책/완료 기준이 연결되어 있다. |
| Publishing 충족 | 관련 publishing feature 또는 `../publishing/Publishing.md`의 UI 기준이 연결되어 있다. |
| Development 반영 | 기획 요구사항과 퍼블리싱 조건이 구현 TASK, API/상태관리, 테스트 기준에 반영되어 있다. |
| QA 연결 | 원인 QA ID와 재검증 체크표가 연결되어 있다. |

개발 문서에 위 조건이 없으면 구현 완료가 아니라 `문서 조건 미충족` 상태로 본다.

## 테스트 정책

- API schema test: fixture data가 Pydantic model을 통과하는지 확인한다.
- API route test: 필터 조합, 빈 결과, 잘못된 enum 값을 확인한다.
- Frontend render test: 정상, 지연, 오류, 미수신, 기준 미정 상태가 모두 표시되는지 확인한다.
- Interaction test: matrix cell click, row detail open, issue action submit, rule edit dialog를 확인한다.
- Regression test: 데이터 조회와 시각화 메뉴에서 모니터링 경고가 기존 기능을 막지 않는지 확인한다.
