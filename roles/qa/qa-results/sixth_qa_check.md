# Sixth QA Check

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | qa |
| 생성 시점 | 여섯 번째 QA 실행 결과 |
| QA Cycle | After fourth QA user change request |
| 참조 QA 결과 | `fifth_qa_check.md` |
| 생성 근거 | 기능 없는 전역 필터와 중복 헤더 CTA 제거 검증 |
| 문서 상태 | Executed |

## 검증 일자

2026-07-09

## 참조 문서

- `../../../Project_Context.md`
- `../QA.md`
- `../feature/12_global_controls_removal_qa.md`
- `../../planning/feature/04_after_fourth_qa/16_remove_nonfunctional_global_controls.md`
- `../../publishing/feature/04_after_fourth_qa/09_header_simplification_visual_policy.md`
- `../../development/feature/04_after_fourth_qa/20_remove_nonfunctional_global_controls.md`
- `../../../impact-analysis/2026-07-09_remove-nonfunctional-global-controls.md`

## 자동 검증 결과

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| Frontend typecheck | 통과 | `npm run typecheck` |
| Frontend production build | 통과 | `npm run build` |
| Backend pytest | 통과 | `19 passed` |

## 소스 기준 검증 결과

| 체크 항목 | 결과 | 근거 |
| --- | --- | --- |
| 전역 필터 panel 제거 | 통과 | `ApcDataManagementShell.tsx`에서 `filter-panel`, `filter-grid`, 전역 `ShellSelect` 제거 |
| 헤더 우측 action cluster 제거 | 통과 | `ApcDataManagementShell.tsx`에서 `apc-header__actions` block 제거 |
| 현재 역할 selector 제거 | 통과 | shell에서 `role-switcher`, `USER_ROLE_LABELS`, `setRole` 제거 |
| 헤더 품질 이슈/Excel 버튼 제거 | 통과 | shell에서 중복 `ShellButton` 제거 |
| 탭 유지 | 통과 | `tabs` 배열 유지 |
| 수신 현황 내부 selectbox 유지 | 통과 | `IngestionStatusPage.tsx`의 `ingestion-filter-controls` 유지 |
| 기능 화면 내부 권한 표시 유지 | 통과 | `role-chip` CSS는 유지, 기능 화면 내부 권한 컴포넌트 미변경 |

## QA 체크표 결과

| 체크 항목 | 결과 |
| --- | --- |
| 기준일/APC/품목/입고·선별/상태 전역 필터 panel이 제거되었는가 | 통과 |
| 헤더 우측 현재 역할 selector가 제거되었는가 | 통과 |
| 헤더 우측 역할 chip이 제거되었는가 | 통과 |
| 헤더 우측 품질 이슈 버튼이 제거되었는가 | 통과 |
| 헤더 우측 Excel 다운로드 버튼이 제거되었는가 | 통과 |
| APC 데이터 관리 탭은 유지되는가 | 통과 |
| 수신 현황 내부 수신 조건 selectbox는 유지되는가 | 통과 |
| 데이터 조회 탭 내부 Excel 다운로드 흐름은 유지되는가 | 통과 |
| 운영 조치 등 기능 화면 내부 권한 표시는 유지되는가 | 통과 |

## 미실행 항목

브라우저 플러그인 기반 시각 검증은 이번 턴에서 별도로 실행하지 않았다. 다만 자동 검증과 소스 기준 검증으로 제거 대상과 유지 대상이 분리되었음을 확인했다.

## 결론

사용자 수정 요청에 따라 기능 없는 전역 컨트롤과 중복 헤더 CTA를 제거했다. 탭 기반 내비게이션, 수신 현황 내부 필터, 데이터 조회 내부 다운로드 흐름, 기능 화면 내부 권한 표시는 유지된다.
