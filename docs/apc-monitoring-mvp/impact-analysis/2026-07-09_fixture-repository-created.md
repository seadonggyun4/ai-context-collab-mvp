# 2026-07-09 Fixture Repository 구현 영향 분석

## 변경 요약

실제 운영 DB, Object Storage, Airflow, APC API 연동 전에도 같은 시연 결과를 반복 재현할 수 있도록 deterministic fixture와 mock repository를 구현했다.

추가된 구현:

- `projects/apc-monitoring-mvp/shared/fixtures/monitoring_fixture.json`
- `MonitoringFixtureRepository`
- fixture repository export
- fixture contract/필터/정렬 테스트
- fixture README

## 변경 원인

Phase 4 API와 Phase 5 이후 UI를 실제 운영 시스템에 바로 연결하면 시연 안정성이 낮아지고, 기획/개발/QA가 같은 기준 데이터를 보며 검증하기 어렵다. Phase 3에서는 문서의 메뉴 구조와 API 계약을 검증 가능한 fixture data로 고정한다.

## 영향 문서

| 문서 | 영향 |
| --- | --- |
| `Project_Context.md` | Phase 3 변경 이력 추가 |
| `projects/apc-monitoring-mvp/docs/phase-plan.md` | 현재 상태를 Phase 3 완료로 갱신 |
| `projects/apc-monitoring-mvp/shared/fixtures/README.md` | fixture 목적과 포함 상태 명시 |
| `roles/development/Development.md` | API 구현 전 repository 경계가 준비됨 |
| `roles/qa/QA.md` | QA 체크 시 동일 fixture 기준으로 검증 가능 |

## 기획 영향

- Planning 문서의 메뉴 구조는 변경하지 않는다.
- 모니터링 홈, 수신 현황, 품질 이슈, 파이프라인 추적, 운영 조치, 기준 설정을 하나의 fixture 흐름으로 확인할 수 있다.
- 중문 입고/선별 분리, 위미 정제 제한, 구좌 기준 미정 같은 실제성 있는 시나리오를 시연 데이터에 포함했다.

## 퍼블리싱 영향

- 화면 스타일 변경 없음.
- 정상/지연/오류/미수신/기준 미정 상태가 모두 포함되어 상태 색상, Badge, Status Dot 검증에 사용할 수 있다.

## 개발 영향

- Phase 4 FastAPI router는 `MonitoringFixtureRepository`를 주입해 `/api/monitoring/*` 응답을 구현할 수 있다.
- fixture는 Pydantic response model을 통과하므로 API 계약 drift를 조기에 발견할 수 있다.
- 실제 JADX 연동은 repository adapter 교체 방식으로 확장한다.

## QA 영향

- `tests/test_fixture_repository.py`가 fixture 로딩, 계약 검증, 상태 커버리지, 운영 우선순위 정렬, 필터, 누락 trace 예외를 검증한다.
- UI QA는 같은 fixture를 기준으로 empty/loading/error 외 정상 시나리오를 재현할 수 있다.

## 리스크

- TypeScript 타입과 Python schema, JSON fixture는 아직 자동 생성 관계가 아니므로 변경 시 수동 동기화가 필요하다.
- fixture는 운영 데이터의 대표 시나리오이며 전체 운영 케이스를 대체하지 않는다.

## 후속 조치

- Phase 4에서 FastAPI monitoring router를 repository 기반으로 구현한다.
- Phase 5 이후 frontend에서 동일 fixture API를 호출해 화면 상태를 검증한다.
- 실제 JADX 연동 시 `JadxApcApiAdapter`, `DatahubAirflowAdapter`를 별도 구현하고 fixture repository와 같은 response contract를 유지한다.
