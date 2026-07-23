# DF-004 Main and Project Dashboard

## 구현 계약

- `entities/project`는 Project core, `ProjectDashboard` projection, `ProjectRepository`만 소유한다.
- repository는 비동기 `getProjectDashboard(projectId, signal)`을 제공하고 `DomainResult<ProjectDashboard | null>`로 not-found와 transport/schema failure를 분리한다.
- fixture와 HTTP adapter는 동일한 runtime parser를 거쳐 화면에 불완전한 데이터를 전달하지 않는다.
- `VITE_DATA_SOURCE=fixture|http` 선택은 app composition root에서만 수행한다.
- page는 repository 상태와 route parameter를 결합하고, widget은 전달받은 read model만 표현한다.
- 목록의 상태·위험·역할·시각 label은 read model에 안정적으로 포함해 화면별 재해석을 막는다.

## FSD 배치

| 대상 | 위치 |
| --- | --- |
| dashboard model/repository/parser/adapters/hook | `entities/project` |
| 제품 흐름 preview | `widgets/product-workspace-preview` |
| 운영 dashboard sections | `widgets/project-dashboard` |
| route state/composition | `pages/landing`, `pages/project-overview` |
| data source/env/http base URL | `shared/config`, `app/providers` |

## HTTP 경계

- 예상 endpoint: `GET /api/v1/projects/{projectId}/dashboard`
- `404`는 정상적인 `null`, 그 외 non-2xx는 `PROJECT_DASHBOARD_HTTP_ERROR`다.
- payload schema가 맞지 않으면 `PROJECT_DASHBOARD_INVALID_RESPONSE`로 실패한다.
- abort는 component unmount 시 fetch를 중단하며 stale response가 최신 화면을 덮지 않는다.
- fixture로의 자동 fallback은 하지 않는다.

## 완료 증거

- Change: `CR-2026-007`
- Impact: `impact-analysis/2026-07-22_phase-3-main-project-dashboard.md`
- QA: `roles/qa/feature/03_phase-3/01_main_project_dashboard_qa.md`
- 구현: `projects/context-collaboration-console/src/entities/project`, `widgets/project-dashboard`, `widgets/product-workspace-preview`
- 자동 검증: typecheck/lint, Vitest 38 tests, production build 통과
- 브라우저: 4 breakpoint와 light/dark, console error/warning 0건
