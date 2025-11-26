export interface AttractionSummary {
  id: string;
  name: string;
  ratingScore?: string | null;
  ratingText?: string | null;
  reviewCount?: number | null;
  distance?: string | null;
  duration?: string | null;
  price?: number | null;
  priceText?: string | null;
  image?: string | null;
}
