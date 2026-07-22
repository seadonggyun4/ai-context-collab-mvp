# API

## 책임

Python FastAPI 기반 APC 모니터링 API를 구현한다.

## 기준 문서

- `../../../docs/apc-monitoring-mvp/roles/development/Development.md`
- `../../../docs/apc-monitoring-mvp/roles/development/feature/*.md`
- `../../../docs/apc-monitoring-mvp/Project_Context.md`

## 디렉토리 경계

| 경로 | 책임 |
| --- | --- |
| `app/monitoring/routers` | FastAPI endpoint |
| `app/monitoring/schemas` | Pydantic schema |
| `app/monitoring/services` | 상태 계산, 정렬, validation orchestration |
| `app/monitoring/repositories` | deterministic fixture repository |
| `app/monitoring/adapters` | 추후 JADX/DataHub/Airflow 연동 경계 |
| `tests` | API/schema test |

## 다음 Phase

Phase 1에서 FastAPI entrypoint와 Python dependency 파일을 생성한다.
