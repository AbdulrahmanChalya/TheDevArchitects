import { NextRequest, NextResponse } from "next/server";
import { buildExpediaFlightSearchUrl } from "../../../lib/expediaFlights";
import expediaFlightParser from "../../../parsing/expediaFlightCustomParser.json";
import type { FlightSummary } from "../../../types/flight";
import { parseRouteFull } from "../../../lib/flightParsers";

// Optional: cache this route for 1 hour on the Next.js side
export const revalidate = 60 * 60;

// Helper to split "New York (JFK) - Paris (CDG)" -> JFK / CDG
// const parseRoute = (route?: string) => {
//   if (!route) {
//     return { departureAirport: null, arrivalAirport: null };
//   }

//   const match = route.match(/\((.*?)\)\s*-\s*\((.*?)\)/);
//   return {
//     departureAirport: match?.[1] || null,
//     arrivalAirport: match?.[2] || null,
//   };
// };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Expect IATA codes here, e.g. origin=JFK&destination=CDG
    const originAirport = searchParams.get("origin") || "";
    const destinationAirport = searchParams.get("destination") || "";
    const departureDate = searchParams.get("startDate") || ""; // YYYY-MM-DD
    const returnDate = searchParams.get("endDate") || ""; // YYYY-MM-DD
    const adults = Number(searchParams.get("people") || 1);
    const cabinClass = searchParams.get("class") || "Economy";

    if (
      !originAirport ||
      !destinationAirport ||
      !departureDate ||
      !returnDate
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required query params. Required: origin, destination, startDate, endDate",
        },
        { status: 400 }
      );
    }

    const expediaSearchUrl = buildExpediaFlightSearchUrl({
      originAirport,
      destinationAirport,
      departureDate,
      returnDate,
      adults,
    });

    const username = process.env.OXYLABS_USERNAME;
    const password = process.env.OXYLABS_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        {
          error:
            "Missing OXYLABS_USERNAME or OXYLABS_PASSWORD environment variables",
        },
        { status: 500 }
      );
    }

    const authToken = Buffer.from(`${username}:${password}`).toString("base64");

    const payload = {
      source: "universal",
      url: expediaSearchUrl,
      render: "html",
      parse: true,
      parsing_instructions: expediaFlightParser,
      browser_instructions: [
        {
          type: "scroll_to_bottom",
          timeout_s: 30,
          wait_time_s: 20,
        },
      ],
    };

    const res = await fetch("https://realtime.oxylabs.io/v1/queries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify(payload),
      // You *can* also add: next: { revalidate: 60 * 60 } here if you want
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Oxylabs error:", res.status, text);
      return NextResponse.json(
        {
          error: "Oxylabs error",
          status: res.status,
          details: text.slice(0, 500),
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    const content = data?.results?.[0]?.content;
    const flightsRaw = (content?.flights || []) as any[];

    const flights: FlightSummary[] = flightsRaw.map((f, index) => {
      const { departureAirport, arrivalAirport } = parseRouteFull(f.route);

      // f.price should already be numeric because of amount_from_string,
      // but we normalise anyway just in case
      let numericPrice = 0;
      if (typeof f.price === "number") {
        numericPrice = f.price;
      } else if (typeof f.price === "string") {
        const cleaned = f.price.replace(/[^\d.]/g, "");
        numericPrice = cleaned ? Number(cleaned) : 0;
      }

      return {
        id: `flight-${index + 1}`,
        airline: f.airline ?? null,
        logo: f.airlineLogo || null,
        departureAirport: departureAirport ?? null,
        arrivalAirport: arrivalAirport ?? null,
        price: numericPrice,
        duration: f.duration ?? null,
        class: cabinClass, // from query; list view usually doesn't show cabin class
      };
    });

    return NextResponse.json({ flights, expediaSearchUrl });
  } catch (err: any) {
    console.error("Flights API error:", err);
    return NextResponse.json(
      {
        error: "Server failed",
        detail: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
