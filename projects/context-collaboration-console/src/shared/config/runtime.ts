export type DataSource = "fixture" | "http";

const environment: unknown = import.meta.env;

function envString(key: string): string | undefined {
  if (typeof environment !== "object" || environment === null) return undefined;
  const value = (environment as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function readDataSource(value: string | undefined): DataSource {
  if (value === undefined || value === "" || value === "fixture") return "fixture";
  if (value === "http") return "http";
  throw new Error(`Unsupported VITE_DATA_SOURCE: ${value}`);
}

export const runtimeConfig = Object.freeze({
  dataSource: readDataSource(envString("VITE_DATA_SOURCE")),
  apiBaseUrl: envString("VITE_API_BASE_URL") ?? "http://127.0.0.1:8000",
});
