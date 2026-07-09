# Monitoring Contract

## 목적

프론트 TypeScript 타입과 백엔드 Pydantic schema가 같은 의미를 갖도록 Phase 2에서 고정한 계약이다.

## 공통 enum

| 타입 | 값 |
| --- | --- |
| `ApcName` | `NAMWON`, `WIMI`, `SEOGWI`, `JUNGMUN`, `GUJWA` |
| `CropType` | `CITRUS`, `CARROT` |
| `SnpSe` | `WRHS`, `CLSFY` |
| `MonitoringStatus` | `NORMAL`, `DELAYED`, `ERROR`, `MISSING`, `UNDEFINED_RULE` |
| `IssueStatus` | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `IGNORED` |
| `IssueSeverity` | `HIGH`, `MEDIUM`, `LOW` |
| `PipelineStepStatus` | `SUCCESS`, `RUNNING`, `FAILED`, `SKIPPED`, `UNDEFINED` |

## API response roots

| Endpoint | Response type |
| --- | --- |
| `GET /api/monitoring/summary` | `MonitoringSummaryResponse` |
| `GET /api/monitoring/ingestions` | `IngestionStatusResponse` |
| `GET /api/monitoring/issues` | `QualityIssueResponse` |
| `GET /api/monitoring/pipeline/{trace_id}` | `PipelineTraceResponse` |
| `GET /api/monitoring/actions` | `OperationActionResponse` |
| `POST /api/monitoring/issues/{issue_id}/actions` | `OperationActionItem` |
| `GET /api/monitoring/rules` | `MonitoringRuleResponse` |
| `PUT /api/monitoring/rules/{rule_id}` | `MonitoringRuleItem` |

## API 구현 상태

Phase 4 기준으로 위 endpoint는 FastAPI router에서 제공된다. MVP에서는 deterministic fixture repository를 사용하며, `POST action`과 `PUT rule`은 process memory 안에서만 변경된다.

## 구현 파일

- Backend: `app/api/app/monitoring/schemas/*.py`
- Backend router: `app/api/app/monitoring/routers/monitoring.py`
- Backend service: `app/api/app/monitoring/services/monitoring_service.py`
- Frontend: `app/frontend/src/shared/types/monitoring.ts`
- Labels: `app/frontend/src/shared/constants/monitoringLabels.ts`

## 변경 정책

계약 변경 시 다음 문서를 함께 확인한다.

- `../../../roles/development/Development.md`
- `../../../roles/development/feature/*.md`
- `../../../roles/qa/QA.md`
- `../../../impact-analysis/`
