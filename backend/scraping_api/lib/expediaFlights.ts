type BuildFlightUrlParams = {
  originAirport: string;
  destinationAirport: string;
  departureDate: string;
  returnDate: string;
  adults: number;
};

function formatDateForExpedia(date: string) {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function buildExpediaFlightSearchUrl({
  originAirport,
  destinationAirport,
  departureDate,
  returnDate,
  adults,
}: BuildFlightUrlParams) {
  const base = "https://www.expedia.ca/Flights-Search";

  const dep = formatDateForExpedia(departureDate);
  const ret = formatDateForExpedia(returnDate);

  const leg1 = `leg1=from:${encodeURIComponent(
    originAirport
  )},to:${encodeURIComponent(
    destinationAirport
  )},departure:${encodeURIComponent(`${dep}TANYT`)}`;

  const leg2 = `leg2=from:${encodeURIComponent(
    destinationAirport
  )},to:${encodeURIComponent(originAirport)},departure:${encodeURIComponent(
    `${ret}TANYT`
  )}`;

  const passengers = `passengers=${encodeURIComponent(
    `children:0,adults:${adults},seniors:0,infantinlap:Y`
  )}`;

  const options = `options=${encodeURIComponent("cabinclass:economy")}`;

  const qs = [
    "trip=roundtrip",
    leg1,
    leg2,
    passengers,
    options,
    "mode=search",
  ].join("&");

  return `${base}?${qs}`;
}
