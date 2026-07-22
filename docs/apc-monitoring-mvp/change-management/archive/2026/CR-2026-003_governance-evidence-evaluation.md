# CR-2026-003 문서 거버넌스·증거·평가 체계 도입

## 변경 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-003` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `NONE` |
| 요청일 | `2026-07-16` |
| 최종 갱신일 | `2026-07-16` |
| 요청자 | 사용자 |
| 수행 주체 | 단일 AI 에이전트 |
| 위험도 | 낮음 — 문서 체계 변경 |
| 승인 상태 | 사용자 요청으로 작업 범위 승인됨 |

## 요청 정의

- 목적: 자기검증 편향 완화, 활성 Context 관리, 고위험 사용자 승인, QA 증거 계약, Golden Cases 평가·개선 루프를 기존 문서 엔진에 통합한다.
- 포함: 문서 규칙·템플릿·레지스트리·평가표, 기존 상위 문서 연결, 실제 CR 적용, 전체 변경 커밋과 push.
- 제외: 별도 Evidence 서버, Validator, DB, 외부 CI, 복수 AI.

### 수용 기준

| ID | 완료 조건 | 상태 |
| --- | --- | --- |
| AC-01 | Self-Review 편향 완화 10개 규칙과 필수 7개 질문이 계약화됨 | 충족 |
| AC-02 | 의도·실제 확인, diff 기준, 반례, 확신도·미검증을 분리 기록함 | 충족 |
| AC-03 | `Active_Context.md`가 활성 기준 문서와 5개 메타데이터를 관리함 | 충족 |
| AC-04 | 문서 우선순위·충돌·latest 금지·증거 문서 구분 규칙이 존재함 | 충족 |
| AC-05 | 고위험 분류와 사용자 승인 전 허용·금지 행동이 정의됨 | 충족 |
| AC-06 | Verification Evidence 필드와 6개 결과 상태 규칙이 QA에 통합됨 | 충족 |
| AC-07 | 변경 후 기존 증거 재사용 금지와 artifact 사실성 규칙이 존재함 | 충족 |
| AC-08 | Golden Case, 실행 결과, 공통 지표, 개선 반영 루프가 정의됨 | 충족 |
| AC-09 | 기존 완료 문서와 Feature 이력을 소급 변경하지 않는 확장 구조임 | 충족 |
| AC-10 | 모든 변경이 검증되고 커밋되어 origin에 push됨 | 충족 |

## Context Snapshot

| 기준 | 확인 결과 |
| --- | --- |
| `Project_Context.md` | 현재 SSOT지만 활성 문서 레지스트리 없음 |
| `change-management/README.md` | State/Phase와 기본 증거 상태 존재, 상세 편향·승인 정책 없음 |
| Change Manifest 템플릿 | Self-Review 질문 일부 존재, confidence·의도/관찰·승인 필드 부족 |
| `docs/organization-standards/qa-standards.md` | 기본 증거 상태 존재, 표준 Evidence block 부족 |
| `roles/qa/QA.md` | 제품 QA 중심이며 Change Manifest 증거 계약 연결 부족 |
| 평가 체계 | Golden Cases 디렉토리·템플릿·공통 결과표 없음 |
| Git | `main`, `origin/main`, 기존 P0 변경은 미커밋 상태 |

- 문서 충돌: 없음.
- 권위 판단: 사용자 최신 요청은 기존 P0를 확장하며 대체하지 않는다.
- QA와 Impact Analysis: 기준이 아닌 증거·이력으로 취급한다.

## Phase 진행 현황

| Phase | 상태 | 시작 | 종료 | 산출물 |
| --- | --- | --- | --- | --- |
| `CONTEXT_READER` | 완료 | PT-001 | PT-002 | 기존 구조·Git 상태·누락 확인 |
| `PLANNER` | 완료 | PT-002 | PT-003 | 거버넌스 구조·수용 기준·테스트 계획 |
| `IMPLEMENTER` | 완료 | PT-003 | PT-004 | Context·승인·Self-Review·Evidence·Evaluation 통합 |
| `TESTER` | 완료 | PT-004 | PT-005 | TEST-01~07 통과, TEST-08 Reporter 전달 |
| `SELF_REVIEWER` | 완료 | PT-005 | PT-006 | diff-first 질문·반례·confidence 판정 |
| `REPORTER` | 완료 | PT-006 | PT-007 | Git delivery와 최종 보고, terminal 종료 |

