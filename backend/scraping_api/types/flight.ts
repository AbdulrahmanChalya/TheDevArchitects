// types/flight.ts
export interface FlightSummary {
  id: string;
  airline: string;
  logo: string | null;
  departureAirport: string | null;
  arrivalAirport: string | null;
  price: number;
  duration: string;
  class: string;
}
