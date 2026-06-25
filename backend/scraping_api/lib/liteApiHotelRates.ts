export type HotelRatesPayloadParams = {
  city: string;
  countryCode: string;
  checkin: string;
  checkout: string;
  people: number;
  rooms: number;
  currency?: string;
  guestNationality?: string;
  limit?: number;
};

export function buildHotelRatesPayload({
  city,
  countryCode,
  checkin,
  checkout,
  people,
  rooms,
  currency = "CAD",
  guestNationality = "CA",
  limit = 20,
}: HotelRatesPayloadParams) {
  const adultsPerRoom = Math.max(1, Math.ceil(people / rooms));

  return {
    checkin,
    checkout,
    currency,
    guestNationality,
    countryCode: countryCode.toUpperCase(),
    cityName: cleanCityName(city),
    timeout: 12,
    limit,
    occupancies: Array.from({ length: rooms }, () => ({
      adults: adultsPerRoom,
      children: [],
    })),
  };
}

function cleanCityName(city: string) {
  return city.replace(/\(.*?\)/g, "").split(",")[0].trim();
}