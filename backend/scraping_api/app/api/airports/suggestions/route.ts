import { NextRequest, NextResponse } from "next/server";

const DUFFEL_PLACE_SUGGESTIONS_URL =
  "https://api.duffel.com/places/suggestions";

type DuffelAirport = {
  iata_code?: string;
  name?: string;
  city_name?: string;
  iata_country_code?: string;
  latitude?: number | null;
  longitude?: number | null;
};

type DuffelPlace = DuffelAirport & {
  type?: "airport" | "city";
  airports?: DuffelAirport[] | null;
};

function normalizeAirport(airport: DuffelAirport, fallbackCity = "") {
  if (!airport.iata_code) return null;

  return {
    code: airport.iata_code,
    name: airport.name || airport.iata_code,
    city: airport.city_name || fallbackCity,
    country: airport.iata_country_code || "",
    lat: airport.latitude ?? 0,
    lng: airport.longitude ?? 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const token = process.env.DUFFEL_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Missing DUFFEL_ACCESS_TOKEN" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json({ airports: [] });
    }

    const url = new URL(DUFFEL_PLACE_SUGGESTIONS_URL);
    url.searchParams.set("query", query);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Duffel-Version": "v2",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Duffel airport suggestions failed",
          detail: await response.text(),
        },
        { status: response.status },
      );
    }

    const payload = await response.json();
    const places = (payload?.data || []) as DuffelPlace[];
    const airports = new Map<string, ReturnType<typeof normalizeAirport>>();

    // City results contain their associated airports; airport results are already flat.
    for (const place of places) {
      const candidates =
        place.type === "city" && place.airports?.length
          ? place.airports.map((airport) => normalizeAirport(airport, place.name || ""))
          : [normalizeAirport(place)];

      for (const airport of candidates) {
        if (airport) airports.set(airport.code, airport);
      }
    }

    return NextResponse.json({
      airports: Array.from(airports.values()),
      provider: "duffel",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Duffel airport suggestions failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
