import { useContext } from "react";

import { ImpactRepositoryContext } from "./impact-repository-context";

export function useImpactRepository() {
  const repository = useContext(ImpactRepositoryContext);
  if (repository === null) throw new Error("ImpactRepositoryProvider is missing");
  return repository;
}
