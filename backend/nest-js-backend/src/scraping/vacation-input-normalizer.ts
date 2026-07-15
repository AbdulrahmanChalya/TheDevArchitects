type ScrapedResponse = {
  attractions?: {
    attractions?: any[];
  };
  hotels?: {
    rooms?: any[];
    city?: string;
    countryCode?: string;
    checkin?: string;
    checkout?: string;
    people?: number;
    requestedRooms?: number;
  };
  flights?: {
    flights?: any[];
  };
};

type SearchQuery = Record<string, any>;

const TARGET_CURRENCY = 'CAD';
const DEFAULT_USD_TO_CAD_RATE = 1.37;

/**
 * Converts the raw combined scraper payload into the stable input shape used by
 * the vacation-package AI.
 */
export function normalizeForVacationModel(
  scrapedResponse: ScrapedResponse,
  query: SearchQuery,
) {
  const hotels = scrapedResponse.hotels?.rooms ?? [];
  const flights = scrapedResponse.flights?.flights ?? [];
  const attractions = scrapedResponse.attractions?.attractions ?? [];

  const checkin = scrapedResponse.hotels?.checkin || query.startDate || '';
  const checkout = scrapedResponse.hotels?.checkout || query.endDate || '';
  const nights = getNights(checkin, checkout);
  const people = Number(scrapedResponse.hotels?.people || query.people || 1);
  const rooms = Number(scrapedResponse.hotels?.requestedRooms || query.rooms || 1);
  const usdToCadRate = getUsdToCadRate();

  return {
    tripRequest: {
      destinationCity: scrapedResponse.hotels?.city || query.city || '',
      countryCode: scrapedResponse.hotels?.countryCode || query.countryCode || '',
      originAirport: query.originAirport || '',
      destinationAirport: query.destinationAirport || '',
      people,
      rooms,
      checkin,
      checkout,
      nights,
      currency: TARGET_CURRENCY,
      budgetCad: Number(query.budgetCad || query.budget || 0),
    },
    normalization: {
      targetCurrency: TARGET_CURRENCY,
      usdToCadRate,
      flightPriceRule: 'Flight price from the scraper is the total cost for all requested passengers.',
      attractionPriceRule: 'Unavailable attraction prices use 0 CAD and are excluded from the package total.',
    },
    options: {
      hotels: hotels.map((hotel) => {
        const totalHotelCost = convertToCad(hotel.price, hotel.currency, usdToCadRate);

        return {
          id: hotel.hotelId,
          name: hotel.hotelName,
          rating: hotel.hotelRating ?? null,
          roomName: hotel.roomName ?? null,
          maxOccupancy: hotel.maxOccupancy ?? null,
          boardName: hotel.boardName ?? null,
          totalHotelCost,
          pricePerNight: roundMoney(totalHotelCost / nights),
          currency: TARGET_CURRENCY,
          refundable: Boolean(hotel.refundable),
        };
      }),
      flights: flights.map((flight) => {
        // Duffel returns the total offer cost for the requested passengers.
        const totalFlightCost = convertToCad(flight.price, flight.currency, usdToCadRate);

        return {
          id: flight.id,
          airline: flight.airline,
          from: flight.departureAirport,
          to: flight.arrivalAirport,
          departureTime: flight.departureTime ?? null,
          arrivalTime: flight.arrivalTime ?? null,
          duration: flight.duration ?? null,
          totalFlightCost,
          pricePerPerson: roundMoney(totalFlightCost / people),
          currency: TARGET_CURRENCY,
        };
      }),
      attractions: attractions.map((attraction) => {
        const pricePerPerson = convertToCad(
          attraction.pricePerPerson ?? attraction.price,
          attraction.currency,
          usdToCadRate,
        );

        return {
          id: attraction.id,
          name: attraction.name,
          rating: attraction.ratingScore ?? null,
          reviewCount: attraction.reviewCount ?? null,
          address: attraction.address ?? null,
          pricePerPerson,
          currency: TARGET_CURRENCY,
        };
      }),
    },
  };
}

/**
 * Calculates hotel nights from check-in/check-out dates.
 *
 * Falls back to 1 night for missing or invalid dates so downstream price math
 * never divides by zero.
 */
function getNights(checkin: string, checkout: string) {
  const start = Date.parse(`${checkin}T00:00:00Z`);
  const end = Date.parse(`${checkout}T00:00:00Z`);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 1;
  }

  return Math.max(1, Math.round((end - start) / 86_400_000));
}

/**
 * Reads the USD to CAD conversion rate from the environment.
 *
 * Use USD_TO_CAD_RATE to control AI package cost conversion. The fallback keeps
 * local development usable, but production should provide an explicit rate or a
 * cached rate from a currency service.
 */
function getUsdToCadRate() {
  const configuredRate = Number(process.env.USD_TO_CAD_RATE);

  if (Number.isFinite(configuredRate) && configuredRate > 0) {
    return configuredRate;
  }

  return DEFAULT_USD_TO_CAD_RATE;
}

/**
 * Converts known source currencies into the model's target currency.
 *
 * Hotels already come from LiteAPI in CAD. Flights currently come from Duffel in
 * USD, so they are multiplied by the configured USD_TO_CAD_RATE.
 */
function convertToCad(value: unknown, currency: unknown, usdToCadRate: number) {
  const amount = Number(value || 0);
  const sourceCurrency = String(currency || TARGET_CURRENCY).toUpperCase();

  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (sourceCurrency === 'USD') {
    return roundMoney(amount * usdToCadRate);
  }

  return roundMoney(amount);
}

/** Round money values to cents for stable model input and easier validation. */
function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
