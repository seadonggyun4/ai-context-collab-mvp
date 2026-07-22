# 2026-07-09 FastAPI Monitoring API 구현 영향 분석

## 변경 요약

개발 feature 01-08에서 사용할 `/api/monitoring/*` endpoint를 FastAPI router로 구현했다. Phase 3 fixture repository를 service 계층으로 감싸고, router는 HTTP query/body/response와 에러 상태만 담당한다.

추가된 구현:

- `projects/apc-monitoring-mvp/api/app/monitoring/routers/monitoring.py`
- `projects/apc-monitoring-mvp/api/app/monitoring/services/monitoring_service.py`
- monitoring router 등록
- action 생성 mock mutation
- rule 수정 mock mutation
- API endpoint regression test

## 변경 원인

Phase 5 UI Shell과 Phase 6 Monitoring Core가 실제 API를 호출할 수 있어야 한다. 화면 구현 전에 API endpoint, query alias, response alias, 404/validation 동작을 고정하여 프론트와 백엔드의 해석 차이를 줄인다.

## 제공 API

| Endpoint | 용도 |
| --- | --- |
| `GET /api/monitoring/summary` | 모니터링 홈 KPI, matrix, 최근 이슈, 상태 분포 |
| `GET /api/monitoring/ingestions` | 수신 현황 목록 |
| `GET /api/monitoring/issues` | 데이터 품질 이슈 목록 |
| `GET /api/monitoring/pipeline/{trace_id}` | 파이프라인 단계 추적 |
| `GET /api/monitoring/actions` | 운영 조치 내역 |
| `POST /api/monitoring/issues/{issue_id}/actions` | 이슈 조치 등록 |
| `GET /api/monitoring/rules` | 모니터링 기준 목록 |
| `PUT /api/monitoring/rules/{rule_id}` | 모니터링 기준 수정 |

## 영향 문서

| 문서 | 영향 |
| --- | --- |
| `Project_Context.md` | Phase 4 변경 이력 추가 |
| `projects/apc-monitoring-mvp/docs/phase-plan.md` | 현재 상태를 Phase 4 완료로 갱신 |
| `projects/apc-monitoring-mvp/shared/contracts/monitoring-contract.md` | POST/PUT endpoint와 구현 파일 추가 |
| `roles/development/feature/01-06` | API/schema/fixture 완료 TASK 체크 |

## 기획 영향

- 메뉴 구조 변경 없음.
- 기획 문서의 모니터링 홈, 수신 현황, 품질 이슈, 파이프라인 추적, 운영 조치, 기준 설정 흐름을 API로 호출할 수 있다.

## 퍼블리싱 영향

- 화면 스타일 변경 없음.
- Phase 5부터 UI shell은 fixture API의 실제 response를 기준으로 상태 Badge, Table, Drawer, Dialog를 구현할 수 있다.

## 개발 영향

- router/service/repository 경계가 분리되어 실제 JADX adapter로 전환할 때 router 변경을 최소화할 수 있다.
- query alias는 문서 기준인 `snpSe`, `startDate`, `endDate`, `issueType`, `issueStatus`, `issueId`를 사용한다.
- `POST action`, `PUT rule`은 MVP process memory 안에서만 반영되며 영속 저장은 하지 않는다.

## QA 영향

- `tests/test_monitoring_api.py`에서 endpoint 응답, 필터, 404, mock mutation을 검증한다.
- API가 실패하더라도 기존 schema/fixture/health regression이 함께 실행된다.

## 리스크

- Vercel serverless 환경에서는 process memory mutation이 요청 간 지속된다고 보장할 수 없다.
- MVP API는 fixture 기반이므로 실제 운영 latency, 인증, DB transaction, Airflow log 조회 실패는 아직 검증하지 않는다.

## 후속 조치

- Phase 5에서 React UI Shell을 만들고 API client를 endpoint contract에 연결한다.
- Phase 6에서 monitoring core 화면들이 API response를 소비하게 한다.
- 운영 시스템 반영 단계에서는 service 아래 adapter를 추가하고 동일 response model을 유지한다.
