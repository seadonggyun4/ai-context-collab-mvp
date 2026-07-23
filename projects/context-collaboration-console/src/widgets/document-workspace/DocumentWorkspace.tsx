import { parseDocument } from "yaml";

import { useDocumentEditor, type EditorSaveStatus } from "@features/edit-document";
import { CodeEditor } from "@shared/ui/code-editor";

import "./document-workspace.css";

import type { DocumentConflict, DocumentDetail } from "@entities/document";

interface DocumentWorkspaceProps {
  document: DocumentDetail;
}

const statusLabels: Record<EditorSaveStatus, string> = {
  clean: "원본과 동일",
  dirty: "저장 대기",
  saving: "초안 저장 중",
  saved: "초안 저장됨",
  invalid: "수정 필요",
  offline: "브라우저에 보존됨",
  conflict: "원본 변경 확인 필요",
};

function ConflictRecovery({
  conflict,
  onKeepDraft,
  onReplace,
}: {
  conflict: DocumentConflict;
  onKeepDraft: () => void;
  onReplace: () => void;
}) {
  return (
    <section className="conflict-recovery" aria-labelledby="conflict-title">
      <header>
        <div>
          <p>Revision conflict · 409</p>
          <h2 id="conflict-title">{conflict.title}</h2>
          <span>{conflict.detail}</span>
        </div>
        <div className="conflict-actions">
          <button type="button" onClick={onReplace}>최신 원본으로 교체</button>
          <button type="button" className="is-primary" onClick={onKeepDraft}>최신 원본 기준으로 초안 유지</button>
        </div>
      </header>
      <div className="conflict-columns">
        <article><h3>편집 시작 원본</h3><small>{conflict.baseRevision.slice(0, 8)}</small><pre>{conflict.baseSource || "서버에 이전 원문이 없어 revision만 표시합니다."}</pre></article>
        <article><h3>최신 원본</h3><small>{conflict.currentRevision.slice(0, 8)}</small><pre>{conflict.currentSource}</pre></article>
        <article><h3>현재 초안</h3><small>브라우저 보존본</small><pre>{conflict.draftSource}</pre></article>
      </div>
    </section>
  );
}

export function DocumentWorkspace({ document }: DocumentWorkspaceProps) {
  const editor = useDocumentEditor(document);

  return (
    <section className="document-workspace" aria-labelledby="editor-title">
      <header className="editor-toolbar">
        <div>
          <h2 id="editor-title">문서 편집</h2>
          <p>초안은 자동 저장되며 검증을 통과해도 활성 원본은 직접 변경되지 않습니다.</p>
        </div>
        <div className="editor-toolbar__actions">
          <span className={`save-status is-${editor.status}`} role="status">{statusLabels[editor.status]}</span>
          <button type="button" onClick={() => void editor.validate()}>문법 검증</button>
          <button type="button" className="is-primary" onClick={() => void editor.save()} disabled={editor.status === "saving"}>지금 저장</button>
        </div>
      </header>

      {editor.error !== null && <div className="editor-notice is-error"><strong>{editor.error.title}</strong><span>{editor.error.detail}</span></div>}
      {editor.conflict !== null && <ConflictRecovery conflict={editor.conflict} onKeepDraft={editor.keepDraftOnLatest} onReplace={editor.replaceWithLatest} />}

      <div className="editor-layout">
        <div>
          <CodeEditor
            ariaLabel={`${document.title} ${document.format} 편집기`}
            value={editor.content}
            format={document.format}
            diagnostics={editor.diagnostics}
            onChange={editor.updateContent}
          />
        </div>
        <aside className="editor-inspector" aria-label="문서 검사 결과">
          <section>
            <h3>검사 결과</h3>
            {editor.diagnostics.length === 0 ? <p className="diagnostic-empty">발견된 문법 문제가 없습니다.</p> : (
              <ul className="diagnostic-list">
                {editor.diagnostics.map((diagnostic) => (
                  <li key={`${diagnostic.code}-${diagnostic.from.line}-${diagnostic.from.column}`} data-severity={diagnostic.severity}>
                    <strong>{diagnostic.severity}</strong>
                    <span>{diagnostic.message}</span>
                    <small>{diagnostic.from.line}:{diagnostic.from.column} · {diagnostic.code}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h3>저장 기준</h3>
            <dl>
              <div><dt>Base revision</dt><dd>{editor.baseRevision.slice(0, 8)}</dd></div>
              <div><dt>형식</dt><dd>{document.format}</dd></div>
              <div><dt>초안 범위</dt><dd>현재 사용자</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}

export function StructuredDocumentView({ document }: DocumentWorkspaceProps) {
  const yamlValue = document.format === "YAML" ? parseDocument(document.source).toJS() as unknown : null;
  return (
    <div className="structured-document">
      <section>
        <h2>문서 메타데이터</h2>
        <dl className="metadata-grid">
          <div><dt>상태</dt><dd>{document.metadata.status}</dd></div>
          <div><dt>버전</dt><dd>{document.metadata.version}</dd></div>
          <div><dt>문서 유형</dt><dd>{document.metadata.documentType}</dd></div>
          <div><dt>승인자</dt><dd>{document.metadata.approvedBy ?? "승인 정보 없음"}</dd></div>
          <div><dt>시행일</dt><dd>{document.metadata.effectiveAt ?? "시행일 미지정"}</dd></div>
          <div><dt>Revision</dt><dd>{document.revision.slice(0, 12)}</dd></div>
        </dl>
      </section>
      <section>
        <h2>구조화 내용</h2>
        {document.format === "YAML" ? <pre className="structured-source">{JSON.stringify(yamlValue, null, 2)}</pre> : (
          <div className="markdown-outline">
            {document.source.split("\n").filter((line) => line.trim() !== "").map((line, index) => {
              if (line.startsWith("# ")) return <h1 key={index}>{line.slice(2)}</h1>;
              if (line.startsWith("## ")) return <h2 key={index}>{line.slice(3)}</h2>;
              if (line.startsWith("- ")) return <p className="outline-item" key={index}>— {line.slice(2)}</p>;
              return <p key={index}>{line}</p>;
            })}
          </div>
        )}
      </section>
      <section>
        <h2>연결 관계</h2>
        {document.relations.length === 0 ? <p className="relation-empty">등록된 직접 관계가 없습니다.</p> : (
          <ul className="relation-list">{document.relations.map((relation) => <li key={`${relation.fromDocumentId}-${relation.toDocumentId}`}><strong>{relation.relationType}</strong><span>{relation.reason}</span><small>{relation.toDocumentId}</small></li>)}</ul>
        )}
      </section>
    </div>
  );
}

export function RawDocumentView({ document }: DocumentWorkspaceProps) {
  return <CodeEditor ariaLabel={`${document.title} 원본 읽기 전용`} value={document.source} format={document.format} diagnostics={[]} onChange={() => undefined} readOnly />;
}
