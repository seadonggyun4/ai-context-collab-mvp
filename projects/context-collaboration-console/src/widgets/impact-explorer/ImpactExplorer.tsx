import { type KeyboardEvent } from "react";

import { selectDirectionalImpactNode, selectImpactNode } from "@entities/impact";
import { useImpactExplorer } from "@features/explore-impact";

import "./impact-explorer.css";

import type { ImpactGraph, ImpactKind, ImpactSelection } from "@entities/impact";

interface ImpactExplorerProps {
  graph: ImpactGraph;
  selection: ImpactSelection;
  onSelect: (id: string) => void;
}

interface Point { x: number; y: number }

const CANVAS_WIDTH = 1180;
const CANVAS_HEIGHT = 630;
const NODE_WIDTH = 166;
const NODE_HEIGHT = 76;

const kindLabels: Record<ImpactKind, string> = {
  REQUEST: "요청",
  PLANNING: "기획 역할",
  PUBLISHING: "퍼블리싱 역할",
  DOCUMENT: "기준 문서",
  API_CONTRACT: "계약",
  DATA: "데이터",
  COMPONENT: "컴포넌트",
  CODE: "코드",
  QA: "QA",
};

const statusLabels = { AFFECTED: "변경 영향", UNCHANGED: "변경 없음", UNKNOWN: "확인 필요" } as const;
const changeLabels = { ADD: "추가", UPDATE: "수정", VERIFY: "검증", NONE: "변경 없음", UNKNOWN: "미확정" } as const;
const relationLabels = { DERIVES: "파생", IMPACTS: "영향", IMPLEMENTS: "구현", VERIFIES: "검증" } as const;
const depthLabels = ["요청", "역할", "문서", "계약", "코드", "QA"] as const;

function layout(graph: ImpactGraph): Map<string, Point> {
  const positions = new Map<string, Point>();
  for (let depth = 0; depth <= 5; depth += 1) {
    const layer = graph.nodes.filter((node) => node.depth === depth);
    const gap = CANVAS_HEIGHT / (layer.length + 1);
    layer.forEach((node, index) => {
      positions.set(node.id, { x: 26 + depth * 196, y: gap * (index + 1) - NODE_HEIGHT / 2 });
    });
  }
  return positions;
}

function edgePath(from: Point, to: Point) {
  const startX = from.x + NODE_WIDTH;
  const startY = from.y + NODE_HEIGHT / 2;
  const endX = to.x;
  const endY = to.y + NODE_HEIGHT / 2;
  const control = Math.max((endX - startX) * .48, 42);
  return `M ${startX} ${startY} C ${startX + control} ${startY}, ${endX - control} ${endY}, ${endX} ${endY}`;
}

export function ImpactExplorer({ graph, selection, onSelect }: ImpactExplorerProps) {
  const explorer = useImpactExplorer(graph, selection);
  const positions = layout(graph);

  function moveNode(nodeId: string, direction: "UP" | "DOWN" | "LEFT" | "RIGHT") {
    const target = selectDirectionalImpactNode(graph, nodeId, direction);
    if (target === null) return;
    onSelect(target.id);
    window.requestAnimationFrame(() => document.getElementById(`impact-graph-node-${target.id}`)?.focus());
  }

  function onNodeKeyDown(nodeId: string, event: KeyboardEvent<HTMLButtonElement>) {
    const direction = event.key === "ArrowUp" ? "UP" : event.key === "ArrowDown" ? "DOWN" : event.key === "ArrowLeft" ? "LEFT" : event.key === "ArrowRight" ? "RIGHT" : null;
    if (direction === null) return;
    event.preventDefault();
    moveNode(nodeId, direction);
  }

  return (
    <div className="impact-explorer">
      <header className="impact-heading">
        <div>
          <p>{graph.changeId} · 영향 분석</p>
          <h1>{graph.nodes.find((node) => node.id === graph.entryNodeId)?.label}</h1>
          <span>요청에서 QA까지 이어지는 변경 근거와 책임 경로를 확인합니다.</span>
        </div>
        <dl>
          <div><dt>분석 revision</dt><dd>r{graph.revision}</dd></div>
          <div><dt>영향 노드</dt><dd>{graph.nodes.length}</dd></div>
          <div><dt>관계</dt><dd>{graph.edges.length}</dd></div>
        </dl>
      </header>

      <div className="impact-view-switch" role="group" aria-label="영향 분석 보기 방식">
        <button type="button" aria-pressed={explorer.viewMode === "GRAPH"} onClick={() => explorer.setViewMode("GRAPH")}>그래프 보기</button>
        <button type="button" aria-pressed={explorer.viewMode === "LIST"} onClick={() => explorer.setViewMode("LIST")}>목록 집중</button>
      </div>

      <div className={`impact-primary-layout is-${explorer.viewMode.toLowerCase()}`}>
        {explorer.viewMode === "GRAPH" && (
          <section className="impact-canvas-section" aria-labelledby="impact-graph-title">
            <header><h2 id="impact-graph-title">영향 관계 그래프</h2><p>좌우 방향키로 관계를, 위아래 방향키로 같은 단계의 노드를 이동합니다.</p></header>
            <div className="impact-canvas-scroll">
              <div className="impact-canvas" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                <div className="impact-layer-labels" aria-hidden="true">
                  {depthLabels.map((label, depth) => <span key={label} style={{ left: 26 + depth * 196 }}>{label}</span>)}
                </div>
                <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} aria-label="요청부터 QA까지의 영향 관계">
                  {graph.edges.map((edge) => {
                    const from = positions.get(edge.from);
                    const to = positions.get(edge.to);
                    if (from === undefined || to === undefined) return null;
                    const selected = selection.type === "EDGE" && selection.id === edge.id;
                    const path = edgePath(from, to);
                    return <g key={edge.id} role="button" tabIndex={0} aria-label={`${relationLabels[edge.relation]} 관계: ${edge.rationale}`} aria-pressed={selected} onClick={() => onSelect(edge.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(edge.id); } }}>
                      <path className="impact-edge-hit" d={path} />
                      <path className={selected ? "impact-edge is-selected" : "impact-edge"} d={path} markerEnd="url(#impact-arrow)" />
                    </g>;
                  })}
                  <defs><marker id="impact-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" /></marker></defs>
                </svg>
                {graph.nodes.map((node) => {
                  const point = positions.get(node.id);
                  if (point === undefined) return null;
                  const selected = selection.type === "NODE" && selection.id === node.id;
                  return <button
                    type="button"
                    id={`impact-graph-node-${node.id}`}
                    key={node.id}
                    className={`impact-node kind-${node.kind.toLowerCase()}${selected ? " is-selected" : ""}`}
                    style={{ left: point.x, top: point.y, width: NODE_WIDTH, minHeight: NODE_HEIGHT }}
                    aria-pressed={selected}
                    onClick={() => onSelect(node.id)}
                    onKeyDown={(event) => onNodeKeyDown(node.id, event)}
                  >
                    <span>{kindLabels[node.kind]}</span><strong>{node.label}</strong><small>{statusLabels[node.status]}</small>
                  </button>;
                })}
              </div>
            </div>
          </section>
        )}
        {explorer.viewMode === "LIST" && <ImpactNodeIndex graph={graph} selection={selection} onSelect={onSelect} />}
        <ImpactDetail graph={graph} explorer={explorer} />
      </div>

      <ImpactRelationList graph={graph} selection={selection} onSelect={onSelect} />
    </div>
  );
}

