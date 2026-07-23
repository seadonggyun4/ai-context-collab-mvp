import { createContext } from "react";

import type { AnalysisRepository } from "../model/analysis-repository";

export const AnalysisRepositoryContext = createContext<AnalysisRepository | null>(null);
