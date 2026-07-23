import type { DomainError } from "@shared/lib/result";

export type DataStateKind = "loading" | "empty" | "error" | "permission" | "stale" | "offline" | "conflict";

const classificationRules: ReadonlyArray<readonly [DataStateKind, RegExp]> = [
  ["conflict", /CONFLICT|LOCKED/iu],
  ["permission", /PERMISSION|FORBIDDEN|UNAUTHORIZED|AUTH_/iu],
  ["stale", /STALE|OUTDATED/iu],
  ["offline", /NETWORK|OFFLINE|UNAVAILABLE|TIMEOUT|CONNECTION/iu],
];

export function classifyDataState(error: DomainError): DataStateKind {
  return classificationRules.find(([, pattern]) => pattern.test(error.code))?.[0] ?? "error";
}
