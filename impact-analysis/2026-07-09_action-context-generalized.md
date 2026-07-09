# Action Context 일반화 영향 분석

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 작성일 | 2026-07-09 |
| 변경 유형 | Development hardening |
| 관련 Development | `../roles/development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md` |
| 관련 화면 | PipelineTracePage, OperationActionsPage, QualityIssuesPage |

## 변경 요약

- `ActionEntryContext`의 생성과 표시 정책을 `features/monitoring/services/actionEntryContext.ts`로 중앙화했다.
- `ApcDataManagementShell`은 handoff context를 직접 조립하지 않고 factory를 통해 생성한다.
- `QualityIssuesPage`는 source별 label/value를 직접 분기하지 않고 helper를 사용한다.

## 영향 범위

| 영역 | 영향 | 결과 |
| --- | --- | --- |
| Planning | 기존 `pipeline -> 품질 이슈`, `운영 조치 내역 -> 품질 이슈` 흐름 유지 | 변경 없음 |
| Publishing | callout label과 focus UI는 기존 정책 유지 | 변경 없음 |
| Development | 새 handoff source 추가 시 source meta/factory 중심으로 확장 가능 | 개선 |
| QA | 기존 QA3-001 검증 항목 유지, source label 회귀 확인 필요 | 다음 QA cycle에서 확인 |

## 회귀 확인

| 검증 | 결과 |
| --- | --- |
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| `app/api/.venv/bin/python -m pytest` | 19 passed |

## 후속 확장 기준

새로운 handoff 출처가 생기면 다음 순서로 확장한다.

1. `ActionEntrySource` union에 source 추가
2. `ACTION_ENTRY_SOURCE_META`에 label/description/traceId 정책 추가
3. source 전용 factory 추가
4. shell 또는 해당 화면에서 factory만 호출
5. `QualityIssuesPage`는 기존 `ActionEntryContext` prop을 그대로 사용
