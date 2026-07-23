import { EmptyState } from "@astryxdesign/core/EmptyState";

import { ProductButton } from "@shared/ui/product-button";

import { classifyDataState, type DataStateKind } from "./data-state-model";

import type { DomainError } from "@shared/lib/result";

import "./data-state.css";

export interface DataStateProps {
  kind: DataStateKind;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function DataState({ action, description, kind, title }: DataStateProps) {
  const isLoading = kind === "loading";
  const isUrgent = kind === "error" || kind === "permission" || kind === "conflict";

  return (
    <main
      className="data-state-page"
      data-state={kind}
      aria-busy={isLoading || undefined}
      aria-live={isUrgent ? "assertive" : "polite"}
      role={isUrgent ? "alert" : "status"}
    >
      <EmptyState
        headingLevel={1}
        title={title}
        description={description}
        actions={action ? <ProductButton label={action.label} href={action.href} variant="primary" /> : undefined}
      />
    </main>
  );
}

export function DataErrorState({ action, error }: { action?: DataStateProps["action"]; error: DomainError }) {
  return <DataState kind={classifyDataState(error)} title={error.title} description={error.detail} {...(action === undefined ? {} : { action })} />;
}
