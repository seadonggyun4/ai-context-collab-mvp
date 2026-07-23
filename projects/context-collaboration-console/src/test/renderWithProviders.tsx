import { render } from "@testing-library/react";
import { type PropsWithChildren, type ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

import { ActivationRepositoryProvider, createFixtureActivationRepository } from "@entities/activation";
import { AnalysisRepositoryProvider, createFixtureAnalysisRepository } from "@entities/analysis";
import { createFixtureDocumentRepository, DocumentRepositoryProvider } from "@entities/document";
import { createFixtureImpactRepository, ImpactRepositoryProvider } from "@entities/impact";
import { fixtureProjectRepository, ProjectRepositoryProvider } from "@entities/project";
import { createFixtureReviewWorkspaceRepository, ReviewWorkspaceRepositoryProvider } from "@entities/review-workspace";
import { ProductThemeProvider } from "@shared/lib/theme";

export function renderWithProviders(element: ReactElement, initialEntries = ["/"]) {
  const analysisRepository = createFixtureAnalysisRepository();
  const documentRepository = createFixtureDocumentRepository();
  const impactRepository = createFixtureImpactRepository();
  const reviewWorkspaceRepository = createFixtureReviewWorkspaceRepository();
  function Wrapper({ children }: PropsWithChildren) {
    return <ProductThemeProvider><MemoryRouter initialEntries={initialEntries}><ProjectRepositoryProvider repository={fixtureProjectRepository}><AnalysisRepositoryProvider repository={analysisRepository}><DocumentRepositoryProvider repository={documentRepository}><ImpactRepositoryProvider repository={impactRepository}><ReviewWorkspaceRepositoryProvider repository={reviewWorkspaceRepository}><ActivationRepositoryProvider repository={createFixtureActivationRepository()}>{children}</ActivationRepositoryProvider></ReviewWorkspaceRepositoryProvider></ImpactRepositoryProvider></DocumentRepositoryProvider></AnalysisRepositoryProvider></ProjectRepositoryProvider></MemoryRouter></ProductThemeProvider>;
  }
  return render(element, { wrapper: Wrapper });
}
