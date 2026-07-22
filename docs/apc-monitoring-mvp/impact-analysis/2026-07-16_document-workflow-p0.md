# Document Workflow P0

## Change ID

- `CR-2026-001`
- Manifest: `change-management/archive/2026/CR-2026-001_document-workflow-p0.md`

## 변경 요약

기존 역할별 Feature와 QA Cycle 구조 위에 변경 요청별 Change Manifest를 추가했다. 요청 접수부터 Context 확인, 계획, 구현 준비, 구현, QA, 자체 검토, 완료까지의 상태와 근거를 하나의 문서에서 추적한다.

## 변경 원인

기존 문서 엔진은 역할별 산출물과 QA 이력은 상세하지만, 개별 사용자 요청의 현재 상태, 예상·실제 변경 범위, 테스트 실행 증거와 완료 판정을 한곳에서 확인하기 어려웠다.

## 영향 문서

- `change-management/README.md`
- `change-management/templates/change-manifest-template.md`
- `change-management/active/README.md`
- `change-management/archive/README.md`
- `README.md`
- `Project_Context.md`
- `roles/Feature_Workflow.md`
- `docs/organization-standards/qa-standards.md`
- `impact-analysis/Impact_Analysis_Guide.md`

## 역할별 영향

| 영역 | 영향 |
| --- | --- |
| Planning | 기존 기획 기준은 유지하고 Manifest에서 요청별 참조와 영향 여부를 기록한다. |
| Publishing | UI 기준과 산출물에는 변화가 없다. 영향 없음 판단을 Manifest에 기록한다. |
| Development | Role Feature의 Development Ready 조건을 요청별 Manifest 게이트와 연결한다. |
| QA | 실행, 정적 검토, 미실행을 구분하고 현재 변경 상태에 대한 증거를 Manifest에 기록한다. |
| Project Context | 모든 신규 변경 요청의 진입점을 Change Manifest로 명시한다. |

## 예상 대비 실제

예상한 `change-management/`, 최상위 진입 문서, Feature Workflow, QA 표준, Impact Analysis 가이드와 변경 이력만 수정했다. 계획 밖 파일이나 앱 코드 변경은 없다. 전체 실제 파일 목록은 `CR-2026-001`의 구현 기록에 확정했다.

## 리스크

- 자동 강제가 없으므로 AI가 규칙을 따르지 않으면 우회할 수 있다.
- 작은 변경에서도 문서 비용이 발생한다.
- 기존 QA Cycle과 새 상태 모델의 목적을 혼동할 수 있다.

각 리스크는 최상위 진입 문서 연결, `해당 없음` 근거 허용, 요청 제어와 역할 상세의 책임 분리로 완화한다.

## 후속 조치

- 이후 신규 변경 요청부터 템플릿을 실제 사용한다.
- 반복 사용 중 불필요하거나 누락된 필드를 발견하면 템플릿과 워크플로를 함께 수정한다.
- 자동화는 현재 범위에 포함하지 않는다.
