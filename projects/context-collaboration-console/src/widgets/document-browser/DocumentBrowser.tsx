import { Link, useSearchParams } from "react-router-dom";

import { routes } from "@shared/config";

import "./document-browser.css";

import type { DocumentRole, DocumentSummary } from "@entities/document";

interface DocumentBrowserProps {
  projectId: string;
  documents: DocumentSummary[];
}

const roleLabels: Record<DocumentRole, string> = {
  ORGANIZATION: "공용 기준",
  PLANNING: "기획",
  PUBLISHING: "퍼블리싱",
  DEVELOPMENT: "개발",
  QA: "QA",
};

function formatDate(value: string) {
  if (value === "Git HEAD") return value;
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function DocumentBrowser({ projectId, documents }: DocumentBrowserProps) {
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const role = params.get("role") ?? "ALL";
  const format = params.get("format") ?? "ALL";

  const filtered = documents.filter((document) => {
    const query = search.trim().toLocaleLowerCase("ko-KR");
    const matchesQuery = query === "" || `${document.title} ${document.path}`.toLocaleLowerCase("ko-KR").includes(query);
    return matchesQuery && (role === "ALL" || document.role === role) && (format === "ALL" || document.format === format);
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value === "" || value === "ALL") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  return (
    <section className="document-browser" aria-labelledby="document-browser-title">
      <header className="document-browser__heading">
        <div>
          <p>Context Browser</p>
          <h1 id="document-browser-title">프로젝트 기준 문서</h1>
          <span>원본 경로와 revision을 유지한 채 역할별 기준을 탐색합니다.</span>
        </div>
        <strong>{filtered.length} / {documents.length} 문서</strong>
      </header>

      <div className="document-filters" role="search" aria-label="문서 필터">
        <label className="document-search">
          <span>문서 검색</span>
          <input value={search} onChange={(event) => updateParam("q", event.target.value)} placeholder="제목 또는 경로 검색" />
        </label>
        <label>
          <span>역할</span>
          <select value={role} onChange={(event) => updateParam("role", event.target.value)}>
            <option value="ALL">전체 역할</option>
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>형식</span>
          <select value={format} onChange={(event) => updateParam("format", event.target.value)}>
            <option value="ALL">전체 형식</option>
            <option value="MARKDOWN">Markdown</option>
            <option value="YAML">YAML</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="document-browser__empty">
          <h2>조건에 맞는 문서가 없습니다</h2>
          <p>검색어나 역할·형식 필터를 조정해 주세요.</p>
          <button type="button" onClick={() => setParams({}, { replace: true })}>필터 초기화</button>
        </div>
      ) : (
        <div className="document-table-wrap">
          <table className="document-table">
            <thead><tr><th>문서</th><th>역할</th><th>상태·버전</th><th>담당</th><th>최근 갱신</th><th>관계</th></tr></thead>
            <tbody>
              {filtered.map((document) => (
                <tr key={document.id}>
                  <td data-label="문서">
                    <Link to={routes.document(projectId, document.id)}>{document.title}</Link>
                    <small>{document.path}</small>
                  </td>
                  <td data-label="역할">{roleLabels[document.role]}</td>
                  <td data-label="상태·버전"><span className="document-status">{document.status}</span><small>v{document.version}</small></td>
                  <td data-label="담당">{document.owner}</td>
                  <td data-label="최근 갱신">{formatDate(document.updatedAt)}</td>
                  <td data-label="관계">{document.relationCount}개</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
