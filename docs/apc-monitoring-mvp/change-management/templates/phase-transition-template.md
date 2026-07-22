# Phase Transition Template

이 템플릿은 Change Manifest 안에서 단일 AI의 역할 전환을 기록할 때 사용한다. 필드를 삭제하거나 이름을 바꾸지 않는다. 값이 없으면 `없음` 또는 `NOT_APPLICABLE`과 근거를 기록한다.

## Phase Transition: PT-NNN

- Previous phase: `NONE | CONTEXT_READER | PLANNER | IMPLEMENTER | TESTER | SELF_REVIEWER | REPORTER`
- Next phase: `CONTEXT_READER | PLANNER | IMPLEMENTER | TESTER | SELF_REVIEWER | REPORTER | NONE`
- State before transition: `REQUESTED | CONTEXT_CONFIRMED | PLANNED | DEVELOPMENT_READY | IMPLEMENTED | QA_COMPLETED | SELF_REVIEWED | COMPLETED | CANCELLED`
- Transition trigger: 이전 Phase 종료 조건을 충족했거나 회귀가 필요한 구체적 사건
- Files changed: 이전 Phase에서 생성·수정·이동·삭제한 파일 또는 `없음`
- Tests executed: 이전 Phase에서 실제 수행한 검증과 결과 또는 `없음`
- Known limitations: 다음 Phase가 알고 있어야 할 확인된 한계 또는 `없음`
- Unverified assumptions: 아직 증명하지 못했으나 작업에 영향을 줄 수 있는 가정 또는 `없음`
- Inputs carried forward: 다음 Phase에 전달하는 문서, 판정, 증거, 실패 정보
- Required output of next phase: 다음 Phase가 종료 전에 생성해야 하는 산출물
- Entry gate: 다음 Phase를 시작할 수 있다고 판단한 근거

## 작성 규칙

1. 전환 ID는 Manifest 안에서 `PT-001`부터 증가시키며 재사용하지 않는다.
2. 선언은 다음 Phase의 실질 작업 전에 기록한다.
3. `Files changed`는 계획이 아니라 실제 변경만 기록한다.
4. `Tests executed`는 실제 수행한 검증만 기록한다. 예정된 검증은 다음 Phase의 Required output에 쓴다.
5. 확인된 한계와 미검증 가정을 구분한다.
6. 회귀 전환도 같은 형식을 사용하고 실패 증거를 Inputs carried forward에 포함한다.
7. 사용자에게 알리는 전환 메시지는 이 선언의 핵심을 요약하되 Manifest 기록과 모순되면 안 된다.
8. `NONE`은 `COMPLETED` 또는 `CANCELLED`를 닫는 terminal transition의 Next phase에만 사용한다.
9. 정상 완료는 `REPORTER → NONE`, 취소는 취소를 확정한 현재 Phase에서 `NONE`으로 전환한다.
