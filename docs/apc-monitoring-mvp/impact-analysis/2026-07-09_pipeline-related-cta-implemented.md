# Pipeline Related CTA 구현 영향 분석

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 생성 일자 | 2026-07-09 |
| 변경 유형 | QA follow-up implementation |
| 참조 QA | `roles/qa/qa-results/second_qa_check.md` |
| 참조 development feature | `roles/development/feature/02_after_second_qa/14_pipeline_related_cta_implementation.md` |
| 영향 범위 | frontend shell, pipeline trace, quality issue detail, QA partial re-check |

## 변경 요약

파이프라인 실패 trace에서 관련 품질 이슈와 운영 조치 작성 흐름으로 바로 이동할 수 있도록 CTA와 context handoff를 구현했다.

## 역할별 영향

| 역할 | 영향 |
| --- | --- |
| Planning | `08_pipeline_related_cta_flow.md`의 관련 이슈 보기/운영 조치 작성 흐름이 실제 화면 흐름으로 반영됨 |
| Publishing | 기존 Astryx button/panel 스타일과 JADX_STATS 토큰을 유지하며 CTA box, context callout, action form focus 상태 추가 |
| Development | `PipelineRelatedContext`를 사용해 pipeline trace에서 quality issue detail로 tab handoff 구현 |
| QA | QA2-002를 세 번째 QA 문서에서 부분 재검증 완료로 기록 |

## 구현 영향

- `PipelineTracePanel`은 `relatedIssueIds` 기반 CTA와 관련 이슈 없음 empty state를 표시한다.
- `ApcDataManagementShell`은 pipeline CTA 클릭 시 `pipelineContext`를 생성하고 데이터 품질 이슈 탭으로 이동한다.
- `QualityIssuesPage`는 pipeline context가 있는 경우 해당 issue를 우선 선택하고 조치 작성 CTA 진입 시 action form을 강조한다.
- 기존 matrix drill-down context와 충돌하지 않도록 pipeline handoff 시 matrix context를 초기화한다.

## 검증

| 검증 항목 | 결과 |
| --- | --- |
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| `.venv/bin/python -m pytest` | 19 passed |
| Browser related issue CTA | 통과 |
| Browser action form CTA | 통과 |

## 잔여 고려사항

- Airflow 원문 로그 deep link는 MVP 후속 운영 연동 범위로 유지한다.
- 운영 조치 내역 탭과 품질 이슈 조치 form 사이의 양방향 연결은 다음 QA cycle에서 필요 시 별도 feature로 분리한다.
