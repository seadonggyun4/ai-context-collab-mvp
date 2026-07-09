# Remove Mock Write Features

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 네 번째 QA 이후 사용자 수정 요청 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/sixth_qa_check.md` |
| 생성 근거 | DB 없이 process memory로 동작하던 action/rule write 기능 제거 |
| 문서 상태 | Implemented |

## 구현 범위

- Frontend 탭에서 `운영 조치 내역`, `모니터링 기준 설정` 제거
- 관련 page/component/hook/service 제거
- 품질 이슈 상세 action form 제거
- 파이프라인 `운영 조치 작성` CTA 제거
- API client에서 actions/rules/write method 제거
- FastAPI router/service/repository에서 actions/rules/write endpoint 제거
- contract/test에서 actions/rules/write 범위 제거

## 구현 TASK

- [x] `ApcManagementTab`에서 `actions`, `rules` 제거
- [x] `ApcDataManagementShell`에서 OperationActions/MonitoringRules import/render/state 제거
- [x] `QualityIssuesPage` action form/state/POST 호출 제거
- [x] `PipelineTracePanel` 운영 조치 작성 CTA 제거
- [x] `monitoringApi` actions/rules methods 제거
- [x] FastAPI `/actions`, `/issues/{issue_id}/actions`, `/rules`, `/rules/{rule_id}` 제거
- [x] 관련 tests 제거/수정
- [x] shared contract 갱신
- [x] typecheck/build/pytest 검증

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `roles/planning/feature/04_after_fourth_qa/17_reduce_mock_write_features.md` | 읽기 중심 MVP 축소 | 충족 |
| Publishing | `roles/publishing/feature/04_after_fourth_qa/10_read_only_monitoring_visual_policy.md` | write UI 제거 기준 | 충족 |
| Development | 현재 문서 | API/UI 제거 TASK 정의 | 충족 |
| QA | `roles/qa/feature/13_mock_write_feature_removal_qa.md`, `roles/qa/qa-results/seventh_qa_check.md` | 회귀 검증 기준 | 충족 |
