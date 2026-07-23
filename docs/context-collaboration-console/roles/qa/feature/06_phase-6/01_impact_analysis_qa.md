# QF-007 Impact Analysis QA

## P0

- REQ-IMPACT-001 request/role/document/contract/code/QA kind와 affected/unknown 상태.
- REQ-IMPACT-002 graph와 accessible relation list의 node/edge 동등성.
- REQ-IMPACT-003 선택 동기화, rationale/source/change status와 entry→selection path.
- 방향키 node 탐색, Enter/Space edge action, list-only keyboard completion.
- invalid/stale selected query recovery와 direct URL reload.
- cycle/missing endpoint/path tie-break selector 반례.
- 1280/768/390px, light/dark, loading/empty/error, production build.

## 실행 결과

| 항목 | 결과 | 증거 |
| --- | --- | --- |
| REQ-IMPACT-001 | 통과 | request/role/document/contract/code/component/QA 10개 node와 kind text·shape |
| REQ-IMPACT-002 | 통과 | graph와 목록이 같은 11개 relation을 사용하고 선택을 공유 |
| REQ-IMPACT-003 | 통과 | status/change/rationale/source와 request→selection path 표시 |
| Selection | 통과 | graph node/edge, node list, relation list, URL query와 detail 동기화 |
| Keyboard | 통과 | 좌우 relation, 상하 sibling focus, edge Enter/Space와 native list button |
| 반례 | 통과 | stale ID 복구, cycle 차단, missing path, shortest stable BFS, invalid endpoint |
| HTTP | 통과 | encoded project/change URL, null source path, 404/schema/network 구분 |
| Mobile | 통과 | 390px 최초 list, 10 nodes/11 relations, page overflow 0 |
| Theme | 통과 | light/dark에서 selected/focus/status 의미 유지 |
| Frontend | 통과 | type/lint, 20 files/64 tests, 2102 modules production build |
| Backend 회귀 | 통과 | 31 passed, PostgreSQL 환경 의존 1 skipped |
| Browser console | 통과 | error/warning 0건 |

## 제한과 후속

- 실제 impact backend persistence와 LLM analysis job은 미구현이며 fixture가 기본 data source다.
- 대규모 graph virtualization, zoom/pan과 graph editing은 관계 규모·성능 budget이 확정된 이후 도입한다.
- PostgreSQL integration 1건은 `TEST_DATABASE_URL`이 없어 skip했으며 Phase 6에서 backend 변경은 없었다.
