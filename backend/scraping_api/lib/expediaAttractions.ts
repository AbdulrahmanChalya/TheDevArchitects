// lib/expedia.ts

export type ExpediaAttractionsUrlParams = {
  city: string;
  startDate?: string; 
  endDate?: string; 
  adults?: number; 
};

function encodeDateForExpedia(date?: string | null) {
  if (!date) return "";
  return date;
}

export function buildExpediaAttractionsSearchUrl({
  city,
  startDate,
  endDate,
  adults = 2,
}: ExpediaAttractionsUrlParams): string {
  const base = "https://www.expedia.ca/things-to-do/search";

  const params = new URLSearchParams();

  // Location
  if (city) {
    params.set("location", city);
  }

  // Dates
  if (startDate) params.set("startDate", encodeDateForExpedia(startDate));
  if (endDate) params.set("endDate", encodeDateForExpedia(endDate));

  // People: Expedia sometimes uses travellers/adults – this works in practice.
  params.set("travellers", String(adults));
  params.set("sort", "RECOMMENDED");
  params.set("filter.seeAll", "true");

  return `${base}?${params.toString()}`;
}
