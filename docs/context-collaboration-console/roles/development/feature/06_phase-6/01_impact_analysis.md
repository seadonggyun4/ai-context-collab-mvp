# DF-007 Impact Analysis

## 구현 경계

- `entities/impact`: graph aggregate, node/edge, repository, parser, fixture/HTTP adapter, path/adjacency selector.
- `features/explore-impact`: view mode와 controlled selection action contract.
- `widgets/impact-explorer`: graph/list/detail 조합과 keyboard interaction.
- `pages/impact-analysis`: route/query, project scope, loading/empty/error 조합.
- `shared`는 domain을 import하지 않으며 범용 primitive만 제공한다.

## 데이터 계약

- Graph: projectId, changeId, revision, generatedAt, entryNodeId, nodes, edges.
- Node: id, kind, depth, label, status, changeType, sourcePath, rationale, reviewable.
- Edge: id, from, to, relation, rationale.
- HTTP: `GET /api/v1/projects/{projectId}/changes/{changeId}/impact`.

## 불변 조건

- 모든 edge endpoint는 같은 graph의 node ID여야 한다.
- entry node kind는 `REQUEST`, depth는 0이다.
- evidence path는 entry node에서 선택 node까지 연결된 edge sequence다.
- graph/list/detail은 ID 기반 controlled selection만 사용한다.
- URL의 알 수 없는 selection은 entry node로 복구한다.

## 완료 증거

- Change: `CR-2026-010`
- Impact: `impact-analysis/2026-07-23_phase-6-impact-analysis.md`
- QA: `roles/qa/feature/06_phase-6/01_impact_analysis_qa.md`

## 구현 결과

```text
pages/impact-analysis
  → widgets/impact-explorer
    → features/explore-impact
      → entities/impact
        → shared/lib
```

- `ImpactGraph` aggregate가 node/edge, entry, revision과 generatedAt을 하나의 일관성 경계로 소유한다.
- parser는 entry request/depth, unique ID, endpoint, nullable source path와 enum을 runtime에서 검증한다.
- stable BFS selector가 cycle을 차단하고 최단 evidence path를 결정론적으로 선택한다.
- 좌우 방향키는 incoming/outgoing relation, 상하 방향키는 같은 depth의 sibling을 탐색한다.
- fixture와 HTTP adapter는 `ImpactRepository`를 공유하고 HTTP 오류를 fixture로 fallback하지 않는다.
- graph/list/detail/URL은 `ImpactSelection` ID를 공유하며 stale query는 entry request로 복구한다.
- desktop은 실제 container 폭이 충분할 때 65/35, 좁은 shell과 mobile은 stacked layout을 사용한다.
- 768px 이하 최초 진입은 accessible list이며 graph 전환을 계속 제공한다.

## 검증 결과

- frontend: typecheck, ESLint, architecture, Vitest `20 files / 64 tests`, production build 통과
- backend regression: pytest `31 passed`, PostgreSQL-only `1 skipped`
- browser: node/edge selection, URL/detail/path synchronization, horizontal/vertical focus traversal
- responsive/theme: 1280px light, 390px dark, document overflow 0, console error/warning 0
