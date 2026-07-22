# Change Management Workflow

## 목적

이 디렉토리는 사용자 요청이 문서 확인 없이 구현으로 바로 이동하거나, 구현과 검증의 근거가 서로 분리되는 문제를 방지한다.

모든 변경 요청은 하나의 Change Manifest를 진입점으로 사용한다. Change Manifest는 역할별 상세 문서를 대체하지 않고 다음 정보를 연결하는 제어 문서다.

- 요청의 원문과 합의된 해석
- 현재 적용되는 기준 문서
- 예상 영향 범위와 역할별 산출물
- 현재 상태와 상태 전환 근거
- 실제 변경 범위
- 테스트 실행 결과와 증거
- 자체 검토 결과와 남은 한계

작업 시작 시 `../Active_Context.md`를 먼저 읽고 이번 요청에 적용할 문서 목록을 Manifest에 선언한다.

이 워크플로는 별도 프로그램이나 외부 플랫폼이 아닌 문서 규칙과 단일 AI 에이전트의 준수로 운영한다.

## 디렉토리 구조

```text
change-management/
├── README.md
├── approval-policy.md
├── templates/
│   ├── change-manifest-template.md
│   ├── phase-transition-template.md
│   ├── self-review-template.md
│   ├── verification-evidence-template.md
│   └── approval-record-template.md
├── active/
│   └── CR-YYYY-NNN_short-title.md
└── archive/
    └── YYYY/
        └── CR-YYYY-NNN_short-title.md
```

- `active/`: `REQUESTED`부터 `SELF_REVIEWED`까지의 변경 요청을 둔다.
- `archive/`: `COMPLETED` 또는 `CANCELLED`된 변경 요청을 연도별로 보존한다.
- 완료된 문서를 이동할 때 문서 ID와 파일명은 바꾸지 않는다.
- 동일 요청의 상태별 복사본을 만들지 않는다. 하나의 문서를 갱신하여 상태 이력을 보존한다.

## 문서 권위와 참조 원칙

Change Manifest는 기준 문서가 아니라 변경 수행 기록이다. 내용이 충돌할 때의 우선순위는 다음과 같다.

1. `docs/organization-standards/`의 조직 표준
2. `Project_Context.md`
3. 현재 변경 요청에 대해 사용자가 명시적으로 확정한 조건
4. 역할 상위 문서 `roles/{role}/{Role}.md`
5. 현재 요청과 연결된 역할별 Feature 문서
6. Change Manifest의 계획과 기록
7. QA 및 Impact Analysis 증거
8. 실제 코드

상위 기준과 하위 문서가 충돌하면 AI는 임의로 선택하지 않는다. 충돌 내용과 영향을 Manifest의 `미해결 사항`에 기록하고 사용자 확인 전 상태 전환을 중단한다.

활성 문서와 메타데이터는 `../Active_Context.md`에서 결정한다. 파일 수정일, 파일명 숫자, 디렉토리 정렬 순서는 권위 근거가 아니다. QA, Impact Analysis, Change Manifest, Evaluation Result는 기준이 아니라 증거와 이력이다.

## 상태 모델

```text
REQUESTED
→ CONTEXT_CONFIRMED
→ PLANNED
→ DEVELOPMENT_READY
→ IMPLEMENTED
→ QA_COMPLETED
→ SELF_REVIEWED
→ COMPLETED
```

예외 종료 상태는 `CANCELLED`다. 상태를 건너뛰거나 이전 상태의 완료 조건을 추정으로 채울 수 없다.

