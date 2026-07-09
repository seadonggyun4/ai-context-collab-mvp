# 02. 권한 상태 시각 정책

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | QA-001 권한 정책 미구현 |
| 문서 상태 | Follow-up scope |

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/01_after_first_qa/09_role_permission_flow.md` | role별 노출/수정 정책 확인 | 충족 |
| Publishing | 현재 문서 | disabled/권한 필요/tooltip 표현 정의 | 충족 |
| Development | `../../../development/feature/01_after_first_qa/09_role_permission_policy.md` | role 기반 UI/API guard 반영 필요 | 대기 |
| QA | `../../../qa/feature/02_ingestion_status_qa.md`, `../../../qa/feature/06_monitoring_rules_qa.md` | role별 재검증 | 대기 |

## 시각 정책

- 권한이 없는 정보는 빈 값처럼 보이지 않게 `권한 필요` badge를 표시한다.
- disabled button은 `color-disabled-bg`와 `color-body-muted`를 사용한다.
- 권한 부족 사유는 tooltip으로 제공한다.
- 민감 경로는 `••••/restricted` 형식으로 마스킹한다.

## 개발 전달 조건

- viewer에게 origin/refined path를 숨기는 UI 상태가 있어야 한다.
- admin 외 rule 수정 버튼은 disabled로 보여야 한다.
- disabled 상태는 hover/focus에서도 활성 버튼처럼 보이면 안 된다.