function ImpactNodeIndex({ graph, selection, onSelect }: ImpactExplorerProps) {
  return <section className="impact-node-index" aria-labelledby="impact-node-index-title">
    <header><h2 id="impact-node-index-title">영향 노드 목록</h2><p>그래프 없이도 단계 순서대로 모든 노드를 탐색합니다.</p></header>
    <ol>{graph.nodes.map((node) => <li key={node.id}><button type="button" aria-pressed={selection.type === "NODE" && selection.id === node.id} onClick={() => onSelect(node.id)}><span>{node.depth}. {kindLabels[node.kind]}</span><strong>{node.label}</strong><small>{statusLabels[node.status]} · {changeLabels[node.changeType]}</small></button></li>)}</ol>
  </section>;
}

function ImpactRelationList({ graph, selection, onSelect }: ImpactExplorerProps) {
  return <section className="impact-relation-list" aria-labelledby="impact-relation-list-title">
    <header><h2 id="impact-relation-list-title">접근 가능한 관계 목록</h2><p>그래프의 {graph.edges.length}개 관계와 동일하며 선택은 상세 패널에 즉시 반영됩니다.</p></header>
    <ol>{graph.edges.map((edge) => {
      const from = selectImpactNode(graph, edge.from);
      const to = selectImpactNode(graph, edge.to);
      return <li key={edge.id}><button type="button" aria-pressed={selection.type === "EDGE" && selection.id === edge.id} onClick={() => onSelect(edge.id)}><span>{from?.label}</span><strong>{relationLabels[edge.relation]}</strong><span>{to?.label}</span><small>{edge.rationale}</small></button></li>;
    })}</ol>
  </section>;
}

function ImpactDetail({ graph, explorer }: { graph: ImpactGraph; explorer: ReturnType<typeof useImpactExplorer> }) {
  const selectedNode = explorer.selectedNode;
  const selectedEdge = explorer.selectedEdge;
  const path = explorer.evidencePath;
  const target = selectedNode ?? (selectedEdge === null ? null : selectImpactNode(graph, selectedEdge.to));
  return <aside className="impact-detail" aria-labelledby="impact-detail-title" aria-live="polite">
    <header><p>{selectedEdge === null ? target === null ? "선택" : kindLabels[target.kind] : "관계 근거"}</p><h2 id="impact-detail-title">{selectedEdge?.rationale ?? target?.label}</h2></header>
    {selectedEdge !== null && <dl className="impact-edge-detail"><div><dt>관계</dt><dd>{relationLabels[selectedEdge.relation]}</dd></div><div><dt>출발</dt><dd>{selectImpactNode(graph, selectedEdge.from)?.label}</dd></div><div><dt>도착</dt><dd>{selectImpactNode(graph, selectedEdge.to)?.label}</dd></div></dl>}
    {target !== null && <><p className="impact-rationale">{selectedEdge?.rationale ?? target.rationale}</p><dl className="impact-node-detail"><div><dt>상태</dt><dd>{statusLabels[target.status]}</dd></div><div><dt>변경</dt><dd>{changeLabels[target.changeType]}</dd></div><div><dt>담당</dt><dd>{target.owner}</dd></div><div><dt>원본 경로</dt><dd><code>{target.sourcePath ?? "변경 요청 원문"}</code></dd></div></dl></>}
    <section className="impact-evidence-path"><h3>영향 근거 경로</h3>{path === null ? <p>요청에서 연결된 경로를 찾지 못했습니다.</p> : <ol>{path.nodeIds.map((nodeId, index) => { const node = selectImpactNode(graph, nodeId); const edgeId = path.edgeIds[index]; const edge = edgeId === undefined ? null : graph.edges.find((item) => item.id === edgeId) ?? null; return <li key={nodeId}><span>{node?.label}</span>{edge !== null && <small>{relationLabels[edge.relation]} · {edge.rationale}</small>}</li>; })}</ol>}</section>
  </aside>;
}
