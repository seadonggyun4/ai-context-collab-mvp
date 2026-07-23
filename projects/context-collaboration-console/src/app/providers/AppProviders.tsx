import { LinkProvider } from "@astryxdesign/core/Link";
import { type PropsWithChildren } from "react";
import { BrowserRouter, Link as RouterLink } from "react-router-dom";

import { ActivationRepositoryProvider, createHttpActivationRepository, fixtureActivationRepository } from "@entities/activation";
import { AnalysisRepositoryProvider, createHttpAnalysisRepository, fixtureAnalysisRepository } from "@entities/analysis";
import { AuthProvider, createHttpAuthRepository, fixtureAuthRepository } from "@entities/auth";
import { createHttpDocumentRepository, DocumentRepositoryProvider, fixtureDocumentRepository } from "@entities/document";
import { createHttpImpactRepository, fixtureImpactRepository, ImpactRepositoryProvider } from "@entities/impact";
import { createHttpProjectRepository, fixtureProjectRepository, ProjectRepositoryProvider } from "@entities/project";
import { createHttpReviewWorkspaceRepository, fixtureReviewWorkspaceRepository, ReviewWorkspaceRepositoryProvider } from "@entities/review-workspace";
import { authenticatedFetch } from "@shared/api";
import { runtimeConfig } from "@shared/config";
import { ProductThemeProvider } from "@shared/lib/theme";

const projectRepository = runtimeConfig.dataSource === "http"
  ? createHttpProjectRepository({ apiBaseUrl: runtimeConfig.apiBaseUrl, fetcher: authenticatedFetch })
  : fixtureProjectRepository;
const analysisRepository = runtimeConfig.dataSource === "http"
  ? createHttpAnalysisRepository({ apiBaseUrl: runtimeConfig.apiBaseUrl, fetcher: authenticatedFetch })
  : fixtureAnalysisRepository;
const documentRepository = runtimeConfig.dataSource === "http"
  ? createHttpDocumentRepository({ apiBaseUrl: runtimeConfig.apiBaseUrl, fetcher: authenticatedFetch })
  : fixtureDocumentRepository;
const impactRepository = runtimeConfig.dataSource === "http"
  ? createHttpImpactRepository({ apiBaseUrl: runtimeConfig.apiBaseUrl, fetcher: authenticatedFetch })
  : fixtureImpactRepository;
const reviewWorkspaceRepository = runtimeConfig.dataSource === "http"
  ? createHttpReviewWorkspaceRepository({ apiBaseUrl: runtimeConfig.apiBaseUrl, fetcher: authenticatedFetch })
  : fixtureReviewWorkspaceRepository;
const activationRepository = runtimeConfig.dataSource === "http"
  ? createHttpActivationRepository({ apiBaseUrl: runtimeConfig.apiBaseUrl, fetcher: authenticatedFetch })
  : fixtureActivationRepository;
const authRepository = runtimeConfig.authRequired
  ? createHttpAuthRepository({ apiBaseUrl: runtimeConfig.apiBaseUrl, fetcher: authenticatedFetch })
  : fixtureAuthRepository;

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ProductThemeProvider>
      <AuthProvider repository={authRepository} required={runtimeConfig.authRequired}>
        <BrowserRouter>
          <LinkProvider component={RouterLink}>
            <ProjectRepositoryProvider repository={projectRepository}>
              <AnalysisRepositoryProvider repository={analysisRepository}>
                <DocumentRepositoryProvider repository={documentRepository}>
                  <ImpactRepositoryProvider repository={impactRepository}>
                    <ReviewWorkspaceRepositoryProvider repository={reviewWorkspaceRepository}>
                      <ActivationRepositoryProvider repository={activationRepository}>
                        {children}
                      </ActivationRepositoryProvider>
                    </ReviewWorkspaceRepositoryProvider>
                  </ImpactRepositoryProvider>
                </DocumentRepositoryProvider>
              </AnalysisRepositoryProvider>
            </ProjectRepositoryProvider>
          </LinkProvider>
        </BrowserRouter>
      </AuthProvider>
    </ProductThemeProvider>
  );
}
