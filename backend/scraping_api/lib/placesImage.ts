import { GOOGLE_PLACES_TEXT_SEARCH_URL } from "./attractions";
import { getCuratedDestinationImage, HERO_IMAGE_URL } from "./curatedImages";
import {
  buildLocationSearchQueries,
  fetchWikimediaLocationImage,
  type LocationImageParams,
  type LocationImageType,
} from "./wikipediaImage";

export type PlacePhotoSearchParams = {
  query: string;
};

export function buildPlacePhotoSearchBody({ query }: PlacePhotoSearchParams) {
  return {
    textQuery: query,
    languageCode: "en",
    maxResultCount: 5,
  };
}

export function buildGooglePhotoUrl(
  photoName: string,
  apiKey: string,
  maxWidthPx = 1200,
) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${apiKey}`;
}

function buildGoogleTextQuery(params: LocationImageParams): string {
  const { name, country, type = "destination" } = params;
  const place = name.trim();
  const nation = country?.trim();

  if (type === "hero") {
    return "tropical beach Maldives scenic";
  }

  if (type === "attraction") {
    return nation ? `${place} ${nation} tourist attraction` : `${place} tourist attraction`;
  }

  if (place && nation) {
    return `${place} ${nation} famous landmark tourist destination`;
  }

  return `${place} famous landmark tourist destination`;
}

async function fetchGooglePlacePhotoUrl(
  params: LocationImageParams,
  apiKey: string,
  maxWidthPx = 1200,
): Promise<string | null> {
  const textQuery = buildGoogleTextQuery(params);
  if (!textQuery.trim()) return null;

  const res = await fetch(GOOGLE_PLACES_TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.photos,places.displayName",
    },
    body: JSON.stringify(buildPlacePhotoSearchBody({ query: textQuery })),
  });

  if (!res.ok) {
    console.error("Google Places image lookup failed:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const places = data?.places ?? [];

  for (const place of places) {
    const photoName = place?.photos?.[0]?.name;
    if (photoName) {
      return buildGooglePhotoUrl(photoName, apiKey, maxWidthPx);
    }
  }

  return null;
}

export async function fetchPlacePhotoUrl(
  params: LocationImageParams,
  apiKey?: string,
  maxWidthPx = 1200,
): Promise<{ imageUrl: string | null; source: string | null }> {
  const trimmedName = params.name?.trim();
  if (!trimmedName) {
    return { imageUrl: null, source: null };
  }

  if (params.type === "hero") {
    return { imageUrl: HERO_IMAGE_URL, source: "curated" };
  }

  const curated = getCuratedDestinationImage(trimmedName, params.country);
  if (curated) {
    return { imageUrl: curated, source: "curated" };
  }

  if (apiKey) {
    const googleImage = await fetchGooglePlacePhotoUrl(params, apiKey, maxWidthPx);
    if (googleImage) {
      return { imageUrl: googleImage, source: "google_places" };
    }
  }

  const wikimediaImage = await fetchWikimediaLocationImage(params);
  if (wikimediaImage) {
    return { imageUrl: wikimediaImage, source: "wikimedia" };
  }

  return { imageUrl: null, source: null };
}

export function resolveLocationImageParams(input: {
  query?: string;
  name?: string;
  country?: string;
  type?: LocationImageType;
}): LocationImageParams {
  if (input.name?.trim()) {
    return {
      name: input.name.trim(),
      country: input.country?.trim() || undefined,
      type: input.type ?? "destination",
    };
  }

  const query = input.query?.trim() ?? "";
  if (!query) {
    return { name: "", type: input.type ?? "destination" };
  }

  const parts = query.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      name: parts[0],
      country: parts.slice(1).join(", "),
      type: input.type ?? "destination",
    };
  }

  return { name: query, type: input.type ?? "destination" };
}

export { buildLocationSearchQueries, type LocationImageParams, type LocationImageType };
