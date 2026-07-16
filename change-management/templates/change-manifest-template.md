# [CR-ID] 변경 제목

## 1. 변경 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-YYYY-NNN` |
| 현재 상태 | `REQUESTED` |
| 현재 Phase | `CONTEXT_READER` (`COMPLETED`/`CANCELLED` 종료 후 `NONE`) |
| 요청일 | `YYYY-MM-DD` |
| 최종 갱신일 | `YYYY-MM-DD` |
| 요청자 | 사용자 |
| 수행 주체 | 단일 AI 에이전트 |
| 위험도 | 낮음 / 중간 / 높음 |
| 승인 상태 | `NOT_REQUIRED | PENDING | APPROVED | REJECTED | EXPIRED` |
| 승인 기록 | 해당 없음 또는 `APR-YYYY-NNN` 경로 |
| 관련 QA Cycle | 해당 cycle 또는 `해당 없음` |

## 2. 요청 정의

### 요청 원문

> 사용자의 요청을 의미가 바뀌지 않게 기록한다.

### 합의된 요청 요약

- 한 문장 요약:
- 요청 목적:
- 포함 범위:
- 제외 범위:

### 수용 기준

| ID | 검증 가능한 완료 조건 | 검증 방법 | 상태 |
| --- | --- | --- | --- |
| AC-01 |  |  | 미확인 |

## 3. Context Snapshot

- `Active_Context.md` 확인 시점:
- 이번 요청에 적용한 활성 문서:
- 제외한 관련 문서와 근거:

### 적용 기준 문서

| 우선순위 | 문서 | 적용 범위 | 확인 결과 |
| --- | --- | --- | --- |
| 1 | `organization-standards/...` |  | 확인 전 |
| 2 | `Project_Context.md` |  | 확인 전 |

### 관련 역할·Feature·QA 문서

| 구분 | 문서 | 이번 변경과의 관계 |
| --- | --- | --- |
| Planning |  |  |
| Publishing |  |  |
| Development |  |  |
| QA |  |  |
| Impact Analysis |  |  |

### 확인된 제약과 용어

- 제약:
- 용어:
- 충돌 여부: 없음 / 있음
- 충돌 상세:

## 4. Phase Execution

### Phase 진행 현황

| Phase | 상태 | 시작 Transition | 종료 Transition | 핵심 산출물 또는 미적용 근거 |
| --- | --- | --- | --- | --- |
| `CONTEXT_READER` | 진행 전 |  |  |  |
| `PLANNER` | 진행 전 |  |  |  |
| `IMPLEMENTER` | 진행 전 |  |  |  |
| `TESTER` | 진행 전 |  |  |  |
| `SELF_REVIEWER` | 진행 전 |  |  |  |
| `REPORTER` | 진행 전 |  |  |  |

Phase 상태는 `진행 전`, `진행 중`, `완료`, `재진입`, `NOT_APPLICABLE` 중 하나를 사용한다. `NOT_APPLICABLE`도 전환 기록과 근거가 필요하다.

정상 완료 시 Reporter의 종료 Transition은 `REPORTER → NONE`이며, 종료된 Manifest의 현재 Phase는 `NONE`으로 갱신한다.

### Phase Transition Log

아래 선언은 `phase-transition-template.md`의 필드를 그대로 사용한다.

#### Phase Transition: PT-001

- Previous phase: `NONE`
- Next phase: `CONTEXT_READER`
- State before transition: `REQUESTED`
- Transition trigger: 사용자 요청 접수
- Files changed: 현재 Manifest 생성
- Tests executed: 없음
- Known limitations:
- Unverified assumptions:
- Inputs carried forward: 요청 원문
- Required output of next phase: Context Snapshot과 충돌 여부
- Entry gate: 요청 원문과 초기 범위 기록 완료

## 5. 영향 분석과 계획

### 역할별 영향

| 영역 | 영향 여부 | 변경 내용 또는 영향 없음의 근거 | 필요한 산출물 |
| --- | --- | --- | --- |
| Planning |  |  |  |
| Publishing |  |  |  |
| Development |  |  |  |
| QA |  |  |  |
| Documentation |  |  |  |

### 예상 변경 범위

| 예상 파일 또는 디렉토리 | 변경 목적 | 변경 유형 |
| --- | --- | --- |
|  |  | 생성 / 수정 / 이동 / 삭제 |

### 위험과 대응

| 위험 | 가능성 | 영향 | 대응 또는 확인 방법 |
| --- | --- | --- | --- |
|  |  |  |  |

### 구현 계획

1.
2.

### 테스트 계획

| ID | 검증 대상 | 방법 또는 명령 | 성공 기준 | 필수 여부 |
| --- | --- | --- | --- | --- |
| TEST-01 |  |  |  | 필수 |

## 6. Development Ready Gate