| 상태 | 의미 | 진입 조건 | 필수 산출물 |
| --- | --- | --- | --- |
| `REQUESTED` | 요청을 접수하고 아직 기준을 확정하지 않음 | 사용자 요청 존재 | 요청 원문, 요청 요약, 초기 범위 |
| `CONTEXT_CONFIRMED` | 적용 기준과 충돌 여부를 확인함 | 활성 기준 문서 정독 | Context Snapshot, 용어/제약, 충돌 여부 |
| `PLANNED` | 역할 영향과 변경·검증 계획을 확정함 | 요구사항이 검증 가능한 조건으로 정리됨 | 역할 영향, 예상 파일, 위험, 테스트 계획 |
| `DEVELOPMENT_READY` | 구현에 필요한 역할별 문서 게이트가 충족됨 | 필요한 Feature/QA/Impact 문서가 연결됨 | 참조 문서, 구현 TASK, 완료 기준 |
| `IMPLEMENTED` | 계획된 문서 또는 코드를 변경함 | 계획 범위 안의 구현 완료 | 실제 변경 파일, 계획 대비 차이 |
| `QA_COMPLETED` | 현재 변경 상태에 대한 검증을 수행함 | 테스트 계획별 실행 결과 기록 | 명령, 종료 코드, 결과, 증거, 미실행 항목 |
| `SELF_REVIEWED` | 원 요청부터 실제 결과까지 다시 대조함 | QA 결과와 실제 변경 재검토 | 자체 검토 질문의 판정과 잔여 위험 |
| `COMPLETED` | 모든 완료 조건을 충족하고 사용자에게 보고 가능함 | blocker 없음, 미실행/한계 공개 | 최종 요약, 후속 작업, 상태 이력 |
| `CANCELLED` | 변경을 진행하지 않기로 확정함 | 사용자 취소 또는 대체 요청 | 취소 사유, 대체 문서 링크 |

## 상태 전환 규칙

1. AI는 작업 시작 시 Change Manifest를 생성하고 `REQUESTED`를 기록한다.
2. 각 상태 전환 전에 해당 상태의 Exit Checklist를 확인한다.
3. 체크되지 않은 항목은 `해당 없음`과 근거가 있을 때만 통과할 수 있다.
4. 상태 전환 시 `상태 이력`에 시각, 이전/다음 상태, 완료 근거를 추가한다.
5. 구현 중 요구사항이나 범위가 달라지면 변경을 멈추고 `PLANNED`로 되돌아간다.
6. 구현 후 파일이 바뀌면 기존 QA 결과를 재사용하지 않고 `IMPLEMENTED` 상태부터 다시 진행한다.
7. 테스트 실패가 남아 있으면 `QA_COMPLETED` 기록은 가능하지만 `SELF_REVIEWED`를 통과할 수 없다. 사용자가 실패를 명시적으로 수용한 경우에만 수용 근거를 남긴다.
8. `COMPLETED`는 작업을 중단했다는 의미가 아니라 요청의 완료 조건과 보고 조건을 모두 충족했다는 의미다.

## 단일 AI 에이전트 실행 규칙

### State와 Phase의 구분

`State`는 변경 요청의 성숙도와 완료 수준을 나타낸다. `Phase`는 단일 AI가 현재 수행하는 역할을 나타낸다.

| 구분 | 질문 | 값의 예 | 기록 위치 |
| --- | --- | --- | --- |
| State | 요청은 완료를 향해 어느 수준까지 왔는가 | `PLANNED`, `QA_COMPLETED` | 현재 상태, 상태 이력 |
| Phase | AI는 지금 어떤 관점과 책임으로 일하는가 | `PLANNER`, `TESTER` | 현재 Phase, Phase Transition Log |

State는 기본적으로 앞으로 진행하지만 재작업 시 이전 상태로 회귀할 수 있다. Phase는 검증 실패, 요구사항 변경, 범위 변경에 따라 반복할 수 있다. 그러므로 State와 Phase를 하나의 값으로 합치지 않는다.

### 표준 Phase

단일 AI는 다음 6개 Phase를 표준 순서로 수행한다. Phase 이름은 문서 전체에서 아래 대문자 식별자를 사용한다.

| 순서 | Phase | 역할 | 필수 입력 | 필수 출력 | 종료 조건 |
| --- | --- | --- | --- | --- | --- |
| 1 | `CONTEXT_READER` | 요청과 유효한 기준 문서를 확인 | 요청 원문, Project Context, 조직 표준, 관련 문서 | Context Snapshot, 충돌·제약·용어, 적용 문서 목록 | 기준 문서 확인 결과와 미해결 충돌이 기록됨 |
| 2 | `PLANNER` | 요구사항과 수행·검증 계획을 설계 | Context Reader 출력 | 수용 기준, 영향 범위, 위험, 예상 파일, 테스트 계획 | Development Ready Gate의 판단 근거가 준비됨 |
| 3 | `IMPLEMENTER` | 승인된 계획과 범위 안에서 변경 | 확정 계획, 참조 Feature, 완료 조건 | 실제 변경, 계획 대비 차이, 발견 이슈 | 계획한 구현이 끝나고 범위 차이가 기록됨 |
| 4 | `TESTER` | 현재 변경 상태를 실제로 검증 | 테스트 계획, 실제 변경 | 명령·방법, 결과, 증거, 실패·미실행 목록 | 모든 테스트 계획에 실행 상태가 부여됨 |
| 5 | `SELF_REVIEWER` | 원 요청부터 결과까지 독립된 관점으로 재대조 | 원 요청, 기준, 계획, 실제 변경, QA 증거 | 수용 기준 재판정, 반례, 잔여 위험, 회귀 결정 | 성공 판정을 반박할 증거와 미검증 사항이 공개됨 |
| 6 | `REPORTER` | 사용자에게 결과와 한계를 구분해 전달 | Self-Review 판정, 완료 게이트 | 완료·미완료·미검증·한계·후속 작업 | 최종 상태와 사용자 보고 내용이 일치함 |

