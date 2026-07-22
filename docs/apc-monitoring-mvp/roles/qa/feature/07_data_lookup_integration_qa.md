# 07. 데이터 조회 연계 QA 체크표

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
- `../../planning/Planning.md`
- `../../publishing/Publishing.md`
- `../../development/feature/00_initial/07_data_lookup_integration.md`

## 체크표

| 구분 | 체크 항목 | 확인 |
| --- | --- | --- |
| 기획 | 기존 품목/입고선별/APC/농가명 필터가 유지되는가 | [ ] |
| 기획 | 품질 이슈가 있으면 조회 화면 상단에 경고가 표시되는가 | [ ] |
| 기획 | Excel 다운로드 전 경고와 계속 다운로드 선택지가 제공되는가 | [ ] |
| 퍼블리싱 | 경고 banner가 상태 표현 기준과 일치하는가 | [ ] |
| 개발 | 기존 조회 조건이 monitoring query로 매핑되는가 | [ ] |
| 개발 | monitoring API 실패가 기존 데이터 조회를 막지 않는가 | [ ] |
| 회귀 | 기존 pagination과 Excel 다운로드 흐름이 유지되는가 | [ ] |

## 미해결 이슈

- 없음
