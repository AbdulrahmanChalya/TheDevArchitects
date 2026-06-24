export type GoogleAttractionsSearchParams = {
  city: string;
  startDate?: string;
  endDate?: string;
  adults?: number;
};

export function buildGoogleAttractionsSearchBody({
  city,
}: GoogleAttractionsSearchParams) {
  return {
    textQuery: `top tourist attractions and things to do in ${city}`,
    languageCode: "en",
    maxResultCount: 10,
  };
}

export const GOOGLE_PLACES_TEXT_SEARCH_URL =
  "https://places.googleapis.com/v1/places:searchText";