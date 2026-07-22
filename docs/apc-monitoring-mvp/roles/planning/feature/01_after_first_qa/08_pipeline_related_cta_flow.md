# 08. Pipeline Related CTA Flow 기획 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | First QA open issue / partial-pass result |
| 문서 상태 | Follow-up scope |


## 발생 출처

- QA 결과: `../../../qa/qa-results/first_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/04_pipeline_trace_qa.md`
- 원인 ID: `QA-004`

## 원인

파이프라인 timeline은 단계, log preview, next action 표시 중심으로 구현되었지만 관련 이슈 보기와 운영 조치 작성 CTA가 직접 연결되지 않았다.

관련 화면으로 이동하려면 `relatedIssueIds`와 action form 상태를 shell 전역에서 공유해야 하는데, 현재 구조에는 이 상태 전파 규칙이 없다.

## 사용자 흐름 보완

| CTA | 위치 | 이동/동작 |
| --- | --- | --- |
| 관련 이슈 보기 | 실패 단계 하단 | 데이터 품질 이슈 탭으로 이동하고 관련 issue 선택 |
| 운영 조치 작성 | 실패 단계 하단 | 품질 이슈 상세의 조치 등록 영역으로 이동 |
| 로그 확인 | log preview 옆 | MVP에서는 preview 확장, 운영 반영 시 Airflow log 이동 검토 |

## 구현 요청 TASK

- [ ] pipeline 실패 단계 CTA 정책 정의
- [ ] 관련 이슈 선택 상태 유지 정책 정의
- [ ] 운영 조치 작성 진입 문구 정의
- [ ] Airflow log 원문 연결은 후속 범위로 분리

## 완료 기준

- 실패 trace에서 관련 품질 이슈 상세로 이동할 수 있다.
- 실패 trace에서 운영 조치 작성 흐름으로 진입할 수 있다.
