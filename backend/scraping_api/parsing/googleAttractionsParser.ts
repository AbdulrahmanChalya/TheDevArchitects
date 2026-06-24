export type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  formattedAddress?: string;
  photos?: { name: string }[];
  googleMapsUri?: string;
  priceLevel?: string;
};

export function normalizeGoogleAttractions(
  places: GooglePlace[],
  apiKey: string
) {
  return places.map((place, index) => ({
    id: place.id || `attraction-${index + 1}`,
    name: place.displayName?.text || null,

    ratingScore: place.rating ?? null,
    ratingText: place.rating ? `${place.rating}/5` : null,
    reviewCount: place.userRatingCount ?? null,

    distance: null,
    duration: null,

    price: null,
    priceText: place.priceLevel || null,

    image: place.photos?.[0]?.name
      ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=800&key=${apiKey}`
      : null,

    link: place.googleMapsUri || null,
    address: place.formattedAddress || null,
  }));
}