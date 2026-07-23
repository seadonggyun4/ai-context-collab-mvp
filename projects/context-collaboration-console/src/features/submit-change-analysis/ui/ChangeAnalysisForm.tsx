import { type FormEvent, useEffect, useMemo, useState } from "react";

import { ANALYSIS_STAGES, createAnalysisIdempotencyKey, useAnalysisRepository } from "@entities/analysis";
import { ProductButton } from "@shared/ui/product-button";

import "./change-analysis-form.css";

import type { AnalysisJob } from "@entities/analysis";
import type { DomainError } from "@shared/lib/result";

const stageCopy = {
  CHECKING_CONTEXT: ["Context 확인", "활성 기준과 요청 시점의 문맥을 고정합니다."],
  STRUCTURING_REQUEST: ["요청 구조화", "요약, 수용 기준과 불확실성을 분리합니다."],
  DISCOVERING_IMPACTS: ["영향 탐색", "역할·화면·API·데이터·파일 관계를 찾습니다."],
  GENERATING_VERIFICATION: ["검증안 생성", "자동 검사와 수동 확인 시나리오를 제안합니다."],
} as const;

const exampleRequest = "모니터링 목록에 ‘최근 정상 수신 시간’을 추가하고, 24시간 이상 수신되지 않으면 경고로 보여주세요.";

interface ChangeAnalysisFormProps {
  contextSnapshot: string;
  projectId: string;
  projectName: string;
  onComplete: (changeId: string) => void;
}

export function ChangeAnalysisForm({ contextSnapshot, onComplete, projectId, projectName }: ChangeAnalysisFormProps) {
  const repository = useAnalysisRepository();
  const draftKey = `context-flow:change-draft:v1:${projectId}`;
  const [rawRequest, setRawRequest] = useState(() => readDraft(draftKey));
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [formError, setFormError] = useState<DomainError | null>(null);
  const isRunning = job?.status === "QUEUED" || job?.status === "RUNNING";
  const input = useMemo(() => ({ projectId, contextSnapshot, rawRequest }), [contextSnapshot, projectId, rawRequest]);

  useEffect(() => {
    try { sessionStorage.setItem(draftKey, rawRequest); }
    catch { /* private storage failure must not block the form */ }
  }, [draftKey, rawRequest]);

  useEffect(() => {
    if (!isRunning || job === null) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void repository.getAnalysisJob(job.id, controller.signal).then((result) => {
        if (controller.signal.aborted) return;
        if (!result.ok) setFormError(result.error);
        else if (result.value === null) setFormError({ code: "ANALYSIS_JOB_NOT_FOUND", title: "분석 작업을 찾을 수 없습니다", detail: "원문을 유지한 채 분석을 다시 시작해 주세요." });
        else setJob(result.value);
      });
    }, 260);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [isRunning, job, repository]);

  useEffect(() => {
    if (job?.status === "COMPLETED" && job.changeId !== null) onComplete(job.changeId);
  }, [job, onComplete]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isRunning) return;
    setFormError(null);
    const result = await repository.startAnalysis(input, createAnalysisIdempotencyKey(input));
    if (!result.ok) setFormError(result.error);
    else setJob(result.value);
  }

  async function handleRetry() {
    if (job === null) return;
    setFormError(null);
    const result = await repository.retryAnalysis(job.id, `${job.id}:retry:${job.attempt + 1}`);
    if (!result.ok) setFormError(result.error);
    else setJob(result.value);
  }

  return (
    <div className="analysis-workspace">
      <header className="analysis-heading">
        <div><p>변경 요청 등록</p><h1>어떤 변경이 필요한지 설명해 주세요.</h1><span>{projectName} · Context v{contextSnapshot}</span></div>
      </header>

      <div className="analysis-layout">
        <form className="analysis-form" onSubmit={(event) => { void handleSubmit(event); }}>
          <label htmlFor="change-request-input">변경 요청 원문</label>
          <textarea
            id="change-request-input"
            value={rawRequest}
            onChange={(event) => setRawRequest(event.target.value)}
            placeholder="변경할 대상, 기대 결과와 중요한 조건을 자연어로 작성하세요."
            rows={10}
            disabled={isRunning}
          />
          <div className="analysis-form__meta"><span>{rawRequest.length.toLocaleString()}자</span><span>입력한 원문은 분석 결과와 함께 그대로 보존됩니다.</span></div>
          <div className="analysis-example">
            <span>예시</span><p>{exampleRequest}</p>
            <button type="button" disabled={isRunning} onClick={() => setRawRequest(exampleRequest)}>이 예시 사용</button>
          </div>
          {formError !== null ? <div className="analysis-error" role="alert"><strong>{formError.title}</strong><p>{formError.detail}</p></div> : null}
          <div className="analysis-form__actions">
            <ProductButton label={isRunning ? "분석 진행 중" : "영향 분석 요청"} type="submit" variant="primary" isDisabled={isRunning || rawRequest.trim().length === 0} />
            <span>분석 결과를 검토하기 전에는 문서나 코드에 반영되지 않습니다.</span>
          </div>
        </form>

        <aside className="analysis-progress" aria-labelledby="analysis-progress-title" aria-live="polite">
          <div><h2 id="analysis-progress-title">분석 과정</h2>{job !== null ? <span>시도 {job.attempt}</span> : null}</div>
          <ol>
            {ANALYSIS_STAGES.map((stage, index) => {
              const currentIndex = job === null ? -1 : ANALYSIS_STAGES.indexOf(job.stage);
              const state = job?.status === "COMPLETED" || (job !== null && index < currentIndex) ? "complete" : job !== null && index === currentIndex ? job.status.toLowerCase() : "pending";
              return <li key={stage} data-state={state}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{stageCopy[stage][0]}</strong><p>{stageCopy[stage][1]}</p></div></li>;
            })}
          </ol>
          {job?.status === "FAILED" ? <div className="analysis-retry" role="alert"><strong>{job.error?.title}</strong><p>{job.error?.detail}</p><ProductButton label="분석 다시 시도" variant="secondary" onClick={() => { void handleRetry(); }} /></div> : null}
          {job === null ? <p className="analysis-progress__empty">요청을 제출하면 고정된 Context를 기준으로 영향 탐색을 시작합니다.</p> : null}
        </aside>
      </div>
    </div>
  );
}

function readDraft(key: string): string {
  try { return sessionStorage.getItem(key) ?? ""; }
  catch { return ""; }
}
