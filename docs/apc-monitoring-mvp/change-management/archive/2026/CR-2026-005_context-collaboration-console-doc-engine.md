# CR-2026-005 Context Collaboration Console 문서 엔진 구축

## 변경 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-005` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `NONE` |
| 요청일 | `2026-07-22` |
| 최종 갱신일 | `2026-07-22` |
| 요청자 | 사용자 |
| 수행 주체 | 단일 AI 에이전트 |
| 위험도 | 중간 |
| 승인 상태 | `APPROVED` |
| 승인 기록 | 현재 요청에서 신규 프로젝트 문서 시스템과 퍼블리싱 규칙을 명시적으로 확정 |

## 요청 정의

- 한 문장 요약: APC 프로젝트를 첫 관리 대상으로 하는 AI 협업 운영 콘솔의 구현 기준 문서와 기계 검증 정책을 구축한다.
- 포함 범위: 회사 공용 UI 규칙, 프로젝트 Context, 역할별 Feature, IA·화면·상태·계약·QA, YAML 정책, 코드 프로젝트 진입점.
- 제외 범위: 이번 요청에서 React 화면과 실제 AI/Git 연동 코드를 구현하는 것.

## 수용 기준

| ID | 완료 조건 | 검증 방법 |
| --- | --- | --- |
| AC-01 | `docs/context-collaboration-console/`이 독립 문서 엔진으로 존재한다 | 구조 검사 |
| AC-02 | 대시보드·자연어 요청·Context·영향 분석·승인/검증의 화면과 흐름이 정의된다 | 요구사항 추적 검사 |
| AC-03 | 금지된 AI식 디자인과 Truthound/Astryx 적용 원칙이 명문화된다 | 공용·프로젝트 퍼블리싱 문서 검사 |
| AC-04 | 상태·권한·승인·문서 메타데이터를 YAML로 기계 검증 가능하게 정의한다 | YAML parse 검사 |
| AC-05 | `projects/context-collaboration-console/`에서 구현을 시작할 수 있다 | 프로젝트 README와 구현 계획 검사 |
| AC-06 | 표면 문구에 MVP·AI 과장 표현이 노출되지 않는 정책이 있다 | 카피 정책 검사 |

## Context Snapshot

- 확인 문서: `docs/apc-monitoring-mvp/Active_Context.md`, `Project_Context.md`, `docs/organization-standards/*`, Change Management 정책.
- 외부 기준: Truthound 한국어 메인 레이아웃 참조, Astryx 공식 사이트의 React/StyleX·themeable·accessible 컴포넌트 기준, 실제 B2B 운영 화면의 역할별 정보 밀도와 감사 추적 원칙.
- 충돌: 없음. 신규 콘솔은 기존 APC 모니터링 앱과 별도 프로젝트로 관리한다.

## 영향과 계획

| 영역 | 영향 | 산출물 |
| --- | --- | --- |
| Organization | 공용 디지털 제품 UI 금지·품질 기준 추가 | `docs/organization-standards/digital-product-ui-standards.md` |
| Planning | 제품 목적, 사용자, IA, 핵심 흐름, 수용 기준 신규 정의 | Project Context와 Planning feature |
| Publishing | 레퍼런스 분석, 색상·타이포·레이아웃·상태·카피 기준 신규 정의 | Publishing feature와 screen specs |
| Development | React/Astryx 구조, fixture-first demo, 향후 백엔드 경계 정의 | Development feature와 contracts |
| QA | 추적성, 상태 전이, 접근성, 시각 회귀, 금지 패턴 검사 정의 | QA feature와 test matrix |
| Project | 구현 시작 위치 생성 | `projects/context-collaboration-console/README.md` |

## 구현 계획

1. 공용 UI 표준과 프로젝트 Context 레지스트리를 만든다.
2. 역할별 상위 문서와 초기 Feature를 연결한다.
3. 정보 구조·화면·토큰·계약·정책·QA 문서를 작성한다.
4. YAML 파싱, 필수 문서·ID·링크, 금지 문구 정책을 정적 검증한다.

## Phase Transition Log

### PT-001

- Previous phase: `NONE`
- Next phase: `CONTEXT_READER`
- Trigger: 사용자 요청 접수
- Result: 기존 활성 Context와 신규 프로젝트 경계 확인

### PT-002

