# Phase 5 Context Browser·문서 Editor 영향 분석

- Change ID: `CR-2026-009`
- 상태: 구현·QA 완료

| 노드 | 예상 영향 |
| --- | --- |
| Backend | draft row/migration, validation service, mutation API, 409 conflict DTO, CORS POST |
| Domain | Document registry/detail/relation/draft/diagnostic/conflict 계약 |
| Adapter | fixture/HTTP list/detail/save/validate와 runtime parser |
| Shared UI | CodeMirror 6 React wrapper, language/theme compartments |
| Feature | local/backend autosave, validation, conflict recovery |
| Routes | Context list와 document workspace |
| QA | filter URL, Markdown/YAML, IME, theme state, diagnostic, 409 recovery |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| CodeMirror state remount로 한글 조합/undo 손실 | EditorView 1회 생성, compartment reconfigure transaction 사용 |
| Git 원본 overwrite | backend는 draft row만 저장하고 Git write API를 제공하지 않음 |
| stale revision의 silent overwrite | current Git revision 비교 후 409 conflict payload 반환 |
| YAML unsafe/oversize | safe parser, alias/tag 차단, document size limit |
| autosave race | debounce cancel, clientDraftId, content revision과 최신 request guard |

## 실제 영향과 증거

| 노드 | 실제 변경 |
| --- | --- |
| Backend | `document_drafts` migration, safe validator, draft/validate POST, 409 DTO |
| Domain | summary/detail/diagnostic/draft/conflict와 repository public API |
| Adapter | fixture/HTTP 동일 계약, runtime parsing, no fallback |
| Shared UI | EditorView 단일 lifecycle과 language/theme/editable/aria compartment |
| Feature | versioned local base source, 700ms autosave, sequence guard, recovery action |
| Routes | `/projects/:projectId/context`와 `context/:documentId` lazy route |
| QA | backend 31 passed, frontend 52 passed, browser Markdown/YAML/theme/keyboard 확인 |
