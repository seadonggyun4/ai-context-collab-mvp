# Implementation Plan

## Phase 0 — scaffold and theme

상태: `COMPLETE` — 2026-07-22

- Vite React TypeScript
- Astryx 설치와 theme wrapper
- route shell, token, typography, icon policy
- fixture/domain test harness

완료: SCR-01 shell과 운영 shell skeleton이 토큰만으로 렌더링된다.

구현 증거:

- `projects/context-collaboration-console/`에 strict TypeScript, alias, lint, Vitest, production build 기반 구성
- Astryx pre-built neutral theme와 제품 semantic token cascade 적용
- `/` 메인 진입 화면, `/projects/:projectId` 운영 shell, not-found/error/data state 구축
- repository contract 뒤의 deterministic fixture로 데이터 공급 경계 분리
- desktop 1280px 및 mobile 390px 브라우저 QA, console error 0
- typecheck, lint, 4 tests, production build 통과

## Phase 0.1 — FSD, styling boundary and theme modes

상태: `COMPLETE` — 2026-07-22

- 기존 Phase 0 구조를 `app/pages/widgets/features/entities/shared`로 migration
- public API와 layer import lint/architecture test
- Astryx API·제품 wrapper·semantic CSS의 styling ownership 정리
- light/dark semantic token set과 system preference provider
- accessible theme switcher, persistence, first-paint flash 방지

완료: FSD dependency test, Astryx/CSS ownership audit, system/light/dark browser·visual·contrast test가 통과한다. 이 단계가 끝나기 전에는 Phase 1 신규 feature를 확장하지 않는다.

구현 증거:

- FSD 6-layer와 slice Public API 적용
- architecture dependency test 3건 추가
- system/light/dark preference, OS sync, persistence, first-paint bootstrap 구현
- app/shared/feature/widget/page CSS ownership 분리와 semantic dark token 적용
- typecheck, lint, 10 tests, production build, desktop/mobile browser QA 통과

## Phase 1 — domain and deterministic fixture

상태: `COMPLETE` — 2026-07-22

- Project, ChangeRequest, Proposal, Document, Impact, Review, Evidence, ContextVersion, AuditEvent entity 계약
- YAML workflow·permission·document schema와 TypeScript 상수의 동기화 계약 테스트
- 순수 함수 기반 proposal revision, review, evidence, transition command와 구조화 DomainError
- proposal 내용 전체를 잠그는 revision scope fingerprint와 implementation revision별 evidence 격리
- 결정론적 `apc-monitoring-mvp` / `CR-DEMO-001` aggregate fixture

완료: UI 없이 P0 승인·검증·활성화 흐름과 권한·상태·revision 반례가 통과한다.

구현 증거:

- FSD entity slice Public API와 단방향 architecture 검사 통과
- `ANALYZED → IN_REVIEW → APPROVED → IMPLEMENTING → VERIFYING → READY_TO_ACTIVATE → ACTIVATED` 정상 전이 통과
- self approval, 권한 부족, high-risk 승인, stale scope/evidence, 실패·미실행·부분·수동 미완료, 비관리자 활성화 차단
- 활성화 command가 ContextVersion과 activation AuditEvent를 같은 결과에서 생성
- typecheck, lint, 8 test files/31 tests, production build 통과

## Phase 2 — backend foundation and Render preview

상태: `IMPLEMENTED_LOCAL / RENDER_SYNC_PENDING` — 2026-07-22

- Python 3.12/FastAPI의 domain→application→infrastructure→API/composition 구조
- Pydantic Settings, request ID, 구조화 error, strict CORS allowlist
- PostgreSQL/SQLAlchemy 2 async persistence와 Alembic single-head migration
- migration-aware liveness/readiness와 idempotent APC project seed
- Project read, Git object 기반 Document list/detail read API와 OpenAPI 계약
- root Render Blueprint의 Static Site, Web Service, PostgreSQL, migration, SPA rewrite, preview expiry

구현 완료: 로컬 disposable PostgreSQL에서 migration·seed·health·CORS·API·Git adapter 통합 검증과 공식 Render JSON Schema 검증이 통과한다.

외부 완료 Gate: Render workspace에서 Blueprint sync 후 실제 preview URL의 web→API→DB smoke를 확인한다. 이 작업은 service/database 생성과 비용·workspace 선택을 수반하므로 별도 승인 전에는 실행하지 않는다.

구현 증거:

- backend Ruff format/lint, strict mypy 오류 0
- pytest 27 tests 통과, 실제 PostgreSQL 14에서 downgrade→upgrade→seed→readiness→API 검증
- frontend typecheck/lint, Vitest 31 tests, production build regression 통과
- Render 공식 JSON Schema validation 통과
- Render CLI semantic/workspace validation은 workspace 미설정으로 외부 Gate에 유지

