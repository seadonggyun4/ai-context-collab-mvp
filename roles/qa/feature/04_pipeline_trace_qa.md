# 04. 파이프라인 추적 QA 체크표

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | qa |
| 생성 시점 | 첫 번째 QA 이전 QA 체크표 |
| QA Cycle | Initial QA checklist before first QA |
| 참조 QA 결과 | None |
| 생성 근거 | QA checklist lifecycle |
| 문서 상태 | Initial QA baseline |


## 참조 문서

- `../QA.md`
- `../../../Project_Context.md`
- `../../planning/feature/00_initial/04_pipeline_trace.md`
- `../../publishing/Publishing.md`
- `../../development/feature/00_initial/04_pipeline_trace.md`

## 체크표

| 구분 | 체크 항목 | 확인 |
| --- | --- | --- |
| 기획 | API 수신부터 화면 표시까지 단계가 순서대로 표시되는가 | [ ] |
| 기획 | 실패 단계에서 메시지와 다음 조치가 표시되는가 | [ ] |
| 기획 | 관련 이슈 보기와 운영 조치 작성 흐름이 연결되는가 | [ ] |
| 퍼블리싱 | 단계별 상태가 일관된 label과 상태 표현으로 표시되는가 | [ ] |
| 개발 | `GET /api/monitoring/pipeline/{trace_id}` 응답이 timeline에 매핑되는가 | [ ] |
| 개발 | 존재하지 않는 trace id에서 오류 상태가 처리되는가 | [ ] |
| 로그 | DAG/task/log preview가 원문보다 요약 우선으로 표시되는가 | [ ] |

## 미해결 이슈

- 없음
