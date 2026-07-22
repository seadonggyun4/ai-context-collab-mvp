# 15. 운영 조치 작성 진입 Handoff 구현 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 두 번째 QA 이후 feature |
| QA Cycle | After second QA |
| 참조 QA 결과 | `../../../qa/qa-results/second_qa_check.md`, `../../../qa/qa-results/third_qa_check.md` |
| 생성 근거 | Planning confirmed: `../../../planning/feature/02_after_second_qa/12_operation_action_form_policy.md` |
| 문서 상태 | Follow-up scope |

## 참조 문서

- `../../Development.md`
- `../../../planning/feature/02_after_second_qa/12_operation_action_form_policy.md`
- `../../../publishing/feature/02_after_second_qa/05_operation_action_entry_visual_policy.md`
- `../../../qa/feature/05_operation_actions_qa.md`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/02_after_second_qa/12_operation_action_form_policy.md` | 운영 조치 내역에는 full form을 두지 않고 QualityIssues action form을 canonical form으로 사용 | 충족 |
| Publishing | `../../../publishing/feature/02_after_second_qa/05_operation_action_entry_visual_policy.md` | CTA, disabled, issue picker, focus handoff 시각 기준 정의 | 충족 |
| Development | 현재 문서 | OperationActionsPage에서 issue 선택 후 QualityIssuesPage action form으로 이동 | 진행 필요 |
| QA | `../../../qa/feature/05_operation_actions_qa.md` | full form 중복 없음, CTA handoff, 권한 제한 재검증 | 대기 |

## 구현 결정

`OperationActionsPage`에는 상태 변경 select, 메모 textarea, 저장 button으로 구성된 full action form을 만들지 않는다.

운영 조치 작성은 `QualityIssuesPage`의 action form을 단일 저장 지점으로 유지한다. 운영 조치 내역 화면은 `조치 작성` CTA와 대상 issue 선택 흐름만 제공한다.

## 구현 TASK

- [ ] `ApcDataManagementShell`에 operation action entry context 추가
- [ ] `OperationActionsPage`에 `조치 작성` CTA 추가
- [ ] viewer 권한에서는 CTA disabled 및 권한 helper 표시
- [ ] operator/admin 권한에서는 CTA 활성화
- [ ] CTA 클릭 시 조치 가능한 품질 이슈 선택 UI 표시
- [ ] 대상 issue 선택 시 `QualityIssuesPage`로 tab 이동
- [ ] `QualityIssuesPage` action form에 focus context 전달
- [ ] 이미 구현된 `PipelineRelatedContext`와 중복되지 않는 shared action handoff 타입 검토
- [ ] 미확인/확인중 이슈가 없을 때 empty state 표시
- [ ] 운영 조치 내역 화면 안에 full form이 렌더링되지 않도록 QA selector/test 추가

## API/상태 설계

MVP에서는 신규 API를 추가하지 않는다.

사용 가능한 기존 API:

- `GET /api/monitoring/issues`
- `GET /api/monitoring/actions`
- `POST /api/monitoring/issues/{issue_id}/actions`

프론트 상태는 다음 중 하나로 정리한다.

```ts
interface ActionEntryContext {
  issueId: string;
  source: "pipeline" | "operation-actions";
  focusActionForm: true;
}
```

기존 `PipelineRelatedContext`가 같은 목적을 수행하고 있으므로, 구현 시에는 이름을 더 일반화하거나 source만 확장한다.

## 완료 기준

- 운영 조치 내역 화면에서 `조치 작성` 흐름을 시작할 수 있다.
- 대상 issue를 선택하면 데이터 품질 이슈 상세로 이동하고 action form이 focus된다.
- 운영 조치 내역 화면 내부에는 full action form이 없다.
- viewer는 조치 작성 CTA를 사용할 수 없다.
- operator/admin은 조치 작성 CTA를 사용할 수 있다.
- 조치 등록 후 운영 조치 내역 timeline에 새 이력이 표시된다.

## QA 체크 항목

| 체크 항목 | 기대 결과 |
| --- | --- |
| OperationActionsPage에 full form이 없는가 | 상태 변경 select, 메모 textarea, 저장 button 조합이 없음 |
| CTA 클릭 시 issue 선택이 가능한가 | 조치 가능한 issue 목록 표시 |
| issue 선택 후 QualityIssuesPage로 이동하는가 | 데이터 품질 이슈 탭 활성 |
| action form focus가 표시되는가 | focus block 표시 |
| viewer 권한에서 CTA가 제한되는가 | disabled + helper text |
| 조치 등록 후 timeline이 갱신되는가 | 새 action item 표시 |
