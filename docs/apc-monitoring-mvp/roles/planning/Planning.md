# Planning.md

## 참조 문서

- `../../Project_Context.md`
- `../../../organization-standards/planning-standards.md`
- `../publishing/Publishing.md`
- `../development/Development.md`

## 서비스 정의

APC(농산물산지유통센터) 모니터링 서비스는 APC별 농산물 데이터가 정상적으로 수신, 검증, 저장, 정제, 적재, 조회 가능한 상태인지 관리자가 한 화면 흐름에서 판단할 수 있게 하는 운영 관리 서비스다.

이 서비스의 목적은 단순한 통계 화면 추가가 아니다. 기존 JADX의 APC 데이터 조회와 시각화 기능 앞단에 데이터 신뢰도 판단 흐름을 붙여, 관리자가 다음 질문에 답할 수 있게 한다.

- 오늘 APC 데이터가 믿을 수 있는 상태인가?
- 어느 APC, 어느 품목, 어느 입고/선별 구분에서 문제가 발생했는가?
- 문제는 수신, 검증, 저장, 정제, 적재, 조회 중 어느 단계에서 발생했는가?
- 엑셀 다운로드나 통계 확인 전에 주의해야 할 품질 이슈가 있는가?
- 누가 문제를 확인했고, 어떤 조치가 진행 중인가?

## 사용자

| 사용자 | 주요 관심사 |
| --- | --- |
| 농기원 관리자 | 오늘의 APC 데이터 상태, 미수신/지연/오류 여부, 통계 신뢰도 |
| 데이터 운영 담당자 | APC별 수신 현황, 품질 이슈, 조치 이력, 기준 변경 이력 |
| QA/기획 담당자 | 화면별 상태 정의, 예외 케이스, 테스트 기준 |
| 개발자 | 문제가 발생한 파이프라인 단계, 관련 DAG/log, 원천/정제 흐름 |

## 레퍼런스 조사 기준

APC 모니터링 서비스의 UX는 범용 쇼핑몰/관리자 예시가 아니라, 실제 운영 모니터링 도구의 공통 패턴을 기준으로 정의한다.

