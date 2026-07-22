# CR-2026-004 저장소 문서 엔진 및 프로젝트 구조 개편

## 1. 변경 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-004` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `NONE` |
| 요청일 | `2026-07-22` |
| 최종 갱신일 | `2026-07-22` |
| 요청자 | 사용자 |
| 수행 주체 | 단일 AI 에이전트 |
| 위험도 | 중간 |
| 승인 상태 | `APPROVED` |
| 승인 기록 | 현재 사용자 요청이 디렉토리 재배치 범위를 명시적으로 승인 |
| 관련 QA Cycle | 문서·저장소 구조 검증 |

## 2. 요청 정의

### 요청 원문

> 문서엔진은 docs/ 를 만들어 그 하위에 docs/프로젝트명/ 하위에 관리되는 체계로 만들자. 단 회사 공용규칙은 docs/ 에 있어야 겠지. 그리고 프로젝트들도 projects/ 하위로 이동시켜줘

### 합의된 요청 요약

- 한 문장 요약: 공용 규칙은 `docs/`에, APC 프로젝트 문서는 `docs/apc-monitoring-mvp/`에, 실행 코드는 `projects/apc-monitoring-mvp/`에 배치한다.
- 요청 목적: 비개발자용 문서 엔진과 다중 프로젝트 확장이 가능한 저장소 경계를 만든다.
- 포함 범위: 디렉토리 이동, 내부 경로 참조, 실행·배포 설정 경로, 구조 안내 문서 갱신.
- 제외 범위: 앱 기능, API 계약, 화면 디자인, 실제 문서 편집 UI 구현.

### 수용 기준

| ID | 검증 가능한 완료 조건 | 검증 방법 | 상태 |
| --- | --- | --- | --- |
| AC-01 | 회사 공용 규칙이 `docs/organization-standards/`에 존재한다 | 파일 경로 검사 | 충족 |
| AC-02 | 프로젝트 문서 엔진이 `docs/apc-monitoring-mvp/` 아래에 존재한다 | 파일 경로와 링크 검사 | 충족 |
| AC-03 | 실행 프로젝트가 `projects/apc-monitoring-mvp/` 아래에 존재한다 | 파일 경로와 빌드 검사 | 충족 |
| AC-04 | 이동 전 경로를 가리키는 활성 참조가 남지 않는다 | `rg` 정적 검사 | 충족 |
| AC-05 | 기존 프론트엔드와 API 테스트가 새 위치에서 동작한다 | 테스트·빌드 실행 | 충족 |

## 3. Context Snapshot

- `Active_Context.md` 확인 시점: `2026-07-22`
- 이번 요청에 적용한 활성 문서: `Active_Context.md`, `Project_Context.md`, 조직 표준 4종, Change Management 정책, 역할 상위 문서, Impact Analysis Guide.
- 제외한 관련 문서와 근거: 과거 QA 결과와 Feature 문서는 이력·증거이므로 구조 기준으로 채택하지 않음.

### 확인된 제약과 용어

- 제약: Git 이력을 보존하도록 파일 이동을 사용하고, 앱 동작은 변경하지 않는다.
- 용어: 공용 규칙은 모든 프로젝트에 적용되는 `organization-standards`; 프로젝트 문서 엔진은 Context, 역할, 변경관리, 평가, 영향분석 묶음이다.
- 충돌 여부: 없음. 현재 사용자 요청이 새 최상위 구조를 확정한다.

## 4. Phase Execution

### Phase 진행 현황

| Phase | 상태 | 시작 Transition | 종료 Transition | 핵심 산출물 또는 미적용 근거 |
| --- | --- | --- | --- | --- |
| `CONTEXT_READER` | 완료 | PT-001 | PT-002 | 활성 기준과 사용자 요청 확인 |
| `PLANNER` | 완료 | PT-002 | PT-003 | 이동 구조·검증 계획 확정 |
| `IMPLEMENTER` | 완료 | PT-003 | PT-004 | 저장소 구조와 참조 변경 |
| `TESTER` | 완료 | PT-004 | PT-005 | 구조·API·프론트 검증 |
| `SELF_REVIEWER` | 완료 | PT-005 | PT-006 | 원 요청·실제 구조·증거 재대조 |
| `REPORTER` | 완료 | PT-006 | PT-007 | 완료 결과와 한계 정리 |

### Phase Transition Log

#### Phase Transition: PT-001

- Previous phase: `NONE`
- Next phase: `CONTEXT_READER`
- State before transition: `REQUESTED`
- Transition trigger: 사용자 요청 접수
- Files changed: 현재 Manifest 생성
- Tests executed: 없음
- Known limitations: 없음
- Unverified assumptions: 프로젝트 디렉토리명은 서비스 목적을 반영해 `apc-monitoring-mvp`로 사용
- Inputs carried forward: 요청 원문
- Required output of next phase: 활성 Context와 구조 제약 확인
- Entry gate: 요청 원문 기록 완료

