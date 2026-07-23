# CR-2026-010 Phase 6 영향 분석

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-010` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `ARCHIVIST` |
| 요청일 | `2026-07-23` |
| 완료일 | `2026-07-23` |
| 요청자 | 사용자 |
| 위험도 | 중간 |
| 승인 상태 | `APPROVED` |

## 요청 원문

> Phase 6 영향 분석을 문서시스템에 따라 확장성 높고 유지보수성 높게 추상화해서 개발 진행해줘.

## Active Context snapshot

- 화면: `SCR-07`
- 요구사항: `REQ-IMPACT-001`~`003`
- QA: `QA-IMPACT-01`~`03`
- 선행 계약: Phase 1 `ImpactNode`/`ImpactEdge`, Phase 4 `AnalysisOutcome`, operational shell

## 결정

- graph와 accessible list가 서로 다른 데이터를 만들지 않고 하나의 `ImpactGraph` aggregate와 selector를 사용한다.
- 화면 좌표와 rendering은 widget 책임이며 경로 탐색·selection 정규화·인접 node 계산은 framework-independent domain 함수로 둔다.
- request→role→document→contract→code→QA의 depth를 데이터로 소유하고 DOM 순서로 경로를 추론하지 않는다.
- graph node/edge와 list row는 동일 controlled selection을 공유하고 URL `selected` query에 반영한다.
- 그래프를 사용하지 않는 사용자도 node·relation 목록과 keyboard만으로 같은 근거·경로·상태를 확인한다.
- backend 영향 API가 준비되기 전 fixture와 HTTP adapter가 동일 repository contract를 구현하며 HTTP 오류를 fixture로 fallback하지 않는다.

## 수용 기준

| ID | 조건 | 결과 |
| --- | --- | --- |
| AC-01 | request, role, document, contract, code, QA node kind가 한 graph에 표시된다 | 통과 |
| AC-02 | node type은 색상 외 label·shape·kind text로 구분된다 | 통과 |
| AC-03 | graph와 accessible relation list가 동일 node/edge aggregate에서 파생된다 | 통과 |
| AC-04 | graph node/edge 또는 list row 선택이 view·detail·URL에 동기화된다 | 통과 |
| AC-05 | 선택 시 status, change type, rationale, source path, request부터의 evidence path가 표시된다 | 통과 |
| AC-06 | graph node에서 좌우로 관계, 상하로 sibling을 이동하고 Enter/Space로 edge를 선택한다 | 통과 |
| AC-07 | 768px 이하 기본 list mode와 graph 없는 흐름에서 모든 node·relation을 keyboard로 탐색한다 | 통과 |
| AC-08 | FSD/type/lint/test/build, light/dark, desktop/mobile, keyboard browser QA가 통과한다 | 통과 |

## 구현 결과

- `ImpactGraph`, node depth/change type/owner와 `ImpactSelection`, `ImpactEvidencePath` 계약을 추가했다.
- runtime parser가 snake/camel wire 형식, nullable source path, entry node, unique ID와 edge endpoint를 검증한다.
- stable BFS가 cycle을 방문 집합으로 차단하고 entry부터 선택 대상까지 가장 짧은 근거 경로를 재현한다.
- fixture/HTTP repository, provider와 query hook을 같은 port로 조합하고 network/HTTP/schema/not-found를 분리했다.
- SCR-07 route, 10개 node·11개 relation fixture, SVG edge·HTML node graph와 65/35 detail layout을 구현했다.
- node·edge·목록·상세·URL query가 ID 기반 controlled selection 하나를 공유한다.
- container query로 shell 내부 실제 콘텐츠 폭에 따라 65/35와 stacked layout을 전환하고 canvas overflow를 내부에 격리했다.
- 768px 이하 최초 진입은 목록 집중 mode로 시작하며 사용자는 graph로 전환할 수 있다.
- 변경 제안 화면에서 해당 변경의 영향 경로로 직접 진입하는 action을 연결했다.

## QA 결과

| 검증 | 결과 |
| --- | --- |
| TypeScript / ESLint | 오류·경고 0 |
| Frontend Vitest | 20 files, 64 tests 통과 |
| FSD architecture | 역방향·slice-private import 0건 |
| Domain 반례 | stale selection, cycle, missing target, shortest path, 방향 탐색 통과 |
| HTTP contract | URL encoding, nullable source path, 404/schema/network 분리 통과 |
| Production build | 성공, 2102 modules transformed |
| Backend regression | 31 passed, PostgreSQL 환경 의존 1 skipped |
| Browser | graph/list/URL/detail 동기화, keyboard focus, 1280/390px, light/dark 통과 |
| Mobile | 390px 기본 list, node 10·relation 11, document scroll overflow 0 |
| Console | error/warning 0건 |

## 제외 범위

- 실제 LLM 영향 재분석 job과 backend persistence
- arbitrary graph editing, drag/drop, zoom/pan, minimap과 대규모 virtualization
- 승인·검증 mutation과 Git write

## 계획과 실제 변경 차이

- 1280px viewport라도 operational shell sidebar를 제외한 콘텐츠 폭은 1000px 미만일 수 있어 viewport media query 대신 named container query를 적용했다.
- 기존 responsive 계약에 따라 768px 이하의 최초 graph view를 목록 집중 mode로 변경했다. 전환 후 사용자의 명시적 선택은 유지한다.
- HTTP endpoint는 adapter·parser·contract까지만 구현했다. 실제 backend persistence와 생성 job은 명시된 제외 범위에 유지한다.

## Self-Review

- graph/list/detail은 별도 관계 복사본 없이 같은 aggregate를 순회한다.
- `shared`가 impact domain을 import하지 않고 FSD public API 경계를 유지한다.
- unknown selection은 entry request로 복구되며 cycle은 path traversal을 중단시키지 않는다.
- 색상 없이도 kind label, node shape/border, status와 change text로 의미를 확인할 수 있다.
- graph를 숨겨도 모든 node와 edge를 native button으로 선택하고 동일 detail을 확인할 수 있다.
- HTTP failure는 fixture로 은폐하지 않아 preview와 production의 데이터 출처가 명확하다.

## 완료 판정

AC-01~AC-08과 `REQ-IMPACT-001`~`003`에 연결된 자동·브라우저 검증이 통과했다. Phase 6를 완료하고 archive한다.
