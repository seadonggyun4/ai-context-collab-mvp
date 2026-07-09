# 권한별 운영 조치 CTA 상태 구현 영향 분석

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 작성일 | 2026-07-09 |
| 변경 유형 | Publishing policy implementation |
| 관련 Publishing | `../roles/publishing/feature/03_after_third_qa/06_operation_action_entry_visual_followup.md` |
| 관련 Development | `../roles/development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md` |
| 관련 QA | `../roles/qa/feature/05_operation_actions_qa.md` |

## 변경 요약

- 운영 조치 작성 CTA의 권한 정책을 `shared/auth/rolePermissions.ts`로 중앙화했다.
- `UserRoleContext`에 `canCreateIssueAction`을 추가해 화면이 역할 literal을 직접 비교하지 않도록 했다.
- `OperationActionsPage`는 `getIssueActionEntryCtaState(role)`를 통해 CTA title, enabled/disabled 상태, helper 문구를 가져온다.
- CTA에는 `permission-cta--enabled` 또는 `permission-cta--disabled` class를 부여한다.

## 역할별 결과

| 역할 | CTA | Helper | Issue picker |
| --- | --- | --- | --- |
| viewer | disabled | 표시 | 진입 불가 |
| operator | enabled | 미표시 | 진입 가능 |
| admin | enabled | 미표시 | 진입 가능 |

## 역할별 영향

| 역할 | 영향 | 후속 필요 여부 |
| --- | --- | --- |
| Planning | 기존 viewer/operator/admin 권한 정책과 일치 | 없음 |
| Publishing | disabled 상태를 색상만이 아니라 title/helper/class로 표현 | 다음 QA에서 시각 재확인 |
| Development | CTA 권한이 공통 policy로 이동해 후속 CTA 재사용 가능 | 권한 종류 증가 시 policy 확장 |
| QA | QA3-001 내 권한별 CTA 상태 재검증 가능 | 다음 QA cycle에서 확정 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| `app/api/.venv/bin/python -m pytest` | 19 passed |
| 브라우저: viewer disabled/helper | 통과 |
| 브라우저: operator enabled | 통과 |
| 브라우저: admin enabled | 통과 |
| 브라우저: operator issue picker open | 통과 |
