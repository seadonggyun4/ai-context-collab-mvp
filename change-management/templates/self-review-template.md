# Self-Review Template

## Clean Input Declaration

- Original request re-read: 예 / 아니오
- Active Context re-read: 예 / 아니오
- Actual diff inspected: 예 / 아니오
- Implementation conclusion reused as evidence: 아니오 / 예(사용 금지 사유 기록)
- Evidence records inspected:

## Intent vs Observed

| 항목 | 의도한 동작·결과 | 실제로 확인한 동작·결과 | 증거 | 차이 |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 필수 질문

| 질문 | 판정 | 근거·증거 |
| --- | --- | --- |
| 원 요청의 모든 조건이 구현되었는가? | 미확인 |  |
| 실제 변경이 계획된 범위를 벗어났는가? | 미확인 |  |
| 변경하지 말아야 할 동작이 바뀌었는가? | 미확인 |  |
| 테스트 결과가 현재 변경 상태를 검증하는가? | 미확인 |  |
| 실행하지 않은 검증은 무엇인가? | 미확인 |  |
| 성공을 반박할 수 있는 증거는 없는가? | 미확인 |  |
| 사용자 판단이 필요한 사항은 남아 있는가? | 미확인 |  |

## Counterexample First

- 이 구현이 요구사항을 충족하지 못하는 가장 현실적인 경우:
- 성공 판정을 깨뜨릴 수 있는 입력·환경·순서:
- 확인 방법:
- 확인 결과:
- 범위 밖 신규 영향:

## Confidence and Unknowns

- Confidence: `HIGH | MEDIUM | LOW`
- Confidence basis:
- Unverified items:
- Known limitations:
- Required user decision:
- Regression or re-entry required: 아니오 / `CONTEXT_READER | PLANNER | IMPLEMENTER | TESTER`

