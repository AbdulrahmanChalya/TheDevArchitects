import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GOOGLE_PLACES_API_KEY" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId")?.trim() || "";
    const sessionToken = searchParams.get("sessionToken") || undefined;

    if (!placeId) {
      return NextResponse.json(
        { error: "Missing required param: placeId" },
        { status: 400 }
      );
    }

    const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
    if (sessionToken) {
      url.searchParams.set("sessionToken", sessionToken);
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,addressComponents",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Google Places details failed",
          detail: await response.text(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    // SearchBar stores countryCode separately so the URL can keep destination as city-only.
    const country = (data?.addressComponents || []).find((component: any) =>
      component.types?.includes("country")
    );

    return NextResponse.json({
      placeId,
      country: country?.longText || "",
      countryCode: country?.shortText || "",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Google Places details failed",
        detail: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
