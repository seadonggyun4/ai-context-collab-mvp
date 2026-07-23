import { type PropsWithChildren } from "react";

import { ImpactRepositoryContext } from "./impact-repository-context";

import type { ImpactRepository } from "../model/impact-repository";

interface ImpactRepositoryProviderProps extends PropsWithChildren {
  repository: ImpactRepository;
}

export function ImpactRepositoryProvider({ children, repository }: ImpactRepositoryProviderProps) {
  return <ImpactRepositoryContext.Provider value={repository}>{children}</ImpactRepositoryContext.Provider>;
}