## Phase 3 — main entry and project dashboard

상태: `COMPLETE` — 2026-07-22

- Truthound 참조 범위를 section rhythm·타이포그래피 계층·실제 workspace proof로 제한한 SCR-01 메인
- 활성 Context·시행일·마지막 검증·compact metric strip을 포함한 SCR-02 project overview
- 진행 변경 table, attention queue, 역할별 최신 산출물, 정합성 원인, 최근 QA/evaluation timeline
- Project core와 dashboard projection을 분리한 비동기 `ProjectRepository`
- 같은 wire parser를 사용하는 deterministic fixture/HTTP adapter와 명시적 data source composition
- loading/not-found/error, 상태 label, anchor drill-down, 1280/1024/768/390 responsive composition

완료: SCR-01~02, REQ-DASH-001~005, FSD/style/theme/route gate와 실제 브라우저 검증이 통과한다.

구현 증거:

- typecheck, ESLint 오류 0
- Vitest 10 files/38 tests 통과
- FSD 역방향·slice-private import 0건
- production build 성공, 1941 modules transformed
- 1280/1024/768/390px에서 페이지 가로 overflow 0건
- light mobile·dark desktop 및 theme 전환, console error/warning 0건
- backend dashboard endpoint는 아직 미구현이므로 기본 data source는 fixture이며 HTTP mode는 명시적 오류를 유지

## Phase 4 — natural-language request and analysis proposal

상태: `COMPLETE` — 2026-07-22

- raw request와 versioned session draft 보존
- context 확인→요청 구조화→영향 탐색→검증안 생성의 비동기 AnalysisJob
- project·Context·원문 기반 stable idempotency key와 duplicate start/retry 억제
- 실패 시 같은 job의 새 attempt로 재시도하고 원문·오류 이력 유지
- deterministic fixture와 HTTP start/poll/retry/detail adapter, 공통 runtime parser
- 요약, 수용 기준, confidence, unknowns, clarification, 역할·화면·API·데이터·파일·QA 제안 화면
- 완료 outcome fixture session 복원과 route reload 지원

완료: SCR-03~04, REQ-CHANGE-001~004, idempotency/API contract와 responsive/theme browser QA가 통과한다.

구현 증거:

- typecheck, ESLint 오류 0
- Vitest 13 files/45 tests 통과
- production build 성공, 1960 modules transformed
- 1280/768/390px에서 요청·진행·실패·재시도·완료·새로고침 검증
- light/dark와 console error/warning 0건
- 실제 analysis backend/LLM은 미구현이므로 기본 실행은 deterministic fixture

## Phase 6 — impact analysis

상태: `COMPLETE` — 2026-07-23

- request→role→document→contract→code→QA depth를 갖는 `ImpactGraph` aggregate
- stable BFS evidence path, cycle guard, stale selection 복구와 방향 탐색 selector
- strict runtime parser와 deterministic fixture/HTTP repository provider 경계
- SVG relation·HTML node graph, accessible node/relation list와 synchronized detail
- URL `selected` query, compact 기본 list mode와 container-width responsive layout

완료: SCR-07, REQ-IMPACT-001~003과 graph 없는 keyboard 동등 탐색이 통과한다.

구현 증거:

- typecheck, ESLint, FSD architecture 오류 0
- Vitest 20 files/64 tests 통과
- production build 성공, 2102 modules transformed
- backend regression 31 passed, PostgreSQL 환경 의존 1 skipped
- 1280/390px, light/dark, graph/list/URL/detail과 keyboard focus browser QA 통과
- 390px 최초 list mode, 10 nodes/11 relations, page overflow와 console error/warning 0건
- 실제 impact backend/job은 미구현이므로 기본 data source는 deterministic fixture

## Phase 7 — review and verification

상태: `COMPLETE` — 2026-07-23

- semantic/raw diff와 decision/evidence/gate/audit를 묶는 versioned `ReviewWorkspace`
- frontend fixture/HTTP repository, command feature, SCR-08 responsive widget와 route
- backend 순수 aggregate·server actor registry·idempotent command service·PostgreSQL repository
- Alembic `20260723_0003` workflow/audit/receipt schema와 review/evidence/transition API
- self approval, high-risk approval, stale scope, evidence revision과 READY gate 반례

완료: SCR-08, REQ-REVIEW-001~003, REQ-VERIFY-001~002와 서버 권한·감사·금지 전이가 통과한다.

구현 증거:

- frontend ESLint/TypeScript/FSD 오류 0, Vitest 23 files/74 tests 통과, production build 성공
- backend Ruff/mypy/architecture 오류 0, Pytest 38 passed, PostgreSQL 환경 의존 1 skipped
- 1280px light와 390px dark, semantic/raw, mobile pane, keyboard, 완료 gate browser QA 통과
- 승인→구현→검증→자동/수동 evidence→READY와 audit 8건 확인
- 390px horizontal overflow 및 browser console error/warning 0건

