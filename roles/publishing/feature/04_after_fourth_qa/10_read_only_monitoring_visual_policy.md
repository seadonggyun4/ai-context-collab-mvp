# Read Only Monitoring Visual Policy

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 네 번째 QA 이후 사용자 수정 요청 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/sixth_qa_check.md` |
| 생성 근거 | mock write 기능 제거 후 읽기 중심 모니터링 UI로 정리 |
| 문서 상태 | Implemented |

## UI 정책

- 저장되는 것처럼 보이는 form, 작성 CTA, 변경 diff editor는 제거한다.
- 품질 이슈 상세는 운영자가 판단할 수 있는 읽기 정보만 표시한다.
- 파이프라인은 실패 trace와 관련 이슈 관계를 읽기 안내로만 제공한다.
- 탭은 실제 시연 가치가 있는 읽기 메뉴만 남긴다.
- “설정”, “작성”, “등록”, “변경”처럼 DB persistence를 암시하는 표현을 제거한다.

## 유지할 표현

- 상태 badge
- KPI card
- 수신 조건 selectbox
- 품질 이슈 유형 filter
- 상세 정보 panel
- 파이프라인 step timeline
- 데이터 조회/시각화 warning

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `roles/planning/feature/04_after_fourth_qa/17_reduce_mock_write_features.md` | 제거/유지 대상 확정 | 충족 |
| Publishing | 현재 문서 | 읽기 중심 UI 기준 | 충족 |
| Development | `roles/development/feature/04_after_fourth_qa/21_remove_mock_write_features.md` | UI/API 제거 반영 | 충족 |
| QA | `roles/qa/feature/13_mock_write_feature_removal_qa.md`, `roles/qa/qa-results/seventh_qa_check.md` | 시각/계약 검증 연결 | 충족 |
