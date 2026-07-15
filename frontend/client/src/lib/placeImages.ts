import { backendUrl } from "@/lib/backendUrl";

export const HERO_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Beach%2C_pier_and_cloud._Eriyadu%2C_Maldives.jpg/1280px-Beach%2C_pier_and_cloud._Eriyadu%2C_Maldives.jpg";

export type LocationImageType = "destination" | "attraction" | "hero";

export interface LocationImageRequest {
  name: string;
  country?: string;
  type?: LocationImageType;
}

export function buildPlaceQuery(name: string, country?: string): string {
  const trimmedName = name.trim();
  const trimmedCountry = country?.trim();
  if (trimmedName && trimmedCountry) return `${trimmedName}, ${trimmedCountry}`;
  return trimmedName || trimmedCountry || "";
}

export function parseDestinationLabel(label: string): LocationImageRequest {
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      name: parts[0],
      country: parts.slice(1).join(", "),
      type: "destination",
    };
  }
  return { name: label.trim(), type: "destination" };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPlaceholderGradient(query: string): string {
  const hue = hashString(query || "travel") % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:hsl(${hue},55%,45%)"/><stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360},65%,35%)"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export interface PlaceImageResponse {
  name: string;
  country: string | null;
  type: LocationImageType;
  imageUrl: string | null;
  source: string | null;
}

export function getLocationImageQueryKey(params: LocationImageRequest) {
  return ["place-image", params.name, params.country ?? "", params.type ?? "destination"] as const;
}

export async function fetchPlaceImage(
  params: LocationImageRequest,
): Promise<PlaceImageResponse> {
  const name = params.name.trim();
  if (!name) {
    return {
      name: "",
      country: null,
      type: params.type ?? "destination",
      imageUrl: null,
      source: null,
    };
  }

  const query = new URLSearchParams({ name });
  if (params.country) query.set("country", params.country);
  if (params.type) query.set("type", params.type);

  try {
    const response = await fetch(backendUrl(`/api/images/place?${query}`));
    if (!response.ok) {
      return {
        name,
        country: params.country ?? null,
        type: params.type ?? "destination",
        imageUrl: null,
        source: null,
      };
    }
    return response.json();
  } catch {
    return {
      name,
      country: params.country ?? null,
      type: params.type ?? "destination",
      imageUrl: null,
      source: null,
    };
  }
}

export function resolveImageUrl(
  label: string,
  imageUrl: string | null | undefined,
): string {
  return imageUrl || getPlaceholderGradient(label);
}