## Phase 8 — Git publication and Context activation

상태: `COMPLETE` — 2026-07-23

- READY·approval scope·proposal/implementation revision·base SHA를 고정하는 publication guard
- server-owned branch/path/message와 provider-neutral `GitPublisher` port, sandbox-only Git adapter
- publication commit에 current evidence를 연결하고 admin-only activation을 별도 command로 수행
- Alembic `20260723_0004` immutable ContextVersion과 Project active version 원자적 갱신
- FSD Activation entity/fixture·HTTP repository/action feature/SCR-09 route와 결과 화면
- governance YAML/TypeScript policy version 2 동기화

완료: SCR-09, REQ-VERIFY-003, sandbox Git E2E와 승인 없는 write·activation 차단이 통과한다.

구현 증거:

- frontend ESLint/TypeScript/FSD 오류 0, Vitest 26 files/81 tests와 production build 성공
- backend Ruff/mypy 오류 0, Pytest 42 passed, PostgreSQL 환경 의존 1 skipped
- 실제 임시 Git branch/commit 2개 E2E와 READY 이전 publisher call 0건 반례 통과
- 1265px light와 390px dark publication→activation browser QA, horizontal overflow 0건
- remote provider PR·push는 provider credential과 repository policy가 필요한 외부 integration 경계로 유지

## Phase 9 — authentication, operations, and production deployment

상태: `LOCAL_COMPLETE / EXTERNAL_GATE_PENDING` — 2026-07-23

- provider-neutral Principal/OIDC flow/server session domain과 application port
- OIDC discovery·Authorization Code+PKCE S256·signed ID token/JWKS adapter
- Redis-compatible TTL session/one-time flow/atomic rate-limit adapter와 dependency readiness
- production auth·CSRF·trusted RBAC·security header·request ID·structured access/denial middleware
- FSD Auth entity, credentialed/CSRF fetch, session expiry event, protected boundary와 login/logout UX
- paid PostgreSQL·persistent Key Value·secret 분리를 갖는 Render production Blueprint
- pinned GitHub Actions quality gate, read-only production smoke, application rollback/PITR/rotation runbook

로컬 완료 조건:

- frontend 29 files/88 tests, lint/typecheck/build와 desktop/mobile 양 theme browser QA
- backend 53 tests verified including isolated PostgreSQL migration/seed/readiness/API, Ruff/format/mypy, 공식 Render JSON Schema와 smoke/CI contract
- 실제 IdP/Render resource를 만들거나 production 데이터를 변경하지 않은 상태에서 fail-closed 반례 통과

외부 완료 조건:

- 승인된 Render workspace semantic validation과 Blueprint sync
- IdP callback/group 등록, test tenant 역할별 login
- production web→API→DB/Key Value smoke
- application rollback과 격리 PostgreSQL PITR drill, RTO/RPO 증거

## Phase 10 — quality hardening and Release Gate

상태: `LOCAL_COMPLETE / FIELD_EVIDENCE_PENDING` — 2026-07-23

- `loading / empty / error / permission / stale / offline / conflict` 공통 taxonomy와 DomainError classifier
- WCAG 2.2 A/AA axe, skip link·keyboard·target size와 reduced motion/forced colors 계약
- 1280/1024/768/390px reflow와 dashboard/editor horizontal overflow 검사
- dashboard light/dark, editor Porcelain/Dracula Playwright visual baseline
- 금지 카피·gradient/glass/glow/12px 초과 radius source policy Gate
- versioned production gzip asset budget과 CI browser report

로컬 완료 조건:

- frontend ESLint/TypeScript 오류 0, 30 files/104 Vitest tests 통과
- 11 Playwright tests: 4 viewport, light/dark axe, keyboard, mobile editor reflow, 4 visual snapshots 통과
- production source 191 files policy violation 0
- production build 2,159 modules와 JS/CSS/raw asset 예산 통과
- 실제 브라우저 1280 dark dashboard·390 dark editor 시각 QA 통과

운영 evidence 조건:

- CI macOS/Playwright Chromium의 baseline 재현 확인
- VoiceOver/NVDA 수동 screen reader 검증
- production traffic의 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1을 75 percentile에서 관찰

## 통합 개발 Roadmap

