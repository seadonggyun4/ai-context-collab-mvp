import { useContext } from "react";

import { DocumentRepositoryContext } from "./document-repository-context";

export function useDocumentRepository() {
  const repository = useContext(DocumentRepositoryContext);
  if (repository === null) throw new Error("DocumentRepositoryProvider is missing");
  return repository;
}
