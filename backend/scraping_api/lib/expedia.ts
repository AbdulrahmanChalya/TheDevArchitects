export interface ExpediaSearchParams {
  city: string;
  startDate: string;
  endDate: string;
  totalGuests: number;
  rooms: number;
}

export function buildExpediaSearchUrl({
  city,
  startDate,
  endDate,
  totalGuests,
  rooms,
}: ExpediaSearchParams): string {
  const baseURL = "https://www.expedia.ca/Hotel-Search";

  const adultsPerRoom = Math.max(1, Math.ceil(totalGuests / rooms));
  const adultsList = Array.from({ length: rooms }, () => adultsPerRoom).join(
    ","
  );

  const params = new URLSearchParams({
    destination: city,
    d1: startDate,
    d2: endDate,
    startDate,
    endDate,
    adults: adultsList,
    rooms: String(rooms),
  });

  return `${baseURL}?${params.toString()}`;
}
