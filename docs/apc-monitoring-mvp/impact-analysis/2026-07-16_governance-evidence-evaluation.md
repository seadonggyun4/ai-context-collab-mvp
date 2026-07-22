# Governance, Evidence, and Evaluation Workflow

## Change ID

- `CR-2026-003`
- Manifest: `change-management/archive/2026/CR-2026-003_governance-evidence-evaluation.md`

## 변경 요약

단일 AI 문서 엔진에 Self-Review 편향 완화, Active Context 레지스트리, 고위험 사용자 승인, 표준 Verification Evidence, Golden Cases 평가·개선 루프를 추가했다.

## Active Context 영향

- `Project_Context.md`는 프로젝트 내용의 최상위 기준으로 유지한다.
- `Active_Context.md`가 현재 활성 문서와 status, scope, approved_by, effective_at, supersedes를 관리한다.
- QA, Impact Analysis, Change Manifest, Evaluation Result는 기준이 아니라 증거와 이력으로 명시한다.
- 최근 수정 파일을 자동으로 기준으로 삼는 방식을 금지한다.

## 역할별 영향

| 영역 | 영향 |
| --- | --- |
| Planning | 요청 계획 전에 활성 기준과 위험·승인 조건 확인 |
| Publishing | 직접 UI 변경 없음, 고위험·Evidence 공통 규칙 적용 |
| Development | Development Ready 전에 승인 상태와 실제 diff 범위 확인 |
| QA | 표준 Evidence block, 결과 vocabulary, artifact 사실성 규칙 적용 |
| Self-Review | clean input, intent/observed, 반례 우선, confidence와 unknowns 추가 |
| Evaluation | Golden Case와 공통 지표로 반복 실패를 지침 개선에 연결 |

## 위험 및 승인 영향

이번 변경은 문서 규칙 추가로 낮음 위험이다. 사용자가 현재까지의 변경 전체에 대한 commit과 push를 명시적으로 요청했으므로 해당 범위의 Git 외부 적용은 승인된 것으로 기록한다. 코드 삭제, 배포, 운영 설정 변경은 포함하지 않는다.

## 예상 대비 실제

예상한 Context, Change Management, QA, Evaluation, Impact Analysis 문서만 변경했다. 계획 밖 앱 코드나 외부 시스템은 추가하지 않았다. 첫 commit의 whitespace 경고는 후속 보정으로 해결하고 Evidence에 보존했다.

## 후속 운영

- 모든 신규 요청은 Active Context 적용 목록을 Manifest에 선언한다.
- 고위험 요청은 Approval Record가 없으면 실제 적용하지 않는다.
- QA 결과는 Verification Evidence 필드를 사용한다.
- 반복 실패는 Golden Case Result와 후속 Change ID로 연결한다.
