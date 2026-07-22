# QualityIssues Form Focus 연결 영향 분석

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 작성일 | 2026-07-09 |
| 변경 유형 | Handoff focus hardening |
| 관련 Development | `../roles/development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md` |
| 관련 Planning | `../roles/planning/feature/03_after_third_qa/13_operation_action_entry_handoff_policy.md` |
| 관련 Publishing | `../roles/publishing/feature/03_after_third_qa/06_operation_action_entry_visual_followup.md` |

## 변경 요약

- `QualityIssuesPage`의 action form scroll/focus 로직을 `useActionEntryFocus` hook으로 분리했다.
- 선택 issue가 action entry context의 issue와 일치할 때만 form focus가 실행된다.
- 같은 handoff context에서는 중복 scroll/focus가 반복되지 않도록 key를 사용한다.
- action form block에 `tabIndex={-1}`와 `aria-label`을 추가해 실제 DOM focus 대상이 되도록 했다.
- callout 문구를 `getActionEntryCalloutMessage` helper로 중앙화했다.

## 역할별 영향

| 역할 | 영향 | 후속 필요 여부 |
| --- | --- | --- |
| Planning | `대상 issue 선택 -> 데이터 품질 이슈 상세 -> 조치 등록 form focus` 흐름이 구현됨 | 없음 |
| Publishing | 기존 `.action-form-block.is-focused` 스타일을 유지하면서 실제 focus 대상이 명확해짐 | 다음 QA에서 시각 재확인 |
| Development | focus/scroll/callout 정책이 hook/helper로 분리되어 source 확장 가능 | 없음 |
| QA | 탭 이동, 선택 issue, callout, focus class, DOM focus를 분리 검증 가능 | 다음 QA cycle에서 확정 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| `projects/apc-monitoring-mvp/api/.venv/bin/python -m pytest` | 19 passed |
| 브라우저: issue 선택 후 데이터 품질 이슈 탭 이동 | 통과 |
| 브라우저: 선택 issue 우선 선택 | 통과 |
| 브라우저: `운영 조치 내역에서 이동` callout 표시 | 통과 |
| 브라우저: action form `.is-focused` 표시 | 통과 |
| 브라우저: action form DOM focus | 통과 |
