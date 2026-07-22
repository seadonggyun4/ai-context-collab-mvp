# 06. 모니터링 기준 설정 QA 체크표

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
- `../../planning/feature/00_initial/06_monitoring_rules.md`
- `../../publishing/Publishing.md`
- `../../development/feature/00_initial/06_monitoring_rules.md`

## 체크표

| 구분 | 체크 항목 | 확인 |
| --- | --- | --- |
| 기획 | APC/품목/입고선별별 기준이 목록으로 표시되는가 | [ ] |
| 기획 | 기준 미정 항목이 오류와 구분되어 표시되는가 | [ ] |
| 기획 | 변경 전/후 값과 변경 사유가 표시되는가 | [ ] |
| 퍼블리싱 | 권한 없음/disabled 상태가 명확히 표현되는가 | [ ] |
| 개발 | `GET /api/monitoring/rules` 응답이 목록에 매핑되는가 | [ ] |
| 개발 | `PUT /api/monitoring/rules/{rule_id}` 호출 시 변경 사유가 필수인가 | [ ] |
| 권한 | admin 외 사용자는 수정할 수 없는가 | [ ] |

## 미해결 이슈

- 없음