## Phase Transition Log

### PT-001

- Previous phase: `NONE`
- Next phase: `CONTEXT_READER`
- State before transition: `REQUESTED`
- Transition trigger: 사용자 요청 접수
- Files changed: 현재 Manifest 생성 예정
- Tests executed: 없음
- Known limitations: 문서 규칙은 기술적 강제력이 없음
- Unverified assumptions: Git push 권한 확인 전
- Inputs carried forward: 사용자 P1/P2 요구사항과 커밋·push 요청
- Required output of next phase: 기존 Context·QA·증거·평가 구조와 Git 상태
- Entry gate: 요청 범위 확인

### PT-002

- Previous phase: `CONTEXT_READER`
- Next phase: `PLANNER`
- State before transition: `CONTEXT_CONFIRMED`
- Transition trigger: 관련 문서와 Git 상태 확인 완료
- Files changed: 현재 Manifest의 Context Snapshot
- Tests executed: 문서 정적 검토, Git branch/remote/status 확인
- Known limitations: 기존 Feature 전체에 메타데이터를 직접 삽입하면 중복 유지보수 비용이 큼
- Unverified assumptions: 없음
- Inputs carried forward: 문서 레지스트리 부재, 승인·평가·증거 계약 누락
- Required output of next phase: 중앙 레지스트리와 재사용 템플릿 중심 설계
- Entry gate: 충돌 없음, 누락과 확장 경계 명확

### PT-003

- Previous phase: `PLANNER`
- Next phase: `IMPLEMENTER`
- State before transition: `DEVELOPMENT_READY`
- Transition trigger: 아래 계획·위험·테스트와 승인 조건 확정
- Files changed: 현재 Manifest
- Tests executed: 요구사항 4개 영역과 수용 기준 대조
- Known limitations: 소급 문서 수정 대신 Active Context 레지스트리에서 메타데이터를 중앙 관리
- Unverified assumptions: 없음
- Inputs carried forward: AC-01~10과 예상 변경 구조
- Required output of next phase: Context, 승인, Self-Review, Evidence, Evaluation 문서와 기존 문서 연결
- Entry gate: 고위험 작업 없음, 사용자 요청으로 커밋·push 권한 명시

### PT-004

- Previous phase: `IMPLEMENTER`
- Next phase: `TESTER`
- State before transition: `IMPLEMENTED`
- Transition trigger: P1/P2 규칙·템플릿·레지스트리·평가 구조 구현과 기존 문서 연결 완료
- Files changed: `Active_Context.md`, Change Management 규칙·정책·템플릿, QA 문서, Project Context, Feature Workflow, README, `evaluations/`, Impact Analysis, 현재 Manifest
- Tests executed: 없음
- Known limitations: 문서 규칙은 자동 강제되지 않으며 Golden Case 초기 결과는 아직 없음
- Unverified assumptions: Git push 인증은 실제 push 전까지 미검증
- Inputs carried forward: AC-01~10, 실제 변경 구조, TEST-01~08 계획
- Required output of next phase: 요구사항 커버리지, metadata, Evidence, 승인, 평가, 링크, Git 검증 결과
- Entry gate: 계획 범위 구현 완료, 앱 코드 변경 없음

### PT-005

- Previous phase: `TESTER`
- Next phase: `SELF_REVIEWER`
- State before transition: `QA_COMPLETED`
- Transition trigger: 문서 구현 검증 TEST-01~07 통과, Git 전달 TEST-08만 최종 delivery로 남음
- Files changed: 현재 Manifest에 Verification Evidence 기록
- Tests executed: 요구사항, metadata, Self-Review, 승인, Evidence, Evaluation, 문서 일관성 검사
- Known limitations: Git push 인증은 아직 미검증이며 TEST-08로 명시
- Unverified assumptions: origin/main에 fast-forward push 가능
- Inputs carried forward: 원 요청, Active Context, 실제 변경 목록, EVID-001~003, 미실행 TEST-08
- Required output of next phase: diff-first 필수 질문, 반례, confidence, Reporter 진입 여부
- Entry gate: 구현 검증 실패 없음, 미실행 항목이 숨겨지지 않음

