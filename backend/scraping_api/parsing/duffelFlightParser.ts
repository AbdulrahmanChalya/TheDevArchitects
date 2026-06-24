export type DuffelOffer = {
  id: string;
  total_amount: string;
  total_currency: string;
  owner?: {
    name?: string;
    logo_symbol_url?: string;
  };
  slices?: {
    duration?: string;
    segments?: {
      departing_at?: string;
      arriving_at?: string;
      origin?: {
        iata_code?: string;
      };
      destination?: {
        iata_code?: string;
      };
      marketing_carrier?: {
        name?: string;
        logo_symbol_url?: string;
      };
    }[];
  }[];
  cabin_class?: string;
};

export function normalizeDuffelFlights(offers: DuffelOffer[]) {
  return offers.map((offer, index) => {
    const outbound = offer.slices?.[0];
    const firstSegment = outbound?.segments?.[0];
    const lastSegment = outbound?.segments?.[outbound.segments.length - 1];

    return {
      id: offer.id || `flight-${index + 1}`,

      airline:
        firstSegment?.marketing_carrier?.name ||
        offer.owner?.name ||
        null,

      logo:
        firstSegment?.marketing_carrier?.logo_symbol_url ||
        offer.owner?.logo_symbol_url ||
        null,

      departureAirport: firstSegment?.origin?.iata_code || null,
      arrivalAirport: lastSegment?.destination?.iata_code || null,

      departureTime: firstSegment?.departing_at || null,
      arrivalTime: lastSegment?.arriving_at || null,

      price: Number(offer.total_amount || 0),
      currency: offer.total_currency || null,

      duration: outbound?.duration || null,
      class: offer.cabin_class || null,

      provider: "duffel",
    };
  });
}