### 기본 State와 Phase 매핑

| Phase | 일반적인 시작 State | Phase가 정상 종료될 때의 State |
| --- | --- | --- |
| `CONTEXT_READER` | `REQUESTED` | `CONTEXT_CONFIRMED` |
| `PLANNER` | `CONTEXT_CONFIRMED` | `DEVELOPMENT_READY` (`PLANNED` 경유) |
| `IMPLEMENTER` | `DEVELOPMENT_READY` | `IMPLEMENTED` |
| `TESTER` | `IMPLEMENTED` | `QA_COMPLETED` |
| `SELF_REVIEWER` | `QA_COMPLETED` | `SELF_REVIEWED` |
| `REPORTER` | `SELF_REVIEWED` | `COMPLETED` 또는 승인된 비완료 상태 |

이 표는 정상 경로의 기본값이다. Phase Transition Log가 실제 순서와 회귀 이유의 최종 기록이다.

`COMPLETED` 또는 `CANCELLED`로 종료할 때는 마지막으로 `REPORTER → NONE` 또는 취소를 확정한 현재 Phase에서 `NONE`으로 terminal transition을 기록한다. 종료된 Manifest의 `현재 Phase`는 `NONE`이다. `NONE`은 수행 역할이 아니라 더 이상 활성 Phase가 없다는 종결 표기다.

### Phase 전환 계약

Phase가 바뀌기 전에 AI는 현재 Manifest의 `Phase Transition Log`에 전환 선언을 추가하고, 사용자에게도 같은 내용을 간결하게 알린다. 선언이 기록되기 전에는 다음 Phase의 실질 작업을 시작하지 않는다.

모든 전환 선언에는 다음 필드가 필수다.

```markdown
## Phase Transition: PT-NNN

- Previous phase: `IMPLEMENTER`
- Next phase: `TESTER`
- State before transition: `IMPLEMENTED`
- Transition trigger: 계획된 변경과 실제 변경 대조 완료
- Files changed:
- Tests executed:
- Known limitations:
- Unverified assumptions:
- Inputs carried forward:
- Required output of next phase:
- Entry gate:
```

`Files changed`, `Tests executed`, `Known limitations`, `Unverified assumptions`는 값이 없어도 생략하지 않고 `없음`과 근거를 기록한다. 표준 원본은 `templates/phase-transition-template.md`다.

### Phase 진입과 종료 규칙

1. `Previous phase`의 종료 조건이 충족되어야 다음 Phase로 전환한다.
2. `Next phase`의 필수 입력이 `Inputs carried forward`에 존재해야 한다.
3. Phase를 건너뛰거나 두 Phase를 하나의 판정으로 합치지 않는다.
4. 변경 특성상 수행할 작업이 없는 Phase도 전환은 기록한다. 해당 출력은 `NOT_APPLICABLE`과 근거를 남긴다.
5. Phase 안에서 만든 자기평가는 다음 Phase의 판정을 대신할 수 없다.
6. `TESTER`는 구현 의도를 성공 근거로 사용하지 않고 실제 실행 결과를 기록한다.
7. `SELF_REVIEWER`는 구현 결론을 복사하지 않고 원 요청과 수용 기준부터 다시 판정한다.
8. `REPORTER`는 새로운 구현이나 검증을 수행하지 않는다. 새로운 작업이 필요하면 적절한 이전 Phase로 되돌아간다.
9. 사용자 승인, 문서 충돌, 되돌리기 어려운 변경 또는 중요한 미확정 가정이 있으면 전환하지 않고 `미해결 사항`에 기록한다.
10. `NONE`은 최초 진입의 Previous phase 또는 종료 전환의 Next phase에만 사용할 수 있다. 진행 중 Phase를 대신하는 값으로 사용할 수 없다.
11. 정상 완료는 `REPORTER → NONE` 전환으로 닫는다. 취소는 취소를 확정한 Phase에서 `NONE`으로 닫고 취소 사유를 기록한다.

