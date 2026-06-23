// Calls Nest GET /api/search while the user signs in (fire-and-forget from SearchBar).
import type { QueryClient } from "@tanstack/react-query";

export interface SearchFormParams {
  destination: string;
  departureAirport: string;
  arrivalAirport: string;
  people: string;
  budget: string;
  startDate: string;
  endDate: string;
  rooms: string;
}

function extractAirportCode(airportLabel: string): string {
  if (!airportLabel) return "";
  return airportLabel.split(" - ")[0]?.trim() || airportLabel.trim();
}

export function buildBackendSearchQuery(params: SearchFormParams): URLSearchParams {
  const query = new URLSearchParams();
  if (params.destination) query.set("city", params.destination);
  if (params.departureAirport) {
    query.set("originAirport", extractAirportCode(params.departureAirport));
  }
  if (params.arrivalAirport) {
    query.set("destinationAirport", extractAirportCode(params.arrivalAirport));
  }
  if (params.people) query.set("people", params.people);
  if (params.rooms) query.set("rooms", params.rooms);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  return query;
}

export function getBackendSearchQueryKey(params: SearchFormParams) {
  return ["backend-search", buildBackendSearchQuery(params).toString()] as const;
}

export function searchParamsFromUrl(urlParams: URLSearchParams): SearchFormParams {
  return {
    destination: urlParams.get("destination") || "",
    departureAirport: urlParams.get("departureAirport") || "",
    arrivalAirport: urlParams.get("arrivalAirport") || "",
    people: urlParams.get("people") || "",
    budget: urlParams.get("budget") || "",
    startDate: urlParams.get("startDate") || "",
    endDate: urlParams.get("endDate") || "",
    rooms: urlParams.get("rooms") || "",
  };
}

export async function fetchBackendSearch(params: SearchFormParams) {
  const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const qs = buildBackendSearchQuery(params).toString();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${base}/api/search?${qs}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Backend search failed (${response.status})`);
    }
    return response.json();
  } catch (error) {
    // Live scraping is optional — static JSON packages still power search results.
    console.warn("Live search unavailable (is the Nest API running on port 8000?):", error);
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

/** Start backend search without blocking navigation to sign-in. */
export function startBackendSearch(queryClient: QueryClient, params: SearchFormParams) {
  const hasSearchCriteria = Boolean(
    params.destination || params.startDate || params.departureAirport || params.arrivalAirport,
  );
  if (!hasSearchCriteria) return;

  void queryClient.fetchQuery({
    queryKey: getBackendSearchQueryKey(params),
    queryFn: () => fetchBackendSearch(params),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
