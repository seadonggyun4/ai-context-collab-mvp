import { useContext } from "react";

import { ActivationRepositoryContext } from "./activation-repository-context";
export function useActivationRepository() { const repository = useContext(ActivationRepositoryContext); if (repository === null) throw new Error("ActivationRepositoryProvider is missing"); return repository; }
