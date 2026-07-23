import { ActivationRepositoryContext } from "./activation-repository-context";

import type { ActivationRepository } from "../model/activation-repository";
import type { PropsWithChildren } from "react";
export function ActivationRepositoryProvider({ repository, children }: PropsWithChildren<{ repository: ActivationRepository }>) { return <ActivationRepositoryContext.Provider value={repository}>{children}</ActivationRepositoryContext.Provider>; }