#### Phase Transition: PT-002

- Previous phase: `CONTEXT_READER`
- Next phase: `PLANNER`
- State before transition: `CONTEXT_CONFIRMED`
- Transition trigger: 활성 기준과 충돌 없음 확인
- Files changed: 현재 Manifest
- Tests executed: 기존 디렉토리와 참조 경로 정적 조사
- Known limitations: 없음
- Unverified assumptions: 없음
- Inputs carried forward: Context Snapshot과 사용자 확정 구조
- Required output of next phase: 이동 범위와 테스트 계획
- Entry gate: 적용 문서와 충돌 여부 확인 완료

#### Phase Transition: PT-003

- Previous phase: `PLANNER`
- Next phase: `IMPLEMENTER`
- State before transition: `DEVELOPMENT_READY`
- Transition trigger: 디렉토리 경계, 참조 수정, 검증 계획 확정
- Files changed: 현재 Manifest
- Tests executed: 없음
- Known limitations: 실제 외부 Vercel 프로젝트 설정은 저장소 밖이므로 로컬 설정만 검증
- Unverified assumptions: 없음
- Inputs carried forward: 수용 기준 AC-01~AC-05
- Required output of next phase: 이동된 파일과 갱신된 참조
- Entry gate: 사용자 요청이 구조 변경을 명시적으로 승인하고 blocker 없음

#### Phase Transition: PT-004

- Previous phase: `IMPLEMENTER`
- Next phase: `TESTER`
- State before transition: `IMPLEMENTED`
- Transition trigger: 계획한 이동과 참조 갱신 완료
- Files changed: `docs/`, `projects/`, `README.md`
- Tests executed: 구조 정적 검사
- Known limitations: `.git` 인덱스가 읽기 전용이어서 일반 파일 이동 사용
- Unverified assumptions: 외부 Vercel 프로젝트 Root Directory 설정
- Inputs carried forward: 새 구조와 갱신된 참조
- Required output of next phase: API·프론트·문서 검증 증거
- Entry gate: 계획 대비 실제 변경 대조 완료

#### Phase Transition: PT-005

- Previous phase: `TESTER`
- Next phase: `SELF_REVIEWER`
- State before transition: `QA_COMPLETED`
- Transition trigger: 필수 검증 실행과 결과 기록 완료
- Files changed: 프론트 검증을 막던 `tsconfig.app.json`의 기존 incremental 설정 누락 보완
- Tests executed: API 16 tests, 프론트 typecheck/build, 구조·핵심 참조 검사
- Known limitations: 외부 배포 재실행은 범위 밖
- Unverified assumptions: Vercel의 외부 Root Directory가 새 경로로 별도 갱신되는지 여부
- Inputs carried forward: 테스트 결과와 실제 변경 목록
- Required output of next phase: 수용 기준 재판정과 반례 검토
- Entry gate: 모든 테스트 계획에 실행 상태 부여

#### Phase Transition: PT-006

- Previous phase: `SELF_REVIEWER`
- Next phase: `REPORTER`
- State before transition: `SELF_REVIEWED`
- Transition trigger: 원 요청, 실제 구조, 활성 참조와 테스트 증거 재대조 완료
- Files changed: 현재 Manifest와 Impact Analysis 상태 갱신
- Tests executed: 실제 경로와 핵심 상대 참조 재검사
- Known limitations: Git rename 표시는 staging/commit 시 유사도에 따라 결정됨
- Unverified assumptions: 외부 배포 설정
- Inputs carried forward: 모든 AC 충족 판정과 잔여 한계
- Required output of next phase: 사용자 완료 보고
- Entry gate: blocker와 사용자 추가 결정 사항 없음

#### Phase Transition: PT-007

- Previous phase: `REPORTER`
- Next phase: `NONE`
- State before transition: `COMPLETED`
- Transition trigger: 완료 조건과 보고 내용 일치
- Files changed: 현재 Manifest를 archive로 이동
- Tests executed: 추가 실행 없음; TEST-01~04 증거 사용
- Known limitations: 외부 Vercel Root Directory는 저장소 밖에서 확인 필요
- Unverified assumptions: 없음
- Inputs carried forward: 완료 요약과 검증 결과
- Required output of next phase: 해당 없음
- Entry gate: 완료 게이트 전체 충족

## 5. 영향 분석과 계획

### 역할별 영향