| 레퍼런스 | 반영 기준 |
| --- | --- |
| [Grafana Dashboards](https://grafana.com/docs/grafana/latest/visualizations/dashboards/) | 여러 패널로 관련 정보를 한 화면에 배치하고, 상태 요약에서 상세 진단으로 이동한다. |
| [Datadog Monitors](https://docs.datadoghq.com/monitors/) | 핵심 지표와 임계값을 기반으로 상태를 판단하고, 즉시 조치가 필요한 항목을 우선 노출한다. |
| [New Relic Dashboards](https://docs.newrelic.com/docs/query-your-data/explore-query-data/dashboards/introduction-dashboards/) | 고밀도 인터랙티브 대시보드, 검색, 정렬, 필터링을 통해 문제 원인 파악 시간을 줄인다. |
| [Airflow UI Overview](https://airflow.apache.org/docs/apache-airflow/stable/ui.html) | DAG 목록, 상세, Grid, Graph, Logs처럼 파이프라인 실행 상태와 실패 원인을 추적한다. |

## JADX 근거

APC 모니터링 서비스는 아래 기존 소스와 기능을 근거로 확장한다.

| 영역 | 근거 |
| --- | --- |
| APC API 수신 | `/Users/dgseo/Desktop/JADX/jadx-apc-api/CLAUDE.md`, `/Users/dgseo/Desktop/JADX/jadx-apc-api/app/routes.py` |
| 수집 흐름 | API request, APC별 API key 인증, Pydantic 검증, origin JSON 저장, refined Parquet 저장 |
| APC별 현재 상태 | 남원/중문은 정제 흐름 존재, 위미는 refined processing 제한 또는 미구현 상태로 관리 필요 |
| Airflow/DataHub | `/Users/dgseo/Desktop/JADX/jadx-sis/airflow/dags/apc_*`, `/Users/dgseo/Desktop/JADX/jadx-sis/fastapi/app/domains/datahub/schemas/airflow.py` |
| 기존 화면 | `/Users/dgseo/Desktop/JADX/jadx-fe/apps/jadx-tg/src/pages/ApcDataManagement/index.tsx` |
| 데이터 조회 | `DataLookup.tsx`: 품목, 입고/선별, APC, 농가명 필터, 목록, pagination, Excel 다운로드 |
| 시각화 | `Visualization.tsx`: APC별 당산도, 등급 분포, 총 선별 중량 |

## 메뉴 구조

기존 `jadx-tg`의 `APC 데이터 관리` 화면을 유지하고 탭을 확장한다.

```text
APC 데이터 관리
├── 모니터링
├── 데이터 조회
└── 시각화
```

`모니터링` 탭 안에는 운영자가 문제를 좁혀 가는 순서대로 하위 기능을 둔다.

| 하위 기능 | 문서 | 목적 |
| --- | --- | --- |
| 모니터링 홈 | `feature/00_initial/01_monitoring_home.md` | 오늘 데이터가 신뢰 가능한 상태인지 첫 화면에서 판단 |
| 수신 현황 | `feature/00_initial/02_ingestion_status.md` | APC별 최근 수신, 지연, origin/refined 저장 여부 확인 |
| 데이터 품질 이슈 | `feature/00_initial/03_quality_issues.md` | 필수값 누락, 형식 오류, 중복 의심, 정제 실패 등 확인 |
| 파이프라인 추적 | `feature/00_initial/04_pipeline_trace.md` | API 수신부터 화면 표시까지 실패 단계를 추적 |

`운영 조치 내역`과 `모니터링 기준 설정`은 초기 기획에는 포함되었으나, 네 번째 QA 이후 사용자 검토에서 DB 없이 process memory로만 동작하는 반쪽짜리 write/settings 기능으로 판정되어 MVP 화면 범위에서 제거한다. 관련 히스토리는 `feature/04_after_fourth_qa/17_reduce_mock_write_features.md`에서 관리한다.

## Feature Lifecycle

기획 feature는 QA cycle 기준으로 관리한다.

| Cycle | 디렉토리 | 관리 범위 |
| --- | --- | --- |
| Initial | `feature/00_initial/` | 첫 QA 이전에 합의한 메뉴, UX flow, 화면 정책 |
| After first QA | `feature/01_after_first_qa/` | 첫 QA에서 드러난 사용자 흐름, drill-down, CTA 보완 |
| After second QA | `feature/02_after_second_qa/` | 두 번째 QA 이후 추가될 기획 보완 범위 |

첫 QA 이후 생성된 기획 보완 feature:

| QA ID | 문서 | 목적 |
| --- | --- | --- |
| QA-002 | `feature/01_after_first_qa/07_matrix_drilldown_flow.md` | Matrix cell 선택 후 수신/이슈/파이프라인으로 이어지는 drill-down 흐름 정의 |
| QA-004 | `feature/01_after_first_qa/08_pipeline_related_cta_flow.md` | Pipeline timeline에서 관련 이슈와 운영 조치 CTA로 이동하는 흐름 정의 |
| QA-001 | `feature/01_after_first_qa/09_role_permission_flow.md` | viewer/operator/admin 권한별 화면 정책 정의 |
| QA-003 | `feature/01_after_first_qa/10_monitoring_rule_diff_policy.md` | 모니터링 기준 변경 전/후 diff와 변경 사유 정책 정의 |
| QA-005 | `feature/01_after_first_qa/11_quality_issue_detail_policy.md` | 품질 이슈 sample row와 이슈 유형 표시 범위 정의 |

## 다음 역할 전달 기준

기획 feature는 퍼블리싱과 개발이 다시 해석하지 않도록 다음 항목을 포함해야 한다.

| 항목 | 기준 |
| --- | --- |
| 사용자 흐름 | 사용자가 어디서 진입하고 어디로 이동하는지 정의 |
| 화면 정책 | 표시/숨김/disabled/경고/확인 정책 정의 |
| 예외 처리 | 권한 부족, 데이터 없음, 오류, 기준 미정 상태 정의 |
| 완료 기준 | QA가 검증할 수 있는 결과 조건 정의 |

## 연계 메뉴

### 데이터 조회

기존 `jadx-tg`의 `데이터 조회` 기능은 유지한다.

- 현재 필터: 품목, 입고/선별, APC, 농가명
- 현재 기능: 목록 조회, pagination, Excel 다운로드
- 모니터링 연계: 조회 조건에 품질 이슈가 있으면 화면 상단과 Excel 다운로드 전 경고를 표시한다.

### 시각화

기존 `jadx-tg`의 `시각화` 기능은 유지한다.

- 현재 항목: APC별 당산도, APC별 등급 분포, APC별 총 선별 중량
- 모니터링 연계: 차트 자체에 운영 상태를 섞지 않고, 데이터 신뢰도 경고만 함께 표시한다.

## UX 원칙

1. 상태를 먼저 보여주고 상세는 drill-down으로 제공한다.
2. 정상, 지연, 오류, 미수신은 색상과 텍스트를 함께 표시한다.
3. 오류 발생 시 `어느 APC`, `어느 품목`, `입고/선별 중 어디`, `어느 단계`, `필요 조치`가 보여야 한다.
4. 운영자는 로그 원문보다 조치 가능한 문장을 먼저 보아야 한다.
5. 데이터 조회/시각화와 모니터링 상태는 섞지 않고, 신뢰도 경고로 연결한다.
6. 화면은 `Enterprise Data Operations Dashboard` 방향을 따른다.

## 상태 정의

| 상태 | 의미 | 화면 표현 |
| --- | --- | --- |
| 정상 | 기대 수신 주기 안에 데이터가 수신되고 저장/정제/조회 가능 | 정상 label, 정상 건수에 포함 |
| 지연 | 기대 수신 시각을 초과했으나 최근 수신 이력은 존재 | 지연 label, 지연 시간 표시 |
| 오류 | 검증, 저장, 정제, 적재, 조회 중 실패가 확인됨 | 오류 label, 오류 유형과 조치 안내 표시 |
| 미수신 | 기준 기간 내 수신 이력이 없음 | 미수신 label, 기대 수신 기준 표시 |
| 기준 미정 | 해당 APC/품목/구분의 기준이 아직 정의되지 않음 | 기준 미정 label, 설정 메뉴 이동 제공 |

## 기본 화면 흐름

1. 관리자가 `APC 데이터 관리`에 진입한다.
2. 기본 탭은 `모니터링`으로 진입한다.
3. `모니터링 홈`에서 전체 KPI, APC별 상태 matrix, 최근 이슈를 확인한다.
4. 문제가 있는 APC 또는 이슈를 선택하면 `수신 현황`, `데이터 품질 이슈`, `파이프라인 추적` 중 필요한 상세 화면으로 이동한다.
5. 운영자가 확인한 내용은 `운영 조치 내역`에 남긴다.
6. 기준 변경이 필요하면 관리자 권한으로 `모니터링 기준 설정`에서 변경한다.
7. 데이터 상태를 확인한 뒤 기존 `데이터 조회` 또는 `시각화` 탭으로 이동한다.

## 예외 및 권한 정책

- 권한이 없는 사용자는 원천 저장 경로, 상세 log preview, 기준 설정 변경 기능을 볼 수 없다.
- 수신 기준이 없는 APC는 오류가 아니라 `기준 미정`으로 표시한다.
- 위미 APC는 MVP에서 `정제 미구현/제한` 상태를 별도 표시한다.
- 중문 APC는 입고와 선별을 분리해서 표시한다.
- 상세 알림 발송은 후속 범위로 두고, MVP에서는 화면 내 경고만 정의한다.

## 완료 기준

- `Planning.md`만 읽어도 전체 메뉴 구조와 UX 흐름을 이해할 수 있다.
- 각 하위 feature 문서가 기획 기능과 화면 행동 중심으로 작성되어 있다.
- 각 메뉴가 실제 JADX 소스와 현재 기능에 근거를 둔다.
- 퍼블리싱 기준인 `Enterprise Data Operations Dashboard`와 충돌하지 않는다.
- 개발 문서는 이후 API, 데이터 모델, DAG 연계 설계로 확장할 수 있다.
