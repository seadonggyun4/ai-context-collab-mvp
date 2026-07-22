# App Architecture

## 목표 구조

```text
React/Vite App
  ├── monitoring feature
  ├── data lookup integration
  ├── visualization integration
  └── shared API client

FastAPI App
  └── monitoring domain
      ├── routers
      ├── schemas
      ├── services
      ├── repositories
      └── adapters

shared/
  ├── contracts
  └── fixtures
```

## 경계

| 영역 | 책임 |
| --- | --- |
| `frontend/src/app` | 앱 진입, 라우팅, 전역 provider |
| `frontend/src/features/monitoring` | 모니터링 탭의 핵심 화면 |
| `frontend/src/features/data-lookup-integration` | 기존 데이터 조회 메뉴 품질 경고 연계 |
| `frontend/src/features/visualization-integration` | 기존 시각화 메뉴 신뢰도 경고 연계 |
| `frontend/src/shared` | API client, 공통 상수, 공통 UI wrapper |
| `api/app/monitoring/routers` | FastAPI endpoint |
| `api/app/monitoring/schemas` | Pydantic request/response schema |
| `api/app/monitoring/services` | 상태 계산, 정렬, validation orchestration |
| `api/app/monitoring/repositories` | fixture/mock repository |
| `api/app/monitoring/adapters` | 추후 JADX, DataHub, Airflow 연동 경계 |
| `shared/contracts` | 프론트/백엔드가 공유해야 하는 계약 문서 |
| `shared/fixtures` | deterministic MVP fixture 원본 |

## 확장 원칙

- 신규 메뉴는 `features/{feature-name}` 단위로 추가한다.
- API endpoint 추가 시 schema, repository, service, router를 같은 monitoring domain 안에서 확장한다.
- 실제 JADX 연동은 adapters에만 추가하고, router나 frontend가 직접 외부 시스템을 알지 않게 한다.
- QA 결과는 코드와 분리해 `../../../docs/apc-monitoring-mvp/roles/qa/qa-results/`에 기록한다.
- QA 실패/부분 통과 항목은 각 역할의 `../../../docs/apc-monitoring-mvp/roles/{part}/feature/{cycle}/` 하위 다음 순번 문서로 생성한다.
