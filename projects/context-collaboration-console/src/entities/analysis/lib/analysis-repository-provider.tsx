import { type PropsWithChildren } from "react";

import { AnalysisRepositoryContext } from "./analysis-repository-context";

import type { AnalysisRepository } from "../model/analysis-repository";

interface AnalysisRepositoryProviderProps extends PropsWithChildren {
  repository: AnalysisRepository;
}

export function AnalysisRepositoryProvider({ children, repository }: AnalysisRepositoryProviderProps) {
  return <AnalysisRepositoryContext.Provider value={repository}>{children}</AnalysisRepositoryContext.Provider>;
}
