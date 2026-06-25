export type DuffelStaySearchParams = {
  city: string;
  startDate: string;
  endDate: string;
  people: number;
  rooms: number;
  latitude: number;
  longitude: number;
};

export function buildDuffelStaySearchPayload({
  startDate,
  endDate,
  people,
  rooms,
  latitude,
  longitude,
}: DuffelStaySearchParams) {
  return {
    rooms,
    location: {
      radius: 10,
      geographic_coordinates: {
        latitude,
        longitude,
      },
    },
    check_in_date: startDate,
    check_out_date: endDate,
    adults: people,
  };
}