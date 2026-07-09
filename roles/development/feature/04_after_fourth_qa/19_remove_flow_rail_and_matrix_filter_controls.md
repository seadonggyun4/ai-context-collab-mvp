# Remove Flow Rail And Matrix Filter Controls

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 네 번째 QA 이후 사용자 수정 요청 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/fourth_qa_check.md` |
| 생성 근거 | 중복 UX 제거 및 수신 현황 전용 matrix filter selectbox 구현 |
| 문서 상태 | Follow-up scope |

## 구현 범위

- `ApcDataManagementShell`에서 `JADX 메뉴 흐름 시나리오` 관련 data/rendering 제거
- shell level `AppliedFilterChips` 제거
- `QualityIssuesPage`, `MonitoringRulesPage`에서 Matrix 선택 조건 노출 제거
- `IngestionStatusPage`에 수신 현황 전용 Matrix filter control 구현
- Matrix click context를 수신 현황 filter state 초기값으로 반영
- selectbox 변경 시 API query params 갱신

## 구현 TASK

- [ ] `scenarioSteps` 상수와 `jadx-flow-rail` render 제거
- [ ] `ApcDataManagementShell`의 `AppliedFilterChips` import/render 제거
- [ ] `QualityIssuesPage`, `MonitoringRulesPage`의 `AppliedFilterChips` import/render 제거
- [ ] 수신 현황 전용 filter state를 `IngestionStatusPage`에 추가
- [ ] Matrix context 변경 시 filter state를 동기화
- [ ] APC/품목/입고·선별/상태 selectbox 구현
- [ ] selectbox 값 기반으로 `monitoringApi.getIngestions` query params 생성
- [ ] filter 초기화 시 수신 현황 전체 목록으로 복귀
- [ ] 사용하지 않는 CSS(`jadx-flow-*`, chip-only filter 스타일)를 제거 또는 새 control 스타일로 대체
- [ ] typecheck/build 검증

## 구현 제외

- 탭 구조 변경 없음
- Matrix click의 target tab 정책 변경 없음
- API schema 변경 없음
- fixture data 변경 없음

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `roles/planning/feature/04_after_fourth_qa/15_remove_redundant_flow_and_scope_matrix_filters.md` | 중복 UX 제거 및 수신 현황 전용 필터 정책 | 충족 |
| Publishing | `roles/publishing/feature/04_after_fourth_qa/08_matrix_filter_visual_policy.md` | selectbox UI 기준 | 충족 |
| Development | 현재 문서 | 구현 TASK 정의 | 충족 |
| QA | `roles/qa/feature/11_matrix_filter_scope_qa.md` | 회귀 검증 기준 | 연결 필요 |
