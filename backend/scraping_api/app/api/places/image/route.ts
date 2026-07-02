import { NextRequest, NextResponse } from "next/server";
import {
  fetchPlacePhotoUrl,
  resolveLocationImageParams,
} from "../../../../lib/placesImage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = resolveLocationImageParams({
      query: searchParams.get("query") || undefined,
      name: searchParams.get("name") || undefined,
      country: searchParams.get("country") || undefined,
      type: (searchParams.get("type") as any) || undefined,
    });

    if (!params.name) {
      return NextResponse.json({ error: "name or query is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const { imageUrl, source } = await fetchPlacePhotoUrl(params, apiKey);

    return NextResponse.json({
      name: params.name,
      country: params.country ?? null,
      type: params.type ?? "destination",
      imageUrl,
      source,
    });
  } catch (err: unknown) {
    console.error("Place image API error:", err);
    return NextResponse.json(
      {
        error: "Server failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
