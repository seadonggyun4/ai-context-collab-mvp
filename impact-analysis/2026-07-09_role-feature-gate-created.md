# 2026-07-09 역할 간 Feature 충족 게이트 영향 분석

## 변경 요약

후속 feature가 개발 TODO로 바로 떨어지지 않도록 `기획 → 퍼블리싱 → 개발 → QA` 순차 충족 게이트를 추가했다.

추가된 기준:

```text
Planning feature 탐색/확정
        ↓
Publishing feature 탐색
기획 feature 조건 충족
        ↓
Development feature 구현
기획 + 퍼블리싱 + QA 조건 충족
        ↓
QA 재검증
```

## 생성된 문서

| 경로 | 설명 |
| --- | --- |
| `roles/Feature_Workflow.md` | 역할별 feature 탐색/충족 순서 정의 |
| `roles/planning/feature/01_after_first_qa/09_role_permission_flow.md` | QA-001 권한 정책 기획 기준 |
| `roles/planning/feature/01_after_first_qa/10_monitoring_rule_diff_policy.md` | QA-003 기준 변경 diff 기획 기준 |
| `roles/planning/feature/01_after_first_qa/11_quality_issue_detail_policy.md` | QA-005 품질 이슈 상세 기획 기준 |
| `roles/publishing/feature/01_after_first_qa/02_permission_state_visual_policy.md` | QA-001 권한 상태 시각 기준 |
| `roles/publishing/feature/01_after_first_qa/03_rule_diff_visual_policy.md` | QA-003 diff 시각 기준 |
| `roles/publishing/feature/01_after_first_qa/04_quality_issue_detail_visual_policy.md` | QA-005 품질 이슈 상세 table 시각 기준 |

## 갱신된 문서

| 경로 | 변경 내용 |
| --- | --- |
| `Project_Context.md` | 역할 간 feature 충족 게이트와 AI 문서 생성 순서 추가 |
| `roles/planning/Planning.md` | 첫 QA 이후 기획 보완 feature 목록과 다음 역할 전달 기준 추가 |
| `roles/publishing/Publishing.md` | 기획 feature 충족 기준과 퍼블리싱 보완 feature 목록 추가 |
| `roles/development/Development.md` | 개발 착수 게이트 추가 |
| `roles/development/feature/01_after_first_qa/*.md` | 역할 간 충족 게이트 섹션 추가 |
| `roles/qa/qa-results/first_qa_check.md` | QA-001/003/005 후속 문서를 역할별 세트로 갱신 |

## 기획 영향

- QA 이후 발견된 권한, diff, 품질 이슈 상세 문제를 개발 구현 문제가 아니라 먼저 기획 정책으로 확정한다.
- 기획 feature는 다음 역할이 해석 없이 사용할 수 있는 acceptance criteria를 포함해야 한다.

## 퍼블리싱 영향

- 퍼블리싱 feature는 기획 feature를 충족하는 UI/상태/레이아웃 기준으로 작성된다.
- disabled, tooltip, diff, table overflow 같은 표현 기준이 개발 이전에 고정된다.

## 개발 영향

- 개발 feature는 관련 planning/publishing 문서를 참조하지 않으면 완료 상태가 될 수 없다.
- 구현 TASK에는 기획 조건과 퍼블리싱 조건을 모두 반영해야 한다.

## QA 영향

- QA는 개발 결과만 검증하지 않고 planning/publishing/development 조건이 모두 충족되었는지 확인한다.
- 두 번째 QA에서는 `roles/Feature_Workflow.md`의 게이트를 검증 기준으로 사용한다.
