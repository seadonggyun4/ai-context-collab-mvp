# Remove Redundant Flow UI And Scope Matrix Filters

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 네 번째 QA 이후 사용자 수정 요청 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/fourth_qa_check.md` |
| 생성 근거 | 사용자 화면 검수: 중복 flow UI 제거, Matrix 선택 조건 노출 위치/입력 방식 개선 |
| 문서 상태 | Follow-up scope |

## 사용자 요청 요약

상단 탭이 이미 APC 데이터 관리 흐름을 제공하므로 `JADX 메뉴 흐름 시나리오` 영역을 제거한다. Matrix 선택 조건은 모든 탭 상단에 노출하지 않고 `수신 현황` 탭에서만 selectbox로 조정 가능하게 한다.

## Planning 영향 분류

| 항목 | 판단 |
| --- | --- |
| 메뉴/탭 구조 | 탭 구조는 유지한다. 중복 안내 UI만 제거한다. |
| 사용자 흐름 | 모니터링 matrix click 후 수신 현황으로 이동하는 흐름은 유지한다. |
| 필터 정책 | Matrix 선택 조건은 수신 현황의 보조 필터로만 제공한다. |
| 다른 탭 영향 | 데이터 품질 이슈, 모니터링 기준 설정 등 다른 탭에는 Matrix 선택 조건 bar를 표시하지 않는다. |
| 문구 정책 | `JADX 메뉴 흐름 시나리오` 문구와 관련 설명은 화면에서 제거한다. |

## 기획 요구사항

- 상단 탭이 주 내비게이션이다.
- `JADX 메뉴 흐름 시나리오`는 주 내비게이션과 중복되므로 제거한다.
- Matrix 선택 조건은 `수신 현황` 탭 내부에서만 표시한다.
- Matrix 선택 조건은 chip 나열이 아니라 selectbox로 제공한다.
- selectbox는 APC, 품목, 입고/선별, 상태를 사용자가 조정할 수 있어야 한다.
- `조건 초기화`는 수신 현황 탭 내부에만 둔다.
- Matrix에서 진입한 trace context는 수신 현황 상세 선택에만 반영한다.

## Acceptance Criteria

- [ ] 상단 탭 아래에 `JADX 메뉴 흐름 시나리오` 영역이 보이지 않는다.
- [ ] `Matrix 선택 조건`이 모니터링, 품질 이슈, 파이프라인, 운영 조치, 기준 설정, 데이터 조회, 시각화 탭 상단에 보이지 않는다.
- [ ] `수신 현황` 탭에서만 Matrix 기반 필터 영역이 보인다.
- [ ] 수신 현황 필터는 selectbox로 APC/품목/입고·선별/상태를 선택할 수 있다.
- [ ] Matrix cell 선택 시 수신 현황 탭의 selectbox 초기값이 선택 조건으로 세팅된다.
- [ ] 사용자가 selectbox를 바꾸면 수신 현황 목록 조건이 갱신된다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | 현재 문서 | 중복 UI 제거와 수신 현황 전용 필터 정책 확정 | 충족 |
| Publishing | `roles/publishing/feature/04_after_fourth_qa/08_matrix_filter_visual_policy.md` | selectbox 기반 필터 UI 기준 확정 | 연결 필요 |
| Development | `roles/development/feature/04_after_fourth_qa/19_remove_flow_rail_and_matrix_filter_controls.md` | 구현 TASK 반영 | 연결 필요 |
| QA | `roles/qa/feature/11_matrix_filter_scope_qa.md` | 회귀 검증 체크표 연결 | 연결 필요 |
