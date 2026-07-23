import { createContext } from "react";

import type { ActivationRepository } from "../model/activation-repository";
export const ActivationRepositoryContext = createContext<ActivationRepository | null>(null);
