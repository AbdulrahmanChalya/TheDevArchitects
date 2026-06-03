// Builds "trip packages" entirely from the existing backend JSON files
// (served by the dev server at /backend/*.json). No invented data:
//   - destinations.json  -> destination meta + activity labels
//   - hotels.json        -> hotels keyed by destinationId
//   - flights.json       -> flights keyed by destinationId
//   - recommendations.json -> named attractions per destination
//
// A package exists only for destinations that have at least one hotel
// AND one flight (currently Paris, Tokyo, Bali).

export interface BackendDestination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  activities: string[];
  flightTimeFromNYC: string;
  bestMonths: string[];
}

export interface BackendHotel {
  id: string;
  destinationId: string;
  name: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  reviewCount: number;
}

export interface BackendFlight {
  id: string;
  destinationId: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  price: number;
  duration: string;
  class: string;
}

export interface BackendAttraction {
  name: string;
  description: string;
  icon: string;
}

export interface TripPackage {
  id: string; // destinationId
  destinationId: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  activities: string[];
  hotels: BackendHotel[];
  flights: BackendFlight[];
  attractions: BackendAttraction[];
}

export interface PackagePricing {
  hotel?: BackendHotel;
  flight?: BackendFlight;
  nights: number;
  passengers: number;
  hotelCost: number;
  flightCost: number;
  attractionsCost: number; // attractions have no price in source data -> included (0)
  total: number;
  perPerson: number;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return res.json();
}

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
      const destHotels = hotels.filter((h) => h.destinationId === dest.id);
      const destFlights = flights.filter((f) => f.destinationId === dest.id);

      // Match recommendations by destination name, e.g. "Paris, France" -> "Paris"
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

export function getCheapestHotel(pkg: TripPackage): BackendHotel | undefined {
  return [...pkg.hotels].sort((a, b) => a.pricePerNight - b.pricePerNight)[0];
}

export function getCheapestFlight(pkg: TripPackage): BackendFlight | undefined {
  return [...pkg.flights].sort((a, b) => a.price - b.price)[0];
}

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
  const attractionsCost = 0; // no price data in source -> attractions included
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
