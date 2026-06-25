const BASE_URL = "https://api.liteapi.travel/v3.0";

export async function liteApiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const apiKey = process.env.LITEAPI_KEY;

  if (!apiKey) {
    throw new Error("Missing LITEAPI_KEY");
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      ...(options?.headers || {}),
    },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `LiteAPI failed with status ${res.status}`);
  }

  return text ? JSON.parse(text) : ({} as T);
}