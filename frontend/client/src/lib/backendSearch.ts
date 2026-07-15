// Calls Nest to build AI vacation packages from the search form.
import type { QueryClient } from "@tanstack/react-query";
import { backendUrl } from "@/lib/backendUrl";

export interface SearchFormParams {
  destination: string;
  countryCode?: string;
  departureAirport: string;
  arrivalAirport: string;
  people: string;
  budget: string;
  startDate: string;
  endDate: string;
  rooms: string;
}

export interface VacationPackage {
  vacationId: string;
  destinationCity: string;
  totalCost: number;
  perPersonCost: number;
  comments: string;
  hotel: {
    id: string;
    name: string;
    nights: number;
    pricePerNight: number;
    totalHotelCost: number;
  };
  flight: {
    id: string;
    airline: string;
    from: string;
    to: string;
    totalFlightCost: number;
    pricePerPerson: number;
  };
  attractionsPlan: {
    totalAttractionCost: number;
    attractions: {
      id: string;
      name: string;
      pricePerPerson: number;
    }[];
  };
}

type VacationPackagesResponse = {
  vacationPackages?: Omit<VacationPackage, "vacationId">[];
};

const VACATION_PACKAGES_STORAGE_PREFIX = "vacation-packages:";
const SELECTED_PACKAGE_STORAGE_PREFIX = "selected-vacation-package:";

const COUNTRY_CODES: Record<string, string> = {
  france: "FR",
  japan: "JP",
  indonesia: "ID",
  usa: "US",
  "united states": "US",
  canada: "CA",
  greece: "GR",
  switzerland: "CH",
  peru: "PE",
  italy: "IT",
  uk: "GB",
  "united kingdom": "GB",
  uae: "AE",
  "united arab emirates": "AE",
  singapore: "SG",
  spain: "ES",
};

function extractAirportCode(airportLabel: string): string {
  if (!airportLabel) return "";
  return airportLabel.split(" - ")[0]?.trim() || airportLabel.trim();
}

function splitDestination(destination: string) {
  const [city = "", country = ""] = destination.split(",").map((part) => part.trim());
  return {
    city: city || destination.trim(),
    countryCode: COUNTRY_CODES[country.toLowerCase()] || "",
  };
}

export function getVacationPackageId(
  pkg: Partial<Pick<VacationPackage, "vacationId">>,
  index = 0,
) {
  return pkg.vacationId || `ai-package-${index + 1}`;
}

export function buildBackendSearchQuery(params: SearchFormParams): URLSearchParams {
  const query = new URLSearchParams();
  if (params.destination) {
    const { city, countryCode } = splitDestination(params.destination);
    query.set("city", city);
    const resolvedCountryCode = params.countryCode || countryCode;
    if (resolvedCountryCode) query.set("countryCode", resolvedCountryCode);
  }
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
  if (params.budget) query.set("budgetCad", params.budget);
  return query;
}

export function getBackendSearchQueryKey(params: SearchFormParams) {
  return ["backend-search", buildBackendSearchQuery(params).toString()] as const;
}

export function getVacationPackagesQueryKey(params: SearchFormParams) {
  return ["vacation-packages", buildBackendSearchQuery(params).toString()] as const;
}

function canUseSessionStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.sessionStorage);
  } catch {
    return false;
  }
}

function getVacationPackagesStorageKey(params: SearchFormParams) {
  return `${VACATION_PACKAGES_STORAGE_PREFIX}${buildBackendSearchQuery(params).toString()}`;
}

function getSelectedPackageStorageKey(params: SearchFormParams, packageId: string) {
  return `${SELECTED_PACKAGE_STORAGE_PREFIX}${buildBackendSearchQuery(params).toString()}:${packageId}`;
}

export function readStoredVacationPackages(params: SearchFormParams): VacationPackage[] | undefined {
  if (!canUseSessionStorage()) return undefined;

  try {
    const stored = window.sessionStorage.getItem(getVacationPackagesStorageKey(params));
    if (!stored) return undefined;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

// Preserve generated packages across /search -> /package navigation and browser refreshes.
export function writeStoredVacationPackages(params: SearchFormParams, packages: VacationPackage[]) {
  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.setItem(
      getVacationPackagesStorageKey(params),
      JSON.stringify(packages),
    );
  } catch {
    // Storage is a convenience cache; package rendering still works from React Query.
  }
}

export function readSelectedVacationPackage(
  params: SearchFormParams,
  packageId: string,
): VacationPackage | undefined {
  if (!canUseSessionStorage()) return undefined;

  try {
    const stored = window.sessionStorage.getItem(getSelectedPackageStorageKey(params, packageId));
    return stored ? (JSON.parse(stored) as VacationPackage) : undefined;
  } catch {
    return undefined;
  }
}

export function writeSelectedVacationPackage(
  params: SearchFormParams,
  packageId: string,
  pkg: VacationPackage,
) {
  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.setItem(
      getSelectedPackageStorageKey(params, packageId),
      JSON.stringify(pkg),
    );
  } catch {
    // Storage is a convenience cache; details can still refetch the package list.
  }
}

export function searchParamsFromUrl(urlParams: URLSearchParams): SearchFormParams {
  return {
    destination: urlParams.get("destination") || "",
    countryCode: urlParams.get("countryCode") || "",
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
  const qs = buildBackendSearchQuery(params).toString();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(backendUrl(`/api/search?${qs}`), {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Backend search failed (${response.status})`);
    }
    return response.json();
  } catch (error) {
    console.warn("Live search unavailable (is the Nest API running on port 8000?):", error);
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchVacationPackages(params: SearchFormParams): Promise<VacationPackage[]> {
  const query = buildBackendSearchQuery(params);
  const qs = query.toString();

  const scrapeResponse = await fetch(backendUrl(`/api/search?${qs}`));
  if (!scrapeResponse.ok) {
    throw new Error(`Scrape request failed (${scrapeResponse.status})`);
  }

  // Package generation is two-step: collect live scrape data, then ask the AI to shape bundles.
  const scrapedResponse = await scrapeResponse.json();
  const aiResponse = await fetch(backendUrl("/api/ai/vacation-packages"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scrapedResponse,
      query: Object.fromEntries(query.entries()),
    }),
  });

  if (!aiResponse.ok) {
    throw new Error(`AI package request failed (${aiResponse.status})`);
  }

  const result = (await aiResponse.json()) as VacationPackagesResponse;
  if (!Array.isArray(result.vacationPackages)) {
    throw new Error("AI response did not include vacationPackages.");
  }

  const packages = result.vacationPackages.map((pkg, index) => ({
    ...pkg,
    vacationId: `ai-package-${index + 1}`,
  }));

  writeStoredVacationPackages(params, packages);
  return packages;
}

/** Start package generation without blocking navigation to sign-in. */
export function startBackendSearch(queryClient: QueryClient, params: SearchFormParams) {
  const hasSearchCriteria = Boolean(
    params.destination || params.startDate || params.departureAirport || params.arrivalAirport,
  );
  if (!hasSearchCriteria) return;

  void queryClient.fetchQuery({
    queryKey: getVacationPackagesQueryKey(params),
    queryFn: () => fetchVacationPackages(params),
    staleTime: 1000 * 60 * 5,
    retry: false,
  }).catch((error) => {
    console.warn("Package generation prefetch failed:", error);
  });
}
