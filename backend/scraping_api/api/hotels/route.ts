import { buildExpediaSearchUrl } from "../../lib/expedia";
import { NextRequest, NextResponse } from "next/server";

import expediaParsingInstructions from "../../parsing/expediaCustomParser.json";
import { HotelSummary } from "../../types/hotel";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const people = Number(searchParams.get("people") || 2);
    const rooms = Number(searchParams.get("rooms") || 1);

    const expediaSearchUrl = buildExpediaSearchUrl({
      city,
      startDate,
      endDate,
      totalGuests: people,
      rooms,
    });

    const username = process.env.OXYLABS_USERNAME;
    const password = process.env.OXYLABS_PASSWORD;

    // if (!username || !password) {
    //   // This is a VERY common reason for 500
    //   return NextResponse.json(
    //     { error: "Missing OXYLABS_USERNAME or OXYLABS_PASSWORD env vars" },
    //     { status: 500 }
    //   );
    // }

    const authToken = Buffer.from(`${username}:${password}`).toString("base64");

    const payload = {
      source: "universal",
      url: expediaSearchUrl,
      render: "html",
      parse: true,
      parsing_instructions: expediaParsingInstructions,
      browser_instructions: [
        {
          type: "scroll_to_bottom",
          timeout_s: 5,
          wait_time_s: 5,
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
    });
    // const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      const text = await res.text();
      console.error("Oxylabs error:", res.status, text);
      return NextResponse.json(
        { error: "Oxylabs error", status: res.status, details: text },
        { status: res.status }
      );
    }

    // if (!contentType.includes("application/json")) {
    //   const text = await res.text();
    //   console.error("Oxylabs non-JSON response:", text);
    //   return NextResponse.json(
    //     {
    //       error: "Oxylabs did not return JSON",
    //       details: text.slice(0, 500), // first 500 chars for debugging
    //     },
    //     { status: 502 }
    //   );
    // }

    const data = await res.json();

    // const result = data?.results?.[0];
    // console.log("parse_status_code:", result?.content?.parse_status_code);
    // console.log(
    //   "parser warnings:",
    //   JSON.stringify(result?.content?._warnings, null, 2)
    // );
    // console.log(
    //   "hotels from parser:",
    //   Array.isArray(result?.content?.hotels)
    //     ? result.content.hotels.length
    //     : result?.content?.hotels
    // );

    const content = data.results?.[0]?.content;
    const hotelsRaw = content?.hotels ?? [];

    const hotels: HotelSummary[] = hotelsRaw.map((h: any, index: number) => ({
      id: `hotel-${index + 1}`,
      name: h.name,
      ratingText: h.ratingText || undefined,
      ratingScore: h.ratingScore || undefined,
      pricePerNight: h.pricePerNight || undefined,
      totalPrice: h.totalPrice || undefined,
      images:
        Array.isArray(h.images) && h.images.length > 0 ? h.images : undefined,
      amenities: Array.isArray(h.amenities) ? h.amenities : undefined,
      reviewCount:
        typeof h.reviewCount === "number" ? h.reviewCount : undefined,
    }));

    return NextResponse.json({ hotels, expediaSearchUrl });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server failed", detail: err.message },
      { status: 500 }
    );
  }
}
