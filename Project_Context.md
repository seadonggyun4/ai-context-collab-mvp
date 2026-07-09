# Project Context

## 프로젝트명

JADX APC(농산물산지유통센터) 모니터링 서비스 MVP

## 프로젝트 목적

JADX 플랫폼에 수집되는 APC(농산물산지유통센터) 선별/입고 데이터의 수신 상태와 품질 상태를 관리자가 빠르게 확인할 수 있도록 한다.

이 MVP의 목적은 단순 기능 구현이 아니라, AI가 Project Context, 직군별 문서, Feature 문서를 함께 참조하여 직군 간 소통 비용을 줄이는 협업 방식을 시연하는 것이다.

## 해결하려는 문제

APC(농산물산지유통센터) 데이터는 감귤/당근 출하, 선별, 품질, 생산량 예측, 농가별 영농지도에 영향을 주는 핵심 데이터다. 하지만 APC별 전송 방식, 데이터 항목, 전송 주기, 정제/적재 경로가 다르면 다음 문제가 발생한다.

- 특정 APC 데이터가 지연되거나 누락되어도 화면 사용자가 바로 알기 어렵다.
- 데이터 수신 API, Object Storage, Airflow 적재, FastAPI 조회 API, 프론트 화면이 각자 따로 확인된다.
- 기획 변경이 발생했을 때 퍼블리싱, 개발, QA 영향 범위를 다시 해석해야 한다.
- 예측/통계 결과 이상이 데이터 수집 문제인지 모델 문제인지 구분하기 어렵다.

## 주요 사용자

- 농기원 관리자: APC별 데이터 수신 상태와 품질 상태를 확인한다.
- 데이터 운영 담당자: 수신 지연, 누락, 중복, 스키마 오류를 확인하고 조치한다.
- 개발자: API, DAG, 적재 결과의 장애 원인을 추적한다.
- 기획/QA 담당자: 화면 정책과 테스트 기준을 동일한 문맥에서 확인한다.

## 핵심 요구사항

- APC별 최근 수신 시각을 확인할 수 있어야 한다.
- APC별 데이터 상태를 정상, 지연, 오류, 미수신으로 구분해야 한다.
- 감귤/당근, 입고/선별 구분으로 조회할 수 있어야 한다.
- 품질 오류 유형을 필수값 누락, 형식 오류, 중복, 전일 대비 급변으로 구분해야 한다.
- 오류 발생 시 원천 데이터 경로, 정제 데이터 경로, 적재 DAG, 화면 영향 범위를 확인할 수 있어야 한다.
- 엑셀 다운로드 전 데이터 품질 경고를 표시해야 한다.

## 협업 문서 구조

```text
organization-standards/
├── planning-standards.md
├── publishing-standards.md
├── development-standards.md
└── qa-standards.md

Project_Context.md

roles/
├── Feature_Workflow.md
├── planning/
│   ├── Planning.md
│   └── feature/
│       ├── 00_initial/
│       ├── 01_after_first_qa/
│       ├── 02_after_second_qa/
│       └── 03_after_third_qa/
├── publishing/
│   ├── Publishing.md
│   └── feature/
│       ├── 00_initial/
│       ├── 01_after_first_qa/
│       ├── 02_after_second_qa/
│       └── 03_after_third_qa/
├── development/
│   ├── Development.md
│   └── feature/
│       ├── 00_initial/
│       ├── 01_after_first_qa/
│       ├── 02_after_second_qa/
│       └── 03_after_third_qa/
└── qa/
    ├── QA.md
    ├── feature/
    └── qa-results/
        ├── first_qa_check.md
        ├── second_qa_check.md
        └── third_qa_check.md

impact-analysis/

app/
├── frontend/
├── api/
├── shared/
└── docs/
```

각 문서는 독립 산출물이 아니라 Project Context를 기준으로 연결된다. 변경이 발생하면 `impact-analysis/`에 영향 범위를 기록하고, 기획/퍼블리싱/개발/QA 문서 중 수정 대상이 무엇인지 함께 확인한다.

