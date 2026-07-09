# 2026-07-09 QA 문서 구조 재정렬 영향 분석

## 변경 요약

QA 결과 문서를 `app/qa-results/`나 루트 `qa-results/`가 아니라 `roles/qa/qa-results/`에서 관리하도록 재정렬했다. QA 실패/부분 통과 항목은 별도 후속 디렉토리가 아니라 각 역할의 `roles/{part}/feature/{cycle}/` 하위 다음 순번 문서로 생성하도록 고정했다.

변경된 구조:

```text
Project_Context.md
roles/
├── planning/feature/
├── development/feature/
├── publishing/feature/
└── qa/
    ├── QA.md
    ├── feature/
    └── qa-results/
        └── first_qa_check.md
app/
├── frontend/
├── api/
├── shared/
└── docs/
```

## 변경 원인

`app/qa-results/` 구조는 QA 결과를 개발 앱 하위 산출물처럼 보이게 한다. 루트 `qa-results/` 구조도 QA 기준 문서와 QA 결과 문서를 분리해 QA 파트의 관리 포인트를 늘린다. 이 MVP의 목적은 AI가 직군 간 문맥을 연결하고 각 파트가 자기 역할 문서 안에서 이력을 추적하는 체계를 시연하는 것이므로, QA 결과는 `roles/qa/qa-results/`에 둔다.

## 생성/이동된 문서

| 경로 | 설명 |
| --- | --- |
| `roles/qa/qa-results/first_qa_check.md` | 첫 번째 통합 QA 결과 문서 |
| `roles/development/feature/01_after_first_qa/09_role_permission_policy.md` | 권한 정책 후속 feature |
| `roles/planning/feature/01_after_first_qa/07_matrix_drilldown_flow.md` | matrix drill-down 후속 feature |
| `roles/development/feature/01_after_first_qa/10_rule_diff_and_admin_state.md` | 기준 설정 diff/권한 후속 feature |
| `roles/planning/feature/01_after_first_qa/08_pipeline_related_cta_flow.md` | pipeline CTA 후속 feature |
| `roles/development/feature/01_after_first_qa/11_quality_issue_detail_coverage.md` | 품질 이슈 상세 후속 feature |
| `roles/development/feature/01_after_first_qa/12_jadx_menu_integration_scenario.md` | JADX 메뉴 연계 시나리오 후속 feature |
| `roles/publishing/feature/01_after_first_qa/01_browser_visual_qa_policy.md` | 브라우저 시각 QA 퍼블리싱 기준 |
| `roles/qa/feature/09_browser_visual_qa.md` | 브라우저 시각 QA 재검증 체크표 |

## 기획 영향

- QA 실패가 단순 개발 TODO가 아니라 해당 파트의 feature 문서로 전환된다.
- 사용자 흐름/CTA/drill-down 같은 항목은 `roles/planning/feature/`에서 계속 관리한다.

## 퍼블리싱 영향

- 시각 QA 실패나 스타일 검증 필요 항목은 QA 결과와 후속 feature 문서에서 추적한다.
- 브라우저 시각 QA는 `roles/publishing/feature/01_after_first_qa/01_browser_visual_qa_policy.md`와 `roles/qa/feature/09_browser_visual_qa.md`에 기준을 둔다.

## 개발 영향

- `app/`은 실행 코드와 구현 문서만 관리한다.
- QA 결과는 `roles/qa/qa-results/`에서 관리한다.
- 실패 항목별 원인과 TASK는 각 역할의 feature 문서로 생성되어 담당자가 자기 문서 체계 안에서 바로 참조 가능하다.

## QA 영향

- QA 결과는 `roles/qa/qa-results/`에서 QA 기준 문서와 함께 조회한다.
- 실패/부분 통과 항목은 `roles/*/feature/{cycle}/`에서 원인과 후속 TASK를 추적한다.
- 재검증 결과는 기존 역할별 feature 문서를 갱신하고 새 QA 결과로 추가한다.

## 후속 조치

- 후속 구현 시 역할별 QA-001~QA-007 feature 문서를 갱신한다.
- 재검증 결과는 `roles/qa/qa-results/`에 추가한다.
- Project Context 구조가 변경되면 이 문서와 `Project_Context.md`를 함께 갱신한다.
