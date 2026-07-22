# 03. 데이터 품질 이슈 QA 체크표

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
- `../../planning/feature/00_initial/03_quality_issues.md`
- `../../publishing/Publishing.md`
- `../../development/feature/00_initial/03_quality_issues.md`

## 체크표

| 구분 | 체크 항목 | 확인 |
| --- | --- | --- |
| 기획 | 필수값 누락/형식 오류/중복 의심/비정상 값/정제 실패 유형이 표시되는가 | [ ] |
| 기획 | 미확인 고심각도 이슈가 우선 노출되는가 | [ ] |
| 기획 | 상세에서 영향 범위, 샘플 row, 조치 안내가 보이는가 | [ ] |
| 퍼블리싱 | 심각도와 상태 label이 일관된 스타일로 표시되는가 | [ ] |
| 개발 | `GET /api/monitoring/issues` 응답이 목록/상세에 매핑되는가 | [ ] |
| 개발 | `POST /api/monitoring/issues/{issue_id}/actions`가 상태 변경에 사용되는가 | [ ] |
| 회귀 | 품질 이슈가 있을 때 Excel 다운로드 전 경고가 표시되는가 | [ ] |

## 미해결 이슈

- 없음
