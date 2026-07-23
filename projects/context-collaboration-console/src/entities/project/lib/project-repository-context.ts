import { createContext } from "react";

import type { ProjectRepository } from "../model/project-repository";

export const ProjectRepositoryContext = createContext<ProjectRepository | null>(null);