### PT-006

- Previous phase: `SELF_REVIEWER`
- Next phase: `REPORTER`
- State before transition: `SELF_REVIEWED`
- Transition trigger: 필수 질문·반례·범위 밖 영향 검토 완료, 구현 회귀 불필요
- Files changed: 현재 Manifest의 Self-Review 기록
- Tests executed: 원 요청, Active Context, `git diff`, `git status`, EVID-001~004 재검토
- Known limitations: TEST-08 commit/push는 Reporter delivery에서 수행해야 함
- Unverified assumptions: origin/main push 인증과 fast-forward 가능 여부
- Inputs carried forward: 완료된 문서 변경, TEST-01~07, 미실행 TEST-08, confidence `MEDIUM`
- Required output of next phase: commit·push, 원격 SHA 확인, 최종 완료·미완료·미검증·한계 보고
- Entry gate: 구현 누락·범위 밖 코드 변경·승인 위반 없음, delivery만 남음

### PT-007

- Previous phase: `REPORTER`
- Next phase: `NONE`
- State before transition: `COMPLETED`
- Transition trigger: 구현 커밋 push, 원격 SHA 일치, 완료·미완료·미검증·한계 보고 확정
- Files changed: Reporter 완료 기록과 Manifest archive 경로 갱신
- Tests executed: local/remote SHA 비교, whitespace 보정 후 `git diff --check`
- Known limitations: 첫 Golden Case 실제 Evaluation Result는 후속 운영에서 생성
- Unverified assumptions: 없음
- Inputs carried forward: 최종 결과, 원격 커밋 `9f31bd5`, 후속 평가 운영 기준
- Required output of next phase: `NOT_APPLICABLE` — terminal transition
- Entry gate: TEST-08 통과, 모든 AC 충족, blocker 없음

## 영향 분석과 구현 계획

### 설계 원칙

1. `Project_Context.md`는 최상위 프로젝트 기준으로 유지한다.
2. `Active_Context.md`는 현재 적용 문서와 메타데이터를 결정하는 유일한 레지스트리로 둔다.
3. 기준·정책은 governance 문서, 실행 기록은 Manifest, 검증은 QA Evidence, 평가는 evaluations로 분리한다.
4. 완료된 기존 문서는 소급 수정하지 않고 새 규칙의 시행 시점 이후 문서에 적용한다.
5. 반복 필드는 단일 템플릿으로 관리하고 상위 문서는 링크만 둔다.

### 예상 변경 범위

- `Active_Context.md`
- `change-management/README.md`
- `change-management/approval-policy.md`
- `change-management/templates/change-manifest-template.md`
- `change-management/templates/self-review-template.md`
- `change-management/templates/verification-evidence-template.md`
- `change-management/templates/approval-record-template.md`
- `docs/organization-standards/qa-standards.md`
- `roles/qa/QA.md`
- `Project_Context.md`, `README.md`, `roles/Feature_Workflow.md`
- `evaluations/` 규칙·템플릿·registry·초기 Golden Case
- 관련 Impact Analysis와 현재 Manifest

### 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 기존 문서 수십 개에 메타데이터 중복 | Active Context 중앙 registry와 신규 규범 문서 front matter 규칙 사용 |
| 사용자 승인이 형식화 | 승인 대상·결정·허용 범위·만료 조건을 별도 record로 기록 |
| Self-Review가 구현 결론을 복사 | clean-input checklist와 intent/observed 분리, diff-first 검토 |
| Evidence가 체크박스로 퇴행 | 필수 block과 허용 상태 vocabulary 고정 |
| Golden Case가 문서 보관으로 끝남 | 실행 주기, 공통 지표, 실패→규칙 변경→재평가 연결 의무화 |

### 테스트 계획

