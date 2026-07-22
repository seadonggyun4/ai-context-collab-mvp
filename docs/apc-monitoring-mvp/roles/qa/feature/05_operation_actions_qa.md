# 05. 운영 조치 내역 QA 체크표

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | qa |
| 생성 시점 | 첫 번째 QA 이전 QA 체크표 |
| QA Cycle | Initial QA checklist before first QA |
| 참조 QA 결과 | None |
| 생성 근거 | QA checklist lifecycle |
| 문서 상태 | Updated after third QA implementation |


## 참조 문서

- `../QA.md`
- `../../../Project_Context.md`
- `../../planning/feature/00_initial/05_operation_actions.md`
- `../../planning/feature/02_after_second_qa/12_operation_action_form_policy.md`
- `../../planning/feature/03_after_third_qa/13_operation_action_entry_handoff_policy.md`
- `../../publishing/feature/02_after_second_qa/05_operation_action_entry_visual_policy.md`
- `../../publishing/feature/03_after_third_qa/06_operation_action_entry_visual_followup.md`
- `../../publishing/Publishing.md`
- `../../development/feature/00_initial/05_operation_actions.md`
- `../../development/feature/02_after_second_qa/15_operation_action_entry_handoff.md`
- `../../development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md`

## 체크표

| 구분 | 체크 항목 | 확인 |
| --- | --- | --- |
| 기획 | 조치 이력이 timeline으로 표시되는가 | [x] |
| 기획 | 상태 변경과 메모 작성이 같은 흐름에서 가능한가 | [x] |
| 기획 | 조치 완료 후 원본 이슈가 보존되는가 | [ ] |
| 퍼블리싱 | 운영자용 문장이 로그처럼 보이지 않고 읽기 쉽게 표시되는가 | [x] |
| 개발 | `GET /api/monitoring/actions` 응답이 목록에 매핑되는가 | [x] |
| 개발 | `RESOLVED` 또는 `IGNORED` 변경 시 memo가 필수인가 | [ ] |
| 회귀 | 동일 이슈 재발 표시가 이전 조치 이력과 함께 보이는가 | [x] |
| 회귀 | 운영 조치 내역 화면 내부에 full action form이 중복 렌더링되지 않는가 | [x] |
| 회귀 | 조치 작성 CTA가 품질 이슈 상세 action form으로 handoff 되는가 | [x] |
| 회귀 | 조치 등록 후 운영 조치 내역 timeline이 `GET /api/monitoring/actions` 기준으로 갱신되는가 | [x] |

## 미해결 이슈

- QA3-001: 네 번째 QA에서 `조치 작성 CTA → issue 선택 → 데이터 품질 이슈 상세 action form focus → timeline 갱신` 흐름 통과 확정.

## 구현 후 검증 기록

| 항목 | 결과 |
| --- | --- |
| 조치 등록 후 refresh signal | `QualityIssuesPage`에서 저장 성공 시 shell로 `onIssueActionCreated` 전달 |
| 운영 조치 내역 재조회 | `OperationActionsPage`가 `actionRefreshKey` 변경을 `useAsyncResource` dependency로 받아 `GET /api/monitoring/actions` 재호출 |
| 브라우저 검증 | timeline 2건에서 3건으로 증가, 신규 memo 표시 확인 |
| 네 번째 QA 결과 | `qa-results/fourth_qa_check.md`에서 QA3-001 통과 확정 |
