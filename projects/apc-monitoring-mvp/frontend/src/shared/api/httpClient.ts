import type { ApiErrorResponse } from "@shared/types/monitoring";
import { getCurrentUserRole } from "@shared/auth/currentUserRole";

export class ApiClientError extends Error {
  readonly status: number;
  readonly payload?: ApiErrorResponse;

  constructor(status: number, message: string, payload?: ApiErrorResponse) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest<TResponse>(
  input: string,
  init?: RequestInit
): Promise<TResponse> {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      "X-User-Role": getCurrentUserRole(),
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return (await response.json()) as TResponse;
}

export function withQuery(
  endpoint: string,
  query: object
) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (
      typeof value !== "object" &&
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      params.set(key, String(value));
    }
  });

  const serialized = params.toString();
  return serialized ? `${endpoint}?${serialized}` : endpoint;
}

async function createApiError(response: Response) {
  try {
    const body = (await response.json()) as { detail?: ApiErrorResponse | string };
    const payload = typeof body.detail === "object" ? body.detail : undefined;
    const message = payload?.message ?? String(body.detail ?? response.statusText);
    return new ApiClientError(response.status, message, payload);
  } catch {
    return new ApiClientError(response.status, response.statusText);
  }
}
