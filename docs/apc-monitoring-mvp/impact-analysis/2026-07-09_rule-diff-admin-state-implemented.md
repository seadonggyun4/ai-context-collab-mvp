# Rule Diff and Admin State Implemented

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 생성 일자 | 2026-07-09 |
| 변경 유형 | QA follow-up implementation |
| 연결 QA ID | QA-003 |
| 연결 개발 문서 | `../roles/development/feature/01_after_first_qa/10_rule_diff_and_admin_state.md` |
| 연결 기획 문서 | `../roles/planning/feature/01_after_first_qa/10_monitoring_rule_diff_policy.md` |
| 연결 퍼블리싱 문서 | `../roles/publishing/feature/01_after_first_qa/03_rule_diff_visual_policy.md` |

## 변경 배경

첫 번째 QA에서 모니터링 기준 설정 화면이 저장 요청 중심으로만 구성되어,
사용자가 저장 전에 변경 전/후 값을 비교할 수 없다는 문제가 확인되었다.

또한 관리자 외 역할에서 수정 불가 상태가 더 명확하게 표현되어야 하고,
기준 변경 사유가 빈 값으로 저장되지 않도록 화면 단계에서 먼저 차단해야 했다.

## 구현 요약

| 영역 | 변경 내용 |
| --- | --- |
| Frontend | 기준 변경 화면에 draft state, 변경 전/후 diff, 사유 required validation, latest change history 추가 |
| Styling | 2-column diff layout, 모바일 단일 column 전환, 변경 항목 강조, validation error 스타일 추가 |
| Backend | 기존 `PUT /api/monitoring/rules/{rule_id}`와 `changeHistory` 계약 유지 |
| QA | `second_qa_check.md`에 QA-003 부분 재검증 결과 기록 |

## 영향 범위

| 역할 | 영향 |
| --- | --- |
| Planning | 기준 변경 시 사용자가 확인해야 하는 항목과 영향 범위가 화면에 직접 노출됨 |
| Publishing | diff layout, 강조, disabled, validation error 표현 기준이 실제 UI에 반영됨 |
| Development | 저장 요청 전 local draft와 original rule을 비교하는 구조가 추가됨 |
| QA | QA-003은 자동 검증 일부 통과, 브라우저 시각 검증은 후속 QA에서 확인 필요 |

## 변경 파일

- `projects/apc-monitoring-mvp/frontend/src/features/monitoring/pages/MonitoringRulesPage.tsx`
- `projects/apc-monitoring-mvp/frontend/src/shared/styles/global.css`
- `../roles/development/feature/01_after_first_qa/10_rule_diff_and_admin_state.md`
- `../roles/qa/qa-results/second_qa_check.md`

## 남은 확인

- 브라우저에서 데스크톱/모바일 diff layout 시각 검증
- 실제 기준 저장 후 최신 `changeHistory` 노출 순서 확인
