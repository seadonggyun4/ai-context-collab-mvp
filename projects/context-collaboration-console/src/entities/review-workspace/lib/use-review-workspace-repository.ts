import { useContext } from "react";

import { ReviewWorkspaceRepositoryContext } from "./review-workspace-repository-context";

export function useReviewWorkspaceRepository() {
  const repository = useContext(ReviewWorkspaceRepositoryContext);
  if (repository === null) throw new Error("ReviewWorkspaceRepositoryProvider is missing");
  return repository;
}
