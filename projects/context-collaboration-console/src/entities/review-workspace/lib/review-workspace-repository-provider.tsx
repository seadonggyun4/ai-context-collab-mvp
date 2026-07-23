import { type PropsWithChildren } from "react";

import { ReviewWorkspaceRepositoryContext } from "./review-workspace-repository-context";

import type { ReviewWorkspaceRepository } from "../model/review-workspace-repository";

export function ReviewWorkspaceRepositoryProvider({ children, repository }: PropsWithChildren<{ repository: ReviewWorkspaceRepository }>) {
  return <ReviewWorkspaceRepositoryContext.Provider value={repository}>{children}</ReviewWorkspaceRepositoryContext.Provider>;
}
