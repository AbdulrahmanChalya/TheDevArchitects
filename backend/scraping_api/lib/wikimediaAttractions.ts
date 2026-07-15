import {
  fetchWikimediaLocationImage,
  type LocationImageParams,
} from "./wikipediaImage";

export type WikimediaAttraction = {
  id: string;
  name: string | null;
  ratingScore: number | null;
  ratingText: string | null;
  reviewCount: number | null;
  distance: null;
  duration: null;
  price: null;
  priceText: null;
  image: string | null;
  link: null;
  address: string | null;
};

const USER_AGENT = "GetawayHub/1.0 (travel-app; location-images)";

async function wikiSearchTitles(searchQuery: string, limit = 8): Promise<string[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srsearch: searchQuery,
    srlimit: String(limit),
  });

  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) return [];

  const data = await response.json();
  return (data?.query?.search ?? [])
    .map((item: { title?: string }) => item.title)
    .filter(Boolean);
}

function cleanAttractionTitle(title: string, city: string): string {
  return title
    .replace(new RegExp(`\\(${city}[^)]*\\)`, "i"), "")
    .replace(/\s+/g, " ")
    .trim();
}

function isUsefulAttractionTitle(title: string): boolean {
  const lower = title.toLowerCase();
  if (lower.startsWith("list of")) return false;
  if (lower.startsWith("category:")) return false;
  if (lower === "tourist attraction") return false;
  if (lower === "tourism") return false;
  if (lower.startsWith("tourism in ")) return false;
  if (lower.includes("disambiguation")) return false;
  return title.trim().length > 2;
}

export async function fetchWikimediaCityAttractions(
  city: string,
  country?: string,
  limit = 8,
): Promise<WikimediaAttraction[]> {
  const place = city.trim();
  const nation = country?.trim();
  if (!place) return [];

  const searchQueries = [
    `${place} ${nation ?? ""} tourist attraction`.trim(),
    `${place} landmark`,
    `${place} museum`,
    `Tourism in ${place}`,
    `${place} sightseeing`,
  ];

  const attractions: WikimediaAttraction[] = [];
  const seenTitles = new Set<string>();
  const seenImages = new Set<string>();

  for (const searchQuery of searchQueries) {
    if (attractions.length >= limit) break;

    const titles = await wikiSearchTitles(searchQuery, limit);
    for (const title of titles) {
      if (attractions.length >= limit) break;
      if (!isUsefulAttractionTitle(title)) continue;
      if (seenTitles.has(title.toLowerCase())) continue;

      const image = await fetchWikimediaLocationImage({
        name: title,
        country: nation,
        type: "attraction",
      });

      if (!image || seenImages.has(image)) continue;

      seenTitles.add(title.toLowerCase());
      seenImages.add(image);

      attractions.push({
        id: `wikimedia-attraction-${attractions.length + 1}`,
        name: cleanAttractionTitle(title, place),
        ratingScore: null,
        ratingText: null,
        reviewCount: null,
        distance: null,
        duration: null,
        price: null,
        priceText: null,
        image,
        link: null,
        address: nation ? `${place}, ${nation}` : place,
      });
    }
  }

  if (attractions.length === 0) {
    const fallbackImage = await fetchWikimediaLocationImage({
      name: place,
      country: nation,
      type: "destination",
    });

    if (fallbackImage) {
      attractions.push({
        id: "wikimedia-attraction-1",
        name: place,
        ratingScore: null,
        ratingText: null,
        reviewCount: null,
        distance: null,
        duration: null,
        price: null,
        priceText: null,
        image: fallbackImage,
        link: null,
        address: nation ? `${place}, ${nation}` : place,
      });
    }
  }

  return attractions.slice(0, limit);
}

export { type LocationImageParams };
