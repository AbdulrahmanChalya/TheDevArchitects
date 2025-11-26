export interface HotelSummary {
  id: string;
  name: string;
  ratingText?: string;
  ratingScore?: string;
  pricePerNight?: string;
  totalPrice?: string;
  images?: string[];
  amenities?: string[];
  reviewCount?: number;
}