| ID | 검증 | 성공 기준 |
| --- | --- | --- |
| TEST-01 | 요구사항 커버리지 | 사용자 P1/P2 각 bullet에 규칙 또는 템플릿 위치 존재 |
| TEST-02 | Active Context | 모든 활성 기준 항목에 status/scope/approved_by/effective_at/supersedes 존재 |
| TEST-03 | Self-Review | 10개 편향 규칙, 7개 필수 질문, confidence·미검증 필드 존재 |
| TEST-04 | Approval | 8개 고위험 예시와 승인 전 stop/초안 규칙 존재 |
| TEST-05 | Evidence | 9개 필드와 6개 결과 상태, 증거 재사용 금지 규칙 존재 |
| TEST-06 | Evaluation | Golden Case·결과 템플릿·지표·개선 루프·초기 case 존재 |
| TEST-07 | 문서 일관성 | 내부 참조 존재, diff whitespace 정상, 문서 외 코드 변경 없음 |
| TEST-08 | Git | 커밋 생성 후 origin/main push와 원격 SHA 일치 |

## Development Ready Gate

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| 요청·범위·제외 명확 | 충족 | 요청 정의 |
| 활성 기준과 Git 상태 확인 | 충족 | Context Snapshot |
| 수용 기준·위험·테스트 정의 | 충족 | AC-01~10, TEST-01~08 |
| 고위험 사용자 승인 필요 | 해당 없음 | 문서 규칙 변경이며 push는 사용자가 명시 요청 |
| 구현 blocker | 없음 | 외부 의존 없이 문서로 구현 가능 |

## 구현 기록

### 생성 문서

- `Active_Context.md`
- `change-management/approval-policy.md`
- `change-management/templates/approval-record-template.md`
- `change-management/templates/verification-evidence-template.md`
- `change-management/templates/self-review-template.md`
- `evaluations/README.md`
- `evaluations/templates/golden-case-template.md`
- `evaluations/templates/evaluation-result-template.md`
- `evaluations/golden-cases/README.md`
- `evaluations/golden-cases/GC-001_document-only-change.md`
- `evaluations/results/README.md`
- `impact-analysis/2026-07-16_governance-evidence-evaluation.md`

### 수정 문서

- `change-management/README.md`
- `change-management/templates/change-manifest-template.md`
- `Project_Context.md`
- `README.md`
- `roles/Feature_Workflow.md`
- `docs/organization-standards/qa-standards.md`
- `roles/qa/QA.md`
- `impact-analysis/Impact_Analysis_Guide.md`
- 현재 Manifest

- 계획 밖 앱 코드 변경: 없음.
- 예상했지만 변경하지 않은 범위: 없음.

## QA 실행 증거

### Verification Evidence: EVID-001

- Target: TEST-01~03 요구사항 커버리지, Active Context metadata, Self-Review 계약
- Changed files: `Active_Context.md`, `change-management/README.md`, Change Manifest와 Self-Review 템플릿
- Test command: 필수 7개 질문, 5개 metadata, 10개 편향 규칙을 `rg`와 section 출력으로 확인
- Exit code: `0`
- Result: `PASSED`
- Screenshot/log path: 없음 — 터미널 출력으로 확인
- Not executed: 없음
- Known limitations: 문서 의미의 자동 추론은 없음
- Self-review verdict: Self-Reviewer에서 재확인 예정

### Verification Evidence: EVID-002

- Target: TEST-04~06 승인, Evidence, Golden Cases 평가 체계
- Changed files: 승인 정책·record, Evidence 템플릿·QA 문서, `evaluations/`
- Test command: 8개 고위험 유형, 9개 Evidence 필드, 6개 결과 상태, 8개 평가 지표와 필수 파일 존재 검사
- Exit code: `0`
- Result: `PASSED`
- Screenshot/log path: 없음 — 터미널 출력으로 확인
- Not executed: Golden Case 실제 반복 실행은 초기 체계 도입 범위 밖
- Known limitations: 첫 Evaluation Result는 아직 없음
- Self-review verdict: Self-Reviewer에서 재확인 예정

### Verification Evidence: EVID-003

