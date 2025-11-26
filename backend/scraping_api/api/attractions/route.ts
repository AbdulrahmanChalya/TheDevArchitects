// app/api/attractions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildExpediaAttractionsSearchUrl } from "../../lib/expediaAttractions";
import { AttractionSummary } from "../../types/attraction";
import expediaAttractionsParser from "../../parsing/expediaAttractionsCustomParser.json";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const people = Number(searchParams.get("people") || 2);

    const expediaSearchUrl = buildExpediaAttractionsSearchUrl({
      city,
      startDate,
      endDate,
      adults: people,
    });

    const username = process.env.OXYLABS_USERNAME;
    const password = process.env.OXYLABS_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Missing OXYLABS_USERNAME or OXYLABS_PASSWORD env vars",
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
      parsing_instructions: expediaAttractionsParser,
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
      // Optional caching hint for Next.js route handler
      // next: {
      //   revalidate: 60 * 60, // cache for 1 hour
      // },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Oxylabs error:", res.status, text);
      return NextResponse.json(
        {
          error: "Oxylabs error",
          status: res.status,
          details: text,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    const content = data?.results?.[0]?.content;
    const attractionsRaw = content?.attractions ?? [];

    const attractions: AttractionSummary[] = (attractionsRaw as any[]).map(
      (a, index) => ({
        id: `attraction-${index + 1}`,
        name: a.name,

        ratingScore: a.ratingScore || null,
        ratingText: a.ratingText || null,
        reviewCount: typeof a.reviewCount === "number" ? a.reviewCount : null,

        distance: a.distance || null,
        duration: a.duration || null,

        price: typeof a.price === "number" ? a.price : null,
        priceText: a.priceText || null,

        image: a.image || null,
      })
    );

    return NextResponse.json({ attractions, expediaSearchUrl });
  } catch (err: any) {
    console.error("Attractions API error:", err);
    return NextResponse.json(
      { error: "Server failed", detail: err.message },
      { status: 500 }
    );
  }
}
