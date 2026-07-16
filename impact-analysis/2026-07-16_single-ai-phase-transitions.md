# Single AI Phase Transitions

## Change ID

- `CR-2026-002`
- Manifest: `change-management/archive/2026/CR-2026-002_single-ai-phase-transitions.md`

## 변경 요약

단일 AI가 Context Reader, Planner, Implementer, Tester, Self-Reviewer, Reporter 역할을 순서대로 수행하고 모든 역할 변경 전에 공통 Phase Transition 선언을 남기도록 변경 관리 문서 체계를 확장했다.

## 변경 원인

기존 워크플로에는 6개 역할과 책임이 있었지만 현재 Phase, 역할별 입력·출력, 전환 진입 조건, 역방향 재진입과 전환 이력을 Manifest에서 추적할 구조가 부족했다.

## 설계 결정

- State는 요청의 성숙도, Phase는 단일 AI의 현재 책임으로 분리한다.
- 6개 Phase는 생략하거나 병합하지 않는다.
- 작업이 없는 Phase도 `NOT_APPLICABLE` 근거와 전환 이력을 남긴다.
- 전환 선언 필드는 별도 단일 템플릿을 원본으로 관리한다.
- 검증 실패와 요구사항 변경은 실패 기록을 보존한 채 책임 Phase로 되돌린다.
- 완료된 `CR-2026-001`은 당시 템플릿의 역사적 기록이므로 소급 수정하지 않는다.

## 영향 범위

| 문서 | 영향 |
| --- | --- |
| `change-management/README.md` | State/Phase 구분, Phase 계약, 매핑, 전환·회귀 규칙 추가 |
| `change-management/templates/change-manifest-template.md` | 현재 Phase, 진행 현황, Phase Transition Log 추가 |
| `change-management/templates/phase-transition-template.md` | 재사용 가능한 전환 선언 원본 추가 |
| `Project_Context.md` | 단일 AI Phase를 최상위 협업 규칙에 연결 |
| `roles/Feature_Workflow.md` | 제품 역할과 AI 실행 Phase의 책임 경계 정의 |
| `README.md` | 전환 템플릿 진입점 추가 |

## 예상 대비 실제

예상한 워크플로, 두 템플릿, Project Context, Feature Workflow, README, Impact Analysis와 현재 Manifest만 변경했다. Self-Review에서 발견한 terminal Phase 누락을 같은 범위 안에서 보완했다. 계획 밖 앱 코드나 외부 시스템 변경은 없다.

## 리스크와 한계

- 전환 기록은 문서 규칙이므로 기술적으로 강제되지 않는다.
- 작은 변경에서도 6개 Phase 기록 비용이 발생한다.
- State와 Phase를 혼동하면 이중 기록이 형식적으로 변할 수 있다.

이를 줄이기 위해 단일 전환 템플릿, 기본 매핑, `NOT_APPLICABLE` 근거, 제품 역할과 실행 Phase의 명시적 경계를 제공한다.
