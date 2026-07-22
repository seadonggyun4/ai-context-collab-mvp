# Active Context Registry

## 문서 메타데이터

| 항목 | 값 |
| --- | --- |
| status | `ACTIVE` |
| scope | 현재 작업에 적용할 기준 문서와 권위 순서 |
| approved_by | 사용자 요청에 따라 단일 AI가 정리, 사용자 최종 권위 유지 |
| effective_at | `2026-07-22` |
| supersedes | 이전 동일 경로 revision |

## 목적

이 문서는 현재 유효한 기준 문서를 결정하는 유일한 활성 Context 레지스트리다. `Project_Context.md`는 프로젝트의 최상위 내용 기준이고, 이 문서는 어떤 기준 문서가 현재 활성인지와 각 문서의 상태·범위·승인·시행·대체 관계를 관리한다.

최근에 생성되거나 수정된 파일이라는 이유만으로 활성 기준이 되지 않는다. 아래 레지스트리에 없거나 `ACTIVE`가 아닌 문서는 현재 작업의 기준으로 자동 채택하지 않는다.

## 권위 순서

1. 사용자가 현재 요청에서 명시적으로 확정한 조건
2. 활성 조직 표준
3. `Project_Context.md`
4. 활성 Change Management 정책
5. 활성 역할 상위 문서와 Feature 기준
6. 실제 코드와 계약
7. QA, Verification Evidence, Impact Analysis, 평가 결과는 기준이 아니라 증거와 이력

같은 우선순위의 문서가 충돌하거나 상위·하위 문서가 양립할 수 없으면 AI는 임의로 최신 파일을 선택하지 않는다. 충돌 문서, 충돌 내용, 가능한 선택과 영향을 Change Manifest에 기록하고 사용자 결정을 요청한다.

## 활성 기준 문서 레지스트리

| 문서 | status | scope | approved_by | effective_at | supersedes |
| --- | --- | --- | --- | --- | --- |
| `Active_Context.md` | `ACTIVE` | 활성 문서 결정과 권위 순서 | 사용자 요청 / 단일 AI 기록 | 2026-07-22 | 이전 동일 경로 revision |
| `Project_Context.md` | `ACTIVE` | 프로젝트 목적, 사용자, 요구사항, 협업 구조 | 프로젝트 사용자 | 2026-07-22 | 이전 동일 경로 revision |
| `docs/organization-standards/planning-standards.md` | `ACTIVE` | 기획 문서 공통 기준 | 프로젝트 사용자 | 2026-07-09 | 없음 |
| `docs/organization-standards/publishing-standards.md` | `ACTIVE` | 퍼블리싱 문서 공통 기준 | 프로젝트 사용자 | 2026-07-09 | 없음 |
| `docs/organization-standards/development-standards.md` | `ACTIVE` | 개발 문서 공통 기준 | 프로젝트 사용자 | 2026-07-09 | 없음 |
| `docs/organization-standards/qa-standards.md` | `ACTIVE` | QA와 Verification Evidence 기준 | 프로젝트 사용자 | 2026-07-16 | 이전 동일 경로 revision |
| `change-management/README.md` | `ACTIVE` | 변경 요청 State, Phase, Self-Review, Evidence, 완료 게이트 | 프로젝트 사용자 | 2026-07-16 | 2026-07-16 이전 revision |
| `change-management/approval-policy.md` | `ACTIVE` | 위험 분류와 사용자 승인 | 프로젝트 사용자 | 2026-07-16 | 없음 |
| `roles/Feature_Workflow.md` | `ACTIVE` | 역할별 Feature 흐름과 Change Management 연결 | 프로젝트 사용자 | 2026-07-16 | 이전 동일 경로 revision |
| `roles/planning/Planning.md` | `ACTIVE` | 프로젝트 기획 기준 | 프로젝트 사용자 | 2026-07-09 | 없음 |
| `roles/publishing/Publishing.md` | `ACTIVE` | 프로젝트 퍼블리싱 기준 | 프로젝트 사용자 | 2026-07-09 | 없음 |
| `roles/development/Development.md` | `ACTIVE` | 프로젝트 개발 기준 | 프로젝트 사용자 | 2026-07-09 | 없음 |
| `roles/qa/QA.md` | `ACTIVE` | 프로젝트 QA 범위와 결과 관리 | 프로젝트 사용자 | 2026-07-16 | 이전 동일 경로 revision |
| `impact-analysis/Impact_Analysis_Guide.md` | `ACTIVE` | 변경 영향 분석 작성 기준 | 프로젝트 사용자 | 2026-07-16 | 이전 동일 경로 revision |
| `evaluations/README.md` | `ACTIVE` | Golden Cases 평가와 개선 루프 | 프로젝트 사용자 | 2026-07-16 | 없음 |

`supersedes`가 `이전 동일 경로 revision`인 경우 Git 이력이 이전 버전을 보존한다. 다른 파일을 대체하는 경우에는 해당 문서 경로 또는 ID를 명시한다.

## 요청별 활성 문서 선언 규칙

모든 Change Manifest의 Context Snapshot에는 다음을 기록한다.

- 이 레지스트리를 확인한 시점
- 이번 요청에 실제 적용한 문서 목록
- 각 문서가 적용되는 범위
- 제외한 관련 문서와 제외 근거
- 충돌 여부와 사용자 결정 필요 여부

문서 목록을 선언하기 전에는 `CONTEXT_CONFIRMED`로 전환하지 않는다.

## 상태 값

| status | 의미 |
| --- | --- |
| `DRAFT` | 작성 중이며 기준으로 사용할 수 없음 |
| `ACTIVE` | 현재 기준으로 사용 |
| `DEPRECATED` | 신규 작업의 기준이 아니며 대체 문서를 따라야 함 |
| `SUPERSEDED` | `supersedes` 관계에 의해 완전히 대체됨 |
| `ARCHIVED` | 역사·증거로만 보존 |

## 신규 문서 메타데이터 규칙

2026-07-16 이후 새로 만드는 규범 문서는 다음 다섯 필드를 문서 상단에 포함하거나 이 레지스트리에 개별 항목으로 등록한다.

```markdown
| status | `DRAFT | ACTIVE | DEPRECATED | SUPERSEDED | ARCHIVED` |
| scope | 문서가 결정하는 범위 |
| approved_by | 승인 주체 또는 승인 record |
| effective_at | YYYY-MM-DD |
| supersedes | 대체 문서/버전 또는 없음 |
```

QA 결과, Impact Analysis, Change Manifest, Evaluation Result는 규범 문서가 아니라 증거·이력이다. 이들은 자체 ID, 대상, 작성 시점, 결과 상태를 가지며 활성 기준 레지스트리에 기준 문서로 등록하지 않는다.

## 유지보수 규칙

- 문서가 추가·대체·폐기되면 코드 변경과 무관하게 이 레지스트리를 함께 갱신한다.
- `DEPRECATED` 또는 `SUPERSEDED` 문서는 대체 문서가 없으면 제거할 수 없다.
- 레지스트리 변경은 Change Manifest와 Impact Analysis에 연결한다.
- 동일 scope에 복수 `ACTIVE` 문서가 있으면 충돌 가능성을 명시적으로 검토한다.
- 파일 수정 시각과 이름의 숫자는 권위를 결정하지 않는다.