- Previous phase: `CONTEXT_READER`
- Next phase: `PLANNER`
- Trigger: 기준과 외부 레퍼런스 조사 완료
- Result: 독립 프로젝트명, 문서 구조, 검증 계획 확정

### PT-003

- Previous phase: `PLANNER`
- Next phase: `IMPLEMENTER`
- Trigger: AC-01~06과 산출물 범위 확정
- Entry gate: 사용자 요청이 신규 규범 문서 작성을 승인하고 blocker 없음

## 검증 계획

| Test ID | 대상 | 성공 기준 |
| --- | --- | --- |
| TEST-01 | 필수 구조 | 모든 필수 파일 존재 |
| TEST-02 | YAML 계약 | 모든 YAML 안전 파싱 |
| TEST-03 | 추적성 | 핵심 기능·상태·화면·QA ID가 상호 연결 |
| TEST-04 | 퍼블리싱 정책 | 사용자 금지 목록과 제품 카피 정책 포함 |
| TEST-05 | 링크 | 핵심 상대 경로가 실제 파일로 연결 |

## 구현 기록

- 회사 공용 규칙: `docs/organization-standards/digital-product-ui-standards.md`
- 신규 문서 엔진: `docs/context-collaboration-console/`
- 구현 진입점: `projects/context-collaboration-console/README.md`
- 문서 수: 프로젝트 문서 34개(역할, 제품, 디자인, 개발, 정책, QA, 평가, 영향 분석 포함)
- 구조화 계약: document schema, workflow, permission, UI policy YAML 4종

## QA 실행 증거

| Test ID | 결과 | 증거 |
| --- | --- | --- |
| TEST-01 | `PASSED` | 필수 Context·역할·디자인·개발·QA·project 파일 존재 |
| TEST-02 | `PASSED` | Ruby Psych로 YAML 4종 `safe_load` 성공 |
| TEST-03 | `PASSED` | 기능 요구사항 21개가 QA matrix에 모두 연결 |
| TEST-04 | `PASSED` | 사용자 금지 패턴, surface copy, radius/card/border/button 정책 포함 |
| TEST-05 | `PASSED` | 역할 Feature와 Manifest 핵심 상대 경로 존재 확인 |
| TEST-06 | `PASSED` | `git diff --check` 성공 |

## Phase Transition Log — completion

### PT-004

- Previous phase: `IMPLEMENTER`
- Next phase: `TESTER`
- Trigger: 문서·YAML·프로젝트 진입점 작성 완료
- Result: 계획한 구조와 실제 파일 대조

### PT-005

- Previous phase: `TESTER`
- Next phase: `SELF_REVIEWER`
- Trigger: TEST-01~06 실행 완료
- Result: 모든 필수 정적 검증 통과

### PT-006

- Previous phase: `SELF_REVIEWER`
- Next phase: `REPORTER`
- Trigger: 원 요청, 금지 디자인, 레퍼런스 적용 범위, 실제 문서 재검토
- Result: 구현 가능한 기준은 충분하며 Truthound 시각 캡처 한계를 명시

### PT-007

- Previous phase: `REPORTER`
- Next phase: `NONE`
- Trigger: 완료 조건과 보고 내용 일치
- Result: Manifest archive 이동

## Self-Review

| 질문 | 판정 | 근거 |
| --- | --- | --- |
| 요청한 기능이 모두 문서화됐는가 | 예 | CAP-01~06, REQ 21개, SCR-01~09 |
| 퍼블리싱 금지 조건이 누락됐는가 | 아니오 | 공용 UI 표준과 ui-policy YAML |
| Truthound를 확인 없이 픽셀 단위로 단정했는가 | 아니오 | 구조적 적용 범위와 Reference Lock 한계 분리 |
| Astryx 적용 경계가 있는가 | 예 | component mapping과 wrapper 원칙 |
| 승인·검증 우회가 가능한 정책인가 | 아니오 | workflow guard와 permission contract |
| 구현을 시작할 파일·순서·완료 조건이 있는가 | 예 | project README와 implementation plan |

- Confidence: `HIGH`
- 미검증: Truthound desktop/mobile visual capture, 실제 React/Astryx 구현, 브라우저 QA.
- 재진입 필요: 구현 중 reference capture가 현재 가정과 다르면 Publishing phase로 재진입.

## 완료 판정

- AC-01~06: 모두 충족
- 실패: 없음
- 미실행: 실제 앱 구현·시각 QA는 이번 요청 범위 밖
- 상태: `COMPLETED`
