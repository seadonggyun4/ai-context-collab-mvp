# Phase 6 영향 분석 기능 영향 분석

- Change ID: `CR-2026-010`
- 상태: 구현·QA 완료

| 노드 | 예상 영향 |
| --- | --- |
| Domain | Impact kind/depth/change type, graph aggregate, evidence path와 adjacency selector |
| Adapter | deterministic graph fixture, HTTP parser/repository/provider |
| Feature | controlled selection과 graph/list mode |
| Widget | SVG edge + HTML node graph, accessible relation list, synchronized detail |
| Route | `/projects/:projectId/changes/:changeId/impact`, proposal drill-down action |
| QA | 모든 kind, path determinism, URL selection, keyboard, theme, responsive |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| graph와 list 관계 불일치 | 단일 ImpactGraph와 selector만 사용하고 계약 테스트 |
| 색상만으로 type/status 표현 | kind label, node shape, status/change text를 병행 |
| SVG keyboard 접근성 부족 | HTML node button과 별도 relation list를 canonical keyboard surface로 제공 |
| 순환 edge에서 path 탐색 무한 반복 | visited set과 stable BFS tie-break 적용 |
| 선택 node 삭제·stale URL | selection normalizer가 entry node로 복구 |
| canvas가 모바일에서 잘림 | graph는 horizontal scroll, list/detail은 단일 column으로 유지 |

## 실제 영향과 증거

| 노드 | 실제 변경 |
| --- | --- |
| Domain | graph/depth/change type/selection/evidence path와 stable BFS·방향 selector |
| Adapter | strict snake/camel parser, nullable path 계약, fixture/HTTP repository/provider |
| Feature | controlled selection과 compact 최초 list mode |
| Widget | SVG relation·HTML node graph, node/relation list, detail과 container query |
| Route | impact lazy route, URL `selected` 복구·동기화, proposal drill-down |
| QA | frontend 64 tests, backend 31 passed/1 skipped, build와 1280/390px browser QA |

실제 backend 영향 생성·저장 API는 이 변경의 제외 범위이며 HTTP adapter 계약만 준비했다.
