# QF-006 Context Browser and Document Editor QA

## P0

- REQ-CONTEXT-001~003 목록·filter URL·structured/raw·relation
- REQ-EDIT-001 CodeMirror Markdown/YAML/history/search/draft
- REQ-EDIT-002 Dracula/Porcelain theme 전환 state 보존
- REQ-EDIT-003 marker/list line·severity·message 일치
- REQ-EDIT-004 409 base/current/draft 복구와 원문 보존
- 한글 IME composition 중 autosave/validation 미실행, compositionend 이후 보존
- backend migration, validator, draft idempotency, conflict API contract
- frontend FSD/type/lint/test/build와 browser responsive/theme/keyboard

## 실행 결과

| 항목 | 결과 | 증거 |
| --- | --- | --- |
| REQ-CONTEXT-001 | 통과 | 목록 5건, title/path 검색, role/format URL query, empty reset |
| REQ-CONTEXT-002 | 통과 | structured 기본, raw read-only, metadata/path/revision 표시 |
| REQ-CONTEXT-003 | 통과 | relation count와 직접 관계 이유/대상 표시 |
| REQ-EDIT-001 | 통과 | Markdown/YAML, line/fold/history/search/replace, local/backend draft |
| REQ-EDIT-002 | 통과 | Dracula→Porcelain 전환 후 한글 content와 saved 상태 유지 |
| REQ-EDIT-003 | 통과 | YAML `2:18` error가 lint marker와 inspector에 동일 표시 |
| REQ-EDIT-004 | 통과 | automated stale revision에서 409, 3-way 비교와 두 복구 action |
| 한글 IME | 통과 | composition 중 `clean`, compositionend 후 save/conflict transition |
| Backend | 통과 | Ruff/mypy, 31 passed, migration/API/validator/schema contract |
| Frontend | 통과 | type/lint, 16 files/52 tests, production build |
| 반응형 | 통과 | desktop table, mobile definition layout, stacked editor inspector |
| 키보드 | 통과 | semantic tabs/buttons, CodeMirror `Meta+F` search UI 진입 |

## 제한과 후속

- 실제 PostgreSQL service가 필요한 integration 1건은 `TEST_DATABASE_URL` 부재로 skip했다.
- `workflow-policy.yaml` 외 문서 유형별 JSON Schema는 각 문서 계약이 확정되는 순서대로 path-scoped registry에 추가한다.
- 브라우저 자동 충돌 시나리오는 fixture repository를 주입한 route test로 검증하고, 실제 브라우저에서는 3-way UI 이외 Markdown/YAML/theme/diagnostic 흐름을 확인했다.
