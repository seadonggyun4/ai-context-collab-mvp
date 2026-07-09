# 대상 Issue Picker 구현 영향 분석

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 작성일 | 2026-07-09 |
| 변경 유형 | Planning policy implementation |
| 관련 Planning | `../roles/planning/feature/03_after_third_qa/13_operation_action_entry_handoff_policy.md` |
| 관련 Publishing | `../roles/publishing/feature/03_after_third_qa/06_operation_action_entry_visual_followup.md` |
| 관련 Development | `../roles/development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md` |

## 변경 요약

- 대상 issue picker를 `ActionIssuePickerPanel` 컴포넌트로 분리했다.
- 대상 issue 필터/정렬 정책을 `actionIssuePickerPolicy` service로 분리했다.
- picker는 `OPEN`, `IN_PROGRESS` 이슈만 표시한다.
- 정렬은 심각도 높은 순, 동일 심각도에서는 최근 발생 순으로 고정한다.
- picker summary에 필터/정렬 기준과 표시 건수를 노출한다.

## 역할별 영향

| 역할 | 영향 | 후속 필요 여부 |
| --- | --- | --- |
| Planning | 조치 작성 전 대상 issue 선택 정책이 구현됨 | 없음 |
| Publishing | picker 상단에 정책 summary가 추가됨 | 모바일 시각 QA 권장 |
| Development | 페이지 내부 필터/정렬 함수가 policy service로 이동 | 다른 entry 화면에서 재사용 가능 |
| QA | picker 대상 범위와 정렬 기준을 명확히 검증 가능 | 다음 QA cycle에서 확정 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| `app/api/.venv/bin/python -m pytest` | 19 passed |
| 브라우저: operator issue picker open | 통과 |
| 브라우저: 미확인/확인중 issue 7건 표시 | 통과 |
| 브라우저: 필터/정렬 summary 표시 | 통과 |
| 브라우저: 심각도/최근 발생 정렬 확인 | 통과 |
