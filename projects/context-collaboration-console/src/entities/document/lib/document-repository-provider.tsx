import { type PropsWithChildren } from "react";

import { DocumentRepositoryContext } from "./document-repository-context";

import type { DocumentRepository } from "../model/document-repository";

interface DocumentRepositoryProviderProps extends PropsWithChildren {
  repository: DocumentRepository;
}

export function DocumentRepositoryProvider({ children, repository }: DocumentRepositoryProviderProps) {
  return <DocumentRepositoryContext.Provider value={repository}>{children}</DocumentRepositoryContext.Provider>;
}
