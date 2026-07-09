# 09. 권한 정책 보완 개발 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | First QA open issue / partial-pass result |
| 문서 상태 | Implemented in MVP app |


## 발생 출처

- QA 결과: `../../../qa/qa-results/first_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/02_ingestion_status_qa.md`, `../../../qa/feature/06_monitoring_rules_qa.md`
- 원인 ID: `QA-001`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/01_after_first_qa/09_role_permission_flow.md` | viewer/operator/admin별 노출/수정 정책 확정 | 충족 |
| Publishing | `../../../publishing/feature/01_after_first_qa/02_permission_state_visual_policy.md` | 권한 필요 badge, disabled button, tooltip, path masking 기준 확정 | 충족 |
| Development | 현재 문서 | role fixture, API dependency, UI guard, test 반영 | 충족 |
| QA | `../../../qa/feature/02_ingestion_status_qa.md`, `../../../qa/feature/06_monitoring_rules_qa.md` | role별 재검증 | 자동 검증 통과 |

## 원인

사용자 역할/권한 모델이 API contract, fixture, UI 상태에 포함되지 않았다.

Phase 2-7에서는 모니터링 데이터 계약과 화면 흐름을 우선 구현했고, 로그인/세션/role provider는 MVP 범위에서 정의하지 않았다. 따라서 viewer/admin별 origin/refined path 노출 제한과 rule 수정 제한을 판단할 근거가 없다.

## 영향 범위

| 파트 | 영향 |
| --- | --- |
| Planning | viewer/operator/admin 권한별 화면 정책 추가 필요 |
| Development | `UserRole` fixture, auth context, FastAPI dependency 추가 필요 |
| Publishing | disabled button, 권한 필요 tooltip 스타일 확인 필요 |
| QA | viewer/admin 시나리오별 재검증 필요 |

## 구현 TASK

- [x] `UserRole` 기준을 Project Context와 Development 문서에 명시
- [x] planning 권한 정책의 viewer/operator/admin 구분을 타입과 fixture에 반영
- [x] publishing 권한 상태 기준에 따라 badge, disabled, tooltip, masking UI 적용
- [x] fixture에 현재 사용자 role 추가
- [x] FastAPI dependency에서 mock role 제공
- [x] origin/refined path는 viewer에게 숨김 처리
- [x] rule 수정 버튼은 admin 외 disabled 처리
- [x] QA 체크표에 role별 기대 결과 추가

## 구현 결과

- Backend: `X-User-Role` header 기반 mock role dependency를 추가했다.
- Backend: viewer 요청의 origin/refined path는 `••••/restricted`로 마스킹한다.
- Backend: admin 외 사용자의 `PUT /api/monitoring/rules/{rule_id}` 요청은 `403`으로 차단한다.
- Frontend: 헤더에서 viewer/operator/admin 역할을 전환할 수 있다.
- Frontend: viewer는 수신 상세 경로 대신 `권한 필요` badge와 마스킹 값을 본다.
- Frontend: admin 외 사용자는 기준 저장 버튼과 변경 사유 입력이 disabled 상태로 표시된다.
- Test: role별 path masking, readonly rules, non-admin update 403 검증을 추가했다.

## 완료 기준

- viewer는 origin/refined 상세 경로를 볼 수 없다.
- operator/viewer는 rule을 수정할 수 없다.
- admin은 rule 수정과 변경 사유 저장이 가능하다.