| 영역 | 영향 여부 | 변경 내용 또는 영향 없음의 근거 | 필요한 산출물 |
| --- | --- | --- | --- |
| Planning | 있음 | 문서와 프로젝트 탐색 경로 변경 | 구조 안내 갱신 |
| Publishing | 영향 없음 | UI 표현과 디자인 토큰은 변경하지 않음 | 해당 없음 |
| Development | 있음 | 프로젝트 루트와 상대 참조 변경 | 설정·README 경로 갱신 |
| QA | 있음 | 새 경로에서 동일 테스트 재실행 | 검증 증거 |
| Documentation | 있음 | 프로젝트 문서 엔진 전체 이동 | Impact Analysis와 Manifest |

### 예상 변경 범위

| 예상 파일 또는 디렉토리 | 변경 목적 | 변경 유형 |
| --- | --- | --- |
| `organization-standards/` → `docs/organization-standards/` | 회사 공용 규칙 배치 | 이동 |
| 프로젝트 관련 루트 문서·디렉토리 → `docs/apc-monitoring-mvp/` | 프로젝트 문서 엔진 집약 | 이동 |
| `projects/apc-monitoring-mvp/` → `projects/apc-monitoring-mvp/` | 실행 프로젝트 집약 | 이동 |
| 저장소·하위 README 및 설정 | 새 경로 안내와 상대 링크 정합성 | 수정 |

### 위험과 대응

| 위험 | 가능성 | 영향 | 대응 또는 확인 방법 |
| --- | --- | --- | --- |
| 상대 링크 단절 | 높음 | 문서 탐색 실패 | 전체 Markdown 링크·경로 검색 |
| 빌드/테스트 기준 경로 단절 | 중간 | 앱 검증 실패 | 새 프로젝트 루트에서 테스트와 빌드 실행 |
| 배포 루트 불일치 | 중간 | 외부 배포 실패 가능 | 저장소 설정 검토, 외부 설정 한계 공개 |

### 구현 계획

1. 공용 규칙, 프로젝트 문서, 실행 코드를 새 경계로 이동한다.
2. README와 문서 내부 상대·논리 경로를 새 구조에 맞게 갱신한다.
3. 정적 경로 검사, API 테스트, 프론트엔드 테스트·빌드를 수행한다.

### 테스트 계획

| ID | 검증 대상 | 방법 또는 명령 | 성공 기준 | 필수 여부 |
| --- | --- | --- | --- | --- |
| TEST-01 | 저장소 구조 | `find`, `test -e` | 세 경계가 정확히 존재 | 필수 |
| TEST-02 | 경로 참조 | `rg` | 이동 전 활성 경로 참조 없음 | 필수 |
| TEST-03 | API | 프로젝트 API 테스트 | 전체 통과 | 필수 |
| TEST-04 | 프론트엔드 | 테스트와 빌드 | 전체 통과 | 필수 |

## 6. Development Ready Gate

| 확인 항목 | 상태 | 근거 |
| --- | --- | --- |
| 요청과 제외 범위가 명확하다 | 충족 | 사용자 요청과 합의된 요약 |
| 활성 기준 문서를 확인했다 | 충족 | Context Snapshot |
| 역할별 영향 판단을 기록했다 | 충족 | 역할별 영향 표 |
| 필요한 역할별 문서를 연결했다 | 충족 | 기존 역할 기준과 본 Manifest 연결 |
| 예상 변경 범위와 위험을 기록했다 | 충족 | 예상 범위·위험 표 |
| 테스트 계획과 완료 조건을 기록했다 | 충족 | AC 및 TEST-01~04 |
| 사용자 확인이 필요한 blocker가 없다 | 충족 | 디렉토리 경계가 명시됨 |
| 고위험 변경의 사용자 승인 상태가 유효하다 | 해당 없음 | 데이터·인증·운영 실행 변경이 아닌 구조 이동이며 요청자가 명시 승인 |

## 7. 구현 기록

### 실제 변경 파일

| 실제 변경 파일 | 변경 요약 | 계획 여부 |
| --- | --- | --- |
| `docs/organization-standards/` | 회사 공용 규칙 이동 | 계획됨 |
| `docs/apc-monitoring-mvp/` | 프로젝트 문서 엔진 전체 이동 및 참조 갱신 | 계획됨 |
| `projects/apc-monitoring-mvp/` | 실행 프로젝트 이동 및 실행 안내 갱신 | 계획됨 |
| `README.md`, `docs/README.md`, `projects/README.md` | 새 저장소 구조와 책임 안내 | 계획됨 |
| `projects/apc-monitoring-mvp/frontend/tsconfig.app.json` | 기존 빌드 차단 설정 보완 | 계획 외 |

### 계획 대비 차이

- 예상했지만 변경하지 않은 파일: 없음.
- 계획에 없었지만 변경한 파일: 프론트 `tsconfig.app.json`에 `incremental: true` 추가.
- 차이의 원인과 영향: 의존성 설치 후 기존 `tsBuildInfoFile` 설정이 TypeScript 빌드를 차단해 검증 불가능했으며, 빌드 캐시 옵션을 명시해 기존 의도를 완성했다.
- 계획 또는 테스트 수정 여부: 동일한 typecheck/build를 재실행했다.

