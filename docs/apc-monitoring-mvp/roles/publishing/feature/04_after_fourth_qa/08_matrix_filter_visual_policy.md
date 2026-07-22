# Matrix Filter Visual Policy

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 네 번째 QA 이후 사용자 수정 요청 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/fourth_qa_check.md` |
| 생성 근거 | 수신 현황 전용 Matrix 선택 조건 UI 개선 |
| 문서 상태 | Follow-up scope |

## 목적

수신 현황에서 Matrix 선택 조건을 사용자가 이해하고 수정할 수 있도록 chip 나열 대신 selectbox 기반 필터 컨트롤로 표현한다.

## UI 정책

- `JADX 메뉴 흐름 시나리오` card/rail은 제거한다.
- Matrix filter는 `수신 현황` panel 내부 최상단에 둔다.
- 필터 영역은 `ShellPanel` 내부의 보조 control bar로 표현한다.
- APC, 품목, 입고/선별, 상태는 `ShellSelect` 계열 selectbox로 표현한다.
- `Trace ID`는 사용자가 직접 고르는 주요 필터가 아니므로 텍스트 요약으로만 표시하거나 상세 영역에서만 표시한다.
- `조건 초기화` 버튼은 selectbox 오른쪽 또는 다음 줄 끝에 배치한다.
- 카드/패널 radius는 기존 정책대로 `5px`를 유지한다.

## 반응형 정책

- 데스크톱에서는 selectbox가 한 줄 grid로 배치된다.
- 좁은 화면에서는 2열 또는 1열로 자연스럽게 줄바꿈한다.
- 필터 label과 select 값이 버튼/셀 경계를 넘지 않아야 한다.

## 접근성 기준

- 필터 영역은 `aria-label="수신 현황 matrix 선택 조건"`을 가진다.
- 각 selectbox는 명확한 label을 가진다.
- `조건 초기화`는 keyboard focus가 가능해야 한다.

## 금지 사항

- 모든 탭 상단에 Matrix 선택 조건을 반복 노출하지 않는다.
- 탭과 동일한 역할을 하는 추가 flow card를 만들지 않는다.
- Trace ID를 긴 chip으로 상단에 노출해 레이아웃을 밀지 않는다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `roles/planning/feature/04_after_fourth_qa/15_remove_redundant_flow_and_scope_matrix_filters.md` | 수신 현황 전용 필터 정책 | 충족 |
| Publishing | 현재 문서 | selectbox 기반 UI 기준 | 충족 |
| Development | `roles/development/feature/04_after_fourth_qa/19_remove_flow_rail_and_matrix_filter_controls.md` | CSS/컴포넌트 구현 | 연결 필요 |
| QA | `roles/qa/feature/11_matrix_filter_scope_qa.md` | 시각/반응형 검증 | 연결 필요 |
