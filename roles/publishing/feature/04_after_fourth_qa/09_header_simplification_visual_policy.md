# Header Simplification Visual Policy

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 네 번째 QA 이후 사용자 수정 요청 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/fifth_qa_check.md` |
| 생성 근거 | 기능 없는 전역 컨트롤 제거 후 헤더 시각 구조 단순화 |
| 문서 상태 | Follow-up scope |

## 목적

상단 영역을 실제 업무 흐름에 필요한 정보로만 구성한다. 동작하지 않는 filter panel과 탭 중복 CTA를 제거해 화면 밀도를 낮추고 사용자의 판단 지점을 명확히 한다.

## UI 정책

- 헤더는 좌측 정렬 정보 영역만 유지한다.
- 헤더에 서비스 eyebrow, `APC 데이터 관리`, 마지막 갱신 정보를 표시한다.
- 우측 action cluster는 제거한다.
- 전역 dark filter panel은 제거한다.
- 탭은 헤더 바로 아래에 배치한다.
- 권한/다운로드/품질 이슈 관련 UI는 각 기능 탭 내부에서만 노출한다.

## 반응형 정책

- 헤더는 데스크톱/모바일 모두 단일 정보 블록으로 자연스럽게 줄바꿈한다.
- 전역 필터 제거 후 첫 화면에서 KPI 영역이 더 빨리 보이도록 한다.
- 수신 현황 내부 필터의 반응형 정책은 `08_matrix_filter_visual_policy.md`를 따른다.

## 금지 사항

- 동작하지 않는 selectbox를 화면에 배치하지 않는다.
- 탭과 동일한 이동 기능을 헤더 버튼으로 중복 제공하지 않는다.
- 권한 demo UI를 전역 헤더 장식으로 노출하지 않는다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `roles/planning/feature/04_after_fourth_qa/16_remove_nonfunctional_global_controls.md` | 제거 대상/유지 대상 확정 | 충족 |
| Publishing | 현재 문서 | 헤더/상단 영역 시각 기준 | 충족 |
| Development | `roles/development/feature/04_after_fourth_qa/20_remove_nonfunctional_global_controls.md` | 구현 반영 | 연결 필요 |
| QA | `roles/qa/feature/12_global_controls_removal_qa.md` | 회귀 검증 연결 | 연결 필요 |
