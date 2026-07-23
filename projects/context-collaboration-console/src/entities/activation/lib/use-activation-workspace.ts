import { useEffect, useState } from "react";

import { useActivationRepository } from "./use-activation-repository";

import type { ActivationWorkspace } from "../model/activation";
import type { DomainError } from "@shared/lib/result";
type State = { status: "loading" } | { status: "not-found" } | { status: "error"; error: DomainError } | { status: "ready"; workspace: ActivationWorkspace };
export function useActivationWorkspace(projectId: string, changeId: string) { const repository = useActivationRepository(); const [state, setState] = useState<State>({ status: "loading" }); useEffect(() => { const controller = new AbortController(); setState({ status: "loading" }); void repository.getWorkspace(projectId, changeId, controller.signal).then((result) => { if (!result.ok) setState({ status: "error", error: result.error }); else if (result.value === null) setState({ status: "not-found" }); else setState({ status: "ready", workspace: result.value }); }); return () => controller.abort(); }, [repository, projectId, changeId]); return { state, setState }; }
