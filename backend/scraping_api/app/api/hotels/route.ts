import { NextRequest, NextResponse } from "next/server";
import { liteApiFetch } from "../../../lib/liteApi";
import { buildHotelRatesPayload } from "../../../lib/liteApiHotelRates";
import { normalizeLiteApiRooms } from "../../../parsing/liteApiRoomAvailabilityParser";

export const revalidate = 900;

const MAX_HOTELS = 20;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city") || "";
    const countryCode = searchParams.get("countryCode") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const people = Number(searchParams.get("people") || 2);
    const rooms = Number(searchParams.get("rooms") || 1);

    if (!city || !countryCode || !startDate || !endDate) {
      return NextResponse.json(
        {
          error: "Missing required params: city, countryCode, startDate, endDate",
        },
        { status: 400 }
      );
    }

    const payload = {
      ...buildHotelRatesPayload({
        city,
        countryCode,
        checkin: startDate,
        checkout: endDate,
        people,
        rooms,
        limit: MAX_HOTELS,
      }),
      maxRatesPerHotel: 1,
      includeHotelData: true,
    };

    const ratesResponse = await liteApiFetch<any>("/hotels/rates", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const rawRoomData = Array.isArray(ratesResponse?.data)
      ? ratesResponse.data
      : [];

    const hotelDetails = Array.isArray(ratesResponse?.hotels)
      ? ratesResponse.hotels
      : [];

    const roomsByHotel = normalizeLiteApiRooms(rawRoomData, hotelDetails);

    const uniqueHotelRooms = Array.from(
      new Map(roomsByHotel.map((room: any) => [room.hotelId, room])).values()
    ).slice(0, MAX_HOTELS);

    return NextResponse.json({
      rooms: uniqueHotelRooms,
      provider: "liteapi",
      city,
      countryCode: countryCode.toUpperCase(),
      checkin: startDate,
      checkout: endDate,
      people,
      requestedRooms: rooms,
      totalReturned: uniqueHotelRooms.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "LiteAPI room availability failed",
        detail: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
