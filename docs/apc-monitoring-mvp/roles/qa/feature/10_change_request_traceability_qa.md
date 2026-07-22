# Change Request Traceability QA

## 참조 문서

- `../../../Project_Context.md`
- `../../Feature_Workflow.md`
- `../../planning/feature/04_after_fourth_qa/14_change_request_triage_policy.md`
- `../../publishing/feature/04_after_fourth_qa/07_change_request_visual_policy.md`
- `../../development/feature/04_after_fourth_qa/18_change_request_implementation_gate.md`

## QA 목적

사용자 수정 요청이 단순 코드 변경으로 끝나지 않고, 역할별 문서 산출과 히스토리 추적 체계를 거쳤는지 검증한다.

## 체크표

| 체크 항목 | 확인 |
| --- | --- |
| 사용자 수정 요청이 한 문장으로 요약되어 있는가 | [ ] |
| 수정 요청이 planning / publishing / development / qa 영향으로 분류되어 있는가 | [ ] |
| 최신 QA cycle 또는 다음 cycle 디렉토리에 역할별 feature 문서가 생성되어 있는가 | [ ] |
| Planning feature가 사용자 흐름/정책/완료 기준을 정의했는가 | [ ] |
| Publishing feature가 UI/상태/레이아웃/접근성 기준을 정의했는가 | [ ] |
| Development feature가 Planning과 Publishing 조건을 모두 참조했는가 | [ ] |
| 구현 후 자동 검증 또는 브라우저 검증 결과가 기록되었는가 | [ ] |
| impact-analysis 또는 QA result에 변경 이력이 남았는가 | [ ] |

## 실패 시 후속 처리

위 항목 중 하나라도 실패하면 해당 수정 요청은 완료로 보지 않는다. 실패 항목은 다음 QA cycle의 역할별 feature 디렉토리에 다음 순번 문서로 이월한다.
