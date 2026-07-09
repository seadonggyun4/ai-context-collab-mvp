# 운영 조치 Action Form 정책 확정 영향 분석

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 생성 일자 | 2026-07-09 |
| 변경 유형 | Planning policy confirmation |
| 참조 QA | `roles/qa/qa-results/second_qa_check.md`, `roles/qa/qa-results/third_qa_check.md` |
| 참조 planning feature | `roles/planning/feature/02_after_second_qa/12_operation_action_form_policy.md` |
| 영향 범위 | planning, publishing, development, QA follow-up |

## 변경 요약

운영 조치 작성 form의 기준 위치를 `데이터 품질 이슈 상세`로 확정했다.

운영 조치 내역 화면은 전체 조치 이력 조회, 재발 확인, 필터, 관련 issue 이동에 집중하는 audit-first 화면으로 정의한다. 화면 안에는 full action form을 두지 않고, `조치 작성` CTA와 대상 issue 선택 후 품질 이슈 상세 action form으로 이동하는 handoff만 제공한다.

## 역할별 영향

| 역할 | 영향 |
| --- | --- |
| Planning | `12_operation_action_form_policy.md`가 `Planning confirmed` 상태로 변경됨 |
| Publishing | `05_operation_action_entry_visual_policy.md` 생성, CTA/disabled/issue picker/focus handoff 시각 정책 필요 |
| Development | `15_operation_action_entry_handoff.md` 생성, OperationActionsPage에서 QualityIssuesPage action form으로 handoff 구현 필요 |
| QA | QA2-003은 정책 확정 완료, 구현/시각 검증은 후속 재검증 필요 |

## 결정 근거

- MVP에서 action form을 여러 화면에 두면 저장 기준, 권한, validation, 중복 조치 방지가 분산된다.
- incident/operation 도구들은 timeline을 감사 기록으로 사용하고, 조치/작업은 대상 incident 또는 task에 연결해 관리한다.
- APC 모니터링 서비스는 품질 이슈가 조치의 기준 객체이므로 action은 반드시 issue에 연결되어야 한다.

## 후속 작업

- Publishing: 운영 조치 작성 CTA, disabled state, issue picker, focus handoff 스타일 확정
- Development: OperationActionsPage CTA와 issue 선택 후 QualityIssuesPage action form 이동 구현
- QA: full form 중복 없음, 권한 제한, handoff, timeline 갱신 검증
