# Document Editor Experience

## 기술 선택

Markdown/YAML 편집기는 CodeMirror 6를 사용한다. textarea나 contenteditable 직접 구현은 사용하지 않는다. transaction/state, language extension, lint gutter, search, history와 theme extension을 제품 wrapper 안에 구성한다.

```text
shared/ui/code-editor/              # CodeMirror React lifecycle wrapper
entities/document/                  # content, revision, diagnostic
features/edit-document/             # draft, validate, save, conflict
widgets/document-workspace/         # editor, metadata, preview
pages/document-detail/              # route composition
```

## 편집 경험

- 상단: path, type, base revision, 저장 상태, validation summary
- 중심: line number, fold, search, bracket matching, active line, syntax highlight
- 보조: diagnostic list, structured preview, relation/policy context
- 행동: `초안 저장`, `검증`, `변경 제안 생성`, `변경 취소`
- desktop은 resizable editor/preview split, mobile은 tabs
- Markdown/YAML filename 기반 mode, undo/redo, find/replace, line wrapping
- debounced local draft와 backend autosave를 구분
- dirty, saving, saved, invalid, offline, conflict 상태 제공
- `baseRevision` 충돌 시 before/current/draft 3-way 비교

## Theme

| Application mode | Editor theme | 기준 |
| --- | --- | --- |
| Dark | Dracula | background `#282A36`, foreground `#F8F8F2`, selection `#44475A` 기반 |
| Light | Porcelain | white surface, cool-gray gutter, deep-teal focus/selection의 제품 소유 theme |

Porcelain은 제품 semantic token으로 정의하며 외부 light theme를 복제하지 않는다. editor chrome, gutter, tooltip, autocomplete, search, cursor, selection, diagnostics와 syntax token 전체를 정의한다. Application theme 전환 시 document/history/cursor를 재생성하지 않고 CodeMirror compartment로 theme extension만 교체한다.

## 접근성·안전·성능

- 문서명과 형식을 포함한 accessible label, editor 탈출 shortcut 안내
- diagnostic은 gutter 색과 함께 severity, line, message 목록 제공
- 키보드로 검색, diagnostic 이동, 저장, 검증, preview 전환
- Markdown preview sanitize, raw HTML 기본 비활성
- YAML unsafe tag/alias bomb, oversized document, path traversal 차단
- editor route lazy-load, 1MB 이하 기본 지원, 500KB 이상 large-document 안내
- parse/server validation debounce·cancel, theme 전환 시 editor remount 금지

## QA

- Dracula/Porcelain visual regression
- Markdown/YAML highlight와 diagnostic 일치
- 한글 IME, undo/redo, find/replace
- theme 전환 후 cursor/history/unsaved content 보존
- 409 revision conflict와 draft recovery
- keyboard focus와 screen reader label

## 공식 참고

- [CodeMirror Reference Manual](https://codemirror.net/docs/ref/)
- [CodeMirror Styling and Themes](https://codemirror.net/examples/styling/)
