# 06. 운영 조치 작성 진입 시각 보강

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 세 번째 QA 이후 feature |
| QA Cycle | After third QA |
| 참조 QA 결과 | `../../../qa/qa-results/third_qa_check.md` |
| 생성 근거 | QA3-001 carry-forward issue |
| 문서 상태 | Implemented |

## 참조 문서

- `../../Publishing.md`
- `../../../planning/feature/03_after_third_qa/13_operation_action_entry_handoff_policy.md`
- `../02_after_second_qa/05_operation_action_entry_visual_policy.md`
- `../../../development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/03_after_third_qa/13_operation_action_entry_handoff_policy.md` | 운영 조치 작성은 품질 이슈 상세로 handoff | 충족 |
| Publishing | 현재 문서 | OperationActionsPage의 CTA/issue picker/disabled/focus 기준 정의 | 충족 |
| Development | `../../../development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md` | 시각 정책을 구현 TASK에 반영 | 충족 |
| QA | `../../../qa/qa-results/fourth_qa_check.md` | QA3-001 재검증 | 통과 확정 |

## 시각 보강 정책

세 번째 QA 이후 OperationActionsPage에는 다음 시각 요소가 필요하다.

| 요소 | 표시 정책 |
| --- | --- |
| 상단 command 영역 | `조치 작성` primary CTA를 우측에 배치 |
| viewer 상태 | CTA disabled, `조회 권한은 조치 등록을 할 수 없습니다` helper 표시 |
| operator/admin 상태 | CTA 활성화 |
| 대상 issue 선택 UI | desktop은 dialog, mobile은 drawer 또는 full-width stacked panel |
| issue item | APC, 품목, 입고/선별, 이슈 유형, 심각도, 최근 발생 시각 표시 |
| 선택 후 이동 안내 | 품질 이슈 상세 상단에 `운영 조치 내역에서 이동` context callout 표시 |
| focus 상태 | 기존 `action-form-block.is-focused` 스타일 재사용 |

## 금지 조건

- OperationActionsPage 내부에 full action form을 직접 배치하지 않는다.
- timeline card 안에 CTA와 issue picker를 중첩 카드 형태로 넣지 않는다.
- CTA disabled 사유를 색상만으로 표현하지 않는다.

## 완료 기준

- 사용자는 운영 조치 내역을 감사/이력 화면으로 이해한다.
- 사용자는 조치 작성 CTA를 통해 작성 흐름을 시작할 수 있다.
- 작성 대상 issue 선택과 실제 action form 위치가 시각적으로 분리된다.
- viewer/operator/admin 권한 차이가 명확하다.

## 구현 반영 결과

| 항목 | 구현 결과 |
| --- | --- |
| viewer 상태 | `조치 작성` CTA disabled, helper callout 표시 |
| operator 상태 | `조치 작성` CTA enabled, issue picker 진입 가능 |
| admin 상태 | `조치 작성` CTA enabled, issue picker 진입 가능 |
| disabled 사유 | title과 helper text로 함께 표시 |
| 시각 상태 class | `permission-cta--enabled`, `permission-cta--disabled` |
| 권한 정책 위치 | `shared/auth/rolePermissions.ts`로 중앙화 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| `projects/apc-monitoring-mvp/api/.venv/bin/python -m pytest` | 19 passed |
| 브라우저: viewer CTA disabled/helper 표시 | 통과 |
| 브라우저: operator CTA enabled | 통과 |
| 브라우저: admin CTA enabled | 통과 |
| 브라우저: operator CTA 클릭 시 issue picker 표시 | 통과 |