## 8. QA 실행 증거

| Test ID | 대상 | 실행 방법 또는 명령 | 결과 상태 | 결과 요약 | 증거 위치 | 미검증 범위 |
| --- | --- | --- | --- | --- | --- | --- |
| TEST-01 | 저장소 구조 | `test -f`, `test ! -e` | `PASSED` | 새 세 경계 존재, 이전 최상위 경계 부재 | 명령 출력 `repository structure: PASS` | 없음 |
| TEST-02 | 핵심 문서 참조 | 상대 경로 `test -f`, 활성 문서 `rg` | `PASSED` | Context·조직 표준·프로젝트 코드 참조 확인 | 명령 출력 `key document references: PASS` | 과거 이력의 당시 명령 문자열은 보존 |
| TEST-03 | FastAPI API | `uv run --with pytest pytest` | `PASSED` | 16 passed | pytest 출력 | 없음 |
| TEST-04 | React frontend | `npm run typecheck && npm run build` | `PASSED` | typecheck 성공, Vite 691 modules production build 성공 | npm/Vite 출력 | 브라우저 시각 QA 미실행 |

### 실패와 미실행 항목

- 실패: 최종 실패 없음. 초기 실행은 Python/Node 로컬 의존성 부재와 TypeScript 설정 누락을 발견했고 환경 구성·설정 보완 후 재실행 통과.
- 미실행: 외부 Vercel 배포, 브라우저 시각 QA.
- 사용자 수용이 필요한 사항: 외부 Vercel 프로젝트를 계속 사용할 경우 Root Directory를 `projects/apc-monitoring-mvp`로 확인해야 한다.

## 9. Self-Review

### Clean Input Declaration

- Original request re-read: 예
- Active Context re-read: 예
- Actual diff inspected: 예
- Implementation conclusion reused as evidence: 아니오
- Evidence records inspected: 구조 검사, 핵심 참조 검사, pytest, typecheck, Vite build

| 질문 | 판정 | 근거 |
| --- | --- | --- |
| 원 요청의 모든 조건이 구현되었는가 | 예 | 공용 규칙·프로젝트 문서·실행 코드가 각각 요청 경계에 존재 |
| 실제 변경이 계획 범위를 벗어났는가 | 일부 | 빌드 검증을 위한 TypeScript 설정 1줄 보완, 영향 기록 |
| 변경하지 말아야 할 동작이나 기준이 바뀌었는가 | 아니오 | API 테스트와 프론트 빌드 통과, 앱 기능 코드 미수정 |
| 테스트 결과가 현재 변경 상태를 검증하는가 | 예 | 새 경로에서 실행 |
| 실행하지 않은 검증은 명시되어 있는가 | 예 | 외부 배포·시각 QA 명시 |
| 성공 판정을 반박하는 증거나 반례가 없는가 | 예 | 핵심 로컬 검증 실패 없음 |
| 사용자 판단이 필요한 사항이 남아 있는가 | 아니오 | 외부 배포 설정은 후속 운영 확인 사항 |
| 관련 문서 링크와 상태가 서로 일치하는가 | 예 | 핵심 상대 참조 검사 통과 |

### 반례 검토

- 가장 가능성 높은 실패 시나리오: Vercel이 기존 `app/`를 Root Directory로 유지해 배포가 실패한다.
- 확인 방법: Vercel 프로젝트 설정 또는 다음 배포 로그 확인.
- 결과: 저장소 내부 `vercel.json`은 새 프로젝트 루트 안에서 유효하나 외부 설정은 미검증.

### Confidence and Unknowns

- Confidence: `HIGH`
- Confidence basis: 구조·참조·API·프론트 검증 통과.
- Unverified items: 외부 Vercel 설정과 실제 재배포.
- Required user decision: 없음.
- Regression or re-entry required: 없음.

## 10. 완료 판정

| 완료 조건 | 상태 | 근거 |
| --- | --- | --- |
| 모든 수용 기준에 판정과 근거가 있다 | 충족 | AC-01~05 |
| 기준 문서와 결과 사이에 알려진 충돌이 없다 | 충족 | Context 재검토 |
| 계획 대비 실제 변경 차이를 설명했다 | 충족 | 구현 기록 |
| 모든 테스트 계획에 실행 상태가 있다 | 충족 | TEST-01~04 |
| 실패·미실행·한계를 공개했다 | 충족 | QA와 Self-Review |
| Self-Review를 완료했다 | 충족 | 9절 |
| 6개 Phase와 모든 전환 기록이 완결되었다 | 충족 | PT-001~007 |
| Reporter에서 `NONE`으로 terminal transition을 기록했다 | 충족 | PT-007 |