| 확인 항목 | 상태 | 근거 |
| --- | --- | --- |
| 요청과 제외 범위가 명확하다 | 미충족 |  |
| 활성 기준 문서를 확인했다 | 미충족 |  |
| 역할별 영향 판단을 기록했다 | 미충족 |  |
| 필요한 역할별 문서를 연결했다 | 미충족 |  |
| 예상 변경 범위와 위험을 기록했다 | 미충족 |  |
| 테스트 계획과 완료 조건을 기록했다 | 미충족 |  |
| 사용자 확인이 필요한 blocker가 없다 | 미충족 |  |
| 고위험 변경의 사용자 승인 상태가 유효하다 | 미충족 / 해당 없음 |  |

## 7. 구현 기록

### 실제 변경 파일

| 실제 변경 파일 | 변경 요약 | 계획 여부 |
| --- | --- | --- |
|  |  | 계획됨 / 계획 외 |

### 계획 대비 차이

- 예상했지만 변경하지 않은 파일:
- 계획에 없었지만 변경한 파일:
- 차이의 원인과 영향:
- 계획 또는 테스트 수정 여부:

## 8. QA 실행 증거

각 항목은 `verification-evidence-template.md`의 필드를 사용한다.

| Test ID | 대상 | 실행 방법 또는 명령 | 결과 상태 | 결과 요약 | 증거 위치 | 미검증 범위 |
| --- | --- | --- | --- | --- | --- | --- |
| TEST-01 |  |  | `NOT_EXECUTED` |  |  |  |

### 실패와 미실행 항목

- 실패:
- 미실행:
- 사용자 수용이 필요한 사항:

## 9. Self-Review

`self-review-template.md`를 기준으로 원 요청, Active Context, 실제 diff, Evidence를 다시 읽는다.

### Clean Input Declaration

- Original request re-read: 아니오
- Active Context re-read: 아니오
- Actual diff inspected: 아니오
- Implementation conclusion reused as evidence: 아니오
- Evidence records inspected:

### Intent vs Observed

| 항목 | 의도한 동작·결과 | 실제로 확인한 동작·결과 | 증거 | 차이 |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

| 질문 | 판정 | 근거 |
| --- | --- | --- |
| 원 요청의 모든 조건이 구현되었는가 | 미확인 |  |
| 실제 변경이 계획 범위를 벗어났는가 | 미확인 |  |
| 변경하지 말아야 할 동작이나 기준이 바뀌었는가 | 미확인 |  |
| 테스트 결과가 현재 변경 상태를 검증하는가 | 미확인 |  |
| 실행하지 않은 검증이 명시되어 있는가 | 미확인 |  |
| 성공 판정을 반박하는 증거나 반례가 없는가 | 미확인 |  |
| 사용자 판단이 필요한 사항이 남아 있는가 | 미확인 |  |
| 관련 문서 링크와 상태가 서로 일치하는가 | 미확인 |  |

### 반례 검토

- 가장 가능성 높은 실패 시나리오:
- 확인 방법:
- 결과:

### 잔여 위험과 한계

- 잔여 위험:
- 검증 한계:
- 후속 권장 사항:

### Confidence and Unknowns

- Confidence: `HIGH | MEDIUM | LOW`
- Confidence basis:
- Unverified items:
- Required user decision:
- Regression or re-entry required:

## 10. 완료 판정

| 완료 조건 | 상태 | 근거 |
| --- | --- | --- |
| 모든 수용 기준에 판정과 근거가 있다 | 미충족 |  |
| 기준 문서와 결과 사이에 알려진 충돌이 없다 | 미충족 |  |
| 계획 대비 실제 변경 차이를 설명했다 | 미충족 |  |
| 모든 테스트 계획에 실행 상태가 있다 | 미충족 |  |
| 실패·미실행·한계를 공개했다 | 미충족 |  |
| Self-Review를 완료했다 | 미충족 |  |
| 6개 Phase와 모든 전환 기록이 완결되었다 | 미충족 |  |
| Reporter 또는 취소 Phase에서 `NONE`으로 terminal transition을 기록했다 | 미충족 |  |
| 관련 문서 링크와 상태가 일치한다 | 미충족 |  |
| Self-Review confidence와 미검증 항목이 기록되었다 | 미충족 |  |
| 필요한 사용자 승인이 유효하다 | 미충족 / 해당 없음 |  |

### 최종 결과

- 완료 요약:
- 미완료 또는 제외 항목:
- 후속 작업:

## 11. 상태 이력

| 일시 | 이전 상태 | 다음 상태 | 전환 근거 |
| --- | --- | --- | --- |
| YYYY-MM-DD HH:mm | 없음 | `REQUESTED` | 사용자 요청 접수 및 Manifest 생성 |

## 12. 미해결 사항

| ID | 내용 | 작업 차단 여부 | 필요한 결정 | 상태 |
| --- | --- | --- | --- | --- |
| OPEN-01 |  | 예 / 아니오 |  | 열림 |
