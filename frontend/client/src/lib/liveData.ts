const backendBase = () => import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface LiveAttraction {
  id: string;
  name: string | null;
  image: string | null;
  ratingScore: number | null;
  reviewCount: number | null;
  address: string | null;
}

export interface LiveHotelRoom {
  hotelName: string | null;
  hotelImage: string | null;
  hotelRating: number | null;
  price: number | null;
}

export async function fetchLiveAttractions(city: string, people = 2) {
  const trimmed = city.trim();
  if (!trimmed) return null;

  try {
    const params = new URLSearchParams({ city: trimmed, people: String(people) });
    const response = await fetch(`${backendBase()}/api/attractions?${params}`);
    if (!response.ok) return null;
    return response.json() as Promise<{ attractions: LiveAttraction[] }>;
  } catch {
    return null;
  }
}

export async function fetchLiveHotels(params: {
  city: string;
  countryCode?: string;
  startDate?: string;
  endDate?: string;
  people?: number;
  rooms?: number;
}) {
  const trimmed = params.city.trim();
  if (!trimmed) return null;

  try {
    const query = new URLSearchParams({
      city: trimmed,
      people: String(params.people ?? 2),
      rooms: String(params.rooms ?? 1),
    });
    if (params.countryCode) query.set("countryCode", params.countryCode);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);

    const response = await fetch(`${backendBase()}/api/hotels?${query}`);
    if (!response.ok) return null;
    return response.json() as Promise<{ rooms: LiveHotelRoom[] }>;
  } catch {
    return null;
  }
}
