# 01. 모니터링 홈 QA 체크표

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
- `../../planning/feature/00_initial/01_monitoring_home.md`
- `../../publishing/Publishing.md`
- `../../development/feature/00_initial/01_monitoring_home.md`

## 체크표

| 구분 | 체크 항목 | 확인 |
| --- | --- | --- |
| 기획 | 당일 기준 KPI, matrix, 최근 이슈가 첫 화면에 표시되는가 | [ ] |
| 기획 | 정상/지연/오류/미수신/기준 미정 상태가 텍스트와 함께 표시되는가 | [ ] |
| 기획 | matrix cell 선택 시 관련 조건으로 상세 확인 흐름이 이어지는가 | [ ] |
| 퍼블리싱 | Astryx/JADX_STATS 기준의 상태 표시와 카드 스타일이 적용되었는가 | [ ] |
| 개발 | `GET /api/monitoring/summary` 응답이 화면에 매핑되는가 | [ ] |
| 개발 | loading/empty/error 상태가 각각 확인되는가 | [ ] |
| 회귀 | 기존 데이터 조회/시각화 탭 진입이 막히지 않는가 | [ ] |

## 미해결 이슈

- 없음
