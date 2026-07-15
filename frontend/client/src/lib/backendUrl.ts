const configuredBase = (import.meta.env.VITE_BACKEND_URL as string | undefined)
  ?.trim()
  .replace(/\/$/, "");

const configuredForProduction =
  configuredBase && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase)
    ? configuredBase
    : "";

const backendBase = import.meta.env.PROD
  ? configuredForProduction
  : configuredBase || "http://localhost:8000";

export function backendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendBase}${normalizedPath}`;
}
