import { useContext } from "react";

import { AnalysisRepositoryContext } from "./analysis-repository-context";

export function useAnalysisRepository() {
  const repository = useContext(AnalysisRepositoryContext);
  if (repository === null) throw new Error("AnalysisRepositoryProvider is missing from the application tree.");
  return repository;
}