### 재진입과 회귀 규칙

| 발견 시점 또는 조건 | 돌아갈 Phase | State 처리 | 기존 증거 처리 |
| --- | --- | --- | --- |
| 요청 해석 또는 기준 문서가 바뀜 | `CONTEXT_READER` | `REQUESTED` 또는 `CONTEXT_CONFIRMED`로 회귀 | 이후 계획·QA 판정 무효화 |
| 영향 범위, 위험, 테스트 계획이 달라짐 | `PLANNER` | `PLANNED`로 회귀 | 기존 구현은 재평가 대기 |
| Tester가 구현 결함을 발견 | `IMPLEMENTER` | `DEVELOPMENT_READY`로 회귀 | 실패 증거는 보존, 수정 후 QA 재실행 |
| 구현 후 파일이 다시 변경됨 | `TESTER` | `IMPLEMENTED` | 이전 QA 결과는 현재 변경의 통과 근거로 사용 금지 |
| Self-Review가 요구사항 누락을 발견 | 누락 원인에 따라 `CONTEXT_READER`, `PLANNER`, `IMPLEMENTER` | 해당 선행 State로 회귀 | 기존 Self-Review 판정 무효화 |
| Reporter가 미해결 작업을 발견 | 해당 책임 Phase | `COMPLETED` 전환 금지 | 보고 초안은 보존하되 최종 보고로 사용 금지 |

모든 역방향 전환도 일반 전환과 동일하게 Phase Transition 선언을 남긴다. 이전 기록을 삭제하거나 통과로 덮어쓰지 않는다.

## 영향 분석 규칙

계획 단계에서는 최소한 다음을 기록한다.

- Planning: 사용자 흐름, 정책, 문구, 완료 기준 변화
- Publishing: 레이아웃, 컴포넌트, 상태 표현, 반응형, 접근성 변화
- Development: API, 타입, 상태, 데이터, 테스트, 배포 변화
- QA: 신규 검증, 회귀 검증, 시각 검증 변화
- Documentation: Project Context, 역할 문서, Feature, Impact Analysis 변화

영향이 없으면 빈칸 대신 `영향 없음`과 판단 근거를 쓴다. 예상 파일은 파일 또는 디렉토리 단위로 기록하고 구현 후 실제 변경 파일과 대조한다.

## 테스트와 증거 규칙

검증 상태는 다음 용어만 사용한다.

| 상태 | 정의 |
| --- | --- |
| `PASSED` | 명시한 검증을 실제로 수행했고 성공함 |
| `FAILED` | 검증을 수행했고 실패함 |
| `PARTIALLY_VERIFIED` | 계획한 범위 중 일부만 확인함 |
| `STATIC_REVIEW_ONLY` | 실행하지 않고 문서·코드만 검토함 |
| `NOT_EXECUTED` | 검증을 실행하지 않음 |
| `NOT_APPLICABLE` | 요청 특성상 검증 대상이 아니며 근거가 있음 |

모든 검증 항목에는 대상, 방법 또는 명령, 결과, 근거 위치, 미검증 범위를 기록한다. 체크박스의 `[x]`만으로 통과를 주장할 수 없다.

각 검증 단위는 `templates/verification-evidence-template.md` 형식을 따른다. 필수 필드는 Target, Changed files, Test command, Exit code, Result, Screenshot/log path, Not executed, Known limitations, Self-review verdict다.

- 실제 명령을 실행하고 성공했을 때만 `PASSED`다.
- 눈으로만 확인한 결과는 `STATIC_REVIEW_ONLY`다.
- 변경 후 재실행하지 않은 이전 결과는 현재 변경의 통과 근거로 재사용하지 않는다.
- 실제로 존재하지 않는 screenshot, log, trace, artifact 경로를 기록하지 않는다.
- 증거 없는 체크 항목은 완료 처리하지 않는다.

## Self-Review 편향 완화 규칙

단일 AI의 Self-Review는 독립 검증이 아니다. 다음 규칙은 독립성을 주장하기 위한 것이 아니라 자기확증 편향을 줄이기 위한 최소 계약이다.

