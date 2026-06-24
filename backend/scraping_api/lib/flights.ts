export type BuildDuffelFlightSearchParams = {
  originAirport: string;
  destinationAirport: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
};

export function buildDuffelFlightOfferRequest({
  originAirport,
  destinationAirport,
  departureDate,
  returnDate,
  adults,
  cabinClass = "economy",
}: BuildDuffelFlightSearchParams) {
  const slices = [
    {
      origin: originAirport.toUpperCase(),
      destination: destinationAirport.toUpperCase(),
      departure_date: departureDate,
    },
  ];

  if (returnDate) {
    slices.push({
      origin: destinationAirport.toUpperCase(),
      destination: originAirport.toUpperCase(),
      departure_date: returnDate,
    });
  }

  return {
    slices,
    passengers: Array.from({ length: adults }, () => ({
      type: "adult",
    })),
    cabin_class: cabinClass,
  };
}
