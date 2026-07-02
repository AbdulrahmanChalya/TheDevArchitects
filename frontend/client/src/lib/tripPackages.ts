// tripPackages.ts — build bookable packages from static JSON under /backend/.
//
// Data sources (no API, no invented rows):
//   destinations.json     — where to go, image, rating, activity tags
//   hotels.json           — hotels per destinationId
//   flights.json          — flights per destinationId
//   recommendations.json  — attraction names/descriptions per destination
//
// A destination becomes a package only if it has at least one hotel AND one flight
// (in practice: Paris, Tokyo, Bali).

// One row from destinations.json.
export interface BackendDestination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  activities: string[];
  flightTimeFromNYC: string;
  bestMonths: string[];
}

// One row from hotels.json.
export interface BackendHotel {
  id: string;
  destinationId: string; // links to BackendDestination.id
  name: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  reviewCount: number;
}

// One row from flights.json.
export interface BackendFlight {
  id: string;
  destinationId: string; // links to BackendDestination.id
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  price: number; // per passenger
  duration: string;
  class: string;
}

// Activity line inside recommendations.json (not priced in JSON).
export interface BackendAttraction {
  name: string;
  description: string;
  icon: string;
}

// Merged view used by SearchResults and TripPackageDetails.
export interface TripPackage {
  id: string; // same as destinationId
  destinationId: string;
  name: string;
  country: string;
  description: string;
  image: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  activities: string[];
  hotels: BackendHotel[];
  flights: BackendFlight[];
  attractions: BackendAttraction[];
}

// Price breakdown returned to pages (hotel + flight; attractions always $0).
export interface PackagePricing {
  hotel?: BackendHotel;
  flight?: BackendFlight;
  nights: number;
  passengers: number;
  hotelCost: number;
  flightCost: number;
  attractionsCost: number; // always 0 — included in bundle, not in JSON
  total: number;
  perPerson: number;
}

// GET JSON from a path; throw if the file is missing or not ok.
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return res.json();
}

// Load all four files in parallel, merge into TripPackage[], drop incomplete destinations.
export async function fetchTripPackages(): Promise<TripPackage[]> {
  const [destinations, hotels, flights, recommendations] = await Promise.all([
    fetchJson<BackendDestination[]>("/backend/destinations.json"),
    fetchJson<BackendHotel[]>("/backend/hotels.json"),
    fetchJson<BackendFlight[]>("/backend/flights.json"),
    fetchJson<
      { destination: string; activities: BackendAttraction[] }[]
    >("/backend/recommendations.json"),
  ]);

  return destinations
    .map((dest) => {
      // Keep only hotels and flights for this destination.
      const destHotels = hotels.filter((h) => h.destinationId === dest.id);
      const destFlights = flights.filter((f) => f.destinationId === dest.id);

      // Match "Paris, France" in recommendations to dest.name "Paris".
      const rec = recommendations.find((r) =>
        r.destination.toLowerCase().includes(dest.name.toLowerCase()),
      );

      return {
        id: dest.id,
        destinationId: dest.id,
        name: dest.name,
        country: dest.country,
        description: dest.description,
        image: dest.image,
        imageUrl: dest.imageUrl,
        rating: dest.rating,
        reviewCount: dest.reviewCount,
        activities: dest.activities,
        hotels: destHotels,
        flights: destFlights,
        attractions: rec?.activities ?? [],
      } as TripPackage;
    })
    .filter((pkg) => pkg.hotels.length > 0 && pkg.flights.length > 0);
}

// Pick the cheapest hotel option for display / default pricing.
export function getCheapestHotel(pkg: TripPackage): BackendHotel | undefined {
  return [...pkg.hotels].sort((a, b) => a.pricePerNight - b.pricePerNight)[0];
}

// Pick the cheapest flight option for display / default pricing.
export function getCheapestFlight(pkg: TripPackage): BackendFlight | undefined {
  return [...pkg.flights].sort((a, b) => a.price - b.price)[0];
}

// Nights between start and end (URL dates). Uses fallback (default 5) if invalid or missing.
export function computeNights(
  startDate?: string | null,
  endDate?: string | null,
  fallback = 5,
): number {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff > 0) return diff;
  }
  return fallback;
}

// Total trip cost: (hotel nightly × nights) + (flight price × passengers).
// Uses passed hotel/flight or falls back to cheapest in the package.
export function computePackagePricing(
  pkg: TripPackage,
  options: {
    nights: number;
    passengers: number;
    hotel?: BackendHotel;
    flight?: BackendFlight;
  },
): PackagePricing {
  const hotel = options.hotel ?? getCheapestHotel(pkg);
  const flight = options.flight ?? getCheapestFlight(pkg);
  const nights = Math.max(1, options.nights);
  const passengers = Math.max(1, options.passengers);

  const hotelCost = hotel ? hotel.pricePerNight * nights : 0;
  const flightCost = flight ? flight.price * passengers : 0;
  const attractionsCost = 0;
  const total = hotelCost + flightCost + attractionsCost;

  return {
    hotel,
    flight,
    nights,
    passengers,
    hotelCost,
    flightCost,
    attractionsCost,
    total,
    perPerson: Math.round(total / passengers),
  };
}