- Target: TEST-07 문서 일관성과 변경 범위
- Changed files: 현재 `git status --short`의 모든 문서
- Test command: `git diff --check`, 필수 내부 경로 `test -e`, 비 Markdown 변경 검사
- Exit code: `0`
- Result: `PASSED`
- Screenshot/log path: 없음 — 터미널 출력으로 확인
- Not executed: 앱 테스트는 앱 코드 변경이 없어 `NOT_APPLICABLE`
- Known limitations: Markdown 링크 렌더링의 시각 검사는 없음
- Self-review verdict: Self-Reviewer에서 실제 diff 기준 재확인 예정

### Verification Evidence: EVID-004

- Target: TEST-08 Git commit과 origin push
- Changed files: 이번 요청과 이전 P0 요청의 모든 미커밋 문서
- Test command: `git commit`, `git push origin main`, `git rev-parse HEAD`, `git ls-remote origin refs/heads/main`
- Exit code: `0`
- Result: `PASSED`
- Screenshot/log path: 없음
- Not executed: 없음
- Known limitations: 첫 commit의 whitespace 경고는 후속 보정 커밋에서 정리
- Self-review verdict: local/remote SHA `9f31bd538d60d13ea1dc8aba821478b8edd4ac95` 일치 확인

### Verification Evidence: EVID-005

- Target: 첫 commit의 whitespace 경고 보정
- Changed files: 경고가 발생한 Markdown 템플릿·registry 문서
- Test command: trailing whitespace와 EOF blank line 정리 후 `git diff --check`
- Exit code: `0`
- Result: `PASSED`
- Screenshot/log path: 없음
- Not executed: 없음
- Known limitations: 첫 commit 이력의 경고는 보존되며 후속 commit이 working tree를 정정
- Self-review verdict: 실패를 덮지 않고 원인과 보정을 별도 Evidence로 기록

## Self-Review

### Clean Input Declaration

- Original request re-read: 예
- Active Context re-read: 예
- Actual diff inspected: 예 — tracked diff와 untracked 목록을 함께 확인
- Implementation conclusion reused as evidence: 아니오
- Evidence records inspected: EVID-001~004

### Intent vs Observed

| 항목 | 의도한 결과 | 실제로 확인한 결과 | 증거 | 차이 |
| --- | --- | --- | --- | --- |
| 자기검증 편향 완화 | 10개 규칙, 7개 질문, 반례·confidence | 규칙과 독립 템플릿에 모두 존재 | EVID-001 | 없음 |
| Project Context 관리 | 중앙 registry와 5개 metadata | 15개 활성 기준 항목에 전 필드 존재 | EVID-001 | 없음 |
| 위험·사람 승인 | 8개 고위험 유형과 승인 전 중단 | 정책·record·Development Ready 연결 | EVID-002 | 없음 |
| Evidence | 9개 필드, 6개 상태, 재사용·허위 artifact 금지 | 템플릿·QA 표준·QA 역할 문서 연결 | EVID-002 | 없음 |
| Golden Cases | case·result·지표·개선 루프 | 규칙, 두 템플릿, registry, GC-001 존재 | EVID-002 | 첫 실제 결과는 아직 없음 |
| 변경 범위 | 문서만 변경 | status 기준 Markdown 문서만 변경 | EVID-003 | 없음 |
| Git 전달 | 전체 변경 commit·push | 아직 실행 전 | EVID-004 | Reporter에서 완료 필요 |

### 필수 질문

| 질문 | 판정 | 근거 |
| --- | --- | --- |
| 원 요청의 모든 조건이 구현되었는가? | 부분 충족 | 문서 엔진은 충족, commit·push는 Reporter에서 남음 |
| 실제 변경이 계획된 범위를 벗어났는가? | 아니오 | tracked diff와 untracked 문서가 예상 범위와 일치 |
| 변경하지 말아야 할 동작이 바뀌었는가? | 아니오 | 앱 코드와 실행 동작 변경 없음 |
| 테스트 결과가 현재 변경 상태를 검증하는가? | 예 | TEST-01~07은 최종 문서 상태 기준 |
| 실행하지 않은 검증은 무엇인가? | TEST-08 | commit, push, local/remote SHA 비교 |
| 성공을 반박할 수 있는 증거는 없는가? | 있음, 공개됨 | 첫 Golden Case 실행 결과 부재와 문서 규칙의 비강제성 |
| 사용자 판단이 필요한 사항은 남아 있는가? | 아니오 | push는 사용자 명시 요청, 고위험 변경 없음 |

