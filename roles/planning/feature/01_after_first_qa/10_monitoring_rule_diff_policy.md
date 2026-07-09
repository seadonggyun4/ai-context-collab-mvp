# 10. 모니터링 기준 변경 Diff 기획 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | QA-003 기준 변경 전/후 diff UI 미구현 |
| 문서 상태 | Follow-up scope |

## 발생 출처

- QA 결과: `../../../qa/qa-results/first_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/06_monitoring_rules_qa.md`
- 원인 ID: `QA-003`

## 기획 정책

- 기준 변경은 저장 전에 변경 전 값과 변경 후 값을 함께 보여준다.
- 변경 사유는 필수 입력이다.
- admin이 아닌 사용자는 변경 dialog를 열 수 없거나 저장할 수 없다.
- 변경 후에는 변경 이력에 이전 값, 변경 값, 변경 사유, 변경자를 남긴다.

## Diff 표시 항목

| 항목 | 설명 |
| --- | --- |
| 현재 기준 | 저장되어 있는 기존 기준 |
| 변경 기준 | 사용자가 입력한 새 기준 |
| 영향 범위 | APC, 품목, 입고/선별, 상태 계산에 미치는 영향 |
| 변경 사유 | 운영자가 입력한 필수 사유 |

## 다음 역할 전달 조건

| 전달 대상 | 충족해야 할 조건 |
| --- | --- |
| Publishing | before/after diff layout, 변경 강조, disabled/admin-only 표현 정의 |
| Development | draft state, diff 계산, reason validation, change history 저장 구현 |
| QA | admin/viewer 수정 가능 여부와 diff 표시 여부 재검증 |

## 완료 기준

- 사용자는 저장 전 어떤 기준이 어떻게 바뀌는지 알 수 있다.
- 변경 사유 없이 저장할 수 없다.
