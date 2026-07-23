import { useContext } from "react";

import { ProjectRepositoryContext } from "./project-repository-context";

export function useProjectRepository() {
  const repository = useContext(ProjectRepositoryContext);

  if (repository === null) {
    throw new Error("ProjectRepositoryProvider is missing from the application tree.");
  }

  return repository;
}