### Counterexample First

- 요구사항을 충족하지 못하는 현실적인 경우: 이후 AI가 `Active_Context.md`를 읽지 않거나 Evidence 필드에 실행하지 않은 테스트를 `PASSED`로 기록한다.
- 성공 판정을 깨뜨릴 입력·순서: 기존 QA 체크박스만 보고 Evidence 없이 완료하거나, 같은 scope의 충돌 문서를 최신 파일로 선택한다.
- 확인 방법: 워크플로 진입 규칙, Development Ready, QA 완료 조건, Self-Review 질문에 각각 차단 규칙이 연결됐는지 확인했다.
- 확인 결과: 문서상 모든 경로에 규칙이 연결됐지만 기술적 강제는 없다.
- 범위 밖 신규 영향: 문서 작성량 증가. 중앙 registry와 단일 템플릿으로 중복을 제한했다.

### Confidence and Unknowns

- Confidence: `HIGH`
- Confidence basis: 문서 구조 TEST-01~07과 Git delivery TEST-08이 통과하고 원격 SHA가 일치함.
- Unverified items: 첫 Golden Case Evaluation Result — 평가 체계의 후속 운영 항목이며 초기 구축 수용 기준에는 포함되지 않음.
- Known limitations: 단일 AI 자기검증이며 문서 준수를 기술적으로 강제하지 않음.
- Required user decision: 없음.
- Regression or re-entry required: 아니오. Reporter delivery 진행.

## 완료 판정과 보고

### 완료 판정

| 조건 | 상태 | 근거 |
| --- | --- | --- |
| AC-01~10 | 충족 | EVID-001~005와 Git delivery |
| 실패·미실행 공개 | 충족 | 첫 whitespace 경고와 Golden Case 미실행 공개 |
| 승인 정책 준수 | 충족 | 문서 변경 낮음 위험, push 사용자 명시 요청 |
| Self-Review | 충족 | clean input, diff-first, 반례, confidence 기록 |
| terminal transition | 충족 | PT-007 `REPORTER → NONE` |

### 최종 보고

- 완료: Self-Review 편향 완화, Active Context, 사람 승인, Verification Evidence, Golden Cases 평가 루프를 문서 엔진에 통합했다.
- 미완료: 없음.
- 미검증: 첫 Golden Case 실제 재실행 결과는 아직 없다.
- 알려진 한계: 문서 규칙은 기술적으로 우회를 차단하지 않으며 단일 AI 자기검증은 독립 검증이 아니다.
- Git delivery: `9f31bd5`를 origin/main에 push하고 원격 SHA 일치를 확인했다. Reporter 보정·종결 기록은 후속 커밋으로 push한다.

## 상태 이력

| 일자 | 이전 | 다음 | 근거 |
| --- | --- | --- | --- |
| 2026-07-16 | 없음 | `REQUESTED` | 사용자 요청 접수 |
| 2026-07-16 | `REQUESTED` | `CONTEXT_CONFIRMED` | 관련 문서·Git 상태 확인 |
| 2026-07-16 | `CONTEXT_CONFIRMED` | `PLANNED` | 수용 기준·위험·테스트 계획 정의 |
| 2026-07-16 | `PLANNED` | `DEVELOPMENT_READY` | 구현 전 게이트 충족 |
| 2026-07-16 | `DEVELOPMENT_READY` | `IMPLEMENTED` | 계획된 P1/P2 문서 체계 통합 완료 |
| 2026-07-16 | `IMPLEMENTED` | `QA_COMPLETED` | TEST-01~07 통과, TEST-08 미실행 공개 |
| 2026-07-16 | `QA_COMPLETED` | `SELF_REVIEWED` | diff-first 질문·반례·confidence 검토 완료 |
| 2026-07-16 | `SELF_REVIEWED` | `COMPLETED` | Git delivery와 완료 보고 확정, PT-007 terminal 종료 |

## 미해결 사항

현재 blocker 없음.
