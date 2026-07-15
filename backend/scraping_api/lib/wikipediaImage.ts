const USER_AGENT = "GetawayHub/1.0 (travel-app; location-images)";

export type LocationImageType = "destination" | "attraction" | "hero";

export type LocationImageParams = {
  name: string;
  country?: string;
  type?: LocationImageType;
};

function isUsableImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.endsWith(".svg") || lower.includes(".svg/")) return false;
  if (lower.includes("special_marker") || lower.includes("locator_map")) return false;
  if (lower.includes("dimos_") || lower.includes("/dimos")) return false;
  if (lower.includes("_map.") || lower.includes("_map_") || lower.includes("/map_of")) return false;
  if (lower.includes("administrative") || lower.includes("outline_map")) return false;
  if (lower.includes("flag_of") || lower.includes("coat_of_arms")) return false;
  return true;
}

function isUsableCommonsTitle(title: string | undefined): boolean {
  if (!title) return false;
  const lower = title.toLowerCase();
  if (lower.includes(" map") || lower.startsWith("file:map")) return false;
  if (lower.includes("locator") || lower.includes("dimos")) return false;
  if (lower.includes("flag") || lower.includes("coat of arms")) return false;
  if (lower.includes("location") && lower.includes("indonesia")) return false;
  return true;
}

function toWikiTitle(value: string): string {
  return value.trim().replace(/\s+/g, "_");
}

export function buildLocationSearchQueries({
  name,
  country,
  type = "destination",
}: LocationImageParams): string[] {
  const place = name.trim();
  const nation = country?.trim();
  const queries: string[] = [];

  if (type === "hero") {
    queries.push("tropical beach paradise");
    queries.push("Maldives beach");
    return queries;
  }

  if (type === "attraction") {
    queries.push(`${place} ${nation ?? ""} landmark`.trim());
    queries.push(place);
    if (nation) queries.push(`${place} ${nation}`);
    return [...new Set(queries.filter(Boolean))];
  }

  if (place && nation) {
    queries.push(`${place} ${nation} landmark`);
    queries.push(`${place} ${nation} skyline`);
    queries.push(`${place} ${nation}`);
    queries.push(`${place}, ${nation}`);
    queries.push(place);
  } else if (place) {
    queries.push(place);
    queries.push(`${place} landmark`);
    queries.push(`${place} tourism`);
  }

  return [...new Set(queries.filter(Boolean))];
}

async function wikiFetch(url: string): Promise<any | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function fetchWikipediaSummaryImage(title: string): Promise<string | null> {
  const data = await wikiFetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(toWikiTitle(title))}`,
  );
  const thumbnail = data?.thumbnail?.source;
  const original = data?.originalimage?.source;
  return isUsableImageUrl(original)
    ? original
    : isUsableImageUrl(thumbnail)
      ? thumbnail
      : null;
}

async function fetchWikipediaPageImage(title: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "pageimages",
    piprop: "thumbnail|original",
    pithumbsize: "1200",
    titles: title,
  });

  const data = await wikiFetch(`https://en.wikipedia.org/w/api.php?${params}`);
  const pages = data?.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages) as any[]) {
    const original = page?.original?.source;
    const thumbnail = page?.thumbnail?.source;
    if (isUsableImageUrl(original)) return original;
    if (isUsableImageUrl(thumbnail)) return thumbnail;
  }

  return null;
}

async function fetchWikipediaSearchImage(searchQuery: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srsearch: searchQuery,
    srlimit: "5",
  });

  const data = await wikiFetch(`https://en.wikipedia.org/w/api.php?${params}`);
  const results = data?.query?.search ?? [];

  for (const result of results) {
    const title = result?.title;
    if (!title) continue;

    const image =
      (await fetchWikipediaPageImage(title)) ||
      (await fetchWikipediaSummaryImage(title));
    if (image) return image;
  }

  return null;
}

async function fetchCommonsSearchImage(searchQuery: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: searchQuery,
    gsrnamespace: "6",
    prop: "imageinfo",
    iiprop: "url|thumburl",
    iiurlwidth: "1200",
  });

  const data = await wikiFetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  const pages = data?.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages) as any[]) {
    if (!isUsableCommonsTitle(page?.title)) continue;
    const info = page?.imageinfo?.[0];
    const url = info?.thumburl || info?.url;
    if (isUsableImageUrl(url)) return url;
  }

  return null;
}

export async function fetchWikimediaLocationImage(
  params: LocationImageParams,
): Promise<string | null> {
  const queries = buildLocationSearchQueries(params);

  for (const query of queries) {
    const commonsImage = await fetchCommonsSearchImage(query);
    if (commonsImage) return commonsImage;

    const summaryImage = await fetchWikipediaSummaryImage(query.replace(/, /g, " "));
    if (summaryImage) return summaryImage;

    const searchImage = await fetchWikipediaSearchImage(query);
    if (searchImage) return searchImage;
  }

  return null;
}

export function parseDestinationLabel(label: string): LocationImageParams {
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
