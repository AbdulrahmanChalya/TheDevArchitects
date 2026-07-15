import { NextRequest, NextResponse } from "next/server";
import { Duffel } from "@duffel/api";
import { buildDuffelFlightOfferRequest } from "../../../lib/flights";
import { normalizeDuffelFlights } from "../../../parsing/duffelFlightParser";

export const revalidate = 1800;

export async function GET(req: NextRequest) {
  try {
    const token = process.env.DUFFEL_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Missing DUFFEL_ACCESS_TOKEN" },
        { status: 500 },
      );
    }

    const duffel = new Duffel({ token });

    const { searchParams } = new URL(req.url);

    const originAirport = searchParams.get("origin")?.toUpperCase() || "";
    const destinationAirport =
      searchParams.get("destination")?.toUpperCase() || "";
    const departureDate = searchParams.get("startDate") || "";
    const returnDate = searchParams.get("endDate") || "";
    const adults = Number(searchParams.get("people") || 1);

    const cabinClass =
      (searchParams.get("class")?.toLowerCase() as
        | "economy"
        | "premium_economy"
        | "business"
        | "first") || "economy";

    if (!originAirport || !destinationAirport || !departureDate) {
      return NextResponse.json(
        {
          error: "Missing required params: origin, destination, startDate",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(adults) || adults < 1) {
      return NextResponse.json(
        { error: "people must be greater than 0" },
        { status: 400 },
      );
    }

    const offerRequestPayload = buildDuffelFlightOfferRequest({
      originAirport,
      destinationAirport,
      departureDate,
      returnDate: returnDate || undefined,
      adults,
      cabinClass,
    });

    console.log(
      "Duffel payload:",
      JSON.stringify(offerRequestPayload, null, 2),
    );

    const MAX_FLIGHTS = 20;

    const offerRequest = await duffel.offerRequests.create({
      ...offerRequestPayload,
      return_offers: false,
    } as any);


    const offersResponse = await duffel.offers.list({
      offer_request_id: offerRequest.data.id,
      limit: MAX_FLIGHTS,
      sort: "total_amount",
    } as any);

    const flights = normalizeDuffelFlights(offersResponse.data ?? []);

    return NextResponse.json({
      flights,
      provider: "duffel",
      offerRequestId: offerRequest.data.id,
      totalReturned: flights.length,
    });
  } catch (err: any) {
    console.error("Duffel full error:", JSON.stringify(err, null, 2));
    console.error("Duffel error message:", err?.message);
    console.error("Duffel error errors:", err?.errors);
    console.error("Duffel error meta:", err?.meta);

    return NextResponse.json(
      {
        error: "Duffel request failed",
        message: err?.message || "Unknown error",
        errors: err?.errors || null,
        meta: err?.meta || null,
      },
      { status: 500 },
    );
  }
}
