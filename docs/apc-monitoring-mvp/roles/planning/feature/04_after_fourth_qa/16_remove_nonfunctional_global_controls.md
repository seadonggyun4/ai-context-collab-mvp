# Remove Nonfunctional Global Controls

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 네 번째 QA 이후 사용자 수정 요청 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/fifth_qa_check.md` |
| 생성 근거 | 사용자 화면 검수: 실제 기능 없는 전역 필터와 중복 헤더 CTA 제거 |
| 문서 상태 | Follow-up scope |

## 사용자 요청 요약

상단의 전역 필터 패널과 헤더 우측의 현재 역할/품질 이슈/Excel 다운로드 영역은 현재 MVP에서 실질 동작이 없거나 탭과 중복되므로 제거한다.

## Planning 영향 분류

| 항목 | 판단 |
| --- | --- |
| 전역 필터 | 실제 데이터 조회 조건과 연결되지 않으므로 제거한다. |
| 역할 선택 UI | 권한 시연은 내부 정책으로 유지하되, 상단 헤더 컨트롤로 노출하지 않는다. |
| 품질 이슈 CTA | `데이터 품질 이슈` 탭과 중복되므로 제거한다. |
| Excel 다운로드 CTA | `데이터 조회` 탭 내부의 다운로드 흐름과 중복되므로 제거한다. |
| 탭 구조 | 기존 탭은 유지한다. |

## 기획 요구사항

- 전역 필터 패널은 화면에서 제거한다.
- 헤더는 서비스명, 화면명, 마지막 갱신 정보만 보여준다.
- 품질 이슈 이동은 상단 탭으로 수행한다.
- Excel 다운로드는 `데이터 조회` 탭 내부 흐름으로 수행한다.
- 권한별 상태는 필요한 기능 화면 내부에서만 보여준다.

## Acceptance Criteria

- [ ] 기준일/APC/품목/입고·선별/상태 전역 필터 panel이 보이지 않는다.
- [ ] 헤더 우측의 현재 역할 selector, 역할 chip, 품질 이슈 버튼, Excel 다운로드 버튼이 보이지 않는다.
- [ ] APC 데이터 관리 탭은 그대로 유지된다.
- [ ] 수신 현황 탭 내부의 수신 조건 selectbox는 유지된다.
- [ ] 데이터 조회 탭 내부 Excel 다운로드 기능은 유지된다.
- [ ] 운영 조치 내역 등 기능 화면 내부 권한 표시는 유지된다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | 현재 문서 | 미연결/중복 전역 컨트롤 제거 정책 | 충족 |
| Publishing | `roles/publishing/feature/04_after_fourth_qa/09_header_simplification_visual_policy.md` | 헤더/상단 레이아웃 단순화 기준 | 연결 필요 |
| Development | `roles/development/feature/04_after_fourth_qa/20_remove_nonfunctional_global_controls.md` | 구현 TASK 반영 | 연결 필요 |
| QA | `roles/qa/feature/12_global_controls_removal_qa.md` | 회귀 검증 체크표 연결 | 연결 필요 |
