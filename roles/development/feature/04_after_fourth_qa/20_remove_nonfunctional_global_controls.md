# Remove Nonfunctional Global Controls

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 네 번째 QA 이후 사용자 수정 요청 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/fifth_qa_check.md` |
| 생성 근거 | 미연결 전역 필터와 탭 중복 헤더 CTA 제거 |
| 문서 상태 | Follow-up scope |

## 구현 범위

- `ApcDataManagementShell`의 header action cluster 제거
- 전역 `filter-panel` 제거
- 사용하지 않는 `ShellButton`, `ShellSelect`, `useUserRole`, `USER_ROLE_LABELS`, `UserRole` import 제거
- 전역 필터/헤더 action 관련 CSS 제거
- 탭 내부 기능은 유지

## 구현 TASK

- [ ] 헤더 우측 `apc-header__actions` block 제거
- [ ] 전역 `ShellPanel className="filter-panel"` block 제거
- [ ] 사용하지 않는 import와 state 제거
- [ ] `.apc-header__actions`, `.role-switcher`, `.filter-panel`, `.filter-grid` CSS 제거
- [ ] `.role-chip` CSS는 다른 화면에서 쓰이므로 유지
- [ ] typecheck/build/backend test 검증
- [ ] QA 결과 문서 생성

## 구현 제외

- `UserRoleProvider` 제거 없음
- 기능 화면 내부 권한 표시 제거 없음
- 데이터 조회 탭 내부 Excel 다운로드 제거 없음
- 수신 현황 내부 selectbox 제거 없음

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `roles/planning/feature/04_after_fourth_qa/16_remove_nonfunctional_global_controls.md` | 제거/유지 대상 확정 | 충족 |
| Publishing | `roles/publishing/feature/04_after_fourth_qa/09_header_simplification_visual_policy.md` | 헤더 단순화 기준 | 충족 |
| Development | 현재 문서 | 구현 TASK 정의 | 충족 |
| QA | `roles/qa/feature/12_global_controls_removal_qa.md` | 회귀 검증 기준 | 연결 필요 |
