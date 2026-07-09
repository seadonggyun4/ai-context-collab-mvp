import { type RefObject, useEffect, useRef } from "react";
import {
  getActionEntryKey,
  shouldFocusActionForm
} from "@features/monitoring/services/actionEntryContext";
import type { ActionEntryContext } from "@features/monitoring/types/shell";

interface UseActionEntryFocusParams {
  context?: ActionEntryContext | null;
  selectedIssueId?: string | null;
  targetRef: RefObject<HTMLElement | null>;
}

export function useActionEntryFocus({
  context,
  selectedIssueId,
  targetRef
}: UseActionEntryFocusParams) {
  const lastFocusedKeyRef = useRef<string | null>(null);
  const shouldFocus = shouldFocusActionForm(context, selectedIssueId);
  const focusKey = context ? getActionEntryKey(context) : null;

  useEffect(() => {
    if (!shouldFocus || !focusKey || lastFocusedKeyRef.current === focusKey) {
      return;
    }

    const target = targetRef.current;
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    target.focus({ preventScroll: true });
    lastFocusedKeyRef.current = focusKey;
  }, [focusKey, shouldFocus, targetRef]);

  useEffect(() => {
    if (focusKey) {
      return;
    }

    lastFocusedKeyRef.current = null;
  }, [focusKey]);

  return {
    shouldFocus
  };
}
