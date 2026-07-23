# DF-001 Console Implementation

## 구현 범위

- React/Astryx application shell
- dashboard, change request, context browser, impact graph, review routes
- deterministic APC scenario fixture
- workflow state machine과 permission guard
- semantic document diff와 evidence view
- responsive and keyboard navigation

## TASK

| ID | 작업 | 완료 조건 |
| --- | --- | --- |
| DEV-01 | app shell과 theme | 전 route에 동일 token·navigation 적용 |
| DEV-02 ✅ | domain model | YAML 상태·권한 계약을 TypeScript로 반영 |
| DEV-03 | dashboard | `REQ-DASH-*` 충족 |
| DEV-04 | request analysis | `REQ-CHANGE-*` 충족 |
| DEV-05 | context and impact | `REQ-CONTEXT-*`, `REQ-IMPACT-*` 충족 |
| DEV-06 | review and evidence | `REQ-REVIEW-*`, `REQ-VERIFY-*` 충족 |
| DEV-07 | QA | 자동 테스트와 시각 QA 통과 |

`DEV-02`의 구현·검증 증거는 `../01_phase-1/01_domain_fixture.md`에서 관리한다.
