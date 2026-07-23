import { createContext } from "react";

import type { ImpactRepository } from "../model/impact-repository";

export const ImpactRepositoryContext = createContext<ImpactRepository | null>(null);