| Phase | 목표 | 주요 작업 | 완료 조건 |
| --- | --- | --- | --- |
| Phase 0 ✅ | 프로젝트 기반 구축 | Vite React TypeScript, Astryx, theme wrapper, router/app shell, semantic token, fixture test 기반 | 메인·운영 shell 렌더링, typecheck/lint/test/build와 1280/390px QA 통과 |
| Phase 0.1 ✅ | FSD·스타일링·테마 기반 재정렬 | `app/pages/widgets/features/entities/shared` migration, public API/import rule, Astryx→wrapper→semantic CSS 소유권, system/light/dark provider | FSD dependency test, 스타일 소유권 audit, 양 theme visual·contrast·persistence 통과 |
| Phase 1 ✅ | Domain·Fixture 구축 | YAML workflow/permission model, project/change/proposal/document/impact/review/evidence entity, guard와 selector | UI 없이 P0 승인·검증·활성화 상태 전이와 권한 반례 test 통과 |
| Phase 2 ◐ | Backend 기반·Render Preview | Python 3.12/FastAPI scaffold, settings, health, PostgreSQL, SQLAlchemy/Alembic, Project/Document read API, Git read adapter, root `render.yaml` | 코드·PostgreSQL·Blueprint schema 검증 완료; Render workspace sync와 preview smoke 대기 |
| Phase 3 ✅ | 메인·프로젝트 Dashboard | Truthound 구조 기반 main, project overview, attention queue, 승인·검증·정합성·최근 QA, HTTP/fixture adapter 전환 경계 | SCR-01~02, REQ-DASH-001~005, 38 tests와 4 breakpoint·양 theme browser QA 통과 |
| Phase 4 ✅ | 자연어 요청·분석 제안 | raw draft, 4단계 AnalysisJob, failure/retry, summary, criteria, confidence/unknown, role/screen/API/data/file/QA, fixture/HTTP contract | SCR-03~04, REQ-CHANGE-001~004, 45 tests와 3 breakpoint·양 theme browser QA 통과 |
| Phase 5 ✅ | Context Browser·문서 Editor | document list/detail, structured/raw view, CodeMirror 6 Markdown/YAML, Dracula/Porcelain, draft autosave, schema diagnostic, optimistic revision/409 recovery | SCR-05~06, backend 31 tests, frontend 52 tests, Markdown/YAML·IME·theme·409·keyboard browser QA 통과 |
| Phase 6 ✅ | 영향 분석 | request→role→document→contract→code→QA graph, accessible list, synchronized selection과 evidence path | SCR-07, REQ-IMPACT-*, 64 tests와 graph 없는 keyboard 동일 관계 탐색 통과 |
| Phase 7 ✅ | 승인·검증 | semantic/raw diff, review/RBAC/self-approval guard, 수정 요청·반려, automated/manual evidence, audit, completion gate | SCR-08, REQ-REVIEW-*, REQ-VERIFY-01~02, 74 frontend·38 backend tests와 forbidden transition·RBAC·audit 통과 |
| Phase 8 ✅ | Git 반영·Context 활성화 | approved proposal branch/commit/PR projection, revision lock, evidence commit SHA 연결, activation, Context version과 결과 화면 | SCR-09, REQ-VERIFY-003, frontend 81·backend 42 tests, sandbox Git E2E와 승인 없는 write/activation 차단 통과 |
| Phase 9 ◐ | 인증·운영·Production 배포 | OIDC PKCE, server session·CSRF·RBAC, shared rate limit, structured log, paid DB/Key Value Blueprint, GitHub quality gate, read-only smoke, rollback/PITR runbook | 로컬 security·schema·build·browser gate 완료; IdP/Render sync, production smoke와 rollback/PITR drill 대기 |
| Phase 10 ◐ | 품질 강화·Release Gate | 4개 breakpoint, accessibility/keyboard, loading/empty/error/permission/stale/offline/conflict, visual regression, 금지 카피·패턴, performance | 로컬 104 unit/integration·11 browser·policy/performance/build 통과; CI 재현·screen reader·field vitals evidence 대기 |

## 병행 원칙

- Phase 0.1 완료 전 Phase 1 이후 신규 feature를 확장하지 않는다.
- Phase 2 backend B0~B1은 Phase 1 domain contract가 안정되면 시작한다.
- Phase 3~4 frontend는 deterministic provider로 개발할 수 있지만 HTTP contract test를 유지한다.
- Phase 5 document edit는 backend draft/validation/optimistic revision API가 준비된 뒤 연결한다.
- Phase 7 검증과 Phase 8 Git write는 서버 RBAC·audit·revision gate를 우회할 수 없다.
- Production 자동 배포는 Blueprint에서 `checksPass`로 선언하며 실제 활성화는 Render workspace sync와 운영 승인 후 수행한다.

## Definition of Done

- `product/requirements-traceability.md`의 모든 P0 requirement가 테스트에 연결된다.
- `qa/test-matrix.md`의 P0가 통과한다.
- desktop/tablet/mobile 브라우저 시각 QA 증거가 있다.
- 제품 표면 금지어와 금지 시각 패턴이 없다.
