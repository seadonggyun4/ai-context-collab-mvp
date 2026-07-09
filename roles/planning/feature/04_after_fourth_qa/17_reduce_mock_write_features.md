# Reduce Mock Write Features

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 네 번째 QA 이후 사용자 수정 요청 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/sixth_qa_check.md` |
| 생성 근거 | DB가 필요한 반쪽짜리 mock write 기능 제거 |
| 문서 상태 | Implemented |

## 사용자 요청 요약

운영 조치 내역처럼 DB 저장이 필요한 기능이 mock 데이터 기반 반쪽짜리 기능이라면, 문서 기반 AI 엔진 시범 목적에 맞게 유사 기능을 과감히 제거한다.

## 검증 결과

- `POST /api/monitoring/issues/{issue_id}/actions`는 process memory에 action을 append한다.
- `PUT /api/monitoring/rules/{rule_id}`는 process memory에 rule 변경 이력을 insert한다.
- `app/shared/contracts/monitoring-contract.md`에도 해당 변경이 process memory 안에서만 유지된다고 명시되어 있다.

## Planning 결정

MVP는 읽기 중심 모니터링 시연으로 축소한다.

제거 대상:

- `운영 조치 내역` 탭
- `모니터링 기준 설정` 탭
- 품질 이슈 상세의 `상태 변경/메모/조치 등록` form
- 파이프라인의 `운영 조치 작성` CTA
- action/rule write API를 전제로 한 화면 흐름

유지 대상:

- 모니터링
- 수신 현황
- 데이터 품질 이슈 조회/상세
- 파이프라인 추적
- 데이터 조회
- 시각화

## Acceptance Criteria

- [x] 운영 조치 내역 탭이 보이지 않는다.
- [x] 모니터링 기준 설정 탭이 보이지 않는다.
- [x] 품질 이슈 상세는 조회/원인/영향/권장 조치만 제공한다.
- [x] 품질 이슈 상세에서 상태 변경, 메모, 조치 등록 UI가 보이지 않는다.
- [x] 파이프라인에서 운영 조치 작성 CTA가 보이지 않는다.
- [x] action/rule write API가 MVP API 계약에서 제거된다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | 현재 문서 | MVP 범위를 읽기 중심으로 축소 | 충족 |
| Publishing | `roles/publishing/feature/04_after_fourth_qa/10_read_only_monitoring_visual_policy.md` | 반쪽짜리 write UI 제거 기준 | 충족 |
| Development | `roles/development/feature/04_after_fourth_qa/21_remove_mock_write_features.md` | API/UI 제거 TASK | 충족 |
| QA | `roles/qa/feature/13_mock_write_feature_removal_qa.md`, `roles/qa/qa-results/seventh_qa_check.md` | 회귀 검증 연결 | 충족 |
