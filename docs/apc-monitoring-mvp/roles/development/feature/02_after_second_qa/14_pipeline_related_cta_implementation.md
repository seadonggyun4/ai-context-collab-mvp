# 14. Pipeline Related CTA 구현 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 두 번째 QA 이후 feature |
| QA Cycle | After second QA |
| 참조 QA 결과 | `../../../qa/qa-results/second_qa_check.md` |
| 생성 근거 | Second QA residual issue |
| 문서 상태 | Implemented |

## 발생 출처

- QA 결과: `../../../qa/qa-results/second_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/04_pipeline_trace_qa.md`
- 원인 ID: `QA2-002`
- 기존 1차 QA 원인 ID: `QA-004`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/01_after_first_qa/08_pipeline_related_cta_flow.md` | 관련 이슈 보기, 운영 조치 작성, 로그 확인 CTA 정책 확정 | 충족 |
| Publishing | `../../../publishing/Publishing.md` | timeline CTA가 상태 label/button 스타일 기준과 충돌하지 않음 | 충족 |
| Development | 현재 문서 | relatedIssueIds 기반 tab handoff와 action form 진입 구현 | 충족 |
| QA | `../../../qa/feature/04_pipeline_trace_qa.md`, `../../../qa/feature/05_operation_actions_qa.md` | 실패 trace에서 이슈/조치 흐름 재검증 | 부분 재검증 통과 |

## 원인

`PipelineTracePanel`은 단계, log preview, next action을 표시하지만 `relatedIssueIds`를 CTA로 렌더링하지 않는다.

또한 `ApcDataManagementShell`은 품질 이슈 탭이나 운영 조치 탭으로 이동할 때 선택 issue/action context를 전달하지 않는다.

## 구현 TASK

- [x] `PipelineTracePanel`에 `relatedIssueIds` 기반 CTA 영역 추가
- [x] `관련 이슈 보기` 클릭 시 데이터 품질 이슈 탭으로 이동하고 관련 issue 선택
- [x] `운영 조치 작성` 클릭 시 품질 이슈 상세의 조치 등록 영역으로 이동
- [x] log preview 확장 UI와 Airflow 원문 연결 범위를 분리
- [x] CTA 클릭 후 적용된 trace/issue context를 helper text로 표시
- [x] 존재하지 않는 issue id나 관련 이슈 없음 상태를 empty state로 처리
- [x] QA용 테스트/브라우저 검증 항목 추가

## 구현 결과

- `PipelineTracePanel`은 `trace.relatedIssueIds`가 있을 때 `관련 이슈 보기`, `운영 조치 작성` CTA를 표시한다.
- `ApcDataManagementShell`은 pipeline CTA 클릭 시 matrix context를 초기화하고 `PipelineRelatedContext`를 품질 이슈 탭으로 전달한다.
- `QualityIssuesPage`는 pipeline context가 있으면 matrix filter를 적용하지 않고 관련 issue id를 우선 선택한다.
- `운영 조치 작성` CTA로 진입하면 품질 이슈 상세의 조치 등록 영역으로 스크롤하고 focus 스타일을 표시한다.
- 관련 이슈가 없는 trace는 CTA 대신 `관련 이슈 없음 / 이슈 연결 대기 / 추가 조치 없음` empty state를 표시한다.

## QA 부분 재검증

| 항목 | 결과 |
| --- | --- |
| Frontend typecheck | 통과 |
| Frontend production build | 통과 |
| Backend pytest | 19 passed |
| Browser: 파이프라인 추적에서 `관련 이슈 보기` 클릭 | 데이터 품질 이슈 탭 이동, trace/issue context 표시 통과 |
| Browser: 파이프라인 추적에서 `운영 조치 작성` 클릭 | 데이터 품질 이슈 탭 이동, 조치 등록 영역 focus 통과 |

## 완료 기준

- 실패 trace에서 관련 품질 이슈 상세로 직접 이동할 수 있다.
- 실패 trace에서 운영 조치 작성 흐름으로 진입할 수 있다.
- pipeline timeline은 개발자 로그가 아니라 운영자 조치 흐름으로 연결된다.
