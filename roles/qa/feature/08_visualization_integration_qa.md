# 08. 시각화 연계 QA 체크표

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
- `../../development/feature/00_initial/08_visualization_integration.md`

## 체크표

| 구분 | 체크 항목 | 확인 |
| --- | --- | --- |
| 기획 | APC별 당산도/등급 분포/총 선별 중량 차트 목적이 유지되는가 | [ ] |
| 기획 | 품질 이슈가 있으면 차트 상단에 데이터 신뢰도 경고가 표시되는가 | [ ] |
| 기획 | 모니터링 상태가 차트 데이터와 섞여 해석되지 않는가 | [ ] |
| 퍼블리싱 | 차트와 경고 UI가 Publishing 기준과 충돌하지 않는가 | [ ] |
| 개발 | 시각화 조건이 monitoring query로 매핑되는가 | [ ] |
| 개발 | monitoring API 실패가 기존 차트 표시를 막지 않는가 | [ ] |
| 회귀 | 기존 시각화 기능의 조회 조건과 차트 표시가 유지되는가 | [ ] |

## 미해결 이슈

- 없음