`roles/Feature_Workflow.md`는 feature가 역할 간에 이동하는 순서를 정의한다. 후속 feature는 개발 문서로 바로 넘어가지 않고, 반드시 `기획 feature 탐색/확정 → 퍼블리싱 feature 탐색/기획 조건 충족 → 개발 feature에서 기획+퍼블리싱+QA 조건 충족` 순서로 관리한다.

`roles/qa/qa-results/`는 실행 코드 내부가 아니라 QA 역할 문서 체계 안에서 관리한다. QA 결과는 개발자 전용 산출물이 아니라 기획/퍼블리싱/개발/QA가 함께 보는 협업 기록이며, QA 파트가 기준 문서와 결과 문서를 함께 소유해야 한다.

`roles/{planning,publishing,development}/feature/`는 QA cycle 기준으로 나눈다. `00_initial/`은 첫 QA 이전 최초 설계 범위, `01_after_first_qa/`는 첫 번째 QA 결과에서 파생된 보완 범위, `02_after_second_qa/`는 두 번째 QA 결과에서 파생될 범위를 의미한다. 이후 QA가 추가되면 `03_after_third_qa/`처럼 다음 cycle 디렉토리를 만든다.

QA에서 실패, 부분 통과, 정책 확정 후 구현 대기, 이전 QA에서 이월된 미완료 항목이 발견되면 별도 디렉토리에 만들지 않고, 해당 QA cycle의 `roles/{part}/feature/{cycle}/` 하위에 다음 순번 feature 문서로 생성한다. 예를 들어 세 번째 QA에서 남은 개발 구현 문제는 `roles/development/feature/03_after_third_qa/`, 세 번째 QA에서 보강된 기획 정책은 `roles/planning/feature/03_after_third_qa/`, 세 번째 QA에서 보강된 퍼블리싱 기준은 `roles/publishing/feature/03_after_third_qa/`에 생성한다. 이렇게 해야 각 파트 작업자는 자기 역할의 최신 QA cycle 디렉토리만 따라가도 현재 남은 작업을 추적할 수 있다.

## Feature Lifecycle 생성 규칙

| Cycle 디렉토리 | 생성 시점 | 생성 기준 | 예시 |
| --- | --- | --- | --- |
| `00_initial/` | 첫 QA 이전 | Project Context와 각 역할 상위 문서 기준으로 최초 기능 범위 작성 | `roles/development/feature/00_initial/01_monitoring_home.md` |
| `01_after_first_qa/` | `first_qa_check.md` 이후 | 첫 QA의 실패/부분 통과 항목을 역할별 후속 feature로 전환 | `roles/development/feature/01_after_first_qa/09_role_permission_policy.md` |
| `02_after_second_qa/` | `second_qa_check.md` 이후 | 두 번째 QA의 신규 실패/재실패 항목을 다음 cycle feature로 전환 | `roles/planning/feature/02_after_second_qa/` |
| `03_after_third_qa/` | `third_qa_check.md` 이후 | 세 번째 QA의 실패/부분 통과/구현 대기/carry-forward 항목을 최신 cycle feature로 전환 | `roles/development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md` |
| `NN_after_{nth}_qa/` | N번째 QA 이후 | QA 결과가 생성될 때마다 해당 cycle 디렉토리를 만들고 미완료 항목을 역할별 feature로 이월 | `roles/{part}/feature/NN_after_{nth}_qa/` |

Feature 문서는 생성 시점과 근거를 잃지 않도록 반드시 공통 메타데이터를 포함한다.

```md
## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning / publishing / development |
| 생성 시점 | QA 이전 초기 feature / 첫 번째 QA 이후 feature / 두 번째 QA 이후 feature / N번째 QA 이후 feature |
| QA Cycle | Initial planning before first QA / After first QA / After second QA / After nth QA |
| 참조 QA 결과 | None 또는 `roles/qa/qa-results/{qa_result}.md` |
| 생성 근거 | Project Context 또는 QA open issue |
| 문서 상태 | Initial scope baseline / Follow-up scope / Reserved for next QA cycle |
```

새 QA 결과가 생성되면 AI는 다음 순서로 문서를 갱신한다. 이 단계는 선택 사항이 아니라 문서 엔진의 기본 동작이다.

