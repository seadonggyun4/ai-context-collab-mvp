import { createContext } from "react";

import type { DocumentRepository } from "../model/document-repository";

export const DocumentRepositoryContext = createContext<DocumentRepository | null>(null);
