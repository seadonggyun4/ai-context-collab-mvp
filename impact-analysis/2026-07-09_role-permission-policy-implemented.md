# 2026-07-09 권한 정책 보완 구현 영향 분석

## 변경 요약

QA-001 권한 정책 미구현 항목을 독립 MVP 앱에 구현했다.

구현 범위:

- viewer/operator/admin role 기준 추가
- `X-User-Role` header 기반 FastAPI mock role dependency 추가
- viewer의 origin/refined path 마스킹
- admin 외 rule 수정 API 차단
- 프론트 role selector 추가
- 권한 필요 badge, disabled button, tooltip/title, path masking UI 추가

## 참조 문서

| 역할 | 문서 |
| --- | --- |
| Planning | `../roles/planning/feature/01_after_first_qa/09_role_permission_flow.md` |
| Publishing | `../roles/publishing/feature/01_after_first_qa/02_permission_state_visual_policy.md` |
| Development | `../roles/development/feature/01_after_first_qa/09_role_permission_policy.md` |
| QA | `../roles/qa/feature/02_ingestion_status_qa.md`, `../roles/qa/feature/06_monitoring_rules_qa.md` |

## API 영향

| Endpoint | 변경 |
| --- | --- |
| `GET /api/monitoring/ingestions` | `X-User-Role: VIEWER` 요청 시 origin/refined path를 `••••/restricted`로 마스킹 |
| `GET /api/monitoring/rules` | admin 외 role 요청 시 `isEditable=false`로 반환 |
| `PUT /api/monitoring/rules/{rule_id}` | admin 외 role 요청 시 `403 RULE_NOT_EDITABLE` 반환 |

## UI 영향

- 헤더에 현재 역할 선택 control을 추가했다.
- viewer는 수신 상세에서 제한 경로 대신 `권한 필요` badge를 본다.
- admin 외 사용자는 기준 변경 영역에서 권한 안내 callout과 disabled 입력/버튼을 본다.

## QA 영향

- `roles/qa/qa-results/second_qa_check.md`에 QA-001 부분 재검증 결과를 기록했다.
- 추가 검증 명령:
  - `cd app/api && .venv/bin/python -m pytest`
  - `cd app/frontend && npm run typecheck`
  - `cd app/frontend && npm run build`

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| Backend pytest | 18 passed |
| Frontend typecheck | 통과 |
| Frontend production build | 통과 |

## 남은 범위

- 브라우저 시각 QA는 별도 QA-007 범위에서 수행한다.
- 운영 JADX 반영은 이번 MVP 범위가 아니다.