1. `roles/qa/qa-results/{nth}_qa_check.md`에 검증 결과, 실패 원인, 영향 범위를 기록한다.
2. QA cycle 번호에 맞는 `roles/planning/feature/{cycle}/`, `roles/publishing/feature/{cycle}/`, `roles/development/feature/{cycle}/` 디렉토리를 생성한다.
3. 실패/부분 통과/정책 확정 후 구현 대기/carry-forward 항목을 기획, 퍼블리싱, 개발, QA 중 담당 역할로 분류한다.
4. 먼저 관련 planning feature를 탐색하고, 이전 cycle에 이미 있더라도 최신 QA cycle에 carry-forward planning feature를 생성하거나 연결 문서를 생성한다.
5. publishing feature가 planning 조건을 충족하는지 확인하고, 이전 cycle에 이미 있더라도 최신 QA cycle에 carry-forward publishing feature를 생성하거나 연결 문서를 생성한다.
6. development feature는 planning과 publishing 조건을 모두 참조한 뒤 최신 QA cycle의 `roles/development/feature/{cycle}/`에 생성한다. 이전 cycle 구현 문서가 있더라도 최신 QA 결과에서 미완료라면 새 cycle의 구현 feature로 이월한다.
7. 각 후속 feature 문서에 참조 QA ID, 이전 cycle 연결 문서, 역할 간 충족 게이트, 원인, 영향 범위, TASK, 완료 기준을 기록한다.
8. `roles/qa/qa-results/{nth}_qa_check.md`의 후속 문서 링크를 최신 cycle feature로 갱신한다.
9. `impact-analysis/`에 QA cycle 생성, carry-forward 판단, 구현 영향 범위를 남긴다.
10. `Project_Context.md` 변경 이력에 QA cycle과 생성된 역할별 feature를 기록한다.

## 역할 간 Feature 충족 게이트

개발 feature는 단독으로 완료될 수 없다. 최종 구현 완료 판단은 다음 게이트를 모두 통과해야 한다.

| 순서 | 게이트 | 확인 기준 |
| --- | --- | --- |
| 1 | Planning 탐색/확정 | 사용자 흐름, 화면 정책, 예외 처리, 문구, 완료 기준이 정의되어 있는가 |
| 2 | Publishing 탐색/충족 | 기획 조건을 만족하는 컴포넌트, 상태 표현, 레이아웃, 반응형, 접근성 기준이 정의되어 있는가 |
| 3 | Development 구현 | 기획 요구사항과 퍼블리싱 기준을 모두 구현 TASK와 테스트에 반영했는가 |
| 4 | QA 재검증 | QA 결과 문서와 체크표가 세 역할의 기준을 모두 검증했는가 |

후속 feature 문서에는 다음 섹션을 포함한다.

```md
## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `...` | 사용자 흐름/정책/완료 기준 확정 | 충족/부분/미충족 |
| Publishing | `...` | 기획 조건을 만족하는 UI 기준 확정 | 충족/부분/미충족 |
| Development | `...` | 기획+퍼블리싱 조건을 구현 TASK에 반영 | 충족/부분/미충족 |
| QA | `...` | 재검증 체크표와 연결 | 충족/부분/미충족 |
```

`app/`은 문서 기준이 실제 구현물로 전환되는 영역이다. 문서 산출물과 실행 코드는 분리하되, 구현은 항상 Project Context와 직군별 문서를 참조한다.

## 실제 코드 참조

- APC 수신 API: `/Users/dgseo/Desktop/JADX/jadx-apc-api/app/routes.py`
- APC Snapshot DAG: `/Users/dgseo/Desktop/JADX/jadx-sis/airflow/dags/apc_cifru_jungmun_snapshot_dag.py`
- APC 조회 API: `/Users/dgseo/Desktop/JADX/jadx-sis/fastapi/app/domains/guidance/api/v0/routes/apc.py`
- APC 화면: `/Users/dgseo/Desktop/JADX/jadx-fe/apps/jadx-tg/src/pages/ApcDataManagement`
- APC 프론트 API: `/Users/dgseo/Desktop/JADX/jadx-fe/apps/jadx-tg/src/services/apis/apcApi.ts`

## 용어 정의

