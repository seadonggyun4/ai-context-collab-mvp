# CR-2026-009 Phase 5 Context Browser·문서 Editor

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-009` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `ARCHIVIST` |
| 요청일 | `2026-07-22` |
| 완료일 | `2026-07-23` |
| 요청자 | 사용자 |
| 위험도 | 높음 |
| 승인 상태 | `APPROVED` |

## 요청 원문

> Phase 5 Context Browser·문서 Editor를 문서시스템에 따라 확장성 높고 유지보수성 높게 추상화해서 개발 진행해줘.

## Active Context snapshot

- 화면: `SCR-05`, `SCR-06`
- 요구사항: `REQ-CONTEXT-001`~`003`, `REQ-EDIT-001`~`004`
- backend: `BE-DOC-01`~`04`, B2 Draft/validation/optimistic revision
- editor: CodeMirror 6, Markdown/YAML, Dracula/Porcelain, IME/history/theme compartment

## 결정

- CodeMirror lifecycle과 theme/language compartment는 `shared/ui/code-editor`에 격리한다.
- Document domain은 목록·상세·관계·draft·diagnostic·conflict를 소유하고 feature가 autosave/validate/recovery를 조정한다.
- Git 원본은 read-only이며 저장은 base revision 기반 draft API로만 수행한다.
- backend B2를 함께 구현해 draft persistence, Markdown/YAML validation, 409 최신 원본 반환을 서버에서 강제한다.
- fixture와 HTTP adapter는 동일한 repository contract를 구현하고 오류를 자동 fallback하지 않는다.
- 브라우저 local draft에는 편집 시작 원문과 revision을 함께 보존해 server가 과거 blob을 반환하지 못해도 base/current/draft를 복구한다.

## 수용 기준

| ID | 조건 | 결과 |
| --- | --- | --- |
| AC-01 | 역할·상태·형식 search/filter와 URL query가 동기화된다 | 통과 |
| AC-02 | 문서 상세가 metadata, structured/raw, 상위·파생 관계와 revision을 표시한다 | 통과 |
| AC-03 | CodeMirror 6에서 Markdown/YAML, history, search, line number, diagnostic을 제공한다 | 통과 |
| AC-04 | dark Dracula/light Porcelain 전환에서 content·cursor·history가 보존된다 | 통과 |
| AC-05 | versioned local draft와 backend debounce autosave 상태를 구분한다 | 통과 |
| AC-06 | Markdown/YAML diagnostic의 line/message가 editor marker와 목록에서 일치한다 | 통과 |
| AC-07 | stale base revision은 409와 base/current/draft 비교·복구를 제공하고 원문을 잃지 않는다 | 통과 |
| AC-08 | 한글 IME, 1280/768/390px, keyboard, backend/frontend 전체 자동 검증이 통과한다 | 통과 |

## 구현 결과

- `entities/document`에 목록·상세·draft·validation·conflict 모델과 fixture/HTTP repository를 추가했다.
- SCR-05 문서 목록은 검색, 역할, 형식 URL query와 접근 가능한 table/mobile definition layout을 제공한다.
- SCR-06은 구조화 보기, read-only 원본, 편집 workspace를 같은 document route에서 전환한다.
- CodeMirror EditorView는 한 번만 생성하고 language/theme/editable/aria compartment만 transaction으로 재설정한다.
- Markdown/YAML language, line number, fold, history, search/replace, lint gutter와 source diagnostic을 연결했다.
- 700ms autosave, versioned local draft, 최신 request sequence guard, 상태 표시와 수동 검증/저장을 구현했다.
- 409 시 편집 시작 원본·최신 원본·현재 초안을 비교하고 최신 기준으로 초안 유지 또는 최신 원본 교체를 선택한다.
- FastAPI B2에 SQLAlchemy draft row, Alembic `20260722_0002`, safe Markdown/YAML validator, save/validate API와 CORS mutation 계약을 추가했다.
- 문서 상세 route를 lazy loading해 CodeMirror가 초기 대시보드 route bundle에 포함되지 않게 했다.

## QA 결과

| 검증 | 결과 |
| --- | --- |
| Backend Ruff / mypy | 오류 0, strict type 통과 |
| Backend pytest | 31 passed, PostgreSQL 환경 의존 1 skipped |
| Alembic | single head `20260722_0002` 계약 통과 |
| Frontend TypeScript / ESLint | 오류·경고 0 |
| Frontend Vitest | 16 files, 52 tests 통과 |
| FSD architecture | 역방향·private import 0건 |
| HTTP contract | list/detail/draft/validate, Idempotency-Key, diagnostic, 409 반례 통과 |
| IME / conflict | composition 중 save 보류, compositionend 이후 409 복구 test 통과 |
| Production build | 성공, 2084 modules transformed, document route 분리 |
| Browser | desktop/mobile list, Markdown/YAML, Dracula/Porcelain, 한글 보존, autosave, diagnostic, keyboard search 확인 |

## 계획과 실제 변경 차이

- 서버가 허용 Git ref 밖의 과거 commit blob을 읽지 않는 보안 경계를 유지하기 위해 과거 base source는 local versioned draft에도 저장한다.
- `workflow-policy.yaml`은 path-scoped JSON Schema registry를 적용했다. 다른 문서 type schema는 계약이 확정되는 순서대로 같은 registry 경계에 추가한다.
- 실제 PostgreSQL 통합 테스트는 `TEST_DATABASE_URL`이 없는 실행 환경에서 skip되었고 migration single-head/API/repository 단위 계약으로 대체했다.
- CodeMirror vendor chunk는 document detail route에서만 지연 로드된다. 추가 vendor 분할은 성능 budget을 확정하는 Phase 10에서 측정 후 적용한다.

## Self-Review

- Git 원본을 수정하는 endpoint가 없고 draft row만 저장한다.
- UI는 repository port만 사용하며 fixture/HTTP 오류를 서로 fallback하지 않는다.
- CodeMirror shared adapter가 entity를 import하지 않아 FSD 하향 의존성을 지킨다.
- IME 조합 중 onChange/autosave를 호출하지 않고 compositionend의 완성 문자열만 전달한다.
- light/dark 전환은 EditorView를 remount하지 않으므로 selection과 history를 보존한다.
- 409 복구 전에는 current/draft 어느 쪽도 자동 선택하거나 원본을 덮어쓰지 않는다.

## 완료 판정

AC-01~AC-08과 연결된 자동·브라우저 검증이 통과했다. Phase 5를 완료하고 archive한다.
