# DF-006 Context Browser and Document Editor

## 구현 경계

- Backend: domain/application/infrastructure/API DTO를 분리하고 draft persistence와 validator를 port 뒤에 둔다.
- `entities/document`: registry/detail/relation/draft/diagnostic/conflict와 repository.
- `shared/ui/code-editor`: CodeMirror lifecycle, language/theme/diagnostic mapping만 소유한다.
- `features/edit-document`: local draft, debounce save, validate, conflict resolution.
- `widgets/document-workspace`: metadata, editor, preview, relation, diagnostic composition.
- pages는 query/route와 shell만 조합한다.

## API

- `GET /api/v1/projects/{projectId}/documents`
- `GET /api/v1/documents/{documentId}`
- `POST /api/v1/documents/{documentId}/drafts`
- `POST /api/v1/documents/{documentId}/validate`
- draft: content, baseRevision, clientDraftId
- conflict: baseRevision, currentRevision, baseSource, currentSource, draftSource

## 완료 증거

- Change: `CR-2026-009`
- Impact: `impact-analysis/2026-07-22_phase-5-context-browser-editor.md`
- QA: `roles/qa/feature/05_phase-5/01_context_browser_editor_qa.md`

## 구현 결과

### Backend B2

- `DocumentCommands`가 Git current revision과 `baseRevision`을 비교하고 stale 요청을 `DocumentConflict`로 반환한다.
- `SqlAlchemyDocumentDraftRepository`는 Git 원본과 별도의 `document_drafts` row에 working draft를 저장한다.
- `SafeDocumentValidator`는 HTML 실행이 없는 commonmark parser와 safe YAML parser를 사용하고 line/column diagnostic을 반환한다.
- Alembic head는 `20260722_0002`, CORS는 allowlist origin에서 document `POST`와 `Idempotency-Key`만 추가 허용한다.

### Frontend FSD

```text
pages/context-browser,document-detail
  → widgets/document-browser,document-workspace
    → features/edit-document
      → entities/document
        → shared/ui/code-editor, shared/lib
```

- `DocumentRepository`가 fixture/HTTP list·get·saveDraft·validateDraft를 통일한다.
- `CodeEditor`는 Document entity를 알지 않는 neutral diagnostic/format port다.
- EditorView는 mount당 한 번 생성하고 theme, language, editable, accessibility를 Compartment transaction으로 변경한다.
- local draft는 content/baseRevision/baseSource/clientDraftId를 versioned key로 저장한다.
- autosave는 700ms debounce와 request sequence로 늦게 도착한 응답이 최신 상태를 덮지 못하게 한다.
- document detail route를 lazy load해 editor dependency를 일반 운영 화면과 분리한다.

## 검증 결과

- backend: Ruff, strict mypy, pytest `31 passed`, PostgreSQL-only `1 skipped`
- frontend: typecheck, ESLint, FSD test, Vitest `16 files / 52 tests`, production build
- browser: Markdown/YAML, Dracula/Porcelain, 한글 문자열 보존, autosave status, YAML line diagnostic, `Meta+F` search