| 용어 | 정의 |
| --- | --- |
| APC | Agricultural Products Processing Center. 국내 업무 맥락에서는 농산물산지유통센터를 의미한다. 현재 남원, 위미, 서귀, 구좌, 중문 데이터가 코드상 확인된다. |
| 입고 | APC에 농산물이 들어온 기록. |
| 선별 | APC에서 품질/크기/당도 등 기준으로 분류된 기록. |
| 원천 데이터 | 외부 시스템에서 수신한 원본 데이터. Object Storage의 `origin` 영역에 저장된다. |
| 정제 데이터 | 서비스 조회와 적재를 위해 변환된 데이터. |
| Snapshot | 정제 데이터를 조회/통계용 구조로 적재한 결과. |
| 데이터 품질 상태 | 수신 지연, 누락, 중복, 필수값 오류 등 운영 판단에 필요한 상태. |
| viewer | 조회자 역할. 상태와 요약 정보는 볼 수 있으나 origin/refined 상세 경로와 설정 수정은 제한된다. |
| operator | 운영자 역할. 품질 이슈 상세와 운영 조치 메모는 처리할 수 있으나 시스템 기준 설정은 수정할 수 없다. |
| admin | 관리자 역할. 모니터링 기준 수정과 권한 필요 작업을 수행할 수 있다. |

## 제약사항

- MVP는 문서 기반 시연을 우선한다.
- 실제 운영 DB나 Object Storage에 쓰기 작업을 수행하지 않는다.
- 기존 화면/코드 구조를 기준으로 기능 확장 범위를 정의한다.
- 개인정보와 농업경영체 등록번호는 마스킹 또는 권한 제어가 필요하다.

## 일정

| 단계 | 산출물 | 목표 |
| --- | --- | --- |
| 1단계 | Context 문서 세트 | 협업 구조 시연 |
| 2단계 | Feature 문서 | 기능 구현 범위 합의 |
| 3단계 | QA/영향 분석 문서 | AI 협업 엔진 역할 시연 |
| 4단계 | 화면/ API PoC | 필요 시 후속 구현 |

## 변경 이력

