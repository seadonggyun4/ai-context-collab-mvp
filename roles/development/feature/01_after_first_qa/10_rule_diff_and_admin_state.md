# 10. 모니터링 기준 Diff 및 Admin State 개발 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | First QA open issue / partial-pass result |
| 문서 상태 | Implemented |


## 발생 출처

- QA 결과: `../../../qa/qa-results/first_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/06_monitoring_rules_qa.md`
- 원인 ID: `QA-003`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/01_after_first_qa/10_monitoring_rule_diff_policy.md` | 변경 전/후 표시 항목, 변경 사유, 권한 정책 확정 | 충족 |
| Publishing | `../../../publishing/feature/01_after_first_qa/03_rule_diff_visual_policy.md` | diff layout, 변경 강조, validation, disabled 표현 기준 확정 | 충족 |
| Development | 현재 문서 | draft state, diff calculation, reason validation, admin-only guard 구현 | 충족 |
| QA | `../../../qa/feature/06_monitoring_rules_qa.md` | diff 표시와 권한별 수정 가능 여부 재검증 | 부분 재검증 완료 |

## 원인

모니터링 기준 설정 화면이 저장 요청 중심으로 구현되어 변경 전/후 diff UI와 admin-only disabled state가 없다.

Phase 6에서는 `PUT /rules/{rule_id}` 호출과 변경 사유 검증을 우선했고, draft state와 role state는 구현 범위에서 빠졌다.

## 영향 범위

| 파트 | 영향 |
| --- | --- |
| Planning | 변경 전/후 비교 항목 정책 추가 필요 |
| Publishing | diff layout과 disabled state 스타일 확인 필요 |
| Development | local draft state, role-based edit state 필요 |
| QA | 변경 전/후 diff와 권한별 수정 가능 여부 재검증 |

## 구현 TASK

- [x] rule edit dialog 생성
- [x] planning diff 표시 항목을 dialog에 반영
- [x] publishing diff layout과 강조 기준 적용
- [x] before/current/draft 값 비교 component 생성
- [x] 변경 사유 required validation UI 표시
- [x] admin 외 수정 버튼 disabled 처리
- [x] 변경 후 `changeHistory` 최신 항목 표시

## 구현 결과

| 항목 | 반영 내용 |
| --- | --- |
| 구현 일자 | 2026-07-09 |
| 대상 화면 | `app/frontend/src/features/monitoring/pages/MonitoringRulesPage.tsx` |
| 스타일 기준 | `app/frontend/src/shared/styles/global.css` |
| 변경 전/후 비교 | 기대 수신 주기, 허용 지연 시간, 필수값 기준, 중복 판단 기준을 저장 전 비교 |
| 변경 사유 | admin이라도 사유가 없으면 저장 불가 |
| 변경 여부 | draft 값이 실제로 달라져야 저장 가능 |
| 권한 상태 | admin 외 역할은 입력, 사유, 저장 버튼 disabled |
| 변경 이력 | 선택한 기준의 최신 `changeHistory` 항목 표시 |

## QA 재검증 메모

- QA-003은 두 번째 QA 문서에서 부분 재검증 대상으로 기록한다.
- 브라우저 시각 검증은 별도 QA 실행 시 확인한다.

## 완료 기준

- 사용자는 저장 전 변경 전/후 값을 확인할 수 있다.
- admin 외 사용자는 수정할 수 없고 사유 tooltip을 볼 수 있다.
