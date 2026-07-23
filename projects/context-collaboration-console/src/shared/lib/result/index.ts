export interface DomainError {
  code: string;
  title: string;
  detail: string;
  recovery?: {
    label: string;
    action: string;
  };
  traceId?: string;
}

export type DomainResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: DomainError };

export function domainSuccess<T>(value: T): DomainResult<T> {
  return { ok: true, value };
}

export function domainFailure(
  code: string,
  title: string,
  detail: string,
): DomainResult<never> {
  return { ok: false, error: { code, title, detail } };
}
