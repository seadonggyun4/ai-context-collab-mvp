import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { ApplicationErrorBoundary } from "@app/router/ApplicationErrorBoundary";
import { ChangeProposalPage } from "@pages/change-proposal";
import { MainEntryPage } from "@pages/landing";
import { NewChangeRequestPage } from "@pages/new-change-request";
import { NotFoundPage } from "@pages/not-found";
import { ProjectOverviewPage } from "@pages/project-overview";

const ContextBrowserPage = lazy(() => import("@pages/context-browser").then((module) => ({ default: module.ContextBrowserPage })));
const DocumentDetailPage = lazy(() => import("@pages/document-detail").then((module) => ({ default: module.DocumentDetailPage })));
const ImpactAnalysisPage = lazy(() => import("@pages/impact-analysis").then((module) => ({ default: module.ImpactAnalysisPage })));
const ReviewVerificationPage = lazy(() => import("@pages/review-verification").then((module) => ({ default: module.ReviewVerificationPage })));
const ContextActivationPage = lazy(() => import("@pages/context-activation").then((module) => ({ default: module.ContextActivationPage })));

export function AppRouter() {
  return (
    <ApplicationErrorBoundary>
      <Suspense fallback={<div className="route-loading" role="status" aria-busy="true" aria-live="polite">화면을 불러오고 있습니다</div>}>
        <Routes>
          <Route path="/" element={<MainEntryPage />} />
          <Route path="/projects/:projectId" element={<ProjectOverviewPage />} />
          <Route path="/projects/:projectId/changes/new" element={<NewChangeRequestPage />} />
          <Route path="/projects/:projectId/changes/:changeId" element={<ChangeProposalPage />} />
          <Route path="/projects/:projectId/changes/:changeId/impact" element={<ImpactAnalysisPage />} />
          <Route path="/projects/:projectId/changes/:changeId/review" element={<ReviewVerificationPage />} />
          <Route path="/projects/:projectId/changes/:changeId/activation" element={<ContextActivationPage />} />
          <Route path="/projects/:projectId/context" element={<ContextBrowserPage />} />
          <Route path="/projects/:projectId/context/:documentId" element={<DocumentDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ApplicationErrorBoundary>
  );
}
