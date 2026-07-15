import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

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
    const input = searchParams.get("input")?.trim() || "";
    const languageCode = searchParams.get("languageCode") || "en";
    const sessionToken = searchParams.get("sessionToken") || undefined;

    if (input.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Restrict predictions to cities so the homepage destination field does not suggest POIs.
    const response = await fetch(GOOGLE_PLACES_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify({
        input,
        includedPrimaryTypes: ["(cities)"],
        languageCode,
        ...(sessionToken ? { sessionToken } : {}),
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Google Places autocomplete failed",
          detail: await response.text(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Normalize Google's nested prediction shape into the compact contract used by SearchBar.
    const suggestions = (data?.suggestions || [])
      .map((suggestion: any) => suggestion.placePrediction)
      .filter(Boolean)
      .map((prediction: any) => {
        const mainText =
          prediction.structuredFormat?.mainText?.text ||
          prediction.text?.text?.split(",")[0]?.trim() ||
          "";
        const secondaryText =
          prediction.structuredFormat?.secondaryText?.text || "";

        return {
          placeId: prediction.placeId,
          city: mainText,
          country: secondaryText.split(",").pop()?.trim() || secondaryText,
          label: mainText,
          description: prediction.text?.text || mainText,
          source: "google_places",
        };
      })
      .filter((suggestion: any) => suggestion.placeId && suggestion.city);

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Google Places autocomplete failed",
        detail: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
