import { type PropsWithChildren } from "react";

import { ProjectRepositoryContext } from "./project-repository-context";

import type { ProjectRepository } from "../model/project-repository";


interface ProjectRepositoryProviderProps extends PropsWithChildren {
  repository: ProjectRepository;
}

export function ProjectRepositoryProvider({ children, repository }: ProjectRepositoryProviderProps) {
  return (
    <ProjectRepositoryContext.Provider value={repository}>
      {children}
    </ProjectRepositoryContext.Provider>
  );
}
