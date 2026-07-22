# 03. 기준 변경 Diff 시각 정책

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | QA-003 기준 변경 전/후 diff UI 미구현 |
| 문서 상태 | Follow-up scope |

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/01_after_first_qa/10_monitoring_rule_diff_policy.md` | diff 표시 항목과 변경 사유 정책 확인 | 충족 |
| Publishing | 현재 문서 | before/after layout, 강조, disabled state 정의 | 충족 |
| Development | `../../../development/feature/01_after_first_qa/10_rule_diff_and_admin_state.md` | draft/diff/reason validation 반영 필요 | 대기 |
| QA | `../../../qa/feature/06_monitoring_rules_qa.md` | diff와 admin-only 재검증 | 대기 |

## 시각 정책

- diff는 좌우 2열 또는 모바일 상하 스택으로 표시한다.
- 변경 전 값은 neutral border, 변경 후 값은 `color-accent` 보조 강조를 사용한다.
- 삭제/비활성 값은 회색과 취소선 대신 `변경 전` 라벨로 명확히 구분한다.
- 변경 사유 입력 오류는 색상과 텍스트를 함께 제공한다.

## 개발 전달 조건

- diff component는 table 내부가 아니라 edit dialog 안에서 표시한다.
- 저장 버튼은 변경 사유가 없거나 권한이 없으면 disabled 상태여야 한다.