1. Implementer가 작성한 결론을 그대로 인용해 통과시키지 않는다.
2. Self-Reviewer 진입 시 원 요청부터 다시 읽는다.
3. 계획된 파일 목록이 아니라 실제 `git diff`와 실제 변경 파일을 기준으로 검토한다.
4. “의도한 동작”과 “실제로 확인한 동작”을 별도 열로 기록한다.
5. 실행하지 않은 테스트를 통과로 판정하지 않는다.
6. 증거가 없는 체크 항목을 완료 처리하지 않는다.
7. 성공 근거를 요약하기 전에 반례와 실패 가능성을 먼저 탐색한다.
8. 최소 한 번은 “이 구현이 요구사항을 충족하지 못하는 현실적인 경우”를 작성하고 확인한다.
9. 실제 diff에서 계획 밖 변경과 새롭게 생긴 범위 밖 영향을 확인한다.
10. 최종 판정에 confidence, 미검증 사항, 알려진 한계, 사용자 판단 필요 사항을 기록한다.

Self-Review는 `templates/self-review-template.md`를 사용한다. 다음 질문은 삭제하거나 다른 질문으로 대체할 수 없다.

- 원 요청의 모든 조건이 구현되었는가?
- 실제 변경이 계획된 범위를 벗어났는가?
- 변경하지 말아야 할 동작이 바뀌었는가?
- 테스트 결과가 현재 변경 상태를 검증하는가?
- 실행하지 않은 검증은 무엇인가?
- 성공을 반박할 수 있는 증거는 없는가?
- 사용자 판단이 필요한 사항은 남아 있는가?

필수 질문에 근거가 없거나 confidence가 `LOW`이고 핵심 조건이 미검증이면 `SELF_REVIEWED`로 전환하지 않는다.

## 위험도와 사용자 승인

위험 분류와 승인 절차는 `approval-policy.md`를 따른다. 인증·권한, 민감정보, 데이터 삭제·migration, 공개 인터페이스, 배포·운영 설정, 비가역 변경, 기준 문서 충돌, 다중 해석 요구사항은 사용자 승인이 필요하다.

고위험 변경에서 AI는 승인 전에 read-only 조사, 영향 분석, 초안까지만 수행한다. 실제 적용은 Approval Record가 `APPROVED`인 범위 안에서만 가능하다. 승인 대상이나 범위가 바뀌면 기존 승인을 확대 해석하지 않고 재승인을 요청한다.

## 계획 대비 실제 변경 대조

`IMPLEMENTED` 전환 전에 다음을 확인한다.

- 예상 변경 파일이 실제로 변경되었는가
- 예상하지 않은 파일이 변경되었는가
- 예상했지만 변경하지 않은 파일이 있는가
- 범위 차이가 요구사항 또는 테스트 계획을 바꾸는가
- 범위 차이를 Manifest와 Impact Analysis에 반영했는가

계획 밖 변경은 반드시 사유를 남긴다. 사유가 별도 요청에 해당하면 현재 변경에 포함하지 않고 새 Change Manifest 후보로 기록한다.

## 완료 게이트

다음 조건이 모두 참일 때만 `COMPLETED`로 전환한다.

- 요청의 모든 수용 기준에 판정과 근거가 있다.
- 활성 기준 문서와 구현 결과 사이에 알려진 충돌이 없다.
- 예상 변경과 실제 변경의 차이를 설명했다.
- 테스트 계획의 각 항목이 실행 상태와 함께 기록되었다.
- 실패 또는 미검증 항목이 숨겨지지 않았다.
- Self-Review 질문을 원 요청 기준으로 다시 판정했다.
- 남은 위험과 후속 작업을 사용자에게 보고할 수 있게 정리했다.
- 관련 Feature, QA, Impact Analysis 문서의 링크가 유효하다.
- Self-Review confidence와 모든 미검증 항목이 기록되어 있다.
- 고위험 변경이면 유효한 사용자 Approval Record가 있다.

## 확장 원칙

- 새로운 역할이 생기면 Manifest 형식을 복제하지 않고 `역할 영향 분석` 표에 역할 행을 추가한다.
- 새로운 상태가 필요하면 상태명뿐 아니라 진입 조건, 필수 산출물, 허용 전환을 이 문서에 함께 정의한다.
- 프로젝트별 세부 항목은 역할 문서에 두고 공통 절차만 이 문서에 둔다.
- 템플릿의 필드명을 변경하면 활성 Manifest와 README의 예시를 함께 검토한다.
- 자동화가 도입되더라도 이 문서의 의미를 원본 계약으로 유지하고 도구는 이를 구현하는 수단으로만 취급한다.
