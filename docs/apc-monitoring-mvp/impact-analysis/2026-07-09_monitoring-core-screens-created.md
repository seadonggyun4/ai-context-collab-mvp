# 2026-07-09 모니터링 핵심 화면 구현 영향 분석

## 변경 요약

Planning/Development feature 01-06에 해당하는 모니터링 핵심 화면을 React 화면으로 구현하고 Phase 4 FastAPI endpoint에 연결했다.

추가된 구현:

- monitoring API client
- 공통 HTTP client와 query helper
- 공통 async resource hook
- loading/empty/error state component
- 모니터링 홈 API 연동
- 수신 현황 API 연동 및 trace 상세
- 데이터 품질 이슈 목록/상세/조치 등록
- 파이프라인 trace timeline
- 운영 조치 내역 timeline
- 모니터링 기준 목록/수정
- ECharts 상태 분포 차트

## 변경 원인

Phase 5 UI Shell은 화면 골격과 공통 표현 기준을 고정했다. Phase 6에서는 실제 `/api/monitoring/*` endpoint를 호출해 신규 모니터링 기능이 작동하는 화면으로 확장한다.

## 영향 문서

| 문서 | 영향 |
| --- | --- |
| `Project_Context.md` | Phase 6 변경 이력 추가 |
| `projects/apc-monitoring-mvp/docs/phase-plan.md` | 현재 상태를 Phase 6 완료로 갱신 |
| `projects/apc-monitoring-mvp/frontend/README.md` | frontend 구현 상태 갱신 |
| `roles/development/feature/01-06` | 구현 기준에 해당하는 화면/API 흐름이 코드화됨 |

## 기획 영향

- 모니터링 홈에서 오늘 데이터 신뢰 상태를 KPI, matrix, 최근 이슈, 상태 분포로 확인할 수 있다.
- 수신 현황에서 row를 선택하면 pipeline trace를 함께 확인할 수 있다.
- 품질 이슈에서 이슈 상세와 조치 등록 흐름이 가능하다.
- 운영 조치 내역과 모니터링 기준 설정이 별도 메뉴로 동작한다.

## 퍼블리싱 영향

- 기존 `JADX_STATS` 스타일 토큰과 `5px` radius 정책을 유지한다.
- ECharts는 상태 분포에만 적용하고 table/matrix는 운영 UI로 유지한다.
- 신규 form/timeline/detail UI도 기존 panel/table 스타일을 확장한다.

## 개발 영향

- API client가 `shared/api`로 분리되어 Phase 7 데이터 조회/시각화 연계에서도 재사용 가능하다.
- 화면별 API 호출은 `useAsyncResource`로 통일했다.
- ECharts는 `charts` manual chunk로 분리했다.

## QA 영향

- frontend typecheck와 production build가 통과했다.
- backend regression test가 통과했다.
- local FastAPI/Vite server에서 summary/ingestions API와 frontend HTML 응답을 확인했다.

## 리스크

- 실제 브라우저 시각 검증은 별도 수동 확인이 필요하다.
- action/rule mutation은 MVP memory state이므로 새 serverless instance에서는 지속되지 않을 수 있다.
- ECharts chunk가 크기 때문에 후속 최적화에서는 chart lazy loading을 검토할 수 있다.

## 후속 조치

- Phase 7에서 기존 `데이터 조회`와 `시각화` 메뉴에 품질 경고를 연결한다.
- QA feature 문서 기준으로 메뉴별 수동 체크를 수행한다.
- Vercel 배포 전 API base path와 serverless memory mutation 범위를 다시 확인한다.