| 일자 | 변경 내용 | 영향 |
| --- | --- | --- |
| 2026-07-09 | MVP 주제를 APC(농산물산지유통센터) 모니터링 서비스로 선정 | 기획/퍼블리싱/개발/QA 문서 최초 작성 |
| 2026-07-09 | Astryx Design System 기준으로 퍼블리싱/개발 문서 정렬 및 QA/impact-analysis 계층 추가 | 퍼블리싱/개발 충돌 해소, QA 검증 체계 추가 |
| 2026-07-09 | 실제 구현을 위한 `app/` 작업공간 생성 | 문서 산출물과 실행 코드 분리, Phase 0 완료 |
| 2026-07-09 | Vite React, FastAPI, Vercel 기본 scaffold 생성 | Phase 1 완료, Phase 2 타입/API 계약 구현 준비 |
| 2026-07-09 | TypeScript 타입, Pydantic schema, 공통 contract 구현 | Phase 2 완료, fixture/API 구현 준비 |
| 2026-07-09 | deterministic fixture와 mock repository 구현 | Phase 3 완료, FastAPI monitoring API 구현 준비 |
| 2026-07-09 | `/api/monitoring/*` FastAPI endpoint 구현 | Phase 4 완료, React UI Shell 구현 준비 |
| 2026-07-09 | Astryx + JADX_STATS 기준 APC 데이터 관리 UI Shell 구현 | Phase 5 완료, Monitoring Core API 연동 준비 |
| 2026-07-09 | 모니터링 홈/수신/품질 이슈/파이프라인/조치/기준 설정 화면 API 연동 | Phase 6 완료, 기존 데이터 조회/시각화 연계 준비 |
| 2026-07-09 | 데이터 조회 Excel 경고와 시각화 신뢰도 warning 연계 | Phase 7 완료, QA 검증 단계 준비 |
| 2026-07-09 | `roles/qa/*` 체크표 기준 QA 검증 수행 | Phase 8 완료, 권한/드릴다운/diff/pagination 등 미해결 이슈 도출 |
| 2026-07-09 | QA 결과 위치를 `roles/qa/qa-results/first_qa_check.md`로 정리하고 실패 항목을 역할별 `roles/*/feature/{cycle}/`에 후속 문서로 생성 | QA 결과가 QA 파트 문서 체계 안에서 관리되고, 후속 이슈는 각 파트의 기존 feature 흐름에 누적됨 |
| 2026-07-09 | 역할별 feature 디렉토리를 `00_initial`, `01_after_first_qa`, `02_after_second_qa` cycle 구조로 개편 | 초기 범위와 QA 이후 보완 범위가 섞이지 않고, QA cycle 기반으로 문서 생성 이력을 추적할 수 있음 |
| 2026-07-09 | `roles/Feature_Workflow.md`와 역할 간 feature 충족 게이트 추가 | 개발 feature가 기획/퍼블리싱 조건을 충족해야 완료될 수 있도록 문서 흐름을 고정 |
| 2026-07-09 | 두 번째 QA 체크표 기반 검증 수행 및 브라우저 시각 QA 완료 | 권한/diff/품질 상세/JADX 메뉴 시나리오 통과, matrix drill-down/pipeline CTA 등 후속 feature를 `02_after_second_qa/`에 생성 |
| 2026-07-09 | Matrix drill-down 구현 및 3차 QA 부분 재검증 수행 | 모니터링 홈 matrix cell 선택이 수신 현황/품질 이슈/기준 설정 탭과 filter chip으로 연결됨 |
| 2026-07-09 | Pipeline related CTA 구현 및 3차 QA 부분 재검증 수행 | 파이프라인 실패 trace에서 관련 품질 이슈 확인과 운영 조치 작성 흐름으로 이동 가능 |
| 2026-07-09 | 운영 조치 Action Form 정책 확정 | 운영 조치 내역은 audit-first 화면으로 고정하고, 실제 조치 작성 form은 데이터 품질 이슈 상세로 단일화 |
| 2026-07-09 | 세 번째 QA 체크표 기반 검증 수행 | matrix drill-down/pipeline CTA 통과 확정, operation action entry handoff는 다음 개발 phase로 유지 |
| 2026-07-09 | QA cycle 자동 feature 생성 규칙 보강 및 `03_after_third_qa/` 생성 | QA가 늘어날 때마다 실패/부분 통과/구현 대기/carry-forward 항목이 최신 역할별 feature로 자동 이월되도록 문서 엔진 규칙 정렬 |
| 2026-07-09 | 운영 조치 작성 진입 handoff 구현 | 운영 조치 내역에서 조치 작성 대상 issue를 선택하면 데이터 품질 이슈 상세의 canonical action form으로 이동하고, viewer/operator/admin 권한 상태가 화면에 반영됨 |
| 2026-07-09 | Action Context 일반화 | pipeline/action 화면 handoff context 생성과 표시 정책을 service로 중앙화해 후속 source 추가 시 역할별 문서 기준을 깨지 않고 확장 가능 |
| 2026-07-09 | 권한별 운영 조치 CTA 상태 구현 | viewer는 disabled/helper, operator/admin은 enabled 상태로 `조치 작성` CTA가 표시되며 권한 정책이 `rolePermissions`로 중앙화됨 |
| 2026-07-09 | 대상 Issue Picker 구현 | 조치 작성 전 미확인/확인중 품질 이슈를 심각도 및 최근 발생 기준으로 선택할 수 있도록 picker 정책과 UI를 분리 구현 |
| 2026-07-09 | QualityIssues Form Focus 연결 | 대상 issue 선택 후 데이터 품질 이슈 탭으로 이동하고 선택 issue의 action form에 scroll/focus/callout이 적용되도록 focus hook으로 중앙화 |
| 2026-07-09 | 운영 조치 Timeline 갱신 검증 | 조치 등록 성공 후 `GET /api/monitoring/actions` 재조회 신호가 운영 조치 내역에 전달되어 신규 timeline 이력이 표시됨 |
| 2026-07-09 | 네 번째 QA 체크 완료 | QA3-001 재검증 통과, 자동/브라우저 검증 완료, 신규 미해결 항목이 없어 `04_after_fourth_qa/` 후속 feature 생성 없음 |
