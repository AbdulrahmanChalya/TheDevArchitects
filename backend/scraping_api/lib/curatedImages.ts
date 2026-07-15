import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type CuratedDestination = {
  id: string;
  name: string;
  country: string;
  imageUrl?: string;
};

const catalog = loadDestinationCatalog();

function loadDestinationCatalog(): CuratedDestination[] {
  const candidates = [
    path.resolve(process.cwd(), "destinations.json"),
    path.resolve(process.cwd(), "../destinations.json"),
  ];

  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, "utf8")) as CuratedDestination[];
    }
  }

  console.warn("destinations.json not found for curated destination images.");
  return [];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function getCuratedDestinationImage(
  name: string,
  country?: string,
): string | null {
  const place = normalize(name);
  const nation = country ? normalize(country) : null;

  const exact = catalog.find(
    (entry) =>
      normalize(entry.name) === place &&
      (!nation || normalize(entry.country) === nation),
  );
  if (exact?.imageUrl) return exact.imageUrl;

  const byName = catalog.find((entry) => normalize(entry.name) === place);
  if (byName?.imageUrl) return byName.imageUrl;

  if (nation) {
    const byCountry = catalog.find((entry) => normalize(entry.country) === nation);
    if (byCountry?.imageUrl) return byCountry.imageUrl;
  }

  return null;
}

export const HERO_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Beach%2C_pier_and_cloud._Eriyadu%2C_Maldives.jpg/1280px-Beach%2C_pier_and_cloud._Eriyadu%2C_Maldives.jpg";
