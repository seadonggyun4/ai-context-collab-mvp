import { createContext } from "react";

import type { ReviewWorkspaceRepository } from "../model/review-workspace-repository";

export const ReviewWorkspaceRepositoryContext = createContext<ReviewWorkspaceRepository | null>(null);
