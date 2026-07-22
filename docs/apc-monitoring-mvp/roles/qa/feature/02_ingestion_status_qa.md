# 02. 수신 현황 QA 체크표

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
- `../../planning/feature/00_initial/02_ingestion_status.md`
- `../../publishing/Publishing.md`
- `../../development/feature/00_initial/02_ingestion_status.md`

## 체크표

| 구분 | 체크 항목 | 확인 |
| --- | --- | --- |
| 기획 | 기간/APC/품목/입고선별/상태 필터가 제공되는가 | [ ] |
| 기획 | 지연/미수신/오류 row가 우선 정렬되는가 | [ ] |
| 기획 | 최근 수신 시각과 기대 수신 기준이 함께 표시되는가 | [ ] |
| 퍼블리싱 | 상태가 색상만이 아니라 텍스트와 함께 표시되는가 | [ ] |
| 개발 | `GET /api/monitoring/ingestions` 필터가 동작하는가 | [ ] |
| 개발 | `traceId`를 통해 파이프라인 추적으로 이동 가능한가 | [ ] |
| 권한 | viewer는 origin/refined 상세 경로를 볼 수 없는가 | [ ] |

## 미해결 이슈

- 없음